import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { PrismaModule } from "../prisma/prisma.module";
import { TasksModule } from "../tasks/tasks.module";
import { ExecutiveController } from "./executive.controller";
import { ExecutiveService } from "./executive.service";

@Module({
  imports: [AuthModule, NotificationsModule, PrismaModule, TasksModule],
  controllers: [ExecutiveController],
  providers: [ExecutiveService],
})
export class ExecutiveModule {}
