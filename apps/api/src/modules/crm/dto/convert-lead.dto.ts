import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DealStage } from '@prisma/client';

export class ConvertLeadDto {
  @ApiPropertyOptional({ description: 'Deal value in INR', example: 1500000 })
  @IsNumber()
  @IsOptional()
  dealAmount?: number;

  @ApiPropertyOptional({ description: 'Target closing date ISO string', example: '2026-11-30' })
  @IsDateString()
  @IsOptional()
  closingDate?: string;

  @ApiPropertyOptional({ enum: DealStage, default: DealStage.QUALIFICATION })
  @IsEnum(DealStage)
  @IsOptional()
  stage?: DealStage = DealStage.QUALIFICATION;

  @ApiPropertyOptional({ description: 'Custom Institution / Account title' })
  @IsString()
  @IsOptional()
  customAccountName?: string;
}
