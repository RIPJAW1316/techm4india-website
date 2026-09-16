import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentPrincipal } from "../auth/decorators/current-principal.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Principal } from "../auth/auth.types";
import { AttendanceService } from "./attendance.service";
import {
  AttendanceCorrectionDto,
  AttendanceRangeQueryDto,
  AttendanceSummaryQueryDto,
} from "./dto/attendance.dto";

@ApiTags("attendance")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: "attendance", version: "2" })
export class AttendanceController {
  constructor(private readonly service: AttendanceService) {}
  @Get("me/today")
  @ApiOperation({
    summary: "Read the authenticated employee attendance record for the current business day",
  })
  meToday(@CurrentPrincipal() p: Principal) {
    return this.service.meToday(p).then((data) => ({ success: true, data }));
  }
  @Get("me")
  @ApiOperation({ summary: "Read paginated attendance history for the authenticated employee" })
  me(@CurrentPrincipal() p: Principal, @Query() q: AttendanceRangeQueryDto) {
    return this.service.me(p, q).then((r) => ({ success: true, ...r }));
  }
  @Post("me/check-in") checkIn(@CurrentPrincipal() p: Principal) {
    return this.service.checkIn(p).then((data) => ({ success: true, data }));
  }
  @Post("me/check-out") checkOut(@CurrentPrincipal() p: Principal) {
    return this.service.checkOut(p).then((data) => ({ success: true, data }));
  }
  @Get() list(@CurrentPrincipal() p: Principal, @Query() q: AttendanceRangeQueryDto) {
    return this.service.list(p, q).then((r) => ({ success: true, ...r }));
  }
  @Get("summary") summary(@CurrentPrincipal() p: Principal, @Query() q: AttendanceSummaryQueryDto) {
    return this.service.summary(p, q).then((data) => ({ success: true, data }));
  }
  @Patch(":id") correct(
    @CurrentPrincipal() p: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: AttendanceCorrectionDto,
  ) {
    return this.service.correct(p, id, dto).then((data) => ({ success: true, data }));
  }
}
