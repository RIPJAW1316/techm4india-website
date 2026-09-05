# TechM4India deployment

## Recommended topology

```text
Browser
   │
   ▼
www.techm4india.com
Vercel / current static Vinext frontend
   │ HTTPS REST + credentials
   ▼
api.techm4india.com
Node-compatible host or container running NestJS
   │
   ▼
Managed PostgreSQL 16+
```

The public website and ERP UI remain in the existing static frontend. The NestJS API should run as a separate HTTPS service. The API host needs a persistent environment for the application process, managed secrets, structured logs, health checks, and a private network path to PostgreSQL where available. Redis, object storage, and background workers are not required for the current employee vertical slice.

## Frontend environment

Configure the Vercel project environment variable:

```env
VITE_API_BASE_URL=https://api.techm4india.com/api/v1
```

Do not put database credentials, JWT secrets, refresh tokens, or other server secrets in frontend variables.

## Backend environment

Configure these values in the API host secret manager or environment:

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=<managed-postgresql-connection-string>
CORS_ORIGINS=https://www.techm4india.com,https://techm4india.com
JWT_ACCESS_SECRET=<unique-random-secret-at-least-32-characters>
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=30d
REFRESH_COOKIE_NAME=tm4_refresh
COOKIE_DOMAIN=.techm4india.com
COOKIE_SECURE=true
TRUST_PROXY=true
BUSINESS_TIMEZONE=Asia/Kolkata
```

Generate `JWT_ACCESS_SECRET` with a password generator or a cryptographically secure random-byte command in the deployment environment. Never reuse the example placeholder or display the generated value in source control, documentation, or logs.

`CORS_ORIGINS` is a comma-separated exact allowlist. Do not use `*` with credentials. Local development can use `http://localhost:3000`.

## Cookie posture

The refresh cookie is HttpOnly, Secure in production, scoped to `/api/v1/auth`, and uses `SameSite=Lax`. `www.techm4india.com` and `api.techm4india.com` are same-site subdomains, so Lax supports the intended first-party browser flow without requiring `SameSite=None`. Set `COOKIE_DOMAIN=.techm4india.com` only when the production topology needs the cookie shared across those subdomains; leave it empty for a same-host deployment.

## Database deployment

Use this sequence in the API deployment pipeline:

```bash
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
npm run start
```

Do not run `prisma migrate dev` in production. Take a managed PostgreSQL backup before any future destructive migration and retain rollback/restore instructions with the deployment record.

The API health endpoint is:

```text
GET /api/v1/health
```

Swagger is available at `/api/docs` for controlled internal environments. Restrict or disable public Swagger exposure according to the host’s access policy.

## Seed safety

The seed always upserts base organization, division, department, role, and permission reference data. Development employee/project/task/notification personas are created only when `NODE_ENV` is not `production` and `SEED_DEMO_PASSWORD` is explicitly supplied. A production seed run therefore skips demo accounts.

Run the seed only after migrations in a development environment:

```bash
$env:SEED_DEMO_PASSWORD="<local-development-password>"
npm run prisma:seed
```

