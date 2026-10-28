import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MouStatus } from '@prisma/client';

export class CreateMouDto {
  @ApiProperty({ description: 'Institution UUID' })
  @IsString()
  @IsNotEmpty()
  institutionId: string;

  @ApiProperty({ description: 'Title of Memorandum of Understanding', example: 'CoE in Edge AI & Autonomous Robotics' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Effective start date ISO string', example: '2026-01-10' })
  @IsDateString()
  effectiveDate: string;

  @ApiProperty({ description: 'Expiry date ISO string', example: '2029-01-09' })
  @IsDateString()
  expiryDate: string;

  @ApiProperty({ description: 'Summary of partnership scope and commitments' })
  @IsString()
  @IsNotEmpty()
  scopeSummary: string;

  @ApiPropertyOptional({ description: 'URL to signed PDF document' })
  @IsString()
  @IsOptional()
  signedDocumentUrl?: string;

  @ApiPropertyOptional({ description: 'TechM4 Signatory Employee ID' })
  @IsString()
  @IsOptional()
  techm4SignatoryEmployeeId?: string;

  @ApiProperty({ description: 'Institution signatory official name', example: 'Prof. S. Ramachandram' })
  @IsString()
  @IsNotEmpty()
  institutionSignatoryName: string;

  @ApiProperty({ description: 'Institution signatory official role', example: 'Vice Chancellor' })
  @IsString()
  @IsNotEmpty()
  institutionSignatoryRole: string;

  @ApiPropertyOptional({ enum: MouStatus, default: MouStatus.ACTIVE })
  @IsEnum(MouStatus)
  @IsOptional()
  status?: MouStatus = MouStatus.ACTIVE;
}
