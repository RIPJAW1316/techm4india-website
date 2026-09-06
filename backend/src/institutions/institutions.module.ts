import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { InstitutionsController } from "./institutions.controller";
import { InstitutionsService } from "./institutions.service";
@Module({
  imports: [AuthModule, NotificationsModule],
  controllers: [InstitutionsController],
  providers: [InstitutionsService],
})
export class InstitutionsModule {}
