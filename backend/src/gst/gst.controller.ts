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

import { Principal } from "../auth/auth.types";
import { CurrentPrincipal } from "../auth/decorators/current-principal.decorator";
import { RequirePermissions } from "../auth/decorators/require-permissions.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { V2Controller } from "../common/v2-controller.base";
import {
  CreateHsnSacCodeDto,
  GstPeriodDto,
  GstRegisterQueryDto,
  HsnSacQueryDto,
  UpdateHsnSacCodeDto,
} from "./dto/gst.dto";
import { GstService } from "./gst.service";

/**
 * GST return workings.
 *
 * These endpoints compute returns from records the organization entered. They
 * do not file anything: direct filing runs through a GST Suvidha Provider, and
 * every response is presented in the UI as a working for a tax professional to
 * review rather than as a filed return.
 */
@ApiTags("gst-v2")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: "gst", version: "2" })
export class GstController extends V2Controller {
  constructor(private readonly gst: GstService) {
    super();
  }

  @Get("hsn-codes")
  @RequirePermissions("finance.gst.read")
  hsnCodes(@CurrentPrincipal() principal: Principal, @Query() query: HsnSacQueryDto) {
    return this.ok(this.gst.listHsnCodes(principal, query));
  }

  @Post("hsn-codes")
  @RequirePermissions("finance.tax.manage")
  createHsnCode(
    @CurrentPrincipal() principal: Principal,
    @Body() dto: CreateHsnSacCodeDto,
    @Req() request: Request,
  ) {
    return this.ok(this.gst.createHsnCode(principal, dto, this.metadata(request)));
  }

  @Patch("hsn-codes/:id")
  @RequirePermissions("finance.tax.manage")
  updateHsnCode(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateHsnSacCodeDto,
    @Req() request: Request,
  ) {
    return this.ok(this.gst.updateHsnCode(principal, id, dto, this.metadata(request)));
  }

  @Get("gstr-1")
  @RequirePermissions("finance.gst.read")
  gstr1(@CurrentPrincipal() principal: Principal, @Query() query: GstPeriodDto) {
    return this.ok(this.gst.gstr1(principal, query));
  }

  @Get("gstr-3b")
  @RequirePermissions("finance.gst.read")
  gstr3b(@CurrentPrincipal() principal: Principal, @Query() query: GstPeriodDto) {
    return this.ok(this.gst.gstr3b(principal, query));
  }

  @Get("itc-register")
  @RequirePermissions("finance.gst.read")
  itcRegister(@CurrentPrincipal() principal: Principal, @Query() query: GstRegisterQueryDto) {
    return this.list(this.gst.itcRegister(principal, query));
  }
}
