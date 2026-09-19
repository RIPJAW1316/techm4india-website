export default () => ({
  nodeEnv: process.env.NODE_ENV ?? "development",
  businessTimeZone: process.env.BUSINESS_TIMEZONE ?? "Asia/Kolkata",
  port: Number.parseInt(process.env.PORT ?? "3001", 10),
  databaseUrl: process.env.DATABASE_URL,
  corsOrigins: (process.env.CORS_ORIGINS ?? "http://localhost:3000,https://techm4india-website.vercel.app,https://techm4india.com,https://www.techm4india.com")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  auth: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    accessTokenTtl: process.env.ACCESS_TOKEN_TTL ?? "15m",
    refreshTokenTtl: process.env.REFRESH_TOKEN_TTL ?? "30d",
    refreshCookieName: process.env.REFRESH_COOKIE_NAME ?? "tm4_refresh",
    cookieDomain: process.env.COOKIE_DOMAIN || undefined,
    cookieSameSite: process.env.COOKIE_SAME_SITE ?? "lax",
    cookieSecure: process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV === "production",
  },
  trustProxy: process.env.TRUST_PROXY === "true",
});
