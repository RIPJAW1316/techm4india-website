import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuoteItemDto {
  @ApiProperty({ description: 'Description of service or kit component', example: '60-Seat ROS2 & Edge AI Robotics Lab Infrastructure Setup' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ description: 'HSN/SAC Code', example: '998334' })
  @IsString()
  @IsOptional()
  hsnSacCode?: string = '998334';

  @ApiProperty({ description: 'Quantity', example: 1 })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Unit rate before tax in INR', example: 1271186.44 })
  @IsNumber()
  unitRate: number;

  @ApiPropertyOptional({ description: 'GST rate percentage', example: 18.0 })
  @IsNumber()
  @IsOptional()
  taxRatePct?: number = 18.0;
}

export class CreateQuoteDto {
  @ApiPropertyOptional({ description: 'Linked Deal UUID' })
  @IsString()
  @IsOptional()
  dealId?: string;

  @ApiPropertyOptional({ description: 'Target Institution UUID' })
  @IsString()
  @IsOptional()
  institutionId?: string;

  @ApiProperty({ description: 'Quotation validity expiry date', example: '2026-12-31' })
  @IsDateString()
  validUntil: string;

  @ApiPropertyOptional({ description: 'Discount in INR', example: 0 })
  @IsNumber()
  @IsOptional()
  discount?: number = 0;

  @ApiPropertyOptional({ description: 'Notes and commercial terms' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ type: [CreateQuoteItemDto], description: 'Quotation line items' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuoteItemDto)
  items: CreateQuoteItemDto[];
}
