import {
  Body,
  Controller,
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

import { CurrentPrincipal } from "../auth/decorators/current-principal.decorator";
import { RequirePermissions } from "../auth/decorators/require-permissions.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { Principal } from "../auth/auth.types";
import { V2Controller } from "../common/v2-controller.base";
import {
  AddComplianceEvidenceDto,
  ComplianceQueryDto,
  CreateComplianceObligationDto,
} from "./dto/compliance.dto";
import { ComplianceService } from "./compliance.service";

@ApiTags("compliance-v2")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: "compliance", version: "2" })
export class ComplianceController extends V2Controller {
  constructor(private readonly compliance: ComplianceService) {
    super();
  }

  @Get("dashboard")
  @RequirePermissions("compliance.dashboard.read")
  @ApiOperation({ summary: "Compliance calendar status and overdue count" })
  dashboard(@CurrentPrincipal() principal: Principal) {
    return this.ok(this.compliance.dashboard(principal));
  }

  @Get("obligations")
  @RequirePermissions("compliance.read")
  listObligations(@CurrentPrincipal() principal: Principal, @Query() query: ComplianceQueryDto) {
    return this.list(this.compliance.listObligations(principal, query));
  }

  @Get("obligations/:id")
  @RequirePermissions("compliance.read")
  getObligation(@CurrentPrincipal() principal: Principal, @Param("id", ParseUUIDPipe) id: string) {
    return this.ok(this.compliance.getObligation(principal, id));
  }

  @Post("obligations")
  @RequirePermissions("compliance.manage")
  @ApiOperation({ summary: "Register a compliance obligation on the calendar" })
  createObligation(
    @CurrentPrincipal() principal: Principal,
    @Body() dto: CreateComplianceObligationDto,
    @Req() request: Request,
  ) {
    return this.ok(this.compliance.createObligation(principal, dto, this.metadata(request)));
  }

  @Post("obligations/:id/evidence")
  @RequirePermissions("compliance.manage")
  addEvidence(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: AddComplianceEvidenceDto,
    @Req() request: Request,
  ) {
    return this.ok(this.compliance.addEvidence(principal, id, dto, this.metadata(request)));
  }

  @Post("obligations/:id/start")
  @RequirePermissions("compliance.manage")
  start(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: Request,
  ) {
    return this.ok(this.compliance.transition(principal, id, "start", this.metadata(request)));
  }

  @Post("obligations/:id/submit")
  @RequirePermissions("compliance.manage")
  submit(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: Request,
  ) {
    return this.ok(this.compliance.transition(principal, id, "submit", this.metadata(request)));
  }

  @Post("obligations/:id/complete")
  @RequirePermissions("compliance.manage")
  complete(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: Request,
  ) {
    return this.ok(this.compliance.transition(principal, id, "complete", this.metadata(request)));
  }

  @Post("obligations/:id/waive")
  @RequirePermissions("compliance.manage")
  waive(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: Request,
  ) {
    return this.ok(this.compliance.transition(principal, id, "waive", this.metadata(request)));
  }
}
