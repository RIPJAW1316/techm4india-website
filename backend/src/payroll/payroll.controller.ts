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
import { PayrollService } from "./payroll.service";
import {
  CreateCompensationDto,
  CreateComponentDto,
  CreatePeriodDto,
  CreateRunDto,
  CreateStructureDto,
  OverrideResultDto,
  UpdateCompensationDto,
  UpdateComponentDto,
  UpdatePeriodDto,
  UpdateStructureDto,
} from "./dto/payroll.dto";

@ApiTags("payroll-v2")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: "payroll", version: "2" })
export class PayrollController {
  constructor(private readonly payroll: PayrollService) {}
  @Get("dashboard") @RequirePermissions("payroll.dashboard.read") dashboard(
    @CurrentPrincipal() p: Principal,
  ) {
    return this.ok(this.payroll.dashboard(p));
  }
  @Get("components") @RequirePermissions("payroll.components.read") components(
    @CurrentPrincipal() p: Principal,
  ) {
    return this.ok(this.payroll.components(p));
  }
  @Post("components")
  @RequirePermissions("payroll.components.manage")
  createComponent(
    @CurrentPrincipal() p: Principal,
    @Body() dto: CreateComponentDto,
    @Req() r: Request,
  ) {
    return this.ok(this.payroll.createComponent(p, dto, this.meta(r)));
  }
  @Patch("components/:id")
  @RequirePermissions("payroll.components.manage")
  updateComponent(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateComponentDto,
    @Req() r: Request,
  ) {
    return this.ok(this.payroll.updateComponent(p, id, dto, this.meta(r)));
  }
  @Get("salary-structures")
  @RequirePermissions("payroll.structures.read")
  structures(@CurrentPrincipal() p: Principal) {
    return this.ok(this.payroll.structures(p));
  }
  @Get("salary-structures/:id")
  @RequirePermissions("payroll.structures.read")
  structure(@CurrentPrincipal() p: Principal, @Param("id", ParseUUIDPipe) id: string) {
    return this.ok(this.payroll.structure(p, id));
  }
  @Post("salary-structures")
  @RequirePermissions("payroll.structures.manage")
  createStructure(
    @CurrentPrincipal() p: Principal,
    @Body() dto: CreateStructureDto,
    @Req() r: Request,
  ) {
    return this.ok(this.payroll.createStructure(p, dto, this.meta(r)));
  }
  @Patch("salary-structures/:id")
  @RequirePermissions("payroll.structures.manage")
  updateStructure(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateStructureDto,
    @Req() r: Request,
  ) {
    return this.ok(this.payroll.updateStructure(p, id, dto, this.meta(r)));
  }
  @Get("compensations")
  @RequirePermissions("payroll.compensation.read")
  compensations(@CurrentPrincipal() p: Principal, @Query("employeeId") employeeId?: string) {
    return this.ok(this.payroll.compensations(p, employeeId));
  }
  @Get("employees/:employeeId/compensation")
  @RequirePermissions("payroll.compensation.read")
  employeeCompensation(
    @CurrentPrincipal() p: Principal,
    @Param("employeeId", ParseUUIDPipe) employeeId: string,
  ) {
    return this.ok(this.payroll.compensations(p, employeeId));
  }
  @Post("employees/:employeeId/compensation")
  @RequirePermissions("payroll.compensation.manage")
  createCompensation(
    @CurrentPrincipal() p: Principal,
    @Param("employeeId", ParseUUIDPipe) employeeId: string,
    @Body() dto: CreateCompensationDto,
    @Req() r: Request,
  ) {
    return this.ok(this.payroll.createCompensation(p, employeeId, dto, this.meta(r)));
  }
  @Patch("compensations/:id")
  @RequirePermissions("payroll.compensation.manage")
  updateCompensation(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateCompensationDto,
    @Req() r: Request,
  ) {
    return this.ok(this.payroll.updateCompensation(p, id, dto, this.meta(r)));
  }
  @Get("periods") @RequirePermissions("payroll.runs.read") periods(
    @CurrentPrincipal() p: Principal,
  ) {
    return this.ok(this.payroll.periods(p));
  }
  @Post("periods") @RequirePermissions("payroll.runs.process") createPeriod(
    @CurrentPrincipal() p: Principal,
    @Body() dto: CreatePeriodDto,
    @Req() r: Request,
  ) {
    return this.ok(this.payroll.createPeriod(p, dto, this.meta(r)));
  }
  @Patch("periods/:id")
  @RequirePermissions("payroll.runs.process")
  updatePeriod(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdatePeriodDto,
  ) {
    return this.ok(this.payroll.updatePeriod(p, id, dto));
  }
  @Get("runs") @RequirePermissions("payroll.runs.read") runs(@CurrentPrincipal() p: Principal) {
    return this.ok(this.payroll.runs(p));
  }
  @Get("runs/:id") @RequirePermissions("payroll.runs.read") run(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.ok(this.payroll.run(p, id));
  }
  @Post("runs") @RequirePermissions("payroll.runs.process") createRun(
    @CurrentPrincipal() p: Principal,
    @Body() dto: CreateRunDto,
    @Req() r: Request,
  ) {
    return this.ok(this.payroll.createRun(p, dto, this.meta(r)));
  }
  @Post("runs/:id/calculate")
  @RequirePermissions("payroll.runs.process")
  calculate(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() r: Request,
  ) {
    return this.ok(this.payroll.calculate(p, id, this.meta(r)));
  }
  @Post("runs/:id/submit-review")
  @RequirePermissions("payroll.runs.process")
  submitReview(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() r: Request,
  ) {
    return this.ok(this.payroll.submitReview(p, id, this.meta(r)));
  }
  @Post("runs/:id/finalize")
  @RequirePermissions("payroll.runs.approve")
  finalize(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() r: Request,
  ) {
    return this.ok(this.payroll.finalize(p, id, this.meta(r)));
  }
  @Get("runs/:id/results") @RequirePermissions("payroll.runs.read") results(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.ok(this.payroll.results(p, id));
  }
  @Get("runs/:id/results/:resultId")
  @RequirePermissions("payroll.runs.read")
  result(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) runId: string,
    @Param("resultId", ParseUUIDPipe) resultId: string,
  ) {
    return this.ok(this.payroll.result(p, runId, resultId));
  }
  @Patch("runs/:runId/results/:resultId")
  @RequirePermissions("payroll.runs.process")
  override(
    @CurrentPrincipal() p: Principal,
    @Param("runId", ParseUUIDPipe) runId: string,
    @Param("resultId", ParseUUIDPipe) resultId: string,
    @Body() dto: OverrideResultDto,
    @Req() r: Request,
  ) {
    return this.ok(this.payroll.override(p, runId, resultId, dto, this.meta(r)));
  }
  @Get("me/payslips")
  @RequirePermissions("payroll.payslip.read_self")
  myPayslips(@CurrentPrincipal() p: Principal) {
    return this.ok(this.payroll.myPayslips(p));
  }
  @Get("me/payslips/:id")
  @RequirePermissions("payroll.payslip.read_self")
  myPayslip(@CurrentPrincipal() p: Principal, @Param("id", ParseUUIDPipe) id: string) {
    return this.ok(this.payroll.myPayslip(p, id));
  }
  private ok<T>(data: Promise<T> | T) {
    return Promise.resolve(data).then((value) => ({
      success: true,
      data: value,
    }));
  }
  private meta(r: Request) {
    return { ipAddress: r.ip, userAgent: r.get("user-agent") ?? undefined };
  }
}
