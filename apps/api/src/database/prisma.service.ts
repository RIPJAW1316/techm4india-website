import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  Optional,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

export interface DatabaseHealthResult {
  isHealthy: boolean;
  latencyMs: number;
  database?: string;
  ssl?: boolean;
  error?: string;
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(@Optional() private readonly configService?: ConfigService) {
    const databaseUrl =
      configService?.get<string>('database.url') || process.env.DATABASE_URL;

    super({
      datasources: databaseUrl
        ? {
            db: {
              url: databaseUrl,
            },
          }
        : undefined,
      log:
        process.env.NODE_ENV === 'development'
          ? ['warn', 'error']
          : ['error'],
    });
  }

  /**
   * Safely masks a database connection URL so credentials are never logged or exposed.
   */
  static maskUrl(url?: string): string {
    if (!url) return 'Not configured';
    try {
      const parsed = new URL(url);
      if (parsed.password) {
        parsed.password = '****';
      }
      return parsed.toString();
    } catch {
      return 'postgresql://****';
    }
  }

  async onModuleInit(): Promise<void> {
    const rawUrl =
      this.configService?.get<string>('database.url') || process.env.DATABASE_URL;
    const maskedUrl = PrismaService.maskUrl(rawUrl);

    try {
      await this.$connect();
      this.logger.log(`PostgreSQL connected successfully [Target: ${maskedUrl}]`);
    } catch (error) {
      this.logger.error(
        `Failed to connect to PostgreSQL [Target: ${maskedUrl}]`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('PostgreSQL connection closed cleanly.');
  }

  async isHealthy(): Promise<DatabaseHealthResult> {
    const startTime = Date.now();
    try {
      const rows: any = await this.$queryRaw`
        SELECT current_database() AS "database";
      `;
      const latencyMs = Date.now() - startTime;
      const currentDb = Array.isArray(rows) && rows[0]?.database ? rows[0].database : undefined;

      let sslActive = false;
      try {
        const sslRows: any = await this.$queryRaw`
          SELECT ssl FROM pg_stat_ssl WHERE pid = pg_backend_pid();
        `;
        if (Array.isArray(sslRows) && sslRows[0]?.ssl) {
          sslActive = Boolean(sslRows[0].ssl);
        }
      } catch {
        // Non-fatal if pg_stat_ssl is not accessible
        sslActive = false;
      }

      return {
        isHealthy: true,
        latencyMs,
        database: currentDb,
        ssl: sslActive,
      };
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
