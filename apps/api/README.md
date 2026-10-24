# TechM4India ERP — Central Backend (Phases 1 & 2)

This package (`apps/api`) implements the centralized backend foundation, authentication, identity, and Role-Based Access Control (RBAC) infrastructure for **TechM4India Innovations Pvt. Ltd.** It provides a shared identity backbone for both **HRMS** and **Finance ERP** applications.

---

## 1. Architecture Overview

- **Framework**: NestJS 11 with TypeScript
- **Database**: PostgreSQL (Prisma 6 ORM)
- **Authentication**: Argon2id password hashing, short-lived JWT access tokens (`15m`), rotating refresh tokens (`7d`) with family-based reuse attack detection
- **Authorization**: Granular RBAC (`@Roles`, `@Permissions`, `RolesGuard`, `PermissionsGuard`) with explicit HRMS and Finance access isolation
- **API Style**: REST API with global versioning under `/api/v1`
- **Documentation**: Swagger / OpenAPI at `/api/v1/docs`
- **SSO Architecture**: OIDC-compatible Authorization Code Flow with PKCE specification ([`docs/SSO_INTEGRATION_GUIDE.md`](./docs/SSO_INTEGRATION_GUIDE.md))
- **Deployment**: Render Web Service & Shared Managed PostgreSQL

```
apps/api/
├── prisma/
│   ├── schema.prisma              # Central identity, RBAC, sessions & multi-app schema
│   ├── seed.ts                    # Idempotent development seed script (Argon2id hashes)
│   └── migrations/
│       ├── 0_init/                # Baseline database migration DDL
│       └── 20261023_phase2_auth_sessions/ # Refresh tokens & sessions DDL
├── src/
│   ├── main.ts                    # Bootstrap: Helmet, CookieParser, Validation, Swagger
│   ├── app.module.ts              # Root NestJS module & middleware binding
│   ├── config/
│   │   ├── configuration.ts       # Structured configuration loader
│   │   ├── env.validation.ts      # Joi schema validator
│   │   └── env.validation.spec.ts # Unit tests for config validation
│   ├── database/
│   │   ├── prisma.service.ts      # Prisma lifecycle, connection probe & URL masking
│   │   └── database.module.ts     # Global database module
│   ├── common/
│   │   ├── constants/             # Headers, sensitive field blocklists
│   │   ├── decorators/            # @CurrentUser, @Roles, @Permissions, @Public
│   │   ├── guards/                # JwtAuthGuard, RolesGuard, PermissionsGuard
│   │   ├── filters/               # AllExceptionsFilter (safe error responses)
│   │   ├── interceptors/          # Logging (redacted) & response transformation
│   │   └── middleware/            # Correlation ID generator & propagator
│   └── modules/
│       ├── health/                # Liveness & DB readiness endpoints + tests
│       ├── auth/                  # Central Authentication: login, logout, refresh, change-password
│       ├── identity/              # Central User Management, RBAC & session revocation
│       ├── applications/          # Applications catalog & access registry
│       ├── organizations/         # Multi-tenant organization hierarchy
│       ├── hrms/                  # Prepared for HRMS business integration
│       ├── finance/               # Prepared for Finance business integration
│       ├── audit-logs/            # Audit logging queries
│       └── notifications/         # Notification engine
├── test/
│   ├── jest-e2e.json              # E2E test runner configuration
│   ├── health.e2e-spec.ts         # Health & readiness e2e tests
│   └── auth-rbac.e2e-spec.ts      # Authentication, rotation, reuse & RBAC e2e tests
├── docs/
│   └── SSO_INTEGRATION_GUIDE.md   # Architectural guide for HRMS & Finance developers
├── scripts/
│   └── verify-shared-db.ts        # Safe shared database verification CLI tool
├── .env.example                   # Environment configuration template
├── render.yaml                    # Infrastructure-as-code for Render deployment
└── DEPLOYMENT.md                  # Comprehensive Render deployment guide
```

---

## 2. Implemented API Endpoints (`/api/v1`)

### 2.1 Authentication (`/api/v1/auth`)
| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Public | Employee login via email and password. Returns JWT access token & rotating refresh token. |
| `POST` | `/api/v1/auth/refresh` | Public | Rotates refresh token. Detects token reuse attacks and invalidates compromised families. |
| `POST` | `/api/v1/auth/logout` | Public/Auth | Terminates session and revokes the active refresh token. |
| `GET` | `/api/v1/auth/me` | Bearer Auth | Returns current user profile, roles, permissions, and authorized applications. |
| `POST` | `/api/v1/auth/change-password` | Bearer Auth | Changes password with Argon2id and invalidates all other active sessions. |

### 2.2 Central Identity & User Management (`/api/v1/users`)
| Method | Endpoint | Required Permission | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/users` | `users:read` | List employees with pagination, search, role, and application filters. |
| `GET` | `/api/v1/users/:id` | `users:read` | Retrieve user details with assigned roles, permissions, and grants. |
| `POST` | `/api/v1/users` | `users:manage` | Provision a new employee account (prevents privilege escalation). |
| `PATCH` | `/api/v1/users/:id` | `users:manage` | Update employee profile details. |
| `PATCH` | `/api/v1/users/:id/status` | `users:manage` | Activate/deactivate account. Deactivation automatically revokes all sessions. |
| `POST` | `/api/v1/users/:id/roles` | `roles:manage` | Assign a role to a user. |
| `DELETE` | `/api/v1/users/:id/roles/:roleCode` | `roles:manage` | Revoke a role from a user. |
| `GET` | `/api/v1/users/me/applications` | Authenticated | Return the current user's authorized applications with verified redirect URLs. |
| `GET` | `/api/v1/users/:id/applications` | `apps:read` | View application access grants for any user. |
| `POST` | `/api/v1/users/:id/applications` | `apps:manage` | Grant access to an application (`HRMS`, `FINANCE`, etc.). |
| `DELETE` | `/api/v1/users/:id/applications/:appCode` | `apps:manage` | Revoke application access. |
| `POST` | `/api/v1/users/:id/revoke-sessions` | `users:manage` | Administrative kill-switch: revokes all active sessions for a user. |

### 2.3 Applications Catalog (`/api/v1/applications`)
| Method | Endpoint | Required Permission | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/applications` | Authenticated | List application catalog with access status for the authenticated user. |
| `POST` | `/api/v1/applications` | `apps:manage` | Register new application (enforces trusted origin validation). |
| `PATCH` | `/api/v1/applications/:id` | `apps:manage` | Update application details or URL. |
| `DELETE` | `/api/v1/applications/:id` | `apps:manage` | Remove application from catalog. |

### 2.4 Monitoring & Health (`/api/v1/health`)
| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Public | Liveness probe (uptime, status). |
| `GET` | `/api/v1/health/ready` | Public | Database readiness probe (`SELECT 1;`, database identity, SSL status). |
| `GET` | `/api/v1/docs` | Public | Interactive Swagger / OpenAPI 3.0 documentation. |

---

## 3. Security Baseline & Access Isolation

1. **Password Hashing**: Uses Argon2id (`timeCost: 3`, `memoryCost: 65536`, `parallelism: 4`).
2. **Refresh Token Rotation & Reuse Detection**:
   - Refresh tokens are grouped in token families (`family`).
   - If an expired or already-revoked refresh token is re-submitted (indicating theft or token replay), the backend detects the reuse attack and immediately invalidates all tokens in that family.
3. **Application & Role Isolation**:
   - Users with `HRMS_USER` or `HRMS_ADMIN` cannot access Finance ERP endpoints.
   - Users with `FINANCE_USER` or `FINANCE_ADMIN` cannot access HRMS endpoints.
   - `SUPER_ADMIN` privileges are explicitly enforced.
4. **Privilege Escalation Protection**:
   - Non-`SUPER_ADMIN` administrators cannot grant the `SUPER_ADMIN` role to themselves or other users.
   - Users cannot deactivate their own accounts.
5. **URL Destination Validation**:
   - Destination application redirect URLs are validated against `TRUSTED_APP_URLS` before registration or redirection.

---

## 4. Local Development Setup

### 4.1 Prerequisites
- Node.js >= 22.13.0
- Managed PostgreSQL database on Render (or local PostgreSQL)

### 4.2 Setup Steps

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Configure your `DATABASE_URL` with Render's **External Database URL**:
   ```ini
   DATABASE_URL="postgresql://techm4india_admin:<PASSWORD>@dpg-<ID>.<REGION>-postgres.render.com:5432/techm4india_erp?sslmode=require"
   PORT=4000
   NODE_ENV=development
   ```
3. Generate the Prisma Client:
   ```bash
   npm run prisma:generate
   ```
4. Apply migrations:
   ```bash
   npm run prisma:migrate
   ```
5. Seed initial accounts (Argon2id default password: `TechM4Admin2026!`):
   ```bash
   npm run prisma:seed
   ```
   *Provisioned accounts:*
   - `superadmin@techm4india.com` (Roles: `SUPER_ADMIN`, Apps: all)
   - `hrms.admin@techm4india.com` (Roles: `HRMS_ADMIN`, Apps: `HRMS`)
   - `finance.admin@techm4india.com` (Roles: `FINANCE_ADMIN`, Apps: `FINANCE`)
   - `employee.hrms@techm4india.com` (Roles: `HRMS_USER`, Apps: `HRMS`)
   - `accountant.finance@techm4india.com` (Roles: `FINANCE_USER`, Apps: `FINANCE`)

---

## 5. Running Quality Checks & Tests

From repository root:

```bash
# Run 36 unit tests across 7 test suites
npm run api:test

# Run 15 end-to-end integration tests across 2 suites
npm run api:test:e2e

# Run ESLint (0 errors, 0 warnings)
npm run api:lint

# Compile production build
npm run api:build
```

---

## 6. Single Sign-On (SSO) Architecture

For the complete specification on how the HRMS and Finance ERP applications integrate with Central Identity, see [`docs/SSO_INTEGRATION_GUIDE.md`](./docs/SSO_INTEGRATION_GUIDE.md).
