import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DivisionCode, ProgramCertificationType } from '@prisma/client';
import { CreateCurriculumModuleDto } from './create-curriculum-module.dto';

export class CreateProgramDto {
  @ApiProperty({ example: 'PRG-AI-ROB-01', description: 'Unique code for the program' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Advanced Certificate in Autonomous Robotics & Edge AI' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ enum: DivisionCode, default: DivisionCode.TECHM4_ENGINEERING })
  @IsEnum(DivisionCode)
  @IsNotEmpty()
  division: DivisionCode;

  @ApiProperty({ example: 'Hands-on curriculum covering ROS2, LiDAR SLAM, and Jetson edge inference.' })
  @IsString()
  @IsNotEmpty()
  summary: string;

  @ApiPropertyOptional({ example: 12, default: 12 })
  @IsInt()
  @Min(1)
  @IsOptional()
  durationWeeks?: number;

  @ApiPropertyOptional({ example: 4, default: 4 })
  @IsInt()
  @Min(1)
  @IsOptional()
  credits?: number;

  @ApiPropertyOptional({
    enum: ProgramCertificationType,
    default: ProgramCertificationType.TECHM4_INDUSTRY_CERTIFICATE,
  })
  @IsEnum(ProgramCertificationType)
  @IsOptional()
  certificationType?: ProgramCertificationType;

  @ApiPropertyOptional({ example: 'Undergraduate Engineering (ECE / CSE / Mech)' })
  @IsString()
  @IsOptional()
  targetAudience?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ type: [CreateCurriculumModuleDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCurriculumModuleDto)
  @IsOptional()
  modules?: CreateCurriculumModuleDto[];
}
