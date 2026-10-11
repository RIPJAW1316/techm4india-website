import type { ExecutionContext } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";

import { TrustedOriginGuard } from "../src/auth/guards/trusted-origin.guard";
import { isTrustedOrigin } from "../src/common/security/trusted-origin";

const allowedOrigins = new Set([
  "https://www.techm4india.com",
  "https://techm4india-website.vercel.app",
  "http://localhost:3000",
]);

function contextForOrigin(origin: string | undefined): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ headers: { origin } }) }),
  } as unknown as ExecutionContext;
}

describe("trusted browser origins", () => {
  const guard = new TrustedOriginGuard({
    get: () => allowedOrigins,
  } as unknown as ConfigService);

  it.each([
    ["production domain", "https://www.techm4india.com"],
    ["explicit preview domain", "https://techm4india-website.vercel.app"],
    ["configured local development", "http://localhost:3000"],
  ])("accepts the %s", (_description, origin) => {
    expect(isTrustedOrigin(origin, allowedOrigins)).toBe(true);
    expect(guard.canActivate(contextForOrigin(origin))).toBe(true);
  });

  it("accepts a non-browser request without an Origin header", () => {
    expect(isTrustedOrigin(undefined, allowedOrigins)).toBe(true);
    expect(guard.canActivate(contextForOrigin(undefined))).toBe(true);
  });

  it.each([
    ["a domain suffix lookalike", "https://www.techm4india.com.attacker.example"],
    ["a brand substring lookalike", "https://attacker-techm4india.example"],
    ["an unrelated Vercel project", "https://attacker.vercel.app"],
    ["a localhost lookalike", "http://localhost.attacker.example"],
    ["the opaque null origin", "null"],
    ["the right host on an unlisted port", "https://www.techm4india.com:444"],
  ])("rejects %s", (_description, origin) => {
    expect(isTrustedOrigin(origin, allowedOrigins)).toBe(false);
    expect(guard.canActivate(contextForOrigin(origin))).toBe(false);
  });
});
