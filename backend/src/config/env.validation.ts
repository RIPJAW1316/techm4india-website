import Joi from "joi";

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "test", "staging", "production")
    .default("development"),
  PORT: Joi.number().port().default(3001),
  DATABASE_URL: Joi.string()
    .uri({ scheme: ["postgresql", "postgres"] })
    .optional(),
  CORS_ORIGINS: Joi.string().default("http://localhost:3000"),
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  ACCESS_TOKEN_TTL: Joi.string().default("15m"),
  REFRESH_TOKEN_TTL: Joi.string().default("30d"),
  REFRESH_COOKIE_NAME: Joi.string()
    .pattern(/^[A-Za-z0-9_-]+$/)
    .default("tm4_refresh"),
  COOKIE_DOMAIN: Joi.string().allow("").optional(),
  COOKIE_SAME_SITE: Joi.string().valid("lax", "strict", "none").default("lax"),
  COOKIE_SECURE: Joi.boolean().truthy("true").falsy("false").default(false),
  TRUST_PROXY: Joi.boolean().truthy("true").falsy("false").default(false),
  BUSINESS_TIMEZONE: Joi.string().default("Asia/Kolkata"),
  SEED_DEMO_PASSWORD: Joi.string().min(12).allow("").optional(),
}).unknown(true);
