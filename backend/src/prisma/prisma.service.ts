import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly databaseConfigured: boolean;

  constructor(configService: ConfigService) {
    const databaseUrl = configService.get<string>("databaseUrl");
    super(
      databaseUrl
        ? {
            datasources: {
              db: { url: databaseUrl },
            },
          }
        : undefined,
    );
    this.databaseConfigured = Boolean(databaseUrl);
  }

  async onModuleInit(): Promise<void> {
    if (this.databaseConfigured) {
      try {
        await this.$connect();
      } catch {
        // Keep the API available so /health can report database unavailability.
      }
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  async checkConnection(): Promise<
    "connected" | "unavailable" | "not_configured"
  > {
    if (!this.databaseConfigured) {
      return "not_configured";
    }

    try {
      await this.$queryRaw`SELECT 1`;
      return "connected";
    } catch {
      return "unavailable";
    }
  }
}
