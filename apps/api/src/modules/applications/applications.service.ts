import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import {
  ApplicationItemDto,
  CreateApplicationDto,
  UpdateApplicationDto,
} from './dto/applications.dto';

@Injectable()
export class ApplicationsService {
  private readonly trustedOrigins: string[];

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.trustedOrigins = this.configService.get<string[]>('sso.trustedAppUrls') || [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'https://techm4india.com',
    ];
  }

  private validateDestinationUrl(urlStr: string): void {
    try {
      const parsed = new URL(urlStr);
      const origin = parsed.origin;
      const isTrusted = this.trustedOrigins.some(
        (trusted) => trusted === origin || origin.startsWith(trusted),
      );

      if (!isTrusted) {
        throw new BadRequestException(
          `Security violation: Destination URL "${urlStr}" does not match any configured trusted application origin.`,
        );
      }
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      throw new BadRequestException(`Invalid destination URL: ${urlStr}`);
    }
  }

  async listApplications(
    userId: string,
    roles: string[],
  ): Promise<ApplicationItemDto[]> {
    const isSuperAdmin = roles.includes('SUPER_ADMIN');

    const [allApps, userGrants] = await Promise.all([
      this.prisma.application.findMany({
        where: isSuperAdmin ? {} : { isActive: true },
        orderBy: { code: 'asc' },
      }),
      this.prisma.userApplicationAccess.findMany({
        where: { userId, isActive: true },
      }),
    ]);

    const grantedAppIds = new Set(userGrants.map((g) => g.applicationId));

    return allApps.map((app) => ({
      id: app.id,
      code: app.code,
      name: app.name,
      description: app.description || '',
      permittedDestination: app.baseUrl || '',
      hasAccess: isSuperAdmin ? true : grantedAppIds.has(app.id),
      isActive: app.isActive,
    }));
  }

  async getUserAuthorizedApplications(userId: string): Promise<ApplicationItemDto[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: { include: { role: true } },
        appAccess: {
          where: { isActive: true },
          include: { application: true },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found.');

    const isSuperAdmin = user.userRoles.some((ur) => ur.role.code === 'SUPER_ADMIN');

    if (isSuperAdmin) {
      const allApps = await this.prisma.application.findMany({
        where: { isActive: true },
        orderBy: { code: 'asc' },
      });

      return allApps.map((app) => ({
        id: app.id,
        code: app.code,
        name: app.name,
        description: app.description || '',
        permittedDestination: app.baseUrl || '',
        hasAccess: true,
        isActive: app.isActive,
      }));
    }

    return user.appAccess
      .filter((grant) => grant.application.isActive)
      .map((grant) => ({
        id: grant.application.id,
        code: grant.application.code,
        name: grant.application.name,
        description: grant.application.description || '',
        permittedDestination: grant.application.baseUrl || '',
        hasAccess: true,
        isActive: grant.application.isActive,
      }));
  }

  async createApplication(dto: CreateApplicationDto) {
    const existing = await this.prisma.application.findUnique({
      where: { code: dto.code.toUpperCase().trim() },
    });

    if (existing) {
      throw new ConflictException(`Application with code "${dto.code}" already exists.`);
    }

    this.validateDestinationUrl(dto.baseUrl);

    return this.prisma.application.create({
      data: {
        code: dto.code.toUpperCase().trim(),
        name: dto.name.trim(),
        description: dto.description?.trim(),
        baseUrl: dto.baseUrl.trim(),
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
    });
  }

  async updateApplication(id: string, dto: UpdateApplicationDto) {
    const app = await this.prisma.application.findUnique({ where: { id } });
    if (!app) throw new NotFoundException(`Application with ID ${id} not found.`);

    if (dto.baseUrl) {
      this.validateDestinationUrl(dto.baseUrl);
    }

    return this.prisma.application.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        description: dto.description?.trim(),
        baseUrl: dto.baseUrl?.trim(),
        isActive: dto.isActive,
      },
    });
  }

  async deleteApplication(id: string) {
    const app = await this.prisma.application.findUnique({ where: { id } });
    if (!app) throw new NotFoundException(`Application with ID ${id} not found.`);

    await this.prisma.application.delete({ where: { id } });
    return { success: true, message: `Application "${app.code}" deleted successfully.` };
  }
}
