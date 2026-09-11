# TechM4India ERP API

This is the NestJS + Prisma API for the TechM4India Company Management ERP.
The public Vinext/Vite frontend remains at the repository root; ERP pages call
this API over HTTPS in production. Current modules include RBAC, organization
and employee records, attendance, leave, projects/tasks, CRM, institutions,
payroll, and configurable Finance/GST records.

## Requirements

- Node.js 22.13 or newer
- npm
- Docker Desktop for the local PostgreSQL option

## Setup

```text
npm install
Copy-Item .env.example .env
```

The values in `.env.example` and `docker-compose.yml` are development-only credentials.
Never use them in production.

## Local PostgreSQL

```text
docker compose up -d postgres
```

The database is exposed only on local port `5433`.

## Prisma

```text
npm run prisma:format
npm run prisma:validate
npm run prisma:generate
npm run prisma:migrate:dev -- --name foundation
npm run prisma:seed
```

For a deployed database, use `npm run prisma:migrate:deploy` instead of `migrate:dev`.

## Development server

```text
npm run start:dev
```

Health endpoint:

```text
GET http://localhost:3001/api/v1/health
```

Swagger documentation:

```text
http://localhost:3001/api/docs
```

## Authentication development setup

Before starting the API locally, set a unique `JWT_ACCESS_SECRET` (at least 32
characters) in `.env`. The refresh token is an opaque,
rotated, HttpOnly cookie; only its SHA-256 hash is stored in PostgreSQL. Access tokens are
short-lived JWTs and are sent in the `Authorization: Bearer` header.

The development seed account is updated only when `SEED_DEMO_PASSWORD` is supplied:

```text
$env:SEED_DEMO_PASSWORD = "set-your-local-development-password"
npm run prisma:seed
Remove-Item Env:SEED_DEMO_PASSWORD
```

Never commit either value. Demo personas are development-only, opt-in, and
must never be represented as real employees or customer data.

Authentication endpoints:

```text
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

Refresh and logout enforce configured origin checks when a browser sends an
`Origin` header. Organization, employee, project, task, notification,
attendance, leave, CRM, institution, payroll, and Finance/GST APIs are all
organization-scoped at the backend. See `../ERP_HANDOVER.md` for handover,
testing, and managed deployment notes.
