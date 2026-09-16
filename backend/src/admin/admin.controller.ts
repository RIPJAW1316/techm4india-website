import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { Principal } from "../auth/auth.types";
import { CurrentPrincipal } from "../auth/decorators/current-principal.decorator";
import { RequirePermissions } from "../auth/decorators/require-permissions.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { AdminService } from "./admin.service";
import { AdminUserQueryDto, AssignUserRoleDto } from "./dto/admin.dto";

@ApiTags("Admin")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: "admin", version: "2" })
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get("users")
  @RequirePermissions("admin.users.read")
  @ApiOperation({
    summary: "List organization users and linked employees safely",
  })
  users(@CurrentPrincipal() principal: Principal, @Query() query: AdminUserQueryDto) {
    return this.admin.users(principal, query).then((result) => ({ success: true, ...result }));
  }

  @Get("users/:id")
  @RequirePermissions("admin.users.read")
  @ApiOperation({
    summary: "Read a safe consolidated user and employee record",
  })
  user(@CurrentPrincipal() principal: Principal, @Param("id", ParseUUIDPipe) id: string) {
    return this.admin.user(principal, id).then((data) => ({ success: true, data }));
  }

  @Get("roles")
  @RequirePermissions("admin.roles.read")
  @ApiOperation({
    summary: "Read the official role catalogue and implemented permissions",
  })
  roles(@CurrentPrincipal() principal: Principal) {
    return this.admin.roles(principal).then((data) => ({ success: true, data }));
  }

  @Get("permissions")
  @RequirePermissions("admin.permissions.read")
  @ApiOperation({ summary: "Read the current role-permission matrix" })
  permissions(@CurrentPrincipal() principal: Principal) {
    return this.admin.permissions(principal).then((data) => ({ success: true, data }));
  }

  @Post("users/:id/roles")
  @RequirePermissions("admin.users.manage_roles")
  @ApiOperation({ summary: "Assign an official role to an organization user" })
  assignRole(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: AssignUserRoleDto,
    @Req() request: Request,
  ) {
    return this.admin
      .assignRole(principal, id, dto.roleId, this.metadata(request))
      .then((data) => ({ success: true, data }));
  }

  @Delete("users/:id/roles/:roleId")
  @RequirePermissions("admin.users.manage_roles")
  @ApiOperation({
    summary: "Remove an assigned role without deleting the user",
  })
  removeRole(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("roleId", ParseUUIDPipe) roleId: string,
    @Req() request: Request,
  ) {
    return this.admin
      .removeRole(principal, id, roleId, this.metadata(request))
      .then((data) => ({ success: true, data }));
  }

  @Post("users/:id/activate")
  @RequirePermissions("admin.users.manage_status")
  @ApiOperation({
    summary: "Activate a user account independently of employment status",
  })
  activate(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: Request,
  ) {
    return this.admin
      .activate(principal, id, this.metadata(request))
      .then((data) => ({ success: true, data }));
  }

  @Post("users/:id/deactivate")
  @RequirePermissions("admin.users.manage_status")
  @ApiOperation({
    summary: "Disable a user account and revoke active sessions",
  })
  deactivate(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: Request,
  ) {
    return this.admin
      .deactivate(principal, id, this.metadata(request))
      .then((data) => ({ success: true, data }));
  }

  private metadata(request: Request) {
    return {
      ipAddress: request.ip,
      userAgent: request.get("user-agent") ?? undefined,
    };
  }
}
