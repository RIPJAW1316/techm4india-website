import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@techm4india.com' })
  @IsEmail({}, { message: 'A valid email address is required.' })
  email: string;

  @ApiProperty({ example: 'SuperSecurePass123!' })
  @IsString()
  @IsNotEmpty({ message: 'Password is required.' })
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'f3a9e108-9b81-4286-9dc9-4a905a8bbf43' })
  @IsString()
  @IsNotEmpty({ message: 'Refresh token is required.' })
  refreshToken: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'CurrentPassword123!' })
  @IsString()
  @IsNotEmpty({ message: 'Current password is required.' })
  currentPassword: string;

  @ApiProperty({ example: 'NewStrongPassword456!' })
  @IsString()
  @MinLength(8, { message: 'New password must be at least 8 characters long.' })
  @MaxLength(100)
  newPassword: string;
}

export class AuthTokensResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ example: '9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d' })
  refreshToken: string;

  @ApiProperty({ example: 900, description: 'Access token expiration in seconds' })
  expiresIn: number;

  @ApiProperty({ example: 'Bearer' })
  tokenType: string;
}

export class UserProfileResponseDto {
  @ApiProperty({ example: 'f3a9e108-9b81-4286-9dc9-4a905a8bbf43' })
  id: string;

  @ApiProperty({ example: 'admin@techm4india.com' })
  email: string;

  @ApiProperty({ example: 'TechM4' })
  firstName: string;

  @ApiProperty({ example: 'Admin' })
  lastName: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: ['SUPER_ADMIN'] })
  roles: string[];

  @ApiProperty({ example: ['users:read', 'users:manage'] })
  permissions: string[];

  @ApiProperty({ example: 'TECHM4INDIA', required: false })
  organizationCode?: string;

  @ApiProperty({ example: ['CENTRAL_DASHBOARD', 'HRMS', 'FINANCE'] })
  authorizedApplications: string[];
}
