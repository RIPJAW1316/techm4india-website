import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Request } from "express";

import { Principal } from "../auth/auth.types";
import { CurrentPrincipal } from "../auth/decorators/current-principal.decorator";
import { RequirePermissions } from "../auth/decorators/require-permissions.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { BranchQueryDto, CreateBranchDto, UpdateBranchDto } from "./dto/branch.dto";
import { UpdateCompanyProfileDto } from "./dto/company-profile.dto";
import { CostCentreQueryDto, CreateCostCentreDto, UpdateCostCentreDto } from "./dto/cost-centre.dto";
import { StructureQueryDto } from "./dto/structure-query.dto";
import { AddTeamMemberDto, CreateTeamDto, TeamQueryDto, UpdateTeamDto } from "./dto/team.dto";
import { CompanyService } from "./company.service";

@ApiTags("company-v2")
@ApiBearerAuth()
@Controller({ path: "company", version: "2" })
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CompanyController {
  constructor(private readonly company: CompanyService) {}

  @Get("profile")
  @RequirePermissions("company.profile.read")
  @ApiOperation({ summary: "Read the authorized company profile" })
  async profile(@CurrentPrincipal() principal: Principal) {
    return { success: true, data: await this.company.getProfile(principal) };
  }

  @Patch("profile")
  @RequirePermissions("company.profile.manage")
  @ApiOperation({ summary: "Update company profile metadata" })
  async updateProfile(@CurrentPrincipal() principal: Principal, @Body() dto: UpdateCompanyProfileDto, @Req() request: Request) {
    return { success: true, data: await this.company.updateProfile(principal, dto, this.metadata(request)) };
  }

  @Get("divisions")
  @RequirePermissions("organization.structure.read")
  @ApiOperation({ summary: "List authorized divisions" })
  async divisions(@CurrentPrincipal() principal: Principal, @Query() query: StructureQueryDto) {
    return { success: true, data: await this.company.divisions(principal, query) };
  }

  @Get("departments")
  @RequirePermissions("organization.structure.read")
  @ApiOperation({ summary: "List authorized departments" })
  async departments(@CurrentPrincipal() principal: Principal, @Query() query: StructureQueryDto) {
    return { success: true, data: await this.company.departments(principal, query) };
  }

  @Get("branches")
  @RequirePermissions("branches.read")
  @ApiOperation({ summary: "List organization branches" })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiQuery({ name: "type", required: false, enum: ["HEADQUARTERS", "REGIONAL_OFFICE", "PARTNER_LAB", "OTHER"] })
  @ApiQuery({ name: "isActive", required: false, type: Boolean })
  async branches(@CurrentPrincipal() principal: Principal, @Query() query: BranchQueryDto) {
    return { success: true, ...(await this.company.branches(principal, query)) };
  }

  @Get("branches/:id")
  @RequirePermissions("branches.read")
  @ApiOperation({ summary: "Read one organization branch" })
  async branch(@CurrentPrincipal() principal: Principal, @Param("id", ParseUUIDPipe) id: string) {
    return { success: true, data: await this.company.branch(principal, id) };
  }

  @Post("branches")
  @RequirePermissions("branches.manage")
  @ApiOperation({ summary: "Create a branch" })
  async createBranch(@CurrentPrincipal() principal: Principal, @Body() dto: CreateBranchDto, @Req() request: Request) {
    return { success: true, data: await this.company.createBranch(principal, dto, this.metadata(request)) };
  }

  @Patch("branches/:id")
  @RequirePermissions("branches.manage")
  @ApiOperation({ summary: "Update branch metadata or lifecycle" })
  async updateBranch(@CurrentPrincipal() principal: Principal, @Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateBranchDto, @Req() request: Request) {
    return { success: true, data: await this.company.updateBranch(principal, id, dto, this.metadata(request)) };
  }

  @Get("cost-centres")
  @RequirePermissions("cost_centres.read")
  @ApiOperation({ summary: "List authorized cost centres" })
  async costCentres(@CurrentPrincipal() principal: Principal, @Query() query: CostCentreQueryDto) {
    return { success: true, ...(await this.company.costCentres(principal, query)) };
  }

  @Get("cost-centres/:id")
  @RequirePermissions("cost_centres.read")
  async costCentre(@CurrentPrincipal() principal: Principal, @Param("id", ParseUUIDPipe) id: string) {
    return { success: true, data: await this.company.costCentre(principal, id) };
  }

  @Post("cost-centres")
  @RequirePermissions("cost_centres.manage")
  @ApiOperation({ summary: "Create a structural cost centre" })
  async createCostCentre(@CurrentPrincipal() principal: Principal, @Body() dto: CreateCostCentreDto, @Req() request: Request) {
    return { success: true, data: await this.company.createCostCentre(principal, dto, this.metadata(request)) };
  }

  @Patch("cost-centres/:id")
  @RequirePermissions("cost_centres.manage")
  @ApiOperation({ summary: "Update cost centre metadata or lifecycle" })
  async updateCostCentre(@CurrentPrincipal() principal: Principal, @Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateCostCentreDto, @Req() request: Request) {
    return { success: true, data: await this.company.updateCostCentre(principal, id, dto, this.metadata(request)) };
  }

  @Get("teams")
  @RequirePermissions("teams.read")
  @ApiOperation({ summary: "List authorized teams" })
  async teams(@CurrentPrincipal() principal: Principal, @Query() query: TeamQueryDto) {
    return { success: true, ...(await this.company.teams(principal, query)) };
  }

  @Get("teams/:id")
  @RequirePermissions("teams.read")
  @ApiOperation({ summary: "Read one authorized team" })
  async team(@CurrentPrincipal() principal: Principal, @Param("id", ParseUUIDPipe) id: string) {
    return { success: true, data: await this.company.team(principal, id) };
  }

  @Post("teams")
  @RequirePermissions("teams.manage")
  @ApiOperation({ summary: "Create a team" })
  async createTeam(@CurrentPrincipal() principal: Principal, @Body() dto: CreateTeamDto, @Req() request: Request) {
    return { success: true, data: await this.company.createTeam(principal, dto, this.metadata(request)) };
  }

  @Patch("teams/:id")
  @RequirePermissions("teams.manage")
  @ApiOperation({ summary: "Update team metadata or lifecycle" })
  async updateTeam(@CurrentPrincipal() principal: Principal, @Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateTeamDto, @Req() request: Request) {
    return { success: true, data: await this.company.updateTeam(principal, id, dto, this.metadata(request)) };
  }

  @Get("teams/:id/members")
  @RequirePermissions("teams.read")
  @ApiOperation({ summary: "List active and historical team membership" })
  async members(@CurrentPrincipal() principal: Principal, @Param("id", ParseUUIDPipe) id: string) {
    return { success: true, data: await this.company.members(principal, id) };
  }

  @Post("teams/:id/members")
  @RequirePermissions("teams.manage")
  @ApiOperation({ summary: "Add an employee to a team" })
  async addMember(@CurrentPrincipal() principal: Principal, @Param("id", ParseUUIDPipe) id: string, @Body() dto: AddTeamMemberDto, @Req() request: Request) {
    return { success: true, data: await this.company.addMember(principal, id, dto, this.metadata(request)) };
  }

  @Delete("teams/:id/members/:employeeId")
  @RequirePermissions("teams.manage")
  @ApiOperation({ summary: "Remove a member by setting removedAt" })
  async removeMember(@CurrentPrincipal() principal: Principal, @Param("id", ParseUUIDPipe) id: string, @Param("employeeId", ParseUUIDPipe) employeeId: string, @Req() request: Request) {
    return { success: true, data: await this.company.removeMember(principal, id, employeeId, this.metadata(request)) };
  }

  private metadata(request: Request) {
    return { ipAddress: request.ip, userAgent: request.get("user-agent") ?? undefined };
  }
}
