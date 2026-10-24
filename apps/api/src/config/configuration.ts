export default () => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 4000,
  host: process.env.HOST || '0.0.0.0',
  database: {
    url: process.env.DATABASE_URL,
  },
  api: {
    prefix: process.env.API_PREFIX || 'api/v1',
    swaggerPath: process.env.SWAGGER_PATH || 'api/v1/docs',
  },
  security: {
    corsOrigin: process.env.CORS_ORIGIN || '*',
    rateLimitTtl: parseInt(process.env.RATE_LIMIT_TTL, 10) || 60000,
    rateLimitLimit: parseInt(process.env.RATE_LIMIT_LIMIT, 10) || 100,
  },
  jwt: {
    secret:
      process.env.JWT_SECRET ||
      'default_dev_jwt_secret_must_be_overridden_in_prod_min_32_chars',
    expiration: process.env.JWT_EXPIRATION || '15m',
    refreshSecret:
      process.env.JWT_REFRESH_SECRET ||
      'default_dev_refresh_secret_must_be_overridden_in_prod_min_32_chars',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },
  sso: {
    trustedAppUrls: (
      process.env.TRUSTED_APP_URLS ||
      'http://localhost:3000,http://localhost:3001,http://localhost:3002,https://techm4india.com'
    )
      .split(',')
      .map((u) => u.trim()),
  },
});
