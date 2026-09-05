import { Controller, Get, Param, ParseIntPipe, ParseUUIDPipe, Patch, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { Principal } from "../auth/auth.types";
import { CurrentPrincipal } from "../auth/decorators/current-principal.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { NotificationsService } from "./notifications.service";

@ApiTags("notifications")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("notifications")
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: "List notifications for the authenticated user" })
  async list(@CurrentPrincipal() principal: Principal, @Query("page", new ParseIntPipe({ optional: true })) page = 1, @Query("limit", new ParseIntPipe({ optional: true })) limit = 20) {
    const result = await this.service.list(principal, Math.max(1, page), Math.min(100, Math.max(1, limit)));
    return { success: true, data: result.data, meta: result.meta };
  }

  @Patch(":id/read")
  @ApiOperation({ summary: "Mark one recipient notification as read" })
  async markRead(@CurrentPrincipal() principal: Principal, @Param("id", ParseUUIDPipe) id: string) {
    return { success: true, data: await this.service.markRead(principal, id) };
  }
}
