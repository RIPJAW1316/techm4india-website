/** Exact browser-origin allowlist shared by CORS and cookie-auth protection. */
export function isTrustedOrigin(
  origin: string | undefined,
  allowedOrigins: ReadonlySet<string>,
): boolean {
  // Server-to-server clients commonly omit Origin. A supplied Origin must be
  // an exact match; substring checks admit attacker-controlled lookalikes.
  return origin === undefined || allowedOrigins.has(origin);
}
