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
  AcknowledgeReviewDto,
  CreateCycleDto,
  CreateGoalDto,
  CreateReviewDto,
  CycleQueryDto,
  FinalizeReviewDto,
  GoalQueryDto,
  ManagerReviewDto,
  ReviewQueryDto,
  SelfAssessmentDto,
  UpdateGoalDto,
} from "./dto/performance.dto";
import { PerformanceService } from "./performance.service";

@ApiTags("performance-v2")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: "performance", version: "2" })
export class PerformanceController {
  constructor(private readonly performance: PerformanceService) {}

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
  @RequirePermissions("performance.dashboard.read")
  @ApiOperation({ summary: "Performance cycle, review and goal summary" })
  dashboard(@CurrentPrincipal() principal: Principal) {
    return this.ok(this.performance.dashboard(principal));
  }

  @Get("cycles")
  @RequirePermissions("performance.cycles.read")
  listCycles(
    @CurrentPrincipal() principal: Principal,
    @Query() query: CycleQueryDto,
  ) {
    return this.list(this.performance.listCycles(principal, query));
  }

  @Get("cycles/:id")
  @RequirePermissions("performance.cycles.read")
  getCycle(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.ok(this.performance.getCycle(principal, id));
  }

  @Post("cycles")
  @RequirePermissions("performance.cycles.manage")
  @ApiOperation({ summary: "Create a draft performance cycle" })
  createCycle(
    @CurrentPrincipal() principal: Principal,
    @Body() dto: CreateCycleDto,
    @Req() request: Request,
  ) {
    return this.ok(this.performance.createCycle(principal, dto, this.metadata(request)));
  }

  @Post("cycles/:id/activate")
  @RequirePermissions("performance.cycles.manage")
  activateCycle(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: Request,
  ) {
    return this.ok(
      this.performance.transitionCycle(principal, id, "activate", this.metadata(request)),
    );
  }

  @Post("cycles/:id/close")
  @RequirePermissions("performance.cycles.manage")
  closeCycle(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: Request,
  ) {
    return this.ok(
      this.performance.transitionCycle(principal, id, "close", this.metadata(request)),
    );
  }

  @Get("goals")
  @RequirePermissions("performance.goals.read")
  listGoals(
    @CurrentPrincipal() principal: Principal,
    @Query() query: GoalQueryDto,
  ) {
    return this.list(this.performance.listGoals(principal, query));
  }

  @Post("cycles/:id/goals")
  @RequirePermissions("performance.goals.manage")
  @ApiOperation({ summary: "Add a weighted goal for an employee in a cycle" })
  createGoal(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateGoalDto,
    @Req() request: Request,
  ) {
    return this.ok(this.performance.createGoal(principal, id, dto, this.metadata(request)));
  }

  @Patch("goals/:id")
  @RequirePermissions("performance.goals.manage")
  updateGoal(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateGoalDto,
    @Req() request: Request,
  ) {
    return this.ok(this.performance.updateGoal(principal, id, dto, this.metadata(request)));
  }

  @Get("reviews")
  @RequirePermissions("performance.reviews.read")
  listReviews(
    @CurrentPrincipal() principal: Principal,
    @Query() query: ReviewQueryDto,
  ) {
    return this.list(this.performance.listReviews(principal, query));
  }

  @Get("reviews/:id")
  @RequirePermissions("performance.reviews.read")
  getReview(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.ok(this.performance.getReview(principal, id));
  }

  @Post("cycles/:id/reviews")
  @RequirePermissions("performance.reviews.manage")
  @ApiOperation({ summary: "Open an appraisal review for an employee" })
  createReview(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateReviewDto,
    @Req() request: Request,
  ) {
    return this.ok(this.performance.createReview(principal, id, dto, this.metadata(request)));
  }

  @Post("reviews/:id/self-assessment")
  @RequirePermissions("performance.reviews.self")
  @ApiOperation({ summary: "Review subject submits their self-assessment" })
  submitSelfAssessment(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: SelfAssessmentDto,
    @Req() request: Request,
  ) {
    return this.ok(
      this.performance.submitSelfAssessment(principal, id, dto, this.metadata(request)),
    );
  }

  @Post("reviews/:id/manager-review")
  @RequirePermissions("performance.reviews.manage")
  @ApiOperation({ summary: "Reviewer submits the manager assessment" })
  submitManagerReview(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ManagerReviewDto,
    @Req() request: Request,
  ) {
    return this.ok(
      this.performance.submitManagerReview(principal, id, dto, this.metadata(request)),
    );
  }

  @Post("reviews/:id/finalize")
  @RequirePermissions("performance.reviews.finalize")
  @ApiOperation({ summary: "Calibrate and finalize a review rating" })
  finalizeReview(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: FinalizeReviewDto,
    @Req() request: Request,
  ) {
    return this.ok(this.performance.finalizeReview(principal, id, dto, this.metadata(request)));
  }

  @Post("reviews/:id/acknowledge")
  @RequirePermissions("performance.reviews.self")
  @ApiOperation({ summary: "Review subject acknowledges a finalized review" })
  acknowledgeReview(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: AcknowledgeReviewDto,
    @Req() request: Request,
  ) {
    return this.ok(
      this.performance.acknowledgeReview(principal, id, dto, this.metadata(request)),
    );
  }
}
