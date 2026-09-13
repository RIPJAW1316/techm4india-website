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
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Request } from "express";

import { CurrentPrincipal } from "../auth/decorators/current-principal.decorator";
import { RequirePermissions } from "../auth/decorators/require-permissions.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { Principal } from "../auth/auth.types";
import { V2Controller } from "../common/v2-controller.base";
import {
  CreateMilestoneDto,
  CreateRiskDto,
  CreateSprintDto,
  CreateTimeLogDto,
  PagingDto,
  UpdateRiskDto,
} from "./dto/project-delivery.dto";
import { ProjectDeliveryService } from "./project-delivery.service";

@ApiTags("project-delivery-v2")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ version: "2" })
export class ProjectDeliveryController extends V2Controller {
  constructor(private readonly delivery: ProjectDeliveryService) {
    super();
  }

  @Get("projects/:projectId/milestones")
  @RequirePermissions("projects.delivery.read")
  listMilestones(
    @CurrentPrincipal() principal: Principal,
    @Param("projectId", ParseUUIDPipe) projectId: string,
    @Query() query: PagingDto,
  ) {
    return this.list(this.delivery.listMilestones(principal, projectId, query));
  }

  @Post("projects/:projectId/milestones")
  @RequirePermissions("projects.delivery.manage")
  createMilestone(
    @CurrentPrincipal() principal: Principal,
    @Param("projectId", ParseUUIDPipe) projectId: string,
    @Body() dto: CreateMilestoneDto,
    @Req() request: Request,
  ) {
    return this.ok(this.delivery.createMilestone(principal, projectId, dto, this.metadata(request)));
  }

  @Post("project-milestones/:id/start")
  @RequirePermissions("projects.delivery.manage")
  startMilestone(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: Request,
  ) {
    return this.ok(this.delivery.transitionMilestone(principal, id, "start", this.metadata(request)));
  }

  @Post("project-milestones/:id/complete")
  @RequirePermissions("projects.delivery.manage")
  completeMilestone(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: Request,
  ) {
    return this.ok(this.delivery.transitionMilestone(principal, id, "complete", this.metadata(request)));
  }

  @Get("projects/:projectId/risks")
  @RequirePermissions("projects.delivery.read")
  listRisks(
    @CurrentPrincipal() principal: Principal,
    @Param("projectId", ParseUUIDPipe) projectId: string,
    @Query() query: PagingDto,
  ) {
    return this.list(this.delivery.listRisks(principal, projectId, query));
  }

  @Post("projects/:projectId/risks")
  @RequirePermissions("projects.delivery.manage")
  createRisk(
    @CurrentPrincipal() principal: Principal,
    @Param("projectId", ParseUUIDPipe) projectId: string,
    @Body() dto: CreateRiskDto,
    @Req() request: Request,
  ) {
    return this.ok(this.delivery.createRisk(principal, projectId, dto, this.metadata(request)));
  }

  @Patch("project-risks/:id")
  @RequirePermissions("projects.delivery.manage")
  updateRisk(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateRiskDto,
    @Req() request: Request,
  ) {
    return this.ok(this.delivery.updateRisk(principal, id, dto, this.metadata(request)));
  }

  @Get("projects/:projectId/sprints")
  @RequirePermissions("projects.delivery.read")
  listSprints(
    @CurrentPrincipal() principal: Principal,
    @Param("projectId", ParseUUIDPipe) projectId: string,
    @Query() query: PagingDto,
  ) {
    return this.list(this.delivery.listSprints(principal, projectId, query));
  }

  @Post("projects/:projectId/sprints")
  @RequirePermissions("projects.delivery.manage")
  createSprint(
    @CurrentPrincipal() principal: Principal,
    @Param("projectId", ParseUUIDPipe) projectId: string,
    @Body() dto: CreateSprintDto,
    @Req() request: Request,
  ) {
    return this.ok(this.delivery.createSprint(principal, projectId, dto, this.metadata(request)));
  }

  @Post("project-sprints/:id/start")
  @RequirePermissions("projects.delivery.manage")
  startSprint(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: Request,
  ) {
    return this.ok(this.delivery.transitionSprint(principal, id, "start", this.metadata(request)));
  }

  @Post("project-sprints/:id/complete")
  @RequirePermissions("projects.delivery.manage")
  completeSprint(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: Request,
  ) {
    return this.ok(this.delivery.transitionSprint(principal, id, "complete", this.metadata(request)));
  }

  @Get("projects/:projectId/time-logs")
  @RequirePermissions("projects.delivery.read")
  listTimeLogs(
    @CurrentPrincipal() principal: Principal,
    @Param("projectId", ParseUUIDPipe) projectId: string,
    @Query() query: PagingDto,
  ) {
    return this.list(this.delivery.listTimeLogs(principal, projectId, query));
  }

  @Post("projects/:projectId/time-logs")
  @RequirePermissions("projects.timelog.manage")
  createTimeLog(
    @CurrentPrincipal() principal: Principal,
    @Param("projectId", ParseUUIDPipe) projectId: string,
    @Body() dto: CreateTimeLogDto,
    @Req() request: Request,
  ) {
    return this.ok(this.delivery.createTimeLog(principal, projectId, dto, this.metadata(request)));
  }
}
