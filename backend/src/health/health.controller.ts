import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { HealthService } from "./health.service";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: "Check API and database availability" })
  @ApiOkResponse({
    schema: {
      example: {
        status: "ok",
        service: "techm4india-erp-api",
        database: "connected",
        timestamp: "2026-01-01T00:00:00.000Z",
      },
    },
  })
  getStatus() {
    return this.healthService.getStatus();
  }
}
