import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

import { ACCESS_TOKEN_TYPE } from "./auth.constants";
import { AuthService } from "./auth.service";
import { Principal } from "./auth.types";

interface AccessTokenPayload {
  sub: string;
  sid: string;
  typ: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>("auth.accessSecret"),
    });
  }

  async validate(payload: AccessTokenPayload): Promise<Principal> {
    if (payload.typ !== ACCESS_TOKEN_TYPE || !payload.sub || !payload.sid) {
      throw new UnauthorizedException("Access token invalid");
    }
    return this.authService.resolvePrincipal(payload.sub, payload.sid);
  }
}
