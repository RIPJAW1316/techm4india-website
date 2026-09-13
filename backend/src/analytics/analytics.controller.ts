import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { CurrentPrincipal } from "../auth/decorators/current-principal.decorator";
import { RequirePermissions } from "../auth/decorators/require-permissions.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { Principal } from "../auth/auth.types";
import { V2Controller } from "../common/v2-controller.base";
import { AnalyticsService } from "./analytics.service";

@ApiTags("analytics-v2")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: "analytics", version: "2" })
export class AnalyticsController extends V2Controller {
  constructor(private readonly analytics: AnalyticsService) {
    super();
  }

  @Get("overview")
  @RequirePermissions("analytics.read")
  @ApiOperation({ summary: "Organization-scoped cross-domain rollup" })
  overview(@CurrentPrincipal() principal: Principal) {
    return this.ok(this.analytics.overview(principal));
  }
}
