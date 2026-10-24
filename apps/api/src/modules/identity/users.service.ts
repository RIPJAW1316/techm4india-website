import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PasswordService } from '../auth/password.service';
import {
  AssignRoleDto,
  CreateUserDto,
  GrantApplicationAccessDto,
  ListUsersQueryDto,
  UpdateUserDto,
} from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
  ) {}

  async listUsers(query: ListUsersQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.role) {
      where.userRoles = {
        some: {
          role: { code: query.role },
        },
      };
    }

    if (query.application) {
      where.appAccess = {
        some: {
          application: { code: query.application },
          isActive: true,
        },
      };
    }

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          isActive: true,
          isEmailVerified: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          organization: {
            select: { id: true, code: true, name: true },
          },
          userRoles: {
            select: {
              role: { select: { id: true, code: true, name: true } },
            },
          },
          appAccess: {
            where: { isActive: true },
            select: {
              application: { select: { id: true, code: true, name: true } },
            },
          },
        },
      }),
    ]);

    const formatted = users.map((u) => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      phone: u.phone,
      isActive: u.isActive,
      lastLoginAt: u.lastLoginAt,
      organization: u.organization,
      roles: u.userRoles.map((ur) => ur.role.code),
      applications: u.appAccess.map((aa) => aa.application.code),
      createdAt: u.createdAt,
    }));

    return {
      items: formatted,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
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
          include: {
            application: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    const roles = user.userRoles.map((ur) => ur.role.code);
    const permissionSet = new Set<string>();
    for (const ur of user.userRoles) {
      for (const rp of ur.role.permissions) {
        permissionSet.add(rp.permission.code);
      }
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      lastLoginAt: user.lastLoginAt,
      organization: user.organization,
      roles,
      permissions: Array.from(permissionSet),
      applications: user.appAccess.map((aa) => ({
        code: aa.application.code,
        name: aa.application.name,
        isActive: aa.isActive,
        grantedAt: aa.grantedAt,
        expiresAt: aa.expiresAt,
      })),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async createUser(dto: CreateUserDto, creatorRoles: string[]) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new ConflictException(`User with email "${dto.email}" already exists.`);
    }

    // Privilege escalation protection
    if (dto.roles?.includes('SUPER_ADMIN') && !creatorRoles.includes('SUPER_ADMIN')) {
      throw new ForbiddenException(
        'Privilege escalation denied: Only SUPER_ADMIN can grant the SUPER_ADMIN role.',
      );
    }

    let organizationId: string | undefined;
    if (dto.organizationCode) {
      const org = await this.prisma.organization.findUnique({
        where: { code: dto.organizationCode },
      });
      if (!org) {
        throw new BadRequestException(`Organization with code "${dto.organizationCode}" not found.`);
      }
      organizationId = org.id;
    }

    const passwordHash = await this.passwordService.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase().trim(),
        passwordHash,
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        phone: dto.phone,
        organizationId,
        isActive: true,
      },
    });

    // Assign roles if requested
    if (dto.roles && dto.roles.length > 0) {
      const dbRoles = await this.prisma.role.findMany({
        where: { code: { in: dto.roles } },
      });

      for (const role of dbRoles) {
        await this.prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: role.id,
          },
        });
      }
    }

    // Assign applications if requested
    if (dto.applicationCodes && dto.applicationCodes.length > 0) {
      const apps = await this.prisma.application.findMany({
        where: { code: { in: dto.applicationCodes } },
      });

      for (const app of apps) {
        await this.prisma.userApplicationAccess.create({
          data: {
            userId: user.id,
            applicationId: app.id,
            isActive: true,
          },
        });
      }
    }

    return this.getUserById(user.id);
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        firstName: dto.firstName?.trim(),
        lastName: dto.lastName?.trim(),
        phone: dto.phone,
      },
    });

    return this.getUserById(updated.id);
  }

  async updateStatus(id: string, isActive: boolean, currentUserId: string) {
    if (id === currentUserId && !isActive) {
      throw new BadRequestException('Security protection: You cannot deactivate your own account.');
    }

    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    await this.prisma.user.update({
      where: { id },
      data: { isActive },
    });

    // If deactivated, revoke all active sessions immediately
    if (!isActive) {
      await this.prisma.refreshToken.updateMany({
        where: { userId: id },
        data: { isRevoked: true },
      });
    }

    return {
      id,
      isActive,
      message: isActive ? 'Account activated successfully.' : 'Account deactivated and active sessions revoked.',
    };
  }

  async assignRole(userId: string, dto: AssignRoleDto, assignerRoles: string[]) {
    if (dto.roleCode === 'SUPER_ADMIN' && !assignerRoles.includes('SUPER_ADMIN')) {
      throw new ForbiddenException(
        'Privilege escalation denied: Only SUPER_ADMIN can assign the SUPER_ADMIN role.',
      );
    }

    const [user, role] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.role.findUnique({ where: { code: dto.roleCode } }),
    ]);

    if (!user) throw new NotFoundException(`User with ID ${userId} not found.`);
    if (!role) throw new NotFoundException(`Role with code "${dto.roleCode}" not found.`);

    await this.prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId,
          roleId: role.id,
        },
      },
      update: {},
      create: {
        userId,
        roleId: role.id,
      },
    });

    return this.getUserById(userId);
  }

  async revokeRole(userId: string, roleCode: string) {
    const role = await this.prisma.role.findUnique({ where: { code: roleCode } });
    if (!role) throw new NotFoundException(`Role with code "${roleCode}" not found.`);

    await this.prisma.userRole.deleteMany({
      where: {
        userId,
        roleId: role.id,
      },
    });

    return this.getUserById(userId);
  }

  async getUserApplications(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        appAccess: {
          include: { application: true },
        },
      },
    });

    if (!user) throw new NotFoundException(`User with ID ${userId} not found.`);

    return user.appAccess.map((aa) => ({
      code: aa.application.code,
      name: aa.application.name,
      description: aa.application.description,
      baseUrl: aa.application.baseUrl,
      isActive: aa.isActive,
      grantedAt: aa.grantedAt,
      expiresAt: aa.expiresAt,
    }));
  }

  async grantApplicationAccess(userId: string, dto: GrantApplicationAccessDto) {
    const [user, app] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.application.findUnique({ where: { code: dto.applicationCode } }),
    ]);

    if (!user) throw new NotFoundException(`User with ID ${userId} not found.`);
    if (!app) throw new NotFoundException(`Application "${dto.applicationCode}" not found.`);

    await this.prisma.userApplicationAccess.upsert({
      where: {
        userId_applicationId: {
          userId,
          applicationId: app.id,
        },
      },
      update: {
        isActive: true,
        expiresAt: dto.expiresAt,
      },
      create: {
        userId,
        applicationId: app.id,
        isActive: true,
        expiresAt: dto.expiresAt,
      },
    });

    return this.getUserApplications(userId);
  }

  async revokeApplicationAccess(userId: string, applicationCode: string) {
    const app = await this.prisma.application.findUnique({ where: { code: applicationCode } });
    if (!app) throw new NotFoundException(`Application "${applicationCode}" not found.`);

    await this.prisma.userApplicationAccess.deleteMany({
      where: {
        userId,
        applicationId: app.id,
      },
    });

    return this.getUserApplications(userId);
  }

  async revokeUserSessions(userId: string) {
    const existing = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!existing) throw new NotFoundException(`User with ID ${userId} not found.`);

    const result = await this.prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });

    return {
      userId,
      revokedSessionsCount: result.count,
      message: `Successfully revoked ${result.count} active session(s).`,
    };
  }
}
