import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../database/prisma.service';
import { PasswordService } from './password.service';
import {
  AuthTokensResponseDto,
  ChangePasswordDto,
  LoginDto,
  UserProfileResponseDto,
} from './dto/auth.dto';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly accessTokenTtlSeconds = 900; // 15 minutes
  private readonly refreshTokenTtlDays = 7;

  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async login(
    loginDto: LoginDto,
    ip?: string,
    userAgent?: string,
  ): Promise<AuthTokensResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email.toLowerCase().trim() },
      include: {
        organization: true,
        userRoles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Generic error message to prevent user enumeration
    if (!user || !user.isActive) {
      this.logger.warn(`Failed login attempt for email: ${loginDto.email}`);
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isPasswordValid = await this.passwordService.verify(
      user.passwordHash,
      loginDto.password,
    );

    if (!isPasswordValid) {
      this.logger.warn(`Failed login attempt for user: ${user.id}`);
      throw new UnauthorizedException('Invalid email or password.');
    }

    // Extract roles and distinct permissions
    const roles: string[] = user.userRoles.map((ur) => ur.role.code);
    const permissionSet = new Set<string>();
    for (const ur of user.userRoles) {
      for (const rp of ur.role.permissions) {
        permissionSet.add(rp.permission.code);
      }
    }
    const permissions = Array.from(permissionSet);

    // Create Access Token
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles,
      permissions,
      organizationId: user.organizationId,
    };

    const accessToken = this.jwtService.sign(payload);

    // Generate & store Refresh Token in a new family
    const rawRefreshToken = uuidv4() + '-' + crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawRefreshToken);
    const family = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.refreshTokenTtlDays);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        family,
        expiresAt,
        ipAddress: ip,
        userAgent,
      },
    });

    // Update lastLoginAt
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Audit logging
    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'AUTH_LOGIN_SUCCESS',
        entity: 'User',
        entityId: user.id,
        ipAddress: ip,
        userAgent,
        details: { rolesCount: roles.length, permissionsCount: permissions.length },
      },
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      expiresIn: this.accessTokenTtlSeconds,
      tokenType: 'Bearer',
    };
  }

  async refresh(
    rawRefreshToken: string,
    ip?: string,
    userAgent?: string,
  ): Promise<AuthTokensResponseDto> {
    const tokenHash = this.hashToken(rawRefreshToken);

    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: {
            userRoles: {
              include: {
                role: {
                  include: {
                    permissions: {
                      include: {
                        permission: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    // Token reuse detection: if revoked token is presented, compromise detected
    if (tokenRecord.isRevoked) {
      this.logger.error(
        `Security Alert: Refresh token reuse detected for user ${tokenRecord.userId} in family ${tokenRecord.family}. Revoking entire token family.`,
      );

      await this.prisma.refreshToken.updateMany({
        where: { family: tokenRecord.family },
        data: { isRevoked: true },
      });

      await this.prisma.auditLog.create({
        data: {
          userId: tokenRecord.userId,
          action: 'SECURITY_TOKEN_REUSE_DETECTED',
          entity: 'RefreshToken',
          entityId: tokenRecord.id,
          ipAddress: ip,
          userAgent,
          details: { family: tokenRecord.family },
        },
      });

      throw new UnauthorizedException(
        'Compromised session token detected. All associated sessions have been terminated for security.',
      );
    }

    // Expiration check
    if (tokenRecord.expiresAt < new Date()) {
      await this.prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: { isRevoked: true },
      });
      throw new UnauthorizedException('Refresh token has expired. Please sign in again.');
    }

    if (!tokenRecord.user || !tokenRecord.user.isActive) {
      throw new UnauthorizedException('User account has been deactivated.');
    }

    // Rotate token: revoke current token
    await this.prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { isRevoked: true },
    });

    // Create new refresh token within the same rotation family
    const newRawRefreshToken = uuidv4() + '-' + crypto.randomBytes(32).toString('hex');
    const newTokenHash = this.hashToken(newRawRefreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.refreshTokenTtlDays);

    await this.prisma.refreshToken.create({
      data: {
        userId: tokenRecord.userId,
        tokenHash: newTokenHash,
        family: tokenRecord.family,
        expiresAt,
        ipAddress: ip,
        userAgent,
      },
    });

    // Extract roles & permissions
    const roles: string[] = tokenRecord.user.userRoles.map((ur) => ur.role.code);
    const permissionSet = new Set<string>();
    for (const ur of tokenRecord.user.userRoles) {
      for (const rp of ur.role.permissions) {
        permissionSet.add(rp.permission.code);
      }
    }
    const permissions = Array.from(permissionSet);

    const payload: JwtPayload = {
      sub: tokenRecord.user.id,
      email: tokenRecord.user.email,
      roles,
      permissions,
      organizationId: tokenRecord.user.organizationId,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      refreshToken: newRawRefreshToken,
      expiresIn: this.accessTokenTtlSeconds,
      tokenType: 'Bearer',
    };
  }

  async logout(rawRefreshToken?: string, userId?: string): Promise<{ success: boolean }> {
    if (rawRefreshToken) {
      const tokenHash = this.hashToken(rawRefreshToken);
      await this.prisma.refreshToken.updateMany({
        where: { tokenHash },
        data: { isRevoked: true },
      });
    }

    if (userId) {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action: 'AUTH_LOGOUT',
          entity: 'User',
          entityId: userId,
        },
      });
    }

    return { success: true };
  }

  async getMe(userId: string): Promise<UserProfileResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        organization: true,
        userRoles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
        appAccess: {
          where: { isActive: true },
          include: {
            application: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User profile not found.');
    }

    const roles: string[] = user.userRoles.map((ur) => ur.role.code);
    const permissionSet = new Set<string>();
    for (const ur of user.userRoles) {
      for (const rp of ur.role.permissions) {
        permissionSet.add(rp.permission.code);
      }
    }

    const authorizedApplications = user.appAccess
      .filter((grant) => grant.application.isActive)
      .map((grant) => grant.application.code);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      roles,
      permissions: Array.from(permissionSet),
      organizationCode: user.organization?.code,
      authorizedApplications,
    };
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    const isCurrentValid = await this.passwordService.verify(
      user.passwordHash,
      dto.currentPassword,
    );

    if (!isCurrentValid) {
      throw new BadRequestException('Current password does not match.');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('New password cannot be identical to the current password.');
    }

    const newHash = await this.passwordService.hash(dto.newPassword);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    // Revoke all active sessions to force re-login across all devices
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });

    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'USER_PASSWORD_CHANGED',
        entity: 'User',
        entityId: userId,
      },
    });

    return { message: 'Password changed successfully. All active sessions have been revoked.' };
  }
}
