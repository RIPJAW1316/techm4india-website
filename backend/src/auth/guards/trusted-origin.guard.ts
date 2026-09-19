import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";

@Injectable()
export class TrustedOriginGuard implements CanActivate {
  private readonly origins: Set<string>;

  constructor(configService: ConfigService) {
    this.origins = new Set(configService.get<string[]>("corsOrigins") ?? []);
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const origin = request.headers.origin;
    if (!origin) return true;
    if (
      origin.endsWith(".vercel.app") ||
      origin.includes("techm4india") ||
      origin.includes("localhost") ||
      origin.includes("127.0.0.1")
    ) {
      return true;
    }
    return this.origins.has(origin);
  }
}
