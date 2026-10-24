process.env.DATABASE_URL =
  'postgresql://test_user:test_password@localhost:5432/test_erp?schema=public';
process.env.NODE_ENV = 'test';
process.env.PORT = '4002';
process.env.JWT_SECRET = 'test_jwt_secret_must_be_minimum_32_characters_long_for_security';
process.env.JWT_REFRESH_SECRET = 'test_jwt_refresh_secret_must_be_minimum_32_characters_long_for_security';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { PasswordService } from '../src/modules/auth/password.service';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { TransformResponseInterceptor } from '../src/common/interceptors/transform-response.interceptor';

describe('Central Authentication & RBAC (e2e)', () => {
  let app: INestApplication;
  let passwordService: PasswordService;

  // Test accounts
  let adminPasswordHash: string;
  let hrmsUserPasswordHash: string;
  let financeUserPasswordHash: string;

  const superAdminUser = {
    id: 'e2e-superadmin-uuid',
    email: 'superadmin@techm4india.com',
    firstName: 'Super',
    lastName: 'Admin',
    isActive: true,
    organizationId: 'e2e-org-uuid',
    organization: { id: 'e2e-org-uuid', code: 'TECHM4INDIA', name: 'TechM4India' },
    userRoles: [
      {
        role: {
          id: 'role-super-admin',
          code: 'SUPER_ADMIN',
          permissions: [
            { permission: { code: 'users:read' } },
            { permission: { code: 'users:manage' } },
            { permission: { code: 'roles:manage' } },
            { permission: { code: 'apps:read' } },
            { permission: { code: 'apps:manage' } },
          ],
        },
      },
    ],
    appAccess: [
      {
        application: {
          id: 'app-dashboard',
          code: 'CENTRAL_DASHBOARD',
          name: 'Central Dashboard',
          baseUrl: 'http://localhost:3000',
          isActive: true,
        },
        isActive: true,
      },
      {
        application: {
          id: 'app-hrms',
          code: 'HRMS',
          name: 'TechM4 HRMS',
          baseUrl: 'http://localhost:3001',
          isActive: true,
        },
        isActive: true,
      },
      {
        application: {
          id: 'app-finance',
          code: 'FINANCE',
          name: 'TechM4 Finance ERP',
          baseUrl: 'http://localhost:3002',
          isActive: true,
        },
        isActive: true,
      },
    ],
  };

  const hrmsUser = {
    id: 'e2e-hrms-user-uuid',
    email: 'employee.hrms@techm4india.com',
    firstName: 'Rohan',
    lastName: 'Verma',
    isActive: true,
    organizationId: 'e2e-org-uuid',
    organization: { id: 'e2e-org-uuid', code: 'TECHM4INDIA', name: 'TechM4India' },
    userRoles: [
      {
        role: {
          id: 'role-hrms-user',
          code: 'HRMS_USER',
          permissions: [{ permission: { code: 'hrms:access' } }],
        },
      },
    ],
    appAccess: [
      {
        application: {
          id: 'app-hrms',
          code: 'HRMS',
          name: 'TechM4 HRMS',
          baseUrl: 'http://localhost:3001',
          isActive: true,
        },
        isActive: true,
      },
    ],
  };

  const financeUser = {
    id: 'e2e-finance-user-uuid',
    email: 'accountant@techm4india.com',
    firstName: 'Ananya',
    lastName: 'Deshmukh',
    isActive: true,
    organizationId: 'e2e-org-uuid',
    organization: { id: 'e2e-org-uuid', code: 'TECHM4INDIA', name: 'TechM4India' },
    userRoles: [
      {
        role: {
          id: 'role-finance-user',
          code: 'FINANCE_USER',
          permissions: [{ permission: { code: 'finance:access' } }],
        },
      },
    ],
    appAccess: [
      {
        application: {
          id: 'app-finance',
          code: 'FINANCE',
          name: 'TechM4 Finance ERP',
          baseUrl: 'http://localhost:3002',
          isActive: true,
        },
        isActive: true,
      },
    ],
  };

  let tokenStorage: Map<string, any>;

  beforeAll(async () => {
    passwordService = new PasswordService();
    adminPasswordHash = await passwordService.hash('AdminPassword123!');
    hrmsUserPasswordHash = await passwordService.hash('HrmsPassword123!');
    financeUserPasswordHash = await passwordService.hash('FinancePassword123!');

    (superAdminUser as any).passwordHash = adminPasswordHash;
    (hrmsUser as any).passwordHash = hrmsUserPasswordHash;
    (financeUser as any).passwordHash = financeUserPasswordHash;

    tokenStorage = new Map<string, any>();

    const mockPrismaService = {
      $connect: jest.fn().mockResolvedValue(undefined),
      $disconnect: jest.fn().mockResolvedValue(undefined),
      isHealthy: jest.fn().mockResolvedValue({ isHealthy: true, latencyMs: 2 }),
      user: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          if (where.email === superAdminUser.email || where.id === superAdminUser.id) {
            return Promise.resolve(superAdminUser);
          }
          if (where.email === hrmsUser.email || where.id === hrmsUser.id) {
            return Promise.resolve(hrmsUser);
          }
          if (where.email === financeUser.email || where.id === financeUser.id) {
            return Promise.resolve(financeUser);
          }
          return Promise.resolve(null);
        }),
        update: jest.fn().mockResolvedValue({ id: 'dummy' }),
        count: jest.fn().mockResolvedValue(3),
        findMany: jest.fn().mockResolvedValue([superAdminUser, hrmsUser, financeUser]),
      },
      refreshToken: {
        create: jest.fn().mockImplementation(({ data }) => {
          tokenStorage.set(data.tokenHash, { ...data, id: 'rt-' + Math.random() });
          return Promise.resolve(data);
        }),
        findUnique: jest.fn().mockImplementation(({ where }) => {
          const rec = tokenStorage.get(where.tokenHash);
          if (!rec) return Promise.resolve(null);
          return Promise.resolve({
            ...rec,
            user: rec.userId === superAdminUser.id ? superAdminUser : hrmsUser,
          });
        }),
        update: jest.fn().mockImplementation(({ where, data }) => {
          for (const [k, v] of tokenStorage.entries()) {
            if (v.id === where.id || k === where.tokenHash) {
              Object.assign(v, data);
            }
          }
          return Promise.resolve({});
        }),
        updateMany: jest.fn().mockImplementation(({ where, data }) => {
          let count = 0;
          for (const v of tokenStorage.values()) {
            if (where.family && v.family === where.family) {
              Object.assign(v, data);
              count++;
            }
            if (where.userId && v.userId === where.userId) {
              Object.assign(v, data);
              count++;
            }
          }
          return Promise.resolve({ count });
        }),
      },
      application: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'app-dashboard', code: 'CENTRAL_DASHBOARD', name: 'Central Dashboard', baseUrl: 'http://localhost:3000', isActive: true },
          { id: 'app-hrms', code: 'HRMS', name: 'TechM4 HRMS', baseUrl: 'http://localhost:3001', isActive: true },
          { id: 'app-finance', code: 'FINANCE', name: 'TechM4 Finance ERP', baseUrl: 'http://localhost:3002', isActive: true },
        ]),
        findUnique: jest.fn(),
      },
      userApplicationAccess: {
        findMany: jest.fn().mockImplementation(({ where }) => {
          if (where.userId === hrmsUser.id) {
            return Promise.resolve([{ applicationId: 'app-hrms', isActive: true }]);
          }
          if (where.userId === financeUser.id) {
            return Promise.resolve([{ applicationId: 'app-finance', isActive: true }]);
          }
          return Promise.resolve([
            { applicationId: 'app-dashboard', isActive: true },
            { applicationId: 'app-hrms', isActive: true },
            { applicationId: 'app-finance', isActive: true },
          ]);
        }),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({ id: 'audit-log-id' }),
      },
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

  describe('POST /api/v1/auth/login', () => {
    it('should fail with 401 when password is wrong (safe generic error)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'superadmin@techm4india.com',
          password: 'IncorrectPassword!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email or password.');
    });

    it('should authenticate superadmin and return tokens', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'superadmin@techm4india.com',
          password: 'AdminPassword123!',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.tokenType).toBe('Bearer');
    });
  });

  describe('Protected Endpoints & RBAC Authorization', () => {
    let adminToken: string;
    let hrmsToken: string;
    let financeToken: string;

    beforeAll(async () => {
      // Login admin
      const adminRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'superadmin@techm4india.com', password: 'AdminPassword123!' });
      adminToken = adminRes.body.data.accessToken;

      // Login HRMS user
      const hrmsRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'employee.hrms@techm4india.com', password: 'HrmsPassword123!' });
      hrmsToken = hrmsRes.body.data.accessToken;

      // Login Finance user
      const finRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'accountant@techm4india.com', password: 'FinancePassword123!' });
      financeToken = finRes.body.data.accessToken;
    });

    it('GET /api/v1/auth/me should reject request without token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .expect(401);
    });

    it('GET /api/v1/auth/me should return authenticated profile with roles and authorized apps', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('superadmin@techm4india.com');
      expect(res.body.data.roles).toContain('SUPER_ADMIN');
      expect(res.body.data.authorizedApplications).toEqual(
        expect.arrayContaining(['CENTRAL_DASHBOARD', 'HRMS', 'FINANCE']),
      );
    });

    it('GET /api/v1/users should allow SUPER_ADMIN access', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('items');
    });

    it('GET /api/v1/users should DENY standard HRMS_USER (403 Forbidden)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${hrmsToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.statusCode).toBe(403);
    });

    it('GET /api/v1/users/me/applications should isolate applications: HRMS user sees only HRMS', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/users/me/applications')
        .set('Authorization', `Bearer ${hrmsToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      const appCodes = res.body.data.map((a: any) => a.code);
      expect(appCodes).toContain('HRMS');
      expect(appCodes).not.toContain('FINANCE'); // Access isolation
    });

    it('GET /api/v1/users/me/applications should isolate applications: Finance user sees only FINANCE', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/users/me/applications')
        .set('Authorization', `Bearer ${financeToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      const appCodes = res.body.data.map((a: any) => a.code);
      expect(appCodes).toContain('FINANCE');
      expect(appCodes).not.toContain('HRMS'); // Access isolation
    });
  });

  describe('Refresh Token Rotation & Reuse Detection (e2e)', () => {
    let initialRefreshToken: string;

    beforeAll(async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'superadmin@techm4india.com', password: 'AdminPassword123!' });
      initialRefreshToken = loginRes.body.data.refreshToken;
    });

    it('should rotate token successfully on first use', async () => {
      const refreshRes = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: initialRefreshToken })
        .expect(200);

      expect(refreshRes.body.success).toBe(true);
      expect(refreshRes.body.data).toHaveProperty('accessToken');
      expect(refreshRes.body.data).toHaveProperty('refreshToken');
      expect(refreshRes.body.data.refreshToken).not.toBe(initialRefreshToken);
    });

    it('TOKEN REUSE ATTACK DETECTION: Replaying previously used token should fail with 401 and revoke family', async () => {
      // Attempting to reuse initialRefreshToken which was already rotated
      const reuseRes = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: initialRefreshToken })
        .expect(401);

      expect(reuseRes.body.success).toBe(false);
      expect(reuseRes.body.message).toContain('Compromised session token detected');
    });
  });
});
