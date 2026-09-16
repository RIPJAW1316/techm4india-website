import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { REQUIRE_PERMISSIONS } from "../decorators/require-permissions.decorator";
import { Principal } from "../auth.types";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(REQUIRE_PERMISSIONS, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) return true;
    const request = context.switchToHttp().getRequest<{ user?: Principal }>();
    const principal = request.user;
    if (!principal || !required.every((permission) => principal.permissions.includes(permission))) {
      throw new ForbiddenException("Insufficient permission");
    }
    return true;
  }
}
