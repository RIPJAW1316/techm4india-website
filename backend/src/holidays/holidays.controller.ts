import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentPrincipal } from "../auth/decorators/current-principal.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Principal } from "../auth/auth.types";
import { HolidayDto, HolidayQueryDto } from "./dto/holiday.dto";
import { HolidaysService } from "./holidays.service";
@ApiTags("holidays") @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Controller({ path: "holidays", version: "2" })
export class HolidaysController { constructor(private readonly service: HolidaysService) {} @Get() list(@CurrentPrincipal() p: Principal, @Query() q: HolidayQueryDto) { return this.service.list(p, q).then((r) => ({ success: true, ...r })); } @Post() create(@CurrentPrincipal() p: Principal, @Body() dto: HolidayDto) { return this.service.create(p, dto).then((data) => ({ success: true, data })); } @Patch(":id") update(@CurrentPrincipal() p: Principal, @Param("id", ParseUUIDPipe) id: string, @Body() dto: HolidayDto) { return this.service.update(p, id, dto).then((data) => ({ success: true, data })); } }
