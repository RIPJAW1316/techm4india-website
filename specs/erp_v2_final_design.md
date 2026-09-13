# TechM4India ERP V2 final implementation design

## Objective

Extend the deployed TechM4India modular monolith from its current Founder/Admin,
organization, employee, attendance, leave, project/task, CRM, institution,
payroll, and finance/GST capabilities into the V2 operating platform described
in `TechM4India_ERP_V2_Final.pdf`, while preserving the working V1 API and the
existing public website.

The PDF is a product roadmap as well as a product specification. Provider-bound
features (government filing, payment processing, messaging, e-signing, SSO,
object storage, mobile stores, and AI providers) cannot be truthfully marked
functional without client-owned credentials, contracts, policy decisions, and
sandbox acceptance. The repository will expose safe domain seams for those
integrations; production activation remains an explicit deployment step.

## Existing baseline

- Frontend: React 19, Vinext/App Router-compatible routes, static Vercel output.
- Backend: NestJS 11 modular monolith, REST `/api/v1` and `/api/v2`, Prisma 6,
  PostgreSQL 16.
- Security: Argon2id, short-lived JWT access tokens, rotating opaque refresh
  sessions in HttpOnly cookies, DTO validation, Helmet, exact CORS allowlist,
  throttling, backend RBAC/resource policies, organization isolation, and audit
  events.
- Implemented domains: identity/admin, company/organization, employee master,
  attendance, leave/holidays, projects/tasks, CRM, institutions, payroll,
  finance/GST records, notifications, and executive dashboard.

## Architecture decisions

1. Keep one NestJS modular monolith and one frontend shell. Do not add
   microservices, GraphQL, Redis, Kubernetes, or another state/CSS framework
   without measured need.
2. Preserve all existing `/api/v1` contracts. New business domains use explicit
   `/api/v2` controllers, DTOs, services, Swagger tags, and response envelopes.
3. Every tenant-owned row carries `organizationId`; service queries derive it
   from the authenticated principal and never accept it from browser input.
4. Workflows use explicit state transitions. Finalized financial/payroll records
   remain immutable; new sensitive workflows follow the same pattern.
5. External providers are adapters behind disabled-by-default configuration.
   Credentials never reach the frontend or source control.
6. PostgreSQL remains authoritative. Files are represented by metadata only
   until a client-owned private object store and signed-URL policy are supplied.

## Delivery slices

### People operations

Recruitment, applicant/interview/offer workflow, onboarding checklists,
performance cycles/goals/reviews, training catalogue/sessions, and controlled
employee/manager/HR views.

### Education operations

Program catalogue, curriculum, batches and sessions; LMS courses, lessons,
enrollment/progress, assignments/grades, certificate metadata; student and
guardian records with consent and institution/program scope.

### Delivery and commercial operations

Advanced project milestones/risks/sprints/time logs, procurement, inventory,
assets, vendors, and their finance links. Deterministic accounting remains the
system of record; provider actions require idempotent webhooks.

### Content, support, compliance, and insight

CMS revisions and publish workflow, knowledge articles, announcements, support
tickets/SLA, compliance calendar/evidence, and reconciled role-scoped reporting.
AI insights are opt-in, explainable, and never autonomously mutate HR or finance.

## API conventions

- Collection reads are paginated and capped at 100 records.
- UUID path parameters use `ParseUUIDPipe`; bodies use class-validator DTOs.
- Missing resources outside the caller organization return 404 to prevent
  enumeration; authenticated but disallowed actions return 403.
- State conflicts return 409; malformed relationships return 400.
- Writes include actor metadata in `AuditLog`; sensitive notifications are
  addressed only to authorized users.
- Swagger documents the bearer boundary and domain tag for every controller.

## Frontend contract

- Founder navigation stays canonical and ordered; new domains are added once a
  usable workflow exists, never as dead links.
- Employee navigation remains Dashboard, Tasks, Attendance, Leave, Payslips.
- Every data surface provides loading, empty, error, permission, and success
  states and remains keyboard accessible at desktop and 390 px widths.
- API access remains centralized in the typed client. Access tokens stay only in
  memory; refresh tokens stay in HttpOnly cookies.

## Threat model and controls

| Threat | Control |
| --- | --- |
| Cross-organization enumeration | Derive organization from JWT principal and filter every query/write relation |
| Role escalation | Permission catalog plus backend guards/policies; no browser-provided role trust |
| Applicant/student/employee PII leakage | Least-field responses, dedicated permissions, access audit, no raw secrets or identity documents in DB |
| Workflow replay/double action | Transactional state checks, unique constraints, idempotency keys for providers |
| Injection/XSS | Prisma parameterized queries, strict DTO allowlists, React escaping, CSP/Helmet posture |
| Credential/session theft | Argon2id, short JWT TTL, rotating HttpOnly refresh cookie, secure production cookie/CORS settings |
| Financial record tampering | Maker/checker permissions, immutable posted/finalized records, reversal instead of deletion |

## Verification gate

Each completed slice must have a migration, Prisma validation, seed idempotence,
unit/integration tests for happy/error/cross-org/role cases, Swagger exposure,
frontend static route tests, TypeScript, lint, build, and a Playwright critical
flow. Provider-dependent acceptance is reported separately and never simulated
as production success.

