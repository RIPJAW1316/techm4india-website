import { createParamDecorator, ExecutionContext } from "@nestjs/common";

import { Principal } from "../auth.types";

export const CurrentPrincipal = createParamDecorator(
  (_data: unknown, context: ExecutionContext): Principal =>
    context.switchToHttp().getRequest<{ user: Principal }>().user,
);
