import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateStudentDto {
  @ApiPropertyOptional({ example: 'STD-2026-0042', description: 'Unique Student ID' })
  @IsString()
  @IsOptional()
  studentId?: string;

  @ApiProperty({ example: 'Aditya' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Kumar' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'aditya.kumar@osmania.ac.in' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ example: '+919876543210' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Male' })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({ example: '2004-05-15T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  dob?: string;

  @ApiPropertyOptional({ example: 'Electronics & Communication Engineering' })
  @IsString()
  @IsOptional()
  academicBranch?: string;

  @ApiPropertyOptional({ example: 3, default: 3 })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  yearOfStudy?: number;

  @ApiPropertyOptional({ example: 'Ramesh Kumar' })
  @IsString()
  @IsOptional()
  guardianName?: string;

  @ApiPropertyOptional({ example: '+919876500000' })
  @IsString()
  @IsOptional()
  guardianPhone?: string;

  @ApiPropertyOptional({ description: 'Partner Institution ID' })
  @IsUUID()
  @IsOptional()
  institutionId?: string;

  @ApiPropertyOptional({ description: 'Academic Batch ID' })
  @IsUUID()
  @IsOptional()
  batchId?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  kycVerified?: boolean;
}
