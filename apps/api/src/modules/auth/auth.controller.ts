import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { OidcService } from './oidc.service';
import { EnableMfaDto, VerifyMfaDto, DisableMfaDto } from './dto/mfa.dto';
import {
  AuthTokensResponseDto,
  ChangePasswordDto,
  LoginDto,
  RefreshTokenDto,
  UserProfileResponseDto,
  OidcAuthorizeQueryDto,
  OidcTokenExchangeDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly oidcService: OidcService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Central User Login',
    description:
      'Authenticates an employee across HRMS, Finance, and Central Dashboard using single central identity. Returns short-lived access token and rotating refresh token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthTokensResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials or inactive account',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
  ): Promise<AuthTokensResponseDto> {
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('user-agent');
    return this.authService.login(loginDto, ip, userAgent);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Rotate & Refresh Access Token',
    description:
      'Exchanges a valid refresh token for a new access token and a rotated refresh token. Implements automatic token reuse detection.',
  })
  @ApiResponse({
    status: 200,
    description: 'Token rotated successfully',
    type: AuthTokensResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid, expired, or reused refresh token',
  })
  async refresh(
    @Body() refreshDto: RefreshTokenDto,
    @Req() req: Request,
  ): Promise<AuthTokensResponseDto> {
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('user-agent');
    return this.authService.refresh(refreshDto.refreshToken, ip, userAgent);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Session Logout',
    description:
      'Terminates an authenticated session and revokes the active refresh token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Session logged out successfully',
  })
  async logout(
    @Body() body?: Partial<RefreshTokenDto>,
    @CurrentUser('userId') userId?: string,
  ): Promise<{ success: boolean }> {
    return this.authService.logout(body?.refreshToken, userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Current User Identity Profile',
    description:
      'Retrieves the currently authenticated user’s profile, organization, active roles, granular permissions, and authorized applications.',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    type: UserProfileResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(
    @CurrentUser('userId') userId: string,
  ): Promise<UserProfileResponseDto> {
    return this.authService.getMe(userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Change Current User Password',
    description:
      'Allows an authenticated user to change their password with Argon2id re-hashing and invalidation of all other active sessions.',
  })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
  })
  @ApiResponse({ status: 400, description: 'Incorrect current password or invalid payload' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async changePassword(
    @CurrentUser('userId') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.changePassword(userId, changePasswordDto);
  }

  // ===========================================================================
  // Two-Factor Authentication (TOTP MFA)
  // ===========================================================================

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @Post('mfa/setup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Initialize TOTP MFA Setup',
    description: 'Generates base32 secret, 8 backup recovery codes, and otpauth:// URI for authenticator apps.',
  })
  async setupMfa(@CurrentUser('userId') userId: string) {
    return this.authService.setupMfa(userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @Post('mfa/enable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify and Enable TOTP MFA',
    description: 'Verifies the 6-digit TOTP code against secret and activates 2FA on the user account.',
  })
  async enableMfa(
    @CurrentUser('userId') userId: string,
    @Body() dto: EnableMfaDto,
  ) {
    return this.authService.enableMfa(userId, dto);
  }

  @Public()
  @Post('mfa/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify 2FA Step-up Challenge on Login',
    description: 'Exchanges tempToken and 6-digit TOTP code (or recovery code) for full JWT access and refresh tokens.',
  })
  @ApiResponse({
    status: 200,
    description: 'MFA verified; tokens issued',
    type: AuthTokensResponseDto,
  })
  async verifyMfa(
    @Body() dto: VerifyMfaDto,
    @Req() req: Request,
  ): Promise<AuthTokensResponseDto> {
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('user-agent');
    return this.authService.verifyMfaLogin(dto, ip, userAgent);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @Post('mfa/disable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Disable Two-Factor Authentication',
    description: 'Disables MFA on user account with password or TOTP confirmation.',
  })
  async disableMfa(
    @CurrentUser('userId') userId: string,
    @Body() dto: DisableMfaDto,
  ) {
    return this.authService.disableMfa(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @Post('sessions/revoke-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Revoke All Active Sessions',
    description: 'Immediately invalidates all active refresh token families for the current user across all applications.',
  })
  async revokeAllSessions(@CurrentUser('userId') userId: string) {
    return this.authService.revokeAllSessions(userId);
  }

  // ===========================================================================
  // OpenID Connect (OIDC) with PKCE S256 SSO Endpoints
  // ===========================================================================

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @Get('oidc/authorize')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'OIDC Authorize (Generate Authorization Code with PKCE Challenge)',
    description: 'Validates registered client_id, exact redirect_uri, and user application access. Returns single-use authorization code (60s TTL).',
  })
  async oidcAuthorize(
    @CurrentUser('userId') userId: string,
    @Query() query: OidcAuthorizeQueryDto,
  ) {
    return this.oidcService.authorize(userId, query);
  }

  @Public()
  @Post('oidc/token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'OIDC Token Exchange (PKCE S256 Verification)',
    description: 'Exchanges single-use authorization code and code_verifier for application-scoped access_token and OIDC id_token.',
  })
  async oidcToken(@Body() dto: OidcTokenExchangeDto) {
    return this.oidcService.exchangeCodeForToken(dto);
  }

  @Public()
  @Get('oidc/.well-known/openid-configuration')
  @ApiOperation({ summary: 'OIDC Discovery Document' })
  getOpenIdConfiguration() {
    return this.oidcService.getOpenIdConfiguration();
  }
}
