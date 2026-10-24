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
import { DivisionCode, VoucherType } from '@prisma/client';

export class JournalLineItemDto {
  @ApiProperty({ description: 'Target Account ID or Code' })
  @IsString()
  @IsNotEmpty()
  accountId: string;

  @ApiProperty({ example: 50000, description: 'Debit Amount' })
  @IsNumber()
  @Min(0)
  debitAmount: number;

  @ApiProperty({ example: 0, description: 'Credit Amount' })
  @IsNumber()
  @Min(0)
  creditAmount: number;

  @ApiPropertyOptional({ example: 'Client advance payment for Robotics Lab' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: DivisionCode, example: DivisionCode.TECHM4_SCHOOLS })
  @IsEnum(DivisionCode)
  @IsOptional()
  division?: DivisionCode;
}

export class CreateJournalEntryDto {
  @ApiProperty({ example: '2026-10-23', description: 'Transaction Date' })
  @IsDateString()
  date: string;

  @ApiProperty({ enum: VoucherType, example: VoucherType.JOURNAL })
  @IsEnum(VoucherType)
  voucherType: VoucherType;

  @ApiPropertyOptional({ example: 'INV-2026-001', description: 'External reference / Invoice # / Bill #' })
  @IsString()
  @IsOptional()
  reference?: string;

  @ApiProperty({ example: 'Monthly accrual of Cloud Infrastructure cost for Solutions division' })
  @IsString()
  @IsNotEmpty()
  narration: string;

  @ApiPropertyOptional({ enum: DivisionCode, example: DivisionCode.TECHM4_SOLUTIONS })
  @IsEnum(DivisionCode)
  @IsOptional()
  division?: DivisionCode;

  @ApiProperty({ type: [JournalLineItemDto], description: 'Debit and credit lines (Must balance)' })
  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => JournalLineItemDto)
  lineItems: JournalLineItemDto[];
}
