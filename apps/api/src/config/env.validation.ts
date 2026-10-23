import * as Joi from 'joi';

export interface EnvironmentVariables {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  HOST: string;
  DATABASE_URL: string;
  API_PREFIX: string;
  SWAGGER_PATH: string;
  CORS_ORIGIN: string;
  RATE_LIMIT_TTL: number;
  RATE_LIMIT_LIMIT: number;
  JWT_SECRET?: string;
  JWT_EXPIRATION?: string;
  JWT_REFRESH_SECRET?: string;
  JWT_REFRESH_EXPIRATION?: string;
}

export const envValidationSchema = Joi.object<EnvironmentVariables>({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'staging')
    .default('development'),
  PORT: Joi.number().port().default(4000),
  HOST: Joi.string().default('0.0.0.0'),
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgres', 'postgresql'] })
    .required()
    .messages({
      'any.required': 'DATABASE_URL is required to establish PostgreSQL connection.',
      'string.uri': 'DATABASE_URL must be a valid postgresql:// URI format.',
      'string.uriCustomScheme': 'DATABASE_URL must be a valid postgresql:// URI format.',
    }),
  API_PREFIX: Joi.string().default('api/v1'),
  SWAGGER_PATH: Joi.string().default('api/v1/docs'),
  CORS_ORIGIN: Joi.string().default('*'),
  RATE_LIMIT_TTL: Joi.number().positive().default(60000),
  RATE_LIMIT_LIMIT: Joi.number().positive().default(100),
  JWT_SECRET: Joi.string().optional().default('placeholder_development_secret_only'),
  JWT_EXPIRATION: Joi.string().optional().default('1d'),
  JWT_REFRESH_SECRET: Joi.string().optional().default('placeholder_refresh_secret_only'),
  JWT_REFRESH_EXPIRATION: Joi.string().optional().default('7d'),
});

export function validateEnvironment(config: Record<string, unknown>): EnvironmentVariables {
  const { error, value } = envValidationSchema.validate(config, {
    allowUnknown: true,
    abortEarly: false,
  });

  if (error) {
    const errorDetails = error.details.map((detail) => detail.message).join('; ');
    throw new Error(`Environment validation failed: ${errorDetails}`);
  }

  return value as EnvironmentVariables;
}
