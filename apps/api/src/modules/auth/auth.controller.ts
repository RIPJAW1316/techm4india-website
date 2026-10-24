import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
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
import {
  AuthTokensResponseDto,
  ChangePasswordDto,
  LoginDto,
  RefreshTokenDto,
  UserProfileResponseDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
}
