import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentPrincipal } from "../auth/decorators/current-principal.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Principal } from "../auth/auth.types";
import { LeaveService } from "./leave.service";
import { BalanceAdjustmentDto, LeaveApplicationDto, LeaveQueryDto, LeaveReviewDto, LeaveTypeDto } from "./dto/leave.dto";
@ApiTags("leave") @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Controller({ path: "leave", version: "2" })
export class LeaveController { constructor(private readonly service: LeaveService) {}
  @Get("types") types(@CurrentPrincipal() p: Principal) { return this.service.types(p).then((data) => ({ success: true, data })); }
  @Post("types") createType(@CurrentPrincipal() p: Principal, @Body() dto: LeaveTypeDto) { return this.service.createType(p, dto).then((data) => ({ success: true, data })); }
  @Patch("types/:id") updateType(@CurrentPrincipal() p: Principal, @Param("id", ParseUUIDPipe) id: string, @Body() dto: LeaveTypeDto) { return this.service.updateType(p, id, dto).then((data) => ({ success: true, data })); }
  @Get("me/balances") myBalances(@CurrentPrincipal() p: Principal, @Query("year") year?: number) { return this.service.myBalances(p, Number(year) || undefined).then((data) => ({ success: true, data })); }
  @Get("balances") balances(@CurrentPrincipal() p: Principal, @Query("year") year?: number) { return this.service.balances(p, Number(year) || undefined).then((data) => ({ success: true, data })); }
  @Post("balances/:id/adjust") adjust(@CurrentPrincipal() p: Principal, @Param("id", ParseUUIDPipe) id: string, @Body() dto: BalanceAdjustmentDto) { return this.service.adjustBalance(p, id, dto).then((data) => ({ success: true, data })); }
  @Get("me/applications") myApplications(@CurrentPrincipal() p: Principal, @Query() q: LeaveQueryDto) { return this.service.myApplications(p, q).then((r) => ({ success: true, ...r })); }
  @Post("me/applications") apply(@CurrentPrincipal() p: Principal, @Body() dto: LeaveApplicationDto) { return this.service.apply(p, dto).then((data) => ({ success: true, data })); }
  @Post("me/applications/:id/cancel") cancel(@CurrentPrincipal() p: Principal, @Param("id", ParseUUIDPipe) id: string) { return this.service.cancel(p, id).then((data) => ({ success: true, data })); }
  @Get("applications") list(@CurrentPrincipal() p: Principal, @Query() q: LeaveQueryDto) { return this.service.list(p, q).then((r) => ({ success: true, ...r })); }
  @Post("applications/:id/approve") approve(@CurrentPrincipal() p: Principal, @Param("id", ParseUUIDPipe) id: string, @Body() dto: LeaveReviewDto) { return this.service.review(p, id, "APPROVED", dto).then((data) => ({ success: true, data })); }
  @Post("applications/:id/reject") reject(@CurrentPrincipal() p: Principal, @Param("id", ParseUUIDPipe) id: string, @Body() dto: LeaveReviewDto) { return this.service.review(p, id, "REJECTED", dto).then((data) => ({ success: true, data })); }
}
