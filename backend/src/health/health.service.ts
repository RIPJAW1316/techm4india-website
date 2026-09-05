import { Injectable } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async getStatus() {
    const database = await this.prisma.checkConnection();

    return {
      status: database === "connected" ? "ok" : "degraded",
      service: "techm4india-erp-api",
      database,
      timestamp: new Date().toISOString(),
    };
  }
}
