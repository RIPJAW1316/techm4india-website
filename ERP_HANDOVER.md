# TechM4India ERP handover

## Product shape

The public Vinext/React site remains at the repository root. The internal ERP
uses the same visual language and calls the NestJS API in `backend/` over REST.
The current modules are Founder/Admin, employee workspaces, organization and
employee master, attendance, leave, projects/tasks, CRM, institutions, payroll,
and configurable Finance/GST records.

## Roles

Founder/CEO and Super Admin have organization-wide operational access. Finance
Manager and Finance Executive use dedicated finance permissions; Finance
Executive cannot perform final approvals, issuance, posting, cancellation, or
payment voids. Employees see only their own workspace data. The API enforces
role, organization, division/department, and ownership boundaries.

## Local setup

1. Install Node.js 22.13+ and Docker Desktop.
2. Copy `.env.example` to `.env` and `backend/.env.example` to `backend/.env`.
   Set unique local JWT secrets and an optional local-only demo password.
3. From `backend/`, run `docker compose up -d postgres`, `npm install`,
   `npm run prisma:generate`, `npm run prisma:migrate:deploy`, and
   `npm run prisma:seed`.
4. Start the API with `npm run start:dev` and the frontend from the repository
   root with `npm run dev`.
5. Verify `GET http://localhost:3001/api/v1/health` and open
   `http://localhost:3000/login`.

## Verification

Backend: `npm run prisma:validate`, `npm run build`, `npm run lint`, `npm test`.
Frontend: `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm run build`.
Swagger is available locally at `/api/docs`.

## Deployment notes

Deploy the static frontend to Vercel with `VITE_API_BASE_URL` pointing to a
separate HTTPS API host. Deploy NestJS to a Node-compatible managed host with
managed PostgreSQL and persistent backups. Configure production secrets in the
host's secret manager, run `prisma migrate deploy`, enable secure cookies and
an exact CORS allowlist. Do not deploy the local Docker database.

## Intentional limits

GST filing, certified statutory payroll rules, bank transfers, payment gateways,
external messaging, object storage, mobile applications, automatic
payroll-to-ledger posting, and advanced analytics are intentionally outside the
current product scope.
