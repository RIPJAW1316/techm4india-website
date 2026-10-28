import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DealStage, LeadVertical } from '@prisma/client';

export class CreateDealDto {
  @ApiProperty({ description: 'Title of commercial deal', example: 'Osmania Univ - Centre of Excellence in Robotics & Edge AI' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Institution UUID' })
  @IsString()
  @IsOptional()
  institutionId?: string;

  @ApiPropertyOptional({ enum: LeadVertical, default: LeadVertical.ENGINEERING_COLLEGES })
  @IsEnum(LeadVertical)
  @IsOptional()
  vertical?: LeadVertical = LeadVertical.ENGINEERING_COLLEGES;

  @ApiProperty({ description: 'Contract amount in INR', example: 1500000 })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ enum: DealStage, default: DealStage.QUALIFICATION })
  @IsEnum(DealStage)
  @IsOptional()
  stage?: DealStage = DealStage.QUALIFICATION;

  @ApiPropertyOptional({ description: 'Expected deal closing date', example: '2026-11-30' })
  @IsDateString()
  @IsOptional()
  expectedCloseDate?: string;

  @ApiPropertyOptional({ description: 'Owner Employee ID' })
  @IsString()
  @IsOptional()
  ownerEmployeeId?: string;

  @ApiPropertyOptional({ description: 'Commercial deal notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}
