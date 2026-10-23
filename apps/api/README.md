# TechM4India ERP — Central Backend Foundation (Phase 1)

This package (`apps/api`) implements the centralized backend foundation for **TechM4India Innovations Pvt. Ltd.** The platform serves as the central identity, role, and permission infrastructure for both **HRMS** and **Finance ERP** applications, as well as future modules.

---

## 1. Architecture Overview

- **Framework**: NestJS 11 with TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma 6
- **API Style**: REST API with global versioning under `/api/v1`
- **Documentation**: Swagger / OpenAPI at `/api/v1/docs`
- **Validation**: `class-validator`, `class-transformer`, and `joi` environment validation
- **Security**: Helmet, restrictive CORS, rate limiting via `@nestjs/throttler`, correlation IDs via `uuid`, sensitive parameter redaction
- **Deployment**: Render Web Service & Managed PostgreSQL

```
apps/api/
├── prisma/
│   ├── schema.prisma              # Central identity & multi-app RBAC schema
│   ├── seed.ts                    # Idempotent development seed script
│   └── migrations/
│       └── 0_init/
│           └── migration.sql      # Initial PostgreSQL migration DDL
├── src/
│   ├── main.ts                    # Bootstrap: helmet, cors, validation, swagger, interceptors
│   ├── app.module.ts              # Root NestJS module & middleware binding
│   ├── config/
│   │   ├── configuration.ts       # Structured configuration loader
│   │   ├── env.validation.ts      # Joi schema & environment validator
│   │   └── env.validation.spec.ts # Unit tests for config validation
│   ├── database/
│   │   ├── prisma.service.ts      # Prisma client lifecycle & isHealthy probe
│   │   ├── database.module.ts     # Global database module
│   │   └── prisma.service.spec.ts # Unit tests for Prisma health checks
│   ├── common/
│   │   ├── constants/             # Headers, sensitive fields list
│   │   ├── dto/                   # Standardized response envelopes (Swagger annotated)
│   │   ├── filters/               # Global exception filter (safe error responses)
│   │   ├── interceptors/          # Logging (sanitized) & response transformation
│   │   └── middleware/            # Correlation ID generator & propagator
│   └── modules/
│       ├── health/                # Liveness & DB readiness endpoints + tests
│       ├── auth/                  # Reserved for Phase 2 Auth & SSO
│       ├── identity/              # Reserved for Phase 2 Users & RBAC
│       ├── applications/          # Reserved for Phase 2 App access registry
│       ├── organizations/         # Reserved for Phase 2 Tenant hierarchy
│       ├── hrms/                  # Reserved for HRMS integration
│       ├── finance/               # Reserved for Finance ERP integration
│       ├── audit-logs/            # Reserved for Audit query engine
│       └── notifications/         # Reserved for Multi-channel notifications
├── test/
│   ├── jest-e2e.json              # E2E test runner configuration
│   └── health.e2e-spec.ts         # Full end-to-end integration test suite
├── .env.example                   # Environment configuration template
├── render.yaml                    # Infrastructure-as-code for Render deployment
└── DEPLOYMENT.md                  # Comprehensive Render deployment guide
```

---

## 2. Central Identity & Multi-App Model

The database foundation establishes a single identity system so users do not require separate accounts for HRMS and Finance ERP:

- **Organization**: Company identity (`code`, `name`, `taxId`)
- **User**: Central identity credentials (`email`, `passwordHash`, `name`, `isActive`)
- **Role & Permission**: Role-Based Access Control (`SUPER_ADMIN`, `HRMS_ADMIN`, `FINANCE_ADMIN`, etc.)
- **Application**: Application registry (`CENTRAL_DASHBOARD`, `HRMS`, `FINANCE`)
- **UserApplicationAccess**: Cross-app grant mapping which users have access to which applications
- **AuditLog**: Central compliance and activity audit logging

---

## 3. Local Development Setup

### 3.1 Prerequisites

- Node.js >= 22.13.0
- A running PostgreSQL database (or local Docker container)

### 3.2 Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Configure your local `DATABASE_URL`:
   ```ini
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/techm4india_erp?schema=public
   PORT=4000
   ```

### 3.3 Database Migration & Seeding

```bash
# Generate the Prisma Client
npm run prisma:generate

# Apply pending migrations to PostgreSQL
npm run prisma:migrate

# Seed baseline organizations, roles, and applications
npm run prisma:seed
```

### 3.4 Starting the Server

```bash
# Development mode with hot-reload
npm run start:dev

# Production build and run
npm run build
npm run start:prod
```

The API will be available at:
- **Base URL**: `http://localhost:4000/api/v1`
- **Swagger Documentation**: `http://localhost:4000/api/v1/docs`
- **Liveness Probe**: `http://localhost:4000/api/v1/health`
- **Readiness Probe**: `http://localhost:4000/api/v1/health/ready`

---

## 4. API Endpoints

### `GET /api/v1/health` (Liveness)
Used by orchestration layers to confirm the server process is responsive.
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "status": "ok",
    "uptime": 23.4,
    "timestamp": "2026-10-23T18:00:00.000Z",
    "version": "1.0.0"
  },
  "timestamp": "2026-10-23T18:00:00.000Z",
  "correlationId": "85f57a90-3ce9-4a9f-8a07-82ba69d30043"
}
```

### `GET /api/v1/health/ready` (Readiness)
Queries PostgreSQL using `SELECT 1;` to confirm database connectivity.
- Returns `200 OK` if the database is healthy.
- Returns `503 Service Unavailable` if the database connection fails.
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "status": "ok",
    "database": {
      "status": "up",
      "latencyMs": 3
    },
    "uptime": 25.1,
    "timestamp": "2026-10-23T18:00:00.000Z",
    "version": "1.0.0"
  },
  "timestamp": "2026-10-23T18:00:00.000Z",
  "correlationId": "4c9d5d54-8c88-46fb-a0ef-281ce13d78c9"
}
```

### `GET /api/v1/docs` (Swagger / OpenAPI)
Interactive OpenAPI 3.0 UI documenting all schemas, response codes, tags, and security schemes.

---

## 5. Quality & Test Execution

Run the automated test suites:

```bash
# Run unit tests (12 tests across 4 suites)
npm test

# Run end-to-end integration tests (5 tests)
npm run test:e2e

# Run linting
npm run lint

# Compile production build
npm run build
```

---

## 6. Security Baseline

- **Input Validation**: Global `ValidationPipe` with payload transformation, property whitelisting, and strict rejection of unknown parameters.
- **Security Headers**: `helmet` enabled for secure headers (CSP, HSTS, X-Frame-Options, etc.).
- **Rate Limiting**: Configured with `@nestjs/throttler` (default: 100 requests / 60 seconds).
- **Request Logging**: Request correlation IDs propagated across request and response (`x-correlation-id`). Sensitive keys (`password`, `token`, `secret`, `authorization`) are automatically redacted from logs.
- **Safe Error Filter**: Global `AllExceptionsFilter` catches all exceptions. In production, raw SQL errors and stack traces are suppressed and replaced with generic safe responses.

---

## 7. Roadmap & Next Steps (Phase 2)

1. **Authentication & Identity Provider**:
   - Argon2 / Bcrypt password hashing.
   - JWT access & refresh token issuance and revocation.
   - Central authentication guards and `@CurrentUser()` decorator.
2. **RBAC Guard**:
   - `@Roles(...)` and `@Permissions(...)` decorators for endpoint authorization.
3. **Application Launcher**:
   - Single sign-on redirect handling for HRMS and Finance ERP applications based on `UserApplicationAccess`.
4. **Audit Logging Service**:
   - Ingesting user action logs to PostgreSQL `audit_logs` table.
