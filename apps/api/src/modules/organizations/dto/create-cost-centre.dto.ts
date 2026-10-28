import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { DivisionCode } from '@prisma/client';

export class CreateCostCentreDto {
  @ApiProperty({ example: 'CC-ENG-ROB-01', description: 'Unique Cost Centre code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Autonomous Robotics R&D Lab' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: DivisionCode, default: DivisionCode.TECHM4_ENGINEERING })
  @IsEnum(DivisionCode)
  @IsNotEmpty()
  division: DivisionCode;

  @ApiPropertyOptional({ example: 2500000, default: 0, description: 'Annual allocated budget in INR' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  budgetAnnual?: number;

  @ApiPropertyOptional({ description: 'Cost Centre Manager Employee ID' })
  @IsUUID()
  @IsOptional()
  managerEmployeeId?: string;
}
