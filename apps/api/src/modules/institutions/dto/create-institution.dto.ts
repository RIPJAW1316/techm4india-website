import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InstitutionType, NaacRating } from '@prisma/client';

export class CreateInstitutionDto {
  @ApiProperty({ description: 'Institution legal or official name', example: 'Osmania University College of Engineering' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ enum: InstitutionType, default: InstitutionType.AUTONOMOUS_COLLEGE })
  @IsEnum(InstitutionType)
  @IsOptional()
  type?: InstitutionType = InstitutionType.AUTONOMOUS_COLLEGE;

  @ApiPropertyOptional({ enum: NaacRating, default: NaacRating.NOT_ACCREDITED })
  @IsEnum(NaacRating)
  @IsOptional()
  naacRating?: NaacRating = NaacRating.NOT_ACCREDITED;

  @ApiPropertyOptional({ description: 'AISHE Code', example: 'U-0027' })
  @IsString()
  @IsOptional()
  aisheCode?: string;

  @ApiPropertyOptional({ description: 'NIRF Ranking Tier', example: 'TOP_50' })
  @IsString()
  @IsOptional()
  nirfRankTier?: string;

  @ApiProperty({ description: 'City', example: 'Hyderabad' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiPropertyOptional({ description: 'State', default: 'Telangana' })
  @IsString()
  @IsOptional()
  state?: string = 'Telangana';

  @ApiPropertyOptional({ description: 'Postal Pincode', example: '500007' })
  @IsString()
  @IsOptional()
  pincode?: string;

  @ApiPropertyOptional({ description: 'Total enrolled students', example: 4500 })
  @IsInt()
  @IsOptional()
  totalStudents?: number;

  @ApiPropertyOptional({ description: 'Primary contact stakeholder name', example: 'Dr. Rajesh Varma' })
  @IsString()
  @IsOptional()
  primaryContactName?: string;

  @ApiPropertyOptional({ description: 'Primary contact phone number', example: '+91 94401 23456' })
  @IsString()
  @IsOptional()
  primaryContactPhone?: string;

  @ApiPropertyOptional({ description: 'Primary contact email address', example: 'dean.engg@osmania.ac.in' })
  @IsEmail()
  @IsOptional()
  primaryContactEmail?: string;

  @ApiPropertyOptional({ description: 'Initial relationship health score (0-100)', default: 80 })
  @IsInt()
  @IsOptional()
  healthScore?: number = 80;
}
