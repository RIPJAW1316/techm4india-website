import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";

import { AuthModule } from "./auth/auth.module";
import { EmployeesModule } from "./employees/employees.module";
import { envValidationSchema } from "./config/env.validation";
import configuration from "./config/configuration";
import { HealthModule } from "./health/health.module";
import { PrismaModule } from "./prisma/prisma.module";
import { OrganizationModule } from "./organization/organization.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { ProjectsModule } from "./projects/projects.module";
import { TasksModule } from "./tasks/tasks.module";
import { ExecutiveModule } from "./executive/executive.module";
import { CompanyModule } from "./company/company.module";
import { HrModule } from "./hr/hr.module";
import { AttendanceModule } from "./attendance/attendance.module";
import { LeaveModule } from "./leave/leave.module";
import { HolidaysModule } from "./holidays/holidays.module";
import { CrmModule } from "./crm/crm.module";
import { InstitutionsModule } from "./institutions/institutions.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [configuration],
      validationSchema: envValidationSchema,
    }),
    ThrottlerModule.forRoot([{ name: "default", ttl: 60_000, limit: 100 }]),
    PrismaModule,
    HealthModule,
    AuthModule,
    OrganizationModule,
    EmployeesModule,
    NotificationsModule,
    ProjectsModule,
    TasksModule,
    ExecutiveModule,
    CompanyModule,
    HrModule,
    AttendanceModule,
    LeaveModule,
    HolidaysModule,
    CrmModule,
    InstitutionsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
