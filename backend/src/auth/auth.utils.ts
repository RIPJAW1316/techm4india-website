import { createHash, randomBytes } from "node:crypto";

export function createOpaqueRefreshToken(): string {
  return randomBytes(48).toString("base64url");
}

export function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function hashIdentifier(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function parseDurationMs(value: string): number {
  const match = /^(\d+)\s*(s|m|h|d)$/i.exec(value.trim());
  if (!match) return 30 * 24 * 60 * 60 * 1000;
  const amount = Number(match[1]);
  const multiplier = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[
    match[2].toLowerCase() as "s" | "m" | "h" | "d"
  ];
  return amount * multiplier;
}
