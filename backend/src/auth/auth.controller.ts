import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { Request, Response } from "express";

import { AUTH_COOKIE_PATH } from "./auth.constants";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { CurrentPrincipal } from "./decorators/current-principal.decorator";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { TrustedOriginGuard } from "./guards/trusted-origin.guard";
import { Principal } from "./auth.types";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @UseGuards(TrustedOriginGuard)
  @ApiOperation({ summary: "Authenticate with company email and password" })
  @ApiResponse({ status: 200, description: "Authenticated successfully" })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  async login(
    @Body() dto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(dto, this.metadata(request));
    this.setRefreshCookie(response, result.refreshToken);
    return { success: true, data: this.withoutRefreshToken(result) };
  }

  @Post("refresh")
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @UseGuards(TrustedOriginGuard)
  @ApiOperation({ summary: "Rotate the opaque refresh session" })
  @ApiResponse({ status: 200, description: "Refresh session rotated" })
  @ApiResponse({ status: 401, description: "Refresh session invalid" })
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.refresh(
      request.cookies?.[this.authService.refreshCookieName] as string | undefined,
      this.metadata(request),
    );
    this.setRefreshCookie(response, result.refreshToken);
    return { success: true, data: this.withoutRefreshToken(result) };
  }

  @Post("logout")
  @UseGuards(TrustedOriginGuard)
  @ApiOperation({ summary: "Revoke the current refresh session" })
  @ApiResponse({ status: 200, description: "Logged out" })
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    await this.authService.logout(
      request.cookies?.[this.authService.refreshCookieName] as string | undefined,
      this.metadata(request),
    );
    response.clearCookie(this.authService.refreshCookieName, {
      ...this.authService.getRefreshCookieOptions(),
      path: AUTH_COOKIE_PATH,
    });
    return { success: true, data: { loggedOut: true } };
  }

  @Get("me")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Return the current authoritative identity context" })
  @ApiResponse({ status: 200, description: "Current user context" })
  @ApiResponse({ status: 401, description: "Access token required" })
  async me(@CurrentPrincipal() principal: Principal) {
    return { success: true, data: await this.authService.getSafeContext(principal.userId) };
  }

  private metadata(request: Request) {
    return {
      ipAddress: request.ip,
      userAgent: request.get("user-agent") ?? undefined,
    };
  }

  private setRefreshCookie(response: Response, refreshToken: string): void {
    response.cookie(
      this.authService.refreshCookieName,
      refreshToken,
      this.authService.getRefreshCookieOptions(),
    );
  }

  private withoutRefreshToken(result: {
    refreshToken: string;
    accessToken: string;
    user: unknown;
    employee: unknown;
    permissions: string[];
  }) {
    return {
      accessToken: result.accessToken,
      employee: result.employee,
      permissions: result.permissions,
      user: result.user,
    };
  }
}
