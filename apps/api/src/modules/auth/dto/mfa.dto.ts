import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class EnableMfaDto {
  @ApiProperty({ example: '123456', description: '6-digit verification code from Authenticator app' })
  @IsString()
  @Length(6, 6)
  @IsNotEmpty()
  token: string;

  @ApiProperty({ description: 'Base32 secret returned by setup endpoint' })
  @IsString()
  @IsNotEmpty()
  secret: string;
}

export class VerifyMfaDto {
  @ApiProperty({ description: 'Temporary 2FA token returned by login endpoint' })
  @IsString()
  @IsNotEmpty()
  tempToken: string;

  @ApiPropertyOptional({ example: '123456', description: '6-digit TOTP code' })
  @IsString()
  @IsOptional()
  token?: string;

  @ApiPropertyOptional({ example: 'A1B2C3D4-E5F6G7H8', description: 'Emergency single-use recovery code' })
  @IsString()
  @IsOptional()
  recoveryCode?: string;
}

export class DisableMfaDto {
  @ApiPropertyOptional({ example: '123456', description: '6-digit TOTP code to confirm disabling' })
  @IsString()
  @IsOptional()
  token?: string;

  @ApiPropertyOptional({ example: 'Password123!', description: 'Current password' })
  @IsString()
  @IsOptional()
  password?: string;
}
