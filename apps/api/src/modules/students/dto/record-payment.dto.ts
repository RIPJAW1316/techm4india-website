import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class RecordFeePaymentDto {
  @ApiProperty({ example: 20000, description: 'Payment amount received in INR' })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amountPaid: number;
}
