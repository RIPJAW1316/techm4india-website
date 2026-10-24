import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AccountType } from '@prisma/client';

export class CreateAccountDto {
  @ApiProperty({ example: '1010', description: 'Unique Account General Ledger code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'HDFC Current Operating Account', description: 'Account Name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: AccountType, example: AccountType.ASSET })
  @IsEnum(AccountType)
  type: AccountType;

  @ApiProperty({ example: 'CURRENT_ASSETS', description: 'Financial reporting category' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiPropertyOptional({ example: 'BANK_ACCOUNTS' })
  @IsString()
  @IsOptional()
  subCategory?: string;

  @ApiPropertyOptional({ example: 'INR', default: 'INR' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ example: 'Primary operating account for client settlements' })
  @IsString()
  @IsOptional()
  description?: string;
}
