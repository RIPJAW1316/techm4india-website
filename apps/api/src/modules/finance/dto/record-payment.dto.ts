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
import { PaymentMethod, PaymentType } from '@prisma/client';

export class RecordPaymentDto {
  @ApiProperty({ enum: PaymentType, example: PaymentType.INWARD })
  @IsEnum(PaymentType)
  type: PaymentType;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.NEFT_RTGS })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiProperty({ example: 150000, description: 'Payment Amount' })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ example: 'INR', default: 'INR' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ example: '2026-10-23', description: 'Transaction Date' })
  @IsDateString()
  transactionDate: string;

  @ApiPropertyOptional({ example: 'CMS8892183921', description: 'Bank UTR / Transaction Reference' })
  @IsString()
  @IsOptional()
  referenceNumber?: string;

  @ApiPropertyOptional({ description: 'Invoice ID if inward payment' })
  @IsString()
  @IsOptional()
  invoiceId?: string;

  @ApiPropertyOptional({ description: 'Expense ID if outward payment' })
  @IsString()
  @IsOptional()
  expenseId?: string;

  @ApiPropertyOptional({ example: 'Part payment received via HDFC corporate netbanking' })
  @IsString()
  @IsOptional()
  notes?: string;
}
