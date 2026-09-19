# TechM4India

The TechM4India public website: an editorial, image-led experience for the
Engineering, Solutions, Schools and Space divisions.

## Local development

Requires Node.js 22.13 or newer, and Docker Desktop for the database.

```bash
npm install
npm install --prefix backend
cp backend/.env.example backend/.env   # then set a local JWT_ACCESS_SECRET
npm run dev
```

`npm run dev` is the only command needed day to day. It starts the PostgreSQL
container, waits for it to report healthy, applies any pending migrations, and
then runs the API and the web app together with their output interleaved and
labelled `[api]` and `[web]`. Ctrl-C stops both.

| URL | Service |
| --- | --- |
| http://localhost:3000 | Public website and ERP |
| http://localhost:3001/api/v1/health | API health check |
| http://localhost:3001/api/docs | API documentation |

If Docker is unavailable, the startup step says so and steps aside rather than
blocking, so you can point `DATABASE_URL` at a database you manage yourself.

Individual pieces, when you want them on their own:

```bash
npm run dev:db     # database only: container, health wait, migrations
npm run dev:api    # API only  (expects the database to be up)
npm run dev:web    # web only  (expects the API to be up)
```

Seed the demo data once the database is running:

```bash
npm run --prefix backend prisma:seed
```

Demo employee accounts are seeded only when `SEED_DEMO_PASSWORD` is explicitly
set in a non-production environment.

### Checks

```bash
npm run lint       # web
npm run lint:api   # API
npx tsc --noEmit --incremental false
npm run test:all   # web tests, then API tests
```

`npm run build` creates the static Vinext export in `dist/`.

See [ERP_HANDOVER.md](ERP_HANDOVER.md) for the current module map, roles,
verification commands, intentional limitations, and managed deployment notes.

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
