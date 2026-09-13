import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { ProjectDeliveryController } from "./project-delivery.controller";
import { ProjectDeliveryService } from "./project-delivery.service";

@Module({
  imports: [AuthModule],
  controllers: [ProjectDeliveryController],
  providers: [ProjectDeliveryService],
})
export class ProjectDeliveryModule {}
