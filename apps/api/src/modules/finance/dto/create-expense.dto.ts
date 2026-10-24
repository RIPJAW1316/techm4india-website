import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { DivisionCode, TdsSection } from '@prisma/client';

export class CreateExpenseDto {
  @ApiPropertyOptional({ description: 'Vendor ID if this is a vendor invoice' })
  @IsString()
  @IsOptional()
  vendorId?: string;

  @ApiProperty({ example: 'INFRASTRUCTURE', description: 'Expense category (INFRASTRUCTURE, HARDWARE, TRAVEL, etc.)' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ enum: DivisionCode, example: DivisionCode.TECHM4_ENGINEERING })
  @IsEnum(DivisionCode)
  division: DivisionCode;

  @ApiProperty({ example: 'AWS Cloud Hosting and Dedicated GPU Cluster for AI Workloads' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ example: 'AMZN-INV-2026-9921', description: 'Vendor External Invoice #' })
  @IsString()
  @IsOptional()
  invoiceNumber?: string;

  @ApiPropertyOptional({ example: '2026-10-15' })
  @IsDateString()
  @IsOptional()
  invoiceDate?: string;

  @ApiPropertyOptional({ example: '2026-11-15' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiProperty({ example: 85000, description: 'Gross invoice amount before TDS' })
  @IsNumber()
  @Min(0.01)
  grossAmount: number;

  @ApiPropertyOptional({ enum: TdsSection, default: TdsSection.NONE })
  @IsEnum(TdsSection)
  @IsOptional()
  tdsSection?: TdsSection;

  @ApiPropertyOptional({ example: 2.0, description: 'TDS Rate percentage (e.g. 2 for 2%)' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  tdsRate?: number;

  @ApiPropertyOptional({ example: 'PO-2026-042', description: 'Related Purchase Order Number for 3-way matching' })
  @IsString()
  @IsOptional()
  poNumber?: string;

  @ApiPropertyOptional({ example: 'https://cdn.techm4india.com/invoices/inv-aws-oct.pdf' })
  @IsString()
  @IsOptional()
  documentUrl?: string;
}
