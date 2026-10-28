import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { BatchStatus } from '@prisma/client';

export class CreateBatchDto {
  @ApiProperty({ example: 'BATCH-OU-ROB-2026-A', description: 'Unique batch code' })
  @IsString()
  @IsNotEmpty()
  batchCode: string;

  @ApiPropertyOptional({ description: 'Target Program ID (if not provided in route path)' })
  @IsUUID()
  @IsOptional()
  programId?: string;

  @ApiPropertyOptional({ description: 'Optional Partner Institution ID' })
  @IsUUID()
  @IsOptional()
  institutionId?: string;

  @ApiProperty({ example: 'Osmania University Autumn 2026 Robotics Cohort' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '2026-08-01T00:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2026-11-30T00:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiPropertyOptional({ example: 60, default: 60 })
  @IsInt()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @ApiPropertyOptional({ description: 'Optional Lead Faculty Employee ID' })
  @IsUUID()
  @IsOptional()
  leadFacultyEmployeeId?: string;

  @ApiPropertyOptional({ enum: BatchStatus, default: BatchStatus.UPCOMING })
  @IsEnum(BatchStatus)
  @IsOptional()
  status?: BatchStatus;
}
