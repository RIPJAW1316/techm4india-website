import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import configuration from './config/configuration';
import { validateEnvironment } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { IdentityModule } from './modules/identity/identity.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { HrmsModule } from './modules/hrms/hrms.module';
import { FinanceModule } from './modules/finance/finance.module';
import { CrmModule } from './modules/crm/crm.module';
import { InstitutionsModule } from './modules/institutions/institutions.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnvironment,
      envFilePath: ['.env', '.env.local'],
    }),

    // Basic Rate Limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get<number>('security.rateLimitTtl', 60000),
          limit: configService.get<number>('security.rateLimitLimit', 100),
        },
      ],
    }),

    // Database & Infrastructure
    DatabaseModule,

    // Core Foundation Modules
    HealthModule,

    // Enterprise Scalable Domain Structure (Prepared for Phase 2)
    AuthModule,
    IdentityModule,
    ApplicationsModule,
    OrganizationsModule,
    HrmsModule,
    FinanceModule,
    CrmModule,
    InstitutionsModule,
    AuditLogsModule,
    NotificationsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
