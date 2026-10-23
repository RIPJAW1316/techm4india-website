import { validateEnvironment } from './env.validation';

describe('Environment Validation', () => {
  const validBaseEnv = {
    DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/techm4india_erp?schema=public',
  };

  it('should successfully validate with valid required environment variables and assign defaults', () => {
    const validated = validateEnvironment(validBaseEnv);
    expect(validated.DATABASE_URL).toBe(validBaseEnv.DATABASE_URL);
    expect(validated.NODE_ENV).toBe('development');
    expect(validated.PORT).toBe(4000);
    expect(validated.HOST).toBe('0.0.0.0');
    expect(validated.API_PREFIX).toBe('api/v1');
  });

  it('should throw an error if DATABASE_URL is missing', () => {
    expect(() => validateEnvironment({})).toThrow(
      'Environment validation failed: DATABASE_URL is required to establish PostgreSQL connection.',
    );
  });

  it('should throw an error if DATABASE_URL is not a valid postgresql URI', () => {
    expect(() =>
      validateEnvironment({
        DATABASE_URL: 'http://localhost:5432/not-postgres',
      }),
    ).toThrow('DATABASE_URL must be a valid postgresql:// URI format.');
  });

  it('should accept custom PORT and NODE_ENV', () => {
    const validated = validateEnvironment({
      ...validBaseEnv,
      PORT: '8080',
      NODE_ENV: 'production',
      API_PREFIX: 'api/v2',
    });
    expect(validated.PORT).toBe(8080);
    expect(validated.NODE_ENV).toBe('production');
    expect(validated.API_PREFIX).toBe('api/v2');
  });
});
