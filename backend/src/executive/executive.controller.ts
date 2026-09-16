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
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Request } from "express";

import { CurrentPrincipal } from "../auth/decorators/current-principal.decorator";
import { RequirePermissions } from "../auth/decorators/require-permissions.decorator";
import { Principal } from "../auth/auth.types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { ExecutiveEmployeeQueryDto } from "./dto/executive-employee-query.dto";
import { CreateExecutiveTaskDto } from "./dto/create-executive-task.dto";
import { UpdateExecutiveTaskDto } from "./dto/update-executive-task.dto";
import { ExecutiveService } from "./executive.service";

@ApiTags("executive")
@ApiBearerAuth()
@Controller({ path: "executive", version: "2" })
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ExecutiveController {
  constructor(private readonly executive: ExecutiveService) {}

  @Get("workforce/summary")
  @RequirePermissions("executive.dashboard.read")
  @ApiOperation({ summary: "Read organization-wide workforce and work summary" })
  async summary(@CurrentPrincipal() principal: Principal) {
    return { success: true, data: await this.executive.summary(principal) };
  }

  @Get("employees")
  @RequirePermissions("executive.dashboard.read", "employees.read_all", "tasks.read_all")
  @ApiOperation({ summary: "List safe organization-wide employee work summaries" })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 20, maximum: 100 })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiQuery({ name: "divisionId", required: false, format: "uuid" })
  @ApiQuery({ name: "departmentId", required: false, format: "uuid" })
  @ApiQuery({
    name: "status",
    required: false,
    enum: ["ACTIVE", "ON_LEAVE", "SUSPENDED", "RESIGNED", "TERMINATED"],
  })
  async employees(
    @CurrentPrincipal() principal: Principal,
    @Query() query: ExecutiveEmployeeQueryDto,
  ) {
    return { success: true, ...(await this.executive.employees(principal, query)) };
  }

  @Get("employees/:employeeId/work")
  @RequirePermissions("executive.dashboard.read", "employees.read_all", "tasks.read_all")
  @ApiOperation({ summary: "Read an employee's active and completed work" })
  async employeeWork(
    @CurrentPrincipal() principal: Principal,
    @Param("employeeId", ParseUUIDPipe) employeeId: string,
  ) {
    return { success: true, data: await this.executive.employeeWork(principal, employeeId) };
  }

  @Get("projects")
  @RequirePermissions("executive.dashboard.read", "projects.read_all")
  @ApiOperation({ summary: "List organization projects available for executive assignment" })
  async projects(@CurrentPrincipal() principal: Principal) {
    return { success: true, data: await this.executive.projects(principal) };
  }

  @Post("employees/:employeeId/tasks")
  @RequirePermissions("executive.dashboard.read", "tasks.create_all", "tasks.assign_all")
  @ApiOperation({ summary: "Assign a task to an active employee" })
  async createTask(
    @CurrentPrincipal() principal: Principal,
    @Param("employeeId", ParseUUIDPipe) employeeId: string,
    @Body() dto: CreateExecutiveTaskDto,
    @Req() request: Request,
  ) {
    return {
      success: true,
      data: await this.executive.createTask(principal, employeeId, dto, this.metadata(request)),
    };
  }

  @Patch("tasks/:taskId")
  @RequirePermissions("executive.dashboard.read", "tasks.update_all")
  @ApiOperation({ summary: "Update permitted fields on an organization task" })
  async updateTask(
    @CurrentPrincipal() principal: Principal,
    @Param("taskId", ParseUUIDPipe) taskId: string,
    @Body() dto: UpdateExecutiveTaskDto,
    @Req() request: Request,
  ) {
    return {
      success: true,
      data: await this.executive.updateTask(principal, taskId, dto, this.metadata(request)),
    };
  }

  @Post("tasks/:taskId/cancel")
  @RequirePermissions("executive.dashboard.read", "tasks.cancel_all")
  @ApiOperation({ summary: "Cancel a task without deleting its history" })
  async cancelTask(
    @CurrentPrincipal() principal: Principal,
    @Param("taskId", ParseUUIDPipe) taskId: string,
    @Req() request: Request,
  ) {
    return {
      success: true,
      data: await this.executive.cancelTask(principal, taskId, this.metadata(request)),
    };
  }

  private metadata(request: Request) {
    return { ipAddress: request.ip, userAgent: request.get("user-agent") ?? undefined };
  }
}
