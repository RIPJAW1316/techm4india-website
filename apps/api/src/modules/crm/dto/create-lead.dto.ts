import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeadVertical, LeadStatus } from '@prisma/client';

export class CreateLeadDto {
  @ApiProperty({ description: 'Target institution or college name', example: 'Osmania University College of Engineering' })
  @IsString()
  @IsNotEmpty()
  institutionName: string;

  @ApiPropertyOptional({ enum: LeadVertical, default: LeadVertical.ENGINEERING_COLLEGES })
  @IsEnum(LeadVertical)
  @IsOptional()
  vertical?: LeadVertical = LeadVertical.ENGINEERING_COLLEGES;

  @ApiProperty({ description: 'Primary contact stakeholder name', example: 'Dr. Rajesh Varma' })
  @IsString()
  @IsNotEmpty()
  contactPerson: string;

  @ApiPropertyOptional({ description: 'Designation of contact', example: 'Dean of Engineering' })
  @IsString()
  @IsOptional()
  designation?: string;

  @ApiProperty({ description: 'Email address', example: 'dean.engg@osmania.ac.in' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Mobile / Phone number', example: '+91 94401 23456' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'City', example: 'Hyderabad' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiPropertyOptional({ description: 'State', default: 'Telangana' })
  @IsString()
  @IsOptional()
  state?: string = 'Telangana';

  @ApiPropertyOptional({ description: 'Inbound source', example: 'CAMPUS_OUTREACH' })
  @IsString()
  @IsOptional()
  source?: string = 'CAMPUS_OUTREACH';

  @ApiPropertyOptional({ description: 'Estimated budget in INR', example: 1500000 })
  @IsNumber()
  @IsOptional()
  estimatedBudget?: number;

  @ApiPropertyOptional({ description: 'Lead score (0-100)', example: 75 })
  @IsNumber()
  @IsOptional()
  score?: number;

  @ApiPropertyOptional({ description: 'Internal sales notes' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ enum: LeadStatus, default: LeadStatus.NEW })
  @IsEnum(LeadStatus)
  @IsOptional()
  status?: LeadStatus = LeadStatus.NEW;
}
