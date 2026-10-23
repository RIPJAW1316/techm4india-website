process.env.DATABASE_URL =
  'postgresql://test_user:test_password@localhost:5432/test_erp?schema=public';
process.env.NODE_ENV = 'test';
process.env.PORT = '4001';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { TransformResponseInterceptor } from '../src/common/interceptors/transform-response.interceptor';
import { CORRELATION_ID_HEADER } from '../src/common/constants';

describe('API Foundation & Health Endpoints (e2e)', () => {
  let app: INestApplication;
  let mockPrismaService: {
    isHealthy: jest.Mock;
    $connect: jest.Mock;
    $disconnect: jest.Mock;
  };

  beforeAll(async () => {

    mockPrismaService = {
      isHealthy: jest.fn().mockResolvedValue({ isHealthy: true, latencyMs: 2 }),
      $connect: jest.fn().mockResolvedValue(undefined),
      $disconnect: jest.fn().mockResolvedValue(undefined),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalInterceptors(new TransformResponseInterceptor());

    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('GET /api/v1/health (Liveness)', () => {
    it('should return 200 OK with standardized envelope and liveness info', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('statusCode', 200);
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('correlationId');
      expect(response.body.data).toHaveProperty('status', 'ok');
      expect(response.body.data).toHaveProperty('version', '1.0.0');
      expect(typeof response.body.data.uptime).toBe('number');
      expect(response.headers[CORRELATION_ID_HEADER]).toBeDefined();
    });

    it('should propagate client-supplied correlation ID', async () => {
      const customTraceId = 'client-trace-id-abc-123';
      const response = await request(app.getHttpServer())
        .get('/api/v1/health')
        .set(CORRELATION_ID_HEADER, customTraceId)
        .expect(200);

      expect(response.headers[CORRELATION_ID_HEADER]).toBe(customTraceId);
      expect(response.body.correlationId).toBe(customTraceId);
    });
  });

  describe('GET /api/v1/health/ready (Readiness)', () => {
    it('should return 200 OK when database is healthy', async () => {
      mockPrismaService.isHealthy.mockResolvedValueOnce({
        isHealthy: true,
        latencyMs: 4,
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/health/ready')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('ok');
      expect(response.body.data.database.status).toBe('up');
      expect(response.body.data.database.latencyMs).toBe(4);
    });

    it('should return 503 Service Unavailable when database is unhealthy', async () => {
      mockPrismaService.isHealthy.mockResolvedValueOnce({
        isHealthy: false,
        latencyMs: 15,
        error: 'Database connection failed: ECONNREFUSED',
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/health/ready')
        .expect(503);

      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(503);
      expect(response.body.error).toBe('ServiceUnavailableException');
      expect(response.body.correlationId).toBeDefined();
    });
  });

  describe('Global Error & Not Found Handling', () => {
    it('should return 404 with standardized error structure for non-existent routes', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/non-existent-endpoint')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(404);
      expect(response.body.error).toBe('Not Found');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('path', '/api/v1/non-existent-endpoint');
      expect(response.body).toHaveProperty('correlationId');
    });
  });
});
