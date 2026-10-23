import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log:
        process.env.NODE_ENV === 'development'
          ? ['warn', 'error']
          : ['error'],
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('PostgreSQL connection established successfully via Prisma.');
    } catch (error) {
      this.logger.error(
        'Failed to connect to PostgreSQL during initialization.',
        error instanceof Error ? error.stack : undefined,
      );
      // In production/readiness, health check will report database status.
      // We do not exit process immediately so health/readiness endpoints can report failure clearly.
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('PostgreSQL connection closed cleanly.');
  }

  async isHealthy(): Promise<{ isHealthy: boolean; latencyMs: number; error?: string }> {
    const startTime = Date.now();
    try {
      await this.$queryRaw`SELECT 1;`;
      const latencyMs = Date.now() - startTime;
      return { isHealthy: true, latencyMs };
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      return {
        isHealthy: false,
        latencyMs,
        error: error instanceof Error ? error.message : 'Database ping failed',
      };
    }
  }
}
