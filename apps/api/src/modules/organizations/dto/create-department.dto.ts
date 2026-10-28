import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'SPACE-AVIONICS', description: 'Unique department code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Space Avionics & Telemetry Engineering' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Payload design, flight telemetry, RF communications, and CanSat subsystem development.' })
  @IsString()
  @IsOptional()
  description?: string;
}
