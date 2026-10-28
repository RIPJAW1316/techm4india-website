import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateOrganizationDto {
  @ApiPropertyOptional({ example: 'TechM4India Innovations Pvt. Ltd.' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'TechM4India Innovations Private Limited' })
  @IsString()
  @IsOptional()
  legalName?: string;

  @ApiPropertyOptional({ example: 'U72900TG2024PTC123456', description: 'Corporate Identification Number (CIN)' })
  @IsString()
  @IsOptional()
  cin?: string;

  @ApiPropertyOptional({ example: '36AAACT1234F1Z5', description: 'GSTIN for Telangana HQ' })
  @IsString()
  @IsOptional()
  gstin?: string;

  @ApiPropertyOptional({ example: 'AAACT1234F', description: 'Permanent Account Number (PAN)' })
  @IsString()
  @IsOptional()
  pan?: string;

  @ApiPropertyOptional({ example: 'https://techm4india.com' })
  @IsUrl()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional({ example: 'contact@techm4india.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+91 40 2345 6789' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'T-Hub 2.0, Inorbit Mall Road, Madhapur, Hyderabad, Telangana 500081' })
  @IsString()
  @IsOptional()
  registeredAddress?: string;

  @ApiPropertyOptional({ example: 'Plot 42, Hitech City Main Road, Cyberabad, Hyderabad, Telangana 500081' })
  @IsString()
  @IsOptional()
  corporateAddress?: string;
}
