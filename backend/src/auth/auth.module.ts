import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

import { AuditService } from "../audit/audit.service";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";
import { PasswordService } from "./password.service";
import { PermissionsGuard } from "./guards/permissions.guard";
import { TrustedOriginGuard } from "./guards/trusted-origin.guard";
import { AuthorizationPolicy } from "./policies/authorization.policy";
import { parseDurationMs } from "./auth.utils";

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>("auth.accessSecret"),
        signOptions: {
          expiresIn: Math.floor(
            parseDurationMs(configService.get<string>("auth.accessTokenTtl") ?? "15m") / 1000,
          ),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordService,
    AuditService,
    JwtStrategy,
    PermissionsGuard,
    TrustedOriginGuard,
    AuthorizationPolicy,
  ],
  exports: [AuthService, AuditService, AuthorizationPolicy, JwtStrategy, PermissionsGuard, PasswordService],
})
export class AuthModule {}
