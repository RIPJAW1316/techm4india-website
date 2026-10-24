import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'priya.sharma@techm4india.com' })
  @IsEmail({}, { message: 'Must be a valid email format.' })
  email: string;

  @ApiProperty({ example: 'InitialTempPass123!' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  password: string;

  @ApiProperty({ example: 'Priya' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Sharma' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional({ example: '+919876543210' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'TECHM4INDIA' })
  @IsOptional()
  @IsString()
  organizationCode?: string;

  @ApiPropertyOptional({ example: ['HRMS_ADMIN'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];

  @ApiPropertyOptional({ example: ['HRMS'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicationCodes?: string[];
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Priya' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Sharma' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: '+919876543210' })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class UpdateUserStatusDto {
  @ApiProperty({ example: false })
  @IsBoolean()
  isActive: boolean;
}

export class AssignRoleDto {
  @ApiProperty({ example: 'HRMS_USER' })
  @IsString()
  @IsNotEmpty()
  roleCode: string;
}

export class GrantApplicationAccessDto {
  @ApiProperty({ example: 'HRMS' })
  @IsString()
  @IsNotEmpty()
  applicationCode: string;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expiresAt?: Date;
}

export class ListUsersQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Filter by search query in name or email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'HRMS_ADMIN' })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({ example: 'HRMS' })
  @IsOptional()
  @IsString()
  application?: string;
}
