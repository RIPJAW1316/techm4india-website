import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { HealthLivenessDto, HealthReadinessDto } from './health.dto';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly appVersion = '1.0.0';

  constructor(private readonly prisma: PrismaService) {}

  getLiveness(): HealthLivenessDto {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: this.appVersion,
    };
  }

  async getReadiness(): Promise<HealthReadinessDto> {
    const dbHealth = await this.prisma.isHealthy();

    const readiness: HealthReadinessDto = {
      status: dbHealth.isHealthy ? 'ok' : 'error',
      database: {
        status: dbHealth.isHealthy ? 'up' : 'down',
        latencyMs: dbHealth.latencyMs,
        ...(dbHealth.error ? { error: dbHealth.error } : {}),
      },
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: this.appVersion,
    };

    if (!dbHealth.isHealthy) {
      this.logger.warn(`Readiness check failed: Database down (${dbHealth.error})`);
      throw new ServiceUnavailableException(readiness);
    }

    return readiness;
  }
}
