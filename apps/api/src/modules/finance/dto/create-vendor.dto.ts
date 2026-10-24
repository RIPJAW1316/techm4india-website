import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { TdsSection } from '@prisma/client';

export class CreateVendorDto {
  @ApiProperty({ example: 'VND-001', description: 'Vendor Identifier Code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Silicon Electronics & Robotics Components LLP' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Suresh Kumar' })
  @IsString()
  @IsOptional()
  contactPerson?: string;

  @ApiPropertyOptional({ example: '36AAACS1234F1Z8', description: '15-character GSTIN' })
  @IsString()
  @IsOptional()
  gstin?: string;

  @ApiPropertyOptional({ example: 'AAACS1234F', description: '10-character PAN' })
  @IsString()
  @IsOptional()
  pan?: string;

  @ApiPropertyOptional({ example: 'MICRO', description: 'MSME Category: MICRO, SMALL, MEDIUM, NONE' })
  @IsString()
  @IsOptional()
  msmeType?: string;

  @ApiPropertyOptional({ example: 'accounts@siliconelec.in' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+91 98490 12345' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: '50200012345678' })
  @IsString()
  @IsOptional()
  bankAccount?: string;

  @ApiPropertyOptional({ example: 'HDFC0000123' })
  @IsString()
  @IsOptional()
  ifsc?: string;

  @ApiPropertyOptional({ example: 'HDFC Bank Banjara Hills' })
  @IsString()
  @IsOptional()
  bankName?: string;

  @ApiPropertyOptional({ enum: TdsSection, default: TdsSection.SEC_194C })
  @IsEnum(TdsSection)
  @IsOptional()
  tdsSection?: TdsSection;

  @ApiPropertyOptional({ example: 30, default: 30, description: 'Payment terms in days' })
  @IsNumber()
  @IsOptional()
  paymentTermsDays?: number;
}
