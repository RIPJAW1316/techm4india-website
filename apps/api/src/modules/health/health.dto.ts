import { ApiProperty } from '@nestjs/swagger';

export class HealthLivenessDto {
  @ApiProperty({ example: 'ok' })
  status: string;

  @ApiProperty({ example: 123.45 })
  uptime: number;

  @ApiProperty({ example: '2026-10-23T18:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: '1.0.0' })
  version: string;
}

export class DatabaseHealthDto {
  @ApiProperty({ example: 'up', enum: ['up', 'down'] })
  status: string;

  @ApiProperty({ example: 4, description: 'Latency in milliseconds' })
  latencyMs: number;

  @ApiProperty({ required: false, example: 'techm4india_erp' })
  database?: string;

  @ApiProperty({ required: false, example: true })
  ssl?: boolean;

  @ApiProperty({ required: false, example: 'Connection timeout' })
  error?: string;
}

export class HealthReadinessDto {
  @ApiProperty({ example: 'ok', enum: ['ok', 'error'] })
  status: string;

  @ApiProperty({ type: () => DatabaseHealthDto })
  database: DatabaseHealthDto;

  @ApiProperty({ example: 123.45 })
  uptime: number;

  @ApiProperty({ example: '2026-10-23T18:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: '1.0.0' })
  version: string;
}
