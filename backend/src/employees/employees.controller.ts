import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Query, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request } from "express";

import { Principal } from "../auth/auth.types";
import { CurrentPrincipal } from "../auth/decorators/current-principal.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { EmployeeQueryDto } from "./dto/employee-query.dto";
import { UpdateSelfDto } from "./dto/update-self.dto";
import { EmployeesService } from "./employees.service";

@ApiTags("employees")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("employees")
export class EmployeesController {
  constructor(
    private readonly employeesService: EmployeesService,
  ) {}

  @Get("me")
  @ApiOperation({ summary: "Return the authenticated employee profile" })
  async getMe(@CurrentPrincipal() principal: Principal) {
    return { success: true, data: await this.employeesService.getMe(principal) };
  }

  @Patch("me")
  @ApiOperation({ summary: "Update the authenticated employee safe profile fields" })
  async updateMe(@CurrentPrincipal() principal: Principal, @Body() dto: UpdateSelfDto, @Req() request: Request) {
    return {
      success: true,
      data: await this.employeesService.updateMe(principal, dto, {
        ipAddress: request.ip,
        userAgent: request.get("user-agent") ?? undefined,
      }),
    };
  }

  @Get()
  @ApiOperation({ summary: "List employees within the principal's authorized scope" })
  async list(@CurrentPrincipal() principal: Principal, @Query() query: EmployeeQueryDto) {
    const result = await this.employeesService.list(principal, query);
    return { success: true, data: result.data, meta: result.meta };
  }

  @Get(":id")
  @ApiOperation({ summary: "Read one authorized employee profile" })
  async getById(@CurrentPrincipal() principal: Principal, @Param("id", ParseUUIDPipe) id: string) {
    return { success: true, data: await this.employeesService.getById(principal, id) };
  }
}
