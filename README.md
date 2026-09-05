# TechM4India

The TechM4India public website: an editorial, image-led experience for the
Engineering, Solutions, Schools and Space divisions.

## Local development

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

The production checks are:

```bash
npm run lint
npx tsc --noEmit --incremental false
npm test
```

`npm run build` creates the static Vinext export in `dist/`.

## ERP local development

The ERP API is a separate NestJS service under `backend/`. Start PostgreSQL
using the repository's local Docker setup, then copy `backend/.env.example` to
`backend/.env`, set a local `JWT_ACCESS_SECRET`, and run:

```bash
cd backend
npm ci
npm run prisma:migrate:deploy
npm run prisma:seed
npm run start:dev
```

In another terminal, run the frontend with `VITE_API_BASE_URL` pointing to
`http://localhost:3001/api/v1`. The API health check is available at
`http://localhost:3001/api/v1/health`; controlled API documentation is at
`http://localhost:3001/api/docs`. Demo employee accounts are seeded only when
`SEED_DEMO_PASSWORD` is explicitly set in a non-production environment.

## Routes

The primary routes are `/`, `/about`, `/engineering`, `/solutions`,
`/solutions/erp`,
`/schools`, `/space` and `/contact`. Legacy routes such as `/programs` and
`/research` redirect to the closest current division so existing links keep
working.

## Content and assets

Images used in the experience live under `public/images/`. Authentic
TechM4India workshop imagery is used for editorial sections; the Space hero is
credited to ISRO / Department of Space. Confirm permissions and model releases
for event photography before public campaigns or paid media use.
