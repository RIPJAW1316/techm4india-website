import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { DivisionCode, InvoiceType } from '@prisma/client';

export class CreateInvoiceItemDto {
  @ApiProperty({ example: 'Enterprise Cloud ERP Implementation & Architecture Consulting' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: '998313', description: 'HSN or SAC Code' })
  @IsString()
  @IsNotEmpty()
  hsnSacCode: string;

  @ApiProperty({ example: 1, description: 'Quantity / Units' })
  @IsNumber()
  @Min(0.01)
  quantity: number;

  @ApiProperty({ example: 250000, description: 'Unit Price in selected currency' })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ example: 0, description: 'Discount amount' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;

  @ApiProperty({ example: 18, description: 'GST rate in percentage (e.g. 18 for 18%)' })
  @IsNumber()
  @Min(0)
  gstRate: number;
}

export class CreateInvoiceDto {
  @ApiProperty({ description: 'Customer ID or Customer Code' })
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({ enum: InvoiceType, example: InvoiceType.B2B })
  @IsEnum(InvoiceType)
  type: InvoiceType;

  @ApiProperty({ example: '2026-10-23', description: 'Invoice Issue Date' })
  @IsDateString()
  issueDate: string;

  @ApiProperty({ example: '2026-11-22', description: 'Invoice Payment Due Date' })
  @IsDateString()
  dueDate: string;

  @ApiPropertyOptional({ example: 'INR', default: 'INR' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ example: 1.0, default: 1.0 })
  @IsNumber()
  @IsOptional()
  exchangeRate?: number;

  @ApiPropertyOptional({ example: 'Net 30' })
  @IsString()
  @IsOptional()
  paymentTerms?: string;

  @ApiPropertyOptional({ example: 'Bank: HDFC Bank, A/C: 50200088991122, IFSC: HDFC0000045' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ enum: DivisionCode, example: DivisionCode.TECHM4_SOLUTIONS })
  @IsEnum(DivisionCode)
  division: DivisionCode;

  @ApiProperty({ type: [CreateInvoiceItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items: CreateInvoiceItemDto[];
}
