import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request } from "express";

import { Principal } from "../auth/auth.types";
import { CurrentPrincipal } from "../auth/decorators/current-principal.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { CreateTaskDto } from "./dto/create-task.dto";
import { TaskQueryDto } from "./dto/task-query.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { TasksService } from "./tasks.service";

@ApiTags("tasks")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class TasksController {
  constructor(private readonly service: TasksService) {}

  @Get("tasks/my")
  @ApiOperation({ summary: "List tasks assigned to the authenticated employee" })
  async my(@CurrentPrincipal() principal: Principal, @Query() query: TaskQueryDto) { const result = await this.service.my(principal, query); return { success: true, data: result.data, meta: result.meta }; }

  @Get("tasks/my/summary")
  @ApiOperation({ summary: "Return task KPIs for the authenticated employee" })
  async summary(@CurrentPrincipal() principal: Principal) { return { success: true, data: await this.service.summary(principal) }; }

  @Get("tasks/:id")
  @ApiOperation({ summary: "Read an authorized task" })
  async get(@CurrentPrincipal() principal: Principal, @Param("id", ParseUUIDPipe) id: string) { return { success: true, data: await this.service.getById(principal, id) }; }

  @Post("projects/:projectId/tasks")
  @ApiOperation({ summary: "Create a task in an authorized project" })
  async create(@CurrentPrincipal() principal: Principal, @Param("projectId", ParseUUIDPipe) projectId: string, @Body() dto: CreateTaskDto, @Req() req: Request) { return { success: true, data: await this.service.create(principal, projectId, dto, { ipAddress: req.ip, userAgent: req.get("user-agent") ?? undefined }) }; }

  @Patch("tasks/:id")
  @ApiOperation({ summary: "Update a task within the caller's policy scope" })
  async update(@CurrentPrincipal() principal: Principal, @Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateTaskDto, @Req() req: Request) { return { success: true, data: await this.service.update(principal, id, dto, { ipAddress: req.ip, userAgent: req.get("user-agent") ?? undefined }) }; }

  @Get("tasks/:id/comments")
  async comments(@CurrentPrincipal() principal: Principal, @Param("id", ParseUUIDPipe) id: string) { return { success: true, data: await this.service.comments(principal, id) }; }

  @Post("tasks/:id/comments")
  async addComment(@CurrentPrincipal() principal: Principal, @Param("id", ParseUUIDPipe) id: string, @Body() dto: CreateCommentDto, @Req() req: Request) { return { success: true, data: await this.service.addComment(principal, id, dto, { ipAddress: req.ip, userAgent: req.get("user-agent") ?? undefined }) }; }
}
