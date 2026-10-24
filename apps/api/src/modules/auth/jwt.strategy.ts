import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../database/prisma.service';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  permissions: string[];
  organizationId?: string | null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        organizationId: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User account is inactive or no longer exists.');
    }

    return {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: payload.roles || [],
      permissions: payload.permissions || [],
      organizationId: user.organizationId,
    };
  }
}
