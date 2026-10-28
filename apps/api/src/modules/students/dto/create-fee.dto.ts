import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateStudentFeeDto {
  @ApiProperty({ example: 'TUITION', default: 'TUITION', description: 'Fee head: TUITION, LAB_FEE, EXAM_FEE' })
  @IsString()
  @IsNotEmpty()
  feeType: string;

  @ApiProperty({ example: 45000, description: 'Gross fee amount in INR' })
  @IsNumber()
  @IsPositive()
  totalAmount: number;

  @ApiPropertyOptional({ example: 5000, default: 0, description: 'Institutional scholarship or discount' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discountAmount?: number;

  @ApiProperty({ example: '2026-09-15T23:59:59.000Z', description: 'Payment due date' })
  @IsDateString()
  @IsNotEmpty()
  dueDate: string;
}
