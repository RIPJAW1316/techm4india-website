import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";

import { isTrustedOrigin } from "../../common/security/trusted-origin";

@Injectable()
export class TrustedOriginGuard implements CanActivate {
  private readonly origins: Set<string>;

  constructor(configService: ConfigService) {
    this.origins = new Set(configService.get<string[]>("corsOrigins") ?? []);
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const origin = request.headers.origin;
    return isTrustedOrigin(origin, this.origins);
  }
}
