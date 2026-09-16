import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request } from "express";

import { CurrentPrincipal } from "../auth/decorators/current-principal.decorator";
import { RequirePermissions } from "../auth/decorators/require-permissions.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { Principal } from "../auth/auth.types";
import {
  ApplicantQueryDto,
  CompleteInterviewDto,
  CreateApplicantDto,
  CreateOfferDto,
  CreateOnboardingTaskDto,
  CreateRequisitionDto,
  OfferResponseDto,
  RequisitionQueryDto,
  ScheduleInterviewDto,
  UpdateOnboardingTaskDto,
} from "./dto/recruitment.dto";
import { RecruitmentService } from "./recruitment.service";

@ApiTags("recruitment-v2")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: "recruitment", version: "2" })
export class RecruitmentController {
  constructor(private readonly recruitment: RecruitmentService) {}

  private ok<T>(value: Promise<T> | T) {
    return Promise.resolve(value).then((data) => ({ success: true, data }));
  }

  private list<T extends { data: unknown; meta: unknown }>(value: Promise<T>) {
    return value.then((result) => ({ success: true, ...result }));
  }

  private metadata(request: Request) {
    return {
      ipAddress: request.ip,
      userAgent: request.get("user-agent") ?? undefined,
    };
  }

  @Get("dashboard")
  @RequirePermissions("recruitment.dashboard.read")
  @ApiOperation({ summary: "Recruitment funnel and onboarding workload" })
  dashboard(@CurrentPrincipal() principal: Principal) {
    return this.ok(this.recruitment.dashboard(principal));
  }

  @Get("requisitions")
  @RequirePermissions("recruitment.requisitions.read")
  listRequisitions(@CurrentPrincipal() principal: Principal, @Query() query: RequisitionQueryDto) {
    return this.list(this.recruitment.listRequisitions(principal, query));
  }

  @Get("requisitions/:id")
  @RequirePermissions("recruitment.requisitions.read")
  getRequisition(@CurrentPrincipal() principal: Principal, @Param("id", ParseUUIDPipe) id: string) {
    return this.ok(this.recruitment.getRequisition(principal, id));
  }

  @Post("requisitions")
  @RequirePermissions("recruitment.requisitions.manage")
  createRequisition(
    @CurrentPrincipal() principal: Principal,
    @Body() dto: CreateRequisitionDto,
    @Req() request: Request,
  ) {
    return this.ok(this.recruitment.createRequisition(principal, dto, this.metadata(request)));
  }

  @Post("requisitions/:id/submit")
  @RequirePermissions("recruitment.requisitions.manage")
  submitRequisition(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: Request,
  ) {
    return this.ok(
      this.recruitment.transitionRequisition(principal, id, "submit", this.metadata(request)),
    );
  }

  @Post("requisitions/:id/approve")
  @RequirePermissions("recruitment.requisitions.approve")
  approveRequisition(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: Request,
  ) {
    return this.ok(
      this.recruitment.transitionRequisition(principal, id, "approve", this.metadata(request)),
    );
  }

  @Post("requisitions/:id/open")
  @RequirePermissions("recruitment.requisitions.manage")
  openRequisition(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: Request,
  ) {
    return this.ok(
      this.recruitment.transitionRequisition(principal, id, "open", this.metadata(request)),
    );
  }

  @Post("requisitions/:id/hold")
  @RequirePermissions("recruitment.requisitions.manage")
  holdRequisition(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: Request,
  ) {
    return this.ok(
      this.recruitment.transitionRequisition(principal, id, "hold", this.metadata(request)),
    );
  }

  @Post("requisitions/:id/close")
  @RequirePermissions("recruitment.requisitions.manage")
  closeRequisition(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: Request,
  ) {
    return this.ok(
      this.recruitment.transitionRequisition(principal, id, "close", this.metadata(request)),
    );
  }

  @Post("requisitions/:id/cancel")
  @RequirePermissions("recruitment.requisitions.manage")
  cancelRequisition(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: Request,
  ) {
    return this.ok(
      this.recruitment.transitionRequisition(principal, id, "cancel", this.metadata(request)),
    );
  }

  @Get("applicants")
  @RequirePermissions("recruitment.applicants.read")
  listApplicants(@CurrentPrincipal() principal: Principal, @Query() query: ApplicantQueryDto) {
    return this.list(this.recruitment.listApplicants(principal, query));
  }

  @Get("applicants/:id")
  @RequirePermissions("recruitment.applicants.read")
  getApplicant(@CurrentPrincipal() principal: Principal, @Param("id", ParseUUIDPipe) id: string) {
    return this.ok(this.recruitment.getApplicant(principal, id));
  }

  @Post("applicants")
  @RequirePermissions("recruitment.applicants.manage")
  createApplicant(
    @CurrentPrincipal() principal: Principal,
    @Body() dto: CreateApplicantDto,
    @Req() request: Request,
  ) {
    return this.ok(this.recruitment.createApplicant(principal, dto, this.metadata(request)));
  }

  @Post("applicants/:id/interviews")
  @RequirePermissions("recruitment.interviews.manage")
  scheduleInterview(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ScheduleInterviewDto,
    @Req() request: Request,
  ) {
    return this.ok(this.recruitment.scheduleInterview(principal, id, dto, this.metadata(request)));
  }

  @Post("interviews/:id/complete")
  @RequirePermissions("recruitment.interviews.manage")
  completeInterview(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CompleteInterviewDto,
    @Req() request: Request,
  ) {
    return this.ok(this.recruitment.completeInterview(principal, id, dto, this.metadata(request)));
  }

  @Post("applicants/:id/offers")
  @RequirePermissions("recruitment.offers.manage")
  createOffer(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateOfferDto,
    @Req() request: Request,
  ) {
    return this.ok(this.recruitment.createOffer(principal, id, dto, this.metadata(request)));
  }

  @Post("offers/:id/issue")
  @RequirePermissions("recruitment.offers.manage")
  issueOffer(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: Request,
  ) {
    return this.ok(this.recruitment.issueOffer(principal, id, this.metadata(request)));
  }

  @Post("offers/:id/record-response")
  @RequirePermissions("recruitment.offers.manage")
  recordOfferResponse(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: OfferResponseDto,
    @Req() request: Request,
  ) {
    return this.ok(
      this.recruitment.recordOfferResponse(principal, id, dto, this.metadata(request)),
    );
  }

  @Post("applicants/:id/onboarding-tasks")
  @RequirePermissions("recruitment.onboarding.manage")
  createOnboardingTask(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateOnboardingTaskDto,
    @Req() request: Request,
  ) {
    return this.ok(
      this.recruitment.createOnboardingTask(principal, id, dto, this.metadata(request)),
    );
  }

  @Patch("onboarding-tasks/:id")
  @RequirePermissions("recruitment.onboarding.manage")
  updateOnboardingTask(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateOnboardingTaskDto,
    @Req() request: Request,
  ) {
    return this.ok(
      this.recruitment.updateOnboardingTask(principal, id, dto, this.metadata(request)),
    );
  }
}
