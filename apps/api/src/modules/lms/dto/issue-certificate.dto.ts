import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID, IsUrl } from 'class-validator';

export class IssueCertificateDto {
  @ApiProperty({ description: 'Certified Student ID' })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ description: 'Academic Program ID' })
  @IsUUID()
  @IsNotEmpty()
  programId: string;

  @ApiPropertyOptional({ example: 'https://cdn.techm4india.com/certificates/T4I-2026-CERT-001.pdf' })
  @IsUrl()
  @IsOptional()
  pdfUrl?: string;
}
