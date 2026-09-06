# TechM4India ERP V2 architecture delta

## Audit baseline

The current restore point is commit `d4d84b9` on `erp-v2`, also tagged `erp-core-demo`. The product is a public Vinext/Vite/React website with an ERP shell in the same frontend and a separate NestJS API under `backend/`. The backend is a modular monolith using Prisma/PostgreSQL and a REST `/api/v1` contract.

The V2 PDF is a target-state functional specification, not a reason to downgrade working technology. The decisions below optimize for a small team, the already-working employee vertical slice, and the explicit instruction to keep development local until client approval.

## Technology delta

| Area | V2 recommendation | Current implementation | Compatibility | Decision | Reason |
| --- | --- | --- | --- | --- | --- |
| Public frontend | React 18 + TypeScript + Vite | React 19.2.6 + TypeScript 5.9 + Vinext beta + Vite 8; static/export-oriented routes | High at component level; version downgrade is unnecessary | KEEP_CURRENT | Build, route rendering and tests already pass. |
| ERP frontend | Next.js 14 App Router, SSR/RSC, Tailwind | ERP pages live in the same Vinext application and use a client AuthProvider/protected shell | Functional overlap, but not drop-in migration | KEEP_CURRENT | A split would duplicate auth, design and route work before a real SSR need exists. |
| Frontend styling | Tailwind CSS | Shared global CSS/design system; Tailwind package is present but not the ERP styling boundary | Compatible but not required | KEEP_CURRENT | Preserve the established TechM4India visual system and avoid a rewrite. |
| Backend | NestJS 10 | NestJS 11, TypeScript, modular monolith | Backward-compatible architecture; newer major is in use | KEEP_CURRENT | Do not downgrade a passing build and test suite. |
| ORM | Prisma 5 | Prisma 6, generated client, migration deploy and seed | Schema concepts compatible | KEEP_CURRENT | Current lockfile and migrations are the source of truth. |
| Database | PostgreSQL 16 | PostgreSQL datasource; local Docker Compose and prior hosted Neon deployment | Direct | KEEP_CURRENT | Fits relational domains, transactions, audit and future reporting. |
| API style | REST + GraphQL | REST `/api/v1`, Swagger/OpenAPI bootstrap | REST covers current vertical slice | EXTEND_CURRENT | Add versioned REST domains first; GraphQL is a later client-driven option. |
| Cache/session | Redis 7 | No Redis; refresh sessions are PostgreSQL-backed | No current requirement | DEFER_UNTIL_REQUIRED | Database-backed sessions are sufficient for current traffic and security scope. |
| Jobs | BullMQ + Redis | No queue | No current requirement | DEFER_UNTIL_REQUIRED | Introduce when campaigns, payroll batches, certificates, reminders or report jobs need retries/scheduling. |
| Search | Elasticsearch/Meilisearch | PostgreSQL indexes and ordinary queries only | Directly compatible | DEFER_UNTIL_REQUIRED | PostgreSQL search is sufficient until CRM, CMS, knowledge or LMS corpus/UX requires dedicated search. |
| File storage | S3 + CloudFront | Static `public/images`; no private object store | Requires new boundary | INTRODUCE_LATER | Add metadata-first storage when HR documents, contracts, LMS media or invoices arrive. |
| Realtime | Socket.io + Redis pub/sub | Request/response REST; notifications are persisted inbox records | Compatible later | DEFER_UNTIL_REQUIRED | Polling/inbox is adequate for current tasks. Add realtime for chat/live dashboards or mobile push orchestration. |
| Mobile | React Native + Expo | No mobile app | Separate client | INTRODUCE_LATER | Stabilize versioned REST/auth and domain contracts first. |
| AI | OpenAI + LangChain | No AI integration | Optional | DEFER_UNTIL_REQUIRED | Build deterministic data/report foundations and privacy boundaries before AI. |
| Monitoring | Prometheus/Grafana/Sentry | Health endpoint, test output and host logs; no integrations | Direct later | INTRODUCE_LATER | Add before client-approved production scale, not during local domain build-out. |
| Gateway | Kong/AWS API Gateway | Nest global prefix, throttler, CORS, Helmet, trusted-origin guard | Current app boundary is sufficient locally | DEFER_UNTIL_REQUIRED | Revisit at managed production ingress, mobile/external integrations or multi-service extraction. |
| Containers | Docker Compose dev / Kubernetes prod | Docker Compose local PostgreSQL; Vercel-compatible backend entrypoint also exists from deployment work | Current dev is direct | KEEP_CURRENT for dev; MIGRATE_LATER for prod | Client explicitly defers production infrastructure transfer. Kubernetes is not a current development dependency. |
| CI/CD | GitHub Actions + Docker | Repository has build/test scripts; no full CI policy in current source | Compatible | INTRODUCE_LATER | Add required checks and staging gates before client UAT/production handoff. |

## Frontend architecture decision

### Option comparison

| Option | Business value | Risk | Migration cost | SSR requirement | Security impact | Velocity | V2 compatibility |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A. Keep ERP in current Vinext app | One shell, one design system, one auth integration, fastest domain delivery | Vinext beta limits some ecosystem choices; frontend and ERP deploy together | Low | Current employee dashboard does not require server-side rendering | No inherent change; backend remains security boundary | Highest now | Good for current and near-term waves |
| B. Split ERP into a separate frontend app later | Independent releases, ownership and scaling | Two shells, duplicated auth/cookies/telemetry, cross-origin UX | Medium-high | Can choose SSR when justified | More origins and session/CORS decisions | Lower during transition, higher only at scale | Good as a measured later step |
| C. Migrate ERP to Next.js 14 now/later | Matches PDF wording and broad ecosystem | Migration of routes, Vinext behavior, styles, auth and deployment; version is already old relative to current ecosystem | High | Useful only for a demonstrated SSR/RSC need | New boundary increases integration risk | Low during migration | Compatible in theory, not necessary now |

### Recommendation

Choose **Option A for V2-1 through domain waves**. Keep the ERP routes inside the existing Vinext application, preserve the shared shell, and keep all authorization in NestJS. Re-evaluate Option B after at least two independent domain teams need separate release cadence, or when SSR, bundle size, or deploy isolation becomes a measured problem. Do not migrate to Next.js 14 simply to match the PDF.

The public site should remain static/export-oriented. Protected ERP views can continue to render a shell and hydrate data from the API; SSR is not a security boundary and is not required for employee authorization.

## Backend modular-monolith boundary

Continue with one NestJS application and make bounded contexts explicit. A module owns its application services, DTOs, authorization checks, persistence mapping and events; cross-domain access goes through a service/application contract rather than direct table assumptions.

| Bounded context | Owns | Depends on | First wave |
| --- | --- | --- | --- |
| Identity & Access | Users, roles, permissions, sessions, MFA/SSO adapters, auth audit | Organization for scope | Existing; V2-1 hardening |
| Organization | Company, divisions, departments, branches, teams, cost centres | Identity | V2-1/V2-2 |
| HR Core | Employee profile, employment history, documents, designations, grades | Organization, Identity, object storage | V2-3 |
| Recruitment | Requisitions, applicants, interviews, offers, onboarding | HR Core, notifications, document storage | V2-5 |
| Attendance & Leave | Shifts, holidays, attendance, balances, applications | HR Core, organization | V2-4 |
| Performance & L&D | Goals, appraisal cycles, feedback, internal training | HR Core, notifications | V2-6 |
| Payroll | Salary structures, payroll runs, payslips, declarations, reimbursements | HR, attendance/leave, finance, statutory rules | V2-7 |
| CRM & Marketing | Leads, activities, follow-ups, campaigns, targets | Organization, communications, finance for commissions | V2-8 |
| Institutions | Institutions, contacts, MoUs, relationship timeline, health | CRM, documents, programs, finance | V2-9 |
| Programs | Program catalogue, curriculum, batches, sessions, delivery | Divisions, institutions, faculty | V2-10 |
| LMS | Courses, lessons, assignments, submissions, grades, certificates | Programs, Students, object storage, jobs | V2-11 |
| Students | Student/guardian/profile, enrollment, fees, grievance, alumni | Programs, LMS, finance, privacy policy | V2-12 |
| Projects | Existing projects/tasks plus milestones, risks, sprints, time logs | Organization, institutions/CRM, finance | V2-13 |
| Finance & GST | Ledger, accounts, invoices, payments, expenses, tax and reports | Organization, vendors, projects, institutions | V2-14/V2-15 |
| Inventory & Procurement | Items, stock, warehouses, requisitions, RFQ, PO, GRN | Finance, vendors, branches | V2-16 |
| Assets | Asset lifecycle, assignments, maintenance, depreciation | Procurement, HR, finance, branches | V2-16 |
| Vendors & Partners | Vendor KYC, contracts, invoices, partner ecosystem | Finance, procurement, documents | V2-16 |
| CMS | Pages, programs/projects projections, blog/events, revisions, publishing | Identity, programs, HR, object storage | V2-17 |
| Communications | Templates, announcements, notification delivery logs | Identity, all domains, jobs | V2-18/V2-21 |
| Support & Knowledge | Tickets, SLA, knowledge articles, SOPs | Identity, organization, communications, search | V2-18 |
| Compliance | Calendar, obligations, evidence, reminders, immutable audit export | Finance, HR, legal, object storage | V2-18 |
| Analytics & Reporting | Read models, reports, schedules, insights | Domain events/read APIs | V2-19/V2-20 |
| Integrations | Provider credentials, webhooks, idempotency, outbound adapters | Relevant bounded contexts | V2-21 |

Microservices are not a V2-1 requirement. Extract only a bounded context that has independent load, availability, compliance, deployment or team ownership pressure. Until then, a modular monolith keeps transactions, authorization and migrations understandable.

## Fifth vertical: Horizon Startup School

The PDF names the fifth division `Horizon Startup School`; the current seed and frontend contain only Engineering, Solutions, Schools and Space. The migration impact is:

- Confirm whether the official display name is exactly `Horizon Startup School`, whether the slug is `horizon-startup-school` or `horizon`, and whether it is a division, program brand, or separate legal/business unit.
- Add a division row and departments only after approval. No Prisma schema change is inherently required if it remains a normal `Division`.
- Extend `DIVISION_CONFIG`, workspace resolver tests, permitted-division API behavior, public navigation/content, sitemap/metadata and demo-persona strategy.
- Add program categories (bootcamps, incubation, pitch preparation, investor connect), ownership and institution/CRM relationships.
- Decide whether student, founder, mentor and investor personas are new roles or scoped relationships; do not grant employee permissions by analogy.
- Add cost-centre/reporting scope and audit policy before finance or CEO dashboards consume the division.

This audit does not implement or seed the fifth vertical.

## Security architecture extension

The core security boundary remains the backend. The current sequence is:

```text
Browser
  -> short-lived JWT access token
  -> Nest JwtAuthGuard validates token and session state
  -> PermissionsGuard / AuthorizationPolicy checks role + permission + division + ownership
  -> Prisma query applies the permitted resource scope
```

Extend it rather than replacing it:

1. Add an explicit `Principal` scope object for branch, team, cost centre, institution and program where needed.
2. Keep permission keys namespaced (`hr.employee.read_self`, `finance.invoice.approve`) and separate read, create, update, approve, export and administer actions.
3. Add temporal role grants and step-up MFA claims for HR/finance; do not put sensitive authorization in a UI route.
4. Add provider-backed OAuth/SSO only after the client selects Google Workspace or Microsoft Entra ID and defines account-linking rules.
5. Add IP allowlists at the ingress/application policy layer for finance/HR only after a stable production network exists.
6. Preserve audit events for authentication, role changes, sensitive reads/exports, document access and financial mutations.

## Infrastructure decision matrix

| Component | Current development posture | Decision | Trigger to introduce |
| --- | --- | --- | --- |
| PostgreSQL | Local PostgreSQL through Docker Compose | KEEP | Already required by core |
| Redis | None | DEFER | Cross-instance cache, pub/sub, rate-limit scale or job queue |
| BullMQ | None | DEFER | Campaigns, payroll batches, certificates, reminders, report refresh, webhook retries |
| S3/R2 | None for private files | INTRODUCE_LATER | First HR document, contract, invoice, LMS video or CMS media workflow |
| Search engine | PostgreSQL queries/indexes | DEFER | Large CRM/CMS/knowledge/LMS corpus with relevance/facet requirements |
| GraphQL | None | DEFER | Multiple clients need flexible nested reads that REST endpoints cannot serve efficiently |
| Socket.io | None | DEFER | Chat, live dashboard updates or high-value realtime notifications |
| Prometheus/Grafana/Sentry | None | INTRODUCE_LATER | Before client-owned staging/production or measurable operational risk |
| API gateway/WAF | Nest ingress controls | MIGRATE_LATER | Managed production, external partners, mobile apps or multiple services |
| Kubernetes | Not used | DEFER / LIKELY UNNECESSARY CURRENTLY | Only after independently scaling services and a team can operate it |
| Managed hosting | Prior Vercel/Neon deployment exists, but current development direction is local | MIGRATE_LATER | Client approval and transfer to client-owned accounts/workspaces |

## Repository and deployment guardrails

- Keep `backend/` as the API boundary; do not restructure into a monorepo during early V2 waves.
- Keep environment files ignored; only examples may be documented.
- Treat the Vercel-compatible `backend/api/index.ts` and `backend/vercel.json` as deployment support, not proof that production infrastructure is finalized.
- Run Prisma migrations from the backend package, never against a client database from a developer laptop without an approved process.
- Keep Swagger internal or protected when the API is publicly hosted.
- No infrastructure package should be added before the wave that consumes it has a defined failure/retry/security requirement.

