import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DealStage } from '@prisma/client';

export class UpdateDealStageDto {
  @ApiProperty({ enum: DealStage, description: 'Target Kanban stage' })
  @IsEnum(DealStage)
  @IsNotEmpty()
  stage: DealStage;

  @ApiPropertyOptional({ description: 'Reason or milestone narrative for stage transition' })
  @IsString()
  @IsOptional()
  notes?: string;
}
