import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { RecruitmentController } from "./recruitment.controller";
import { RecruitmentService } from "./recruitment.service";

@Module({
  imports: [AuthModule],
  controllers: [RecruitmentController],
  providers: [RecruitmentService],
})
export class RecruitmentModule {}
