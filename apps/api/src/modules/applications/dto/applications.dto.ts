import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateApplicationDto {
  @ApiProperty({ example: 'HRMS' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'TechM4 HRMS' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Human Resource Management System application' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'http://localhost:3001' })
  @IsUrl({ require_tld: false }, { message: 'baseUrl must be a valid trusted URL.' })
  baseUrl: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateApplicationDto {
  @ApiPropertyOptional({ example: 'TechM4 HRMS Portal' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'http://localhost:3001' })
  @IsOptional()
  @IsUrl({ require_tld: false })
  baseUrl?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ApplicationItemDto {
  @ApiProperty({ example: 'f3a9e108-9b81-4286-9dc9-4a905a8bbf43' })
  id: string;

  @ApiProperty({ example: 'HRMS' })
  code: string;

  @ApiProperty({ example: 'TechM4 HRMS' })
  name: string;

  @ApiProperty({ example: 'Human Resource Management System' })
  description: string;

  @ApiProperty({ example: 'http://localhost:3001' })
  permittedDestination: string;

  @ApiProperty({ example: true })
  hasAccess: boolean;

  @ApiProperty({ example: true })
  isActive: boolean;
}
