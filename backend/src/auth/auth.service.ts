import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { UserStatus } from "@prisma/client";
import { CookieOptions } from "express";

import { AuditService } from "../audit/audit.service";
import { PrismaService } from "../prisma/prisma.service";
import { ACCESS_TOKEN_TYPE, AUTH_AUDIT_ACTIONS, AUTH_COOKIE_PATH } from "./auth.constants";
import { LoginDto } from "./dto/login.dto";
import { PasswordService } from "./password.service";
import { RequestMetadata } from "./interfaces/request-metadata";
import { AuthResult, Principal, SafeAuthContext } from "./auth.types";
import {
  createOpaqueRefreshToken,
  hashIdentifier,
  hashRefreshToken,
  parseDurationMs,
} from "./auth.utils";

const INVALID_CREDENTIALS = "Invalid email or password";
class RefreshRotationConflict extends Error {}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
  ) {}

  get refreshCookieName(): string {
    return this.configService.get<string>("auth.refreshCookieName") ?? "tm4_refresh";
  }

  getRefreshCookieOptions(): CookieOptions {
    const ttl = this.configService.get<string>("auth.refreshTokenTtl") ?? "30d";
    const secure = this.configService.get<boolean>("auth.cookieSecure") ?? false;
    const domain = this.configService.get<string>("auth.cookieDomain");
    const sameSite =
      this.configService.get<CookieOptions["sameSite"]>("auth.cookieSameSite") ?? "lax";
    return {
      domain,
      httpOnly: true,
      maxAge: parseDurationMs(ttl),
      path: AUTH_COOKIE_PATH,
      sameSite,
      secure,
    };
  }

  async login(dto: LoginDto, request: RequestMetadata): Promise<AuthResult> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.findUserByEmail(email);
    const valid = user ? await this.passwordService.verify(user.passwordHash, dto.password) : false;

    if (!user || !valid || user.status !== UserStatus.ACTIVE) {
      await this.auditService.record({
        action: AUTH_AUDIT_ACTIONS.LOGIN_FAILURE,
        actorUserId: user?.id,
        entityType: "User",
        entityId: user?.id,
        metadata: { emailHash: hashIdentifier(email) },
        request,
      });
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }

    const refreshToken = createOpaqueRefreshToken();
    const session = await this.prisma.refreshSession.create({
      data: {
        expiresAt: this.refreshExpiry(),
        ipAddress: request.ipAddress,
        tokenHash: hashRefreshToken(refreshToken),
        userAgent: request.userAgent?.slice(0, 512),
        userId: user.id,
      },
    });
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    const accessToken = await this.signAccessToken(user.id, session.id);
    await this.auditService.record({
      action: AUTH_AUDIT_ACTIONS.LOGIN_SUCCESS,
      actorUserId: user.id,
      entityType: "User",
      entityId: user.id,
      request,
    });

    return {
      ...(await this.getSafeContext(user.id)),
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string | undefined, request: RequestMetadata): Promise<AuthResult> {
    if (!refreshToken) {
      throw new UnauthorizedException("Refresh session required");
    }
    const tokenHash = hashRefreshToken(refreshToken);
    const session = await this.prisma.refreshSession.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
    if (!session) {
      throw new UnauthorizedException("Refresh session invalid");
    }

    const now = new Date();
    if (session.revokedAt || session.replacedBySessionId || session.expiresAt <= now) {
      if (session.revokedAt || session.replacedBySessionId) {
        await this.handleRefreshReuse(session.userId, session.id, request);
      }
      throw new UnauthorizedException("Refresh session invalid");
    }
    if (session.user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException("Account is not active");
    }

    const nextRefreshToken = createOpaqueRefreshToken();
    let nextSession;
    try {
      nextSession = await this.prisma.$transaction(async (tx) => {
        const claimed = await tx.refreshSession.updateMany({
          where: {
            id: session.id,
            revokedAt: null,
            replacedBySessionId: null,
            expiresAt: { gt: now },
          },
          data: { lastUsedAt: now, revokedAt: now },
        });
        if (claimed.count !== 1) throw new RefreshRotationConflict();
        const created = await tx.refreshSession.create({
          data: {
            expiresAt: this.refreshExpiry(),
            ipAddress: request.ipAddress,
            tokenHash: hashRefreshToken(nextRefreshToken),
            userAgent: request.userAgent?.slice(0, 512),
            userId: session.userId,
          },
        });
        await tx.refreshSession.update({
          where: { id: session.id },
          data: { replacedBySessionId: created.id },
        });
        await tx.auditLog.create({
          data: {
            action: AUTH_AUDIT_ACTIONS.REFRESH_ROTATED,
            actorUserId: session.userId,
            entityType: "RefreshSession",
            entityId: created.id,
            ipAddress: request.ipAddress,
            userAgent: request.userAgent?.slice(0, 512),
            metadata: { replacedSessionId: session.id },
          },
        });
        return created;
      });
    } catch (error) {
      if (error instanceof RefreshRotationConflict) {
        await this.handleRefreshReuse(session.userId, session.id, request);
        throw new UnauthorizedException("Refresh session invalid");
      }
      throw error;
    }
    const accessToken = await this.signAccessToken(session.userId, nextSession.id);
    return {
      ...(await this.getSafeContext(session.userId)),
      accessToken,
      refreshToken: nextRefreshToken,
    };
  }

  async logout(refreshToken: string | undefined, request: RequestMetadata): Promise<void> {
    if (!refreshToken) return;
    const session = await this.prisma.refreshSession.findUnique({
      where: { tokenHash: hashRefreshToken(refreshToken) },
    });
    if (!session) return;

    const now = new Date();
    await this.prisma.refreshSession.updateMany({
      where: { id: session.id, revokedAt: null },
      data: { lastUsedAt: now, revokedAt: now },
    });
    await this.auditService.record({
      action: AUTH_AUDIT_ACTIONS.LOGOUT,
      actorUserId: session.userId,
      entityType: "RefreshSession",
      entityId: session.id,
      request,
    });
  }

  async getSafeContext(userId: string): Promise<SafeAuthContext> {
    const user = await this.findUserById(userId);
    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException("Account is not active");
    }
    return this.toSafeContext(user);
  }

  async resolvePrincipal(userId: string, sessionId: string): Promise<Principal> {
    const session = await this.prisma.refreshSession.findUnique({
      where: { id: sessionId },
      select: { userId: true, expiresAt: true, revokedAt: true },
    });
    if (
      !session ||
      session.userId !== userId ||
      session.revokedAt ||
      session.expiresAt <= new Date()
    ) {
      throw new UnauthorizedException("Access session invalid");
    }
    const user = await this.findUserById(userId);
    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException("Account is not active");
    }
    const context = this.toSafeContext(user);
    return {
      userId: user.id,
      email: user.email,
      status: user.status,
      employeeId: context.employee?.id,
      organizationId: user.employee?.division?.organizationId,
      divisionId: context.employee?.division?.id,
      departmentId: context.employee?.department?.id,
      roles: context.user.roles,
      permissions: context.permissions,
    };
  }

  private async handleRefreshReuse(
    userId: string,
    sessionId: string,
    request: RequestMetadata,
  ): Promise<void> {
    const now = new Date();
    await this.prisma.$transaction([
      this.prisma.refreshSession.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: now },
      }),
      this.prisma.auditLog.create({
        data: {
          action: AUTH_AUDIT_ACTIONS.REFRESH_REUSE_DETECTED,
          actorUserId: userId,
          entityType: "RefreshSession",
          entityId: sessionId,
          ipAddress: request.ipAddress,
          userAgent: request.userAgent?.slice(0, 512),
        },
      }),
    ]);
  }

  private async signAccessToken(userId: string, sessionId: string): Promise<string> {
    return this.jwtService.signAsync({
      sub: userId,
      sid: sessionId,
      typ: ACCESS_TOKEN_TYPE,
    });
  }

  private refreshExpiry(): Date {
    const ttl = this.configService.get<string>("auth.refreshTokenTtl") ?? "30d";
    return new Date(Date.now() + parseDurationMs(ttl));
  }

  private async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        employee: { include: { division: true, department: true } },
        roles: {
          include: { role: { include: { permissions: { include: { permission: true } } } } },
        },
      },
    });
  }

  private async findUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        employee: { include: { division: true, department: true } },
        roles: {
          include: { role: { include: { permissions: { include: { permission: true } } } } },
        },
      },
    });
  }

  private toSafeContext(
    user: NonNullable<Awaited<ReturnType<AuthService["findUserById"]>>>,
  ): SafeAuthContext {
    const roles = user.roles.map(({ role }) => role.name);
    const permissions = [
      ...new Set(
        user.roles.flatMap(({ role }) => role.permissions.map(({ permission }) => permission.key)),
      ),
    ];
    const employee = user.employee;
    return {
      user: { id: user.id, email: user.email, roles },
      employee: employee
        ? {
            id: employee.id,
            employeeCode: employee.employeeCode,
            firstName: employee.firstName,
            lastName: employee.lastName,
            designation: employee.designation,
            division: employee.division
              ? {
                  id: employee.division.id,
                  slug: employee.division.slug,
                  name: employee.division.name,
                }
              : null,
            department: employee.department
              ? {
                  id: employee.department.id,
                  slug: employee.department.slug,
                  name: employee.department.name,
                }
              : null,
          }
        : null,
      permissions,
    };
  }
}
