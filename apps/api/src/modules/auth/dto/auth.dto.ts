import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
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

  @ApiPropertyOptional({ example: false })
  mfaRequired?: boolean;

  @ApiPropertyOptional({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." })
  tempToken?: string;
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

  @ApiPropertyOptional({ example: false })
  mfaEnabled?: boolean;

  @ApiProperty({ example: ['CENTRAL_DASHBOARD', 'HRMS', 'FINANCE'] })
  authorizedApplications: string[];
}


export class OidcAuthorizeQueryDto {
  @ApiProperty({ example: 'hrms-app-client' })
  @IsString()
  @IsNotEmpty()
  client_id: string;

  @ApiProperty({ example: 'https://techm4india.com/hrms/auth/callback' })
  @IsString()
  @IsNotEmpty()
  redirect_uri: string;

  @ApiProperty({ example: 'code' })
  @IsString()
  @IsNotEmpty()
  response_type: string;

  @ApiPropertyOptional({ example: 'openid profile email' })
  @IsString()
  scope?: string;

  @ApiPropertyOptional({ example: 'xyzStateRandom123' })
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: 'nonce-string-random' })
  @IsString()
  nonce?: string;

  @ApiProperty({ example: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM' })
  @IsString()
  @IsNotEmpty()
  code_challenge: string;

  @ApiPropertyOptional({ example: 'S256', default: 'S256' })
  @IsString()
  code_challenge_method?: string = 'S256';
}

export class OidcTokenExchangeDto {
  @ApiProperty({ example: 'authorization_code' })
  @IsString()
  @IsNotEmpty()
  grant_type: string;

  @ApiProperty({ example: 'auth_code_hex_value' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'https://techm4india.com/hrms/auth/callback' })
  @IsString()
  @IsNotEmpty()
  redirect_uri: string;

  @ApiProperty({ example: 'hrms-app-client' })
  @IsString()
  @IsNotEmpty()
  client_id: string;

  @ApiProperty({ example: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk' })
  @IsString()
  @IsNotEmpty()
  code_verifier: string;
}
