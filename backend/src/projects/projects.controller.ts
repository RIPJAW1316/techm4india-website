import {
  Body,
  Controller,
  Delete,
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

import { Principal } from "../auth/auth.types";
import { CurrentPrincipal } from "../auth/decorators/current-principal.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AddProjectMemberDto } from "./dto/add-project-member.dto";
import { CreateProjectDto } from "./dto/create-project.dto";
import { ProjectQueryDto } from "./dto/project-query.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { ProjectsService } from "./projects.service";

@ApiTags("projects")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("projects")
export class ProjectsController {
  constructor(private readonly service: ProjectsService) {}

  @Get("my")
  @ApiOperation({ summary: "List projects associated with the authenticated employee" })
  async my(@CurrentPrincipal() principal: Principal, @Query() query: ProjectQueryDto) {
    const result = await this.service.my(principal, query);
    return { success: true, data: result.data, meta: result.meta };
  }

  @Get()
  @ApiOperation({ summary: "List projects in the authenticated user's permitted scope" })
  async list(@CurrentPrincipal() principal: Principal, @Query() query: ProjectQueryDto) {
    const result = await this.service.list(principal, query);
    return { success: true, data: result.data, meta: result.meta };
  }

  @Get(":id")
  @ApiOperation({ summary: "Read an authorized project and task summary" })
  async get(@CurrentPrincipal() principal: Principal, @Param("id", ParseUUIDPipe) id: string) {
    return { success: true, data: await this.service.getById(principal, id) };
  }

  @Post()
  @ApiOperation({ summary: "Create a project in an authorized division" })
  async create(
    @CurrentPrincipal() principal: Principal,
    @Body() dto: CreateProjectDto,
    @Req() req: Request,
  ) {
    return {
      success: true,
      data: await this.service.create(principal, dto, {
        ipAddress: req.ip,
        userAgent: req.get("user-agent") ?? undefined,
      }),
    };
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update authorized project metadata" })
  async update(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateProjectDto,
    @Req() req: Request,
  ) {
    return {
      success: true,
      data: await this.service.update(principal, id, dto, {
        ipAddress: req.ip,
        userAgent: req.get("user-agent") ?? undefined,
      }),
    };
  }

  @Get(":id/members")
  async members(@CurrentPrincipal() principal: Principal, @Param("id", ParseUUIDPipe) id: string) {
    return { success: true, data: await this.service.members(principal, id) };
  }

  @Post(":id/members")
  async addMember(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: AddProjectMemberDto,
    @Req() req: Request,
  ) {
    return {
      success: true,
      data: await this.service.addMember(principal, id, dto, {
        ipAddress: req.ip,
        userAgent: req.get("user-agent") ?? undefined,
      }),
    };
  }

  @Delete(":id/members/:employeeId")
  async removeMember(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("employeeId", ParseUUIDPipe) employeeId: string,
    @Req() req: Request,
  ) {
    return {
      success: true,
      data: await this.service.removeMember(principal, id, employeeId, {
        ipAddress: req.ip,
        userAgent: req.get("user-agent") ?? undefined,
      }),
    };
  }
}
