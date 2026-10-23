import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { HealthLivenessDto, HealthReadinessDto } from './health.dto';

@ApiTags('Health & Monitoring')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Application Liveness Check',
    description:
      'Returns 200 OK if the application server is responsive and accepting HTTP requests.',
  })
  @ApiResponse({
    status: 200,
    description: 'Application server is live and healthy.',
    type: HealthLivenessDto,
  })
  getLiveness(): HealthLivenessDto {
    return this.healthService.getLiveness();
  }

  @Get('ready')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Application Readiness Check',
    description:
      'Checks application readiness including PostgreSQL database connectivity. Used by orchestrators and load balancers.',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is ready to serve traffic with healthy database connectivity.',
    type: HealthReadinessDto,
  })
  @ApiResponse({
    status: 503,
    description: 'Application is not ready. Database connection failed.',
    type: HealthReadinessDto,
  })
  async getReadiness(): Promise<HealthReadinessDto> {
    return this.healthService.getReadiness();
  }
}
