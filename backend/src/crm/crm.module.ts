import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { CrmController } from "./crm.controller";
import { CrmService } from "./crm.service";
@Module({
  imports: [AuthModule, NotificationsModule],
  controllers: [CrmController],
  providers: [CrmService],
})
export class CrmModule {}
