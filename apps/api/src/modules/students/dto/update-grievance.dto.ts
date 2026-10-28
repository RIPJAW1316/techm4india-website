import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { GrievanceStatus } from '@prisma/client';

export class UpdateGrievanceDto {
  @ApiProperty({
    enum: GrievanceStatus,
    example: GrievanceStatus.RESOLVED,
    description: 'Status: OPEN, UNDER_INVESTIGATION, RESOLVED, CLOSED',
  })
  @IsEnum(GrievanceStatus)
  @IsNotEmpty()
  status: GrievanceStatus;

  @ApiPropertyOptional({
    example: 'Replaced USB 3.0 bridge cable on LiDAR test bench. Verified /scan topic publishing at 10Hz.',
  })
  @IsString()
  @IsOptional()
  resolutionNotes?: string;
}
