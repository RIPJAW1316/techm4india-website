# TechM4India ERP V1 to V2 API migration plan

## Policy

The current API is a working, tested REST contract under `/api/v1`. It must not be renamed or broken while V2 domains are added. The recommended strategy is a combination of:

- **Option A as the default:** keep compatible core services under `/api/v1`.
- **Option B selectively:** expose a new, normalized V2 facade only when a domain needs a materially different contract or aggregate boundary.
- **Option C gradually:** migrate each frontend/mobile client endpoint-by-endpoint after the V2 contract is implemented and observed; do not big-bang migrate the ERP shell.

The first V2 modules can use `/api/v2` without forcing auth/org/project/task consumers to change. A v2 endpoint may internally call an application service shared with v1, but controllers, DTOs, authorization and response contracts must be version-specific.

## Current `/api/v1` contract

Global prefix is configured in `backend/src/create-app.ts` as `api/v1`. All protected routes require a JWT whose session is still valid; writes also pass DTO validation and relevant policy/permission checks.

| Current endpoint | Purpose | Current auth/scope | V2 disposition | V2 equivalent |
| --- | --- | --- | --- | --- |
| `POST /api/v1/auth/login` | Company email/password login; returns access context and sets refresh cookie | Trusted origin + throttling; active user | UNCHANGED CONTRACT | `/api/v2/auth/login` only when V2 auth adds a materially different response; otherwise keep v1 |
| `POST /api/v1/auth/refresh` | Rotate opaque refresh session | Trusted origin + throttling + HttpOnly cookie | UNCHANGED CONTRACT | Same semantics under v2 only when a V2 auth facade is needed |
| `POST /api/v1/auth/logout` | Revoke current refresh session | Trusted origin + cookie | UNCHANGED CONTRACT | Same |
| `GET /api/v1/auth/me` | Authoritative user, roles, permissions, employee, division and department context | JWT | EXTENDED CONTRACT later | `/api/v2/auth/me` may add branch/team/cost centre/MFA state without changing v1 |
| `GET /api/v1/health` | DB-backed health status | Public health endpoint | UNCHANGED CONTRACT | Keep stable for probes; optionally add versioned diagnostics privately |
| `GET /api/v1/organization/me` | Current organization/employee context | JWT + organization self permission | EXTENDED CONTRACT later | `/api/v2/company/profile` and `/api/v2/company/context` after company model exists |
| `GET /api/v1/divisions` | Divisions visible to principal | JWT + policy | EXTENDED CONTRACT later | `/api/v2/company/divisions` with branch/program/cost-centre fields |
| `GET /api/v1/divisions/:id` | Division detail | JWT + division scope | EXTENDED CONTRACT later | `/api/v2/company/divisions/:id` |
| `GET /api/v1/divisions/:divisionId/departments` | Department list within division | JWT + division scope | EXTENDED CONTRACT later | `/api/v2/company/divisions/:id/departments` |
| `GET /api/v1/employees/me` | Self profile | JWT + self permission | EXTENDED CONTRACT later | `/api/v2/employees/me` with HR-core fields only when field policy is approved |
| `PATCH /api/v1/employees/me` | Self-editable profile fields | JWT + self permission | EXTENDED CONTRACT later | Same route in v2 with explicit field allowlist and audit |
| `GET /api/v1/employees` | Scoped employee list | JWT + division/all permission | EXTENDED CONTRACT later | `/api/v2/employees` with filters, branch/team and masked-field rules |
| `GET /api/v1/employees/:id` | Scoped employee detail | JWT + policy | EXTENDED CONTRACT later | `/api/v2/employees/:id` |
| `GET /api/v1/projects/my` | Projects visible to current employee | JWT + membership/manager/division scope | UNCHANGED CONTRACT | `/api/v2/projects/my` only if response needs V2 fields |
| `GET /api/v1/projects` | Scoped project list | JWT + project permissions | EXTENDED CONTRACT later | `/api/v2/projects` with project types/client/milestone fields |
| `GET /api/v1/projects/:id` | Project detail | JWT + membership/manager/division policy | EXTENDED CONTRACT later | `/api/v2/projects/:id` |
| `POST /api/v1/projects` | Create project | JWT + project manage permission | EXTENDED CONTRACT later | `/api/v2/projects` with approved aggregate fields |
| `PATCH /api/v1/projects/:id` | Update project | JWT + manager/member/division policy | EXTENDED CONTRACT later | `/api/v2/projects/:id` |
| `GET /api/v1/projects/:id/members` | List members | JWT + project policy | UNCHANGED CONTRACT | `/api/v2/projects/:id/members` |
| `POST /api/v1/projects/:id/members` | Add member | JWT + project manage permission | UNCHANGED CONTRACT | Same |
| `DELETE /api/v1/projects/:id/members/:employeeId` | Remove member | JWT + project manage permission | UNCHANGED CONTRACT | Same |
| `GET /api/v1/tasks/my` | Current employee task list | JWT + assignee/membership/project policy | UNCHANGED CONTRACT | `/api/v2/tasks/my` when V2 filters/shape are needed |
| `GET /api/v1/tasks/my/summary` | Employee task counters | JWT + self scope | UNCHANGED CONTRACT | `/api/v2/tasks/my/summary` |
| `GET /api/v1/tasks/:id` | Task detail | JWT + task policy | EXTENDED CONTRACT later | `/api/v2/tasks/:id` with dependencies/time logs |
| `POST /api/v1/projects/:projectId/tasks` | Create task | JWT + project/task manage permissions | EXTENDED CONTRACT later | `/api/v2/projects/:id/tasks` |
| `PATCH /api/v1/tasks/:id` | Update task | JWT + assignee/manager rules | EXTENDED CONTRACT later | `/api/v2/tasks/:id` |
| `GET /api/v1/tasks/:id/comments` | Task comments | JWT + task access | EXTENDED CONTRACT later | `/api/v2/tasks/:id/comments` with mentions/attachments |
| `POST /api/v1/tasks/:id/comments` | Create comment | JWT + task access | EXTENDED CONTRACT later | Same |
| `GET /api/v1/notifications` | Current user inbox | JWT + self scope | EXTENDED CONTRACT later | `/api/v2/notifications/inbox` with channels/delivery state |
| `PATCH /api/v1/notifications/:id/read` | Mark notification read | JWT + owner scope | UNCHANGED CONTRACT | `/api/v2/notifications/:id/read` |

The exact route/controller names above are from source inspection; they are not inferred from the V2 PDF.

## V2 API namespace plan

| Domain | Proposed base | Initial V2 contract | Auth boundary | Dependencies |
| --- | --- | --- | --- | --- |
| Auth | `/api/v2/auth` | `login`, `refresh`, `logout`, `me`; later password reset, MFA and SSO callbacks | Backend identity, session and step-up guards | Identity provider decision |
| Company | `/api/v2/company` | Profile, divisions, departments, branches, teams, cost centres | Organization permissions + scope | V2-1/V2-2 data |
| Employees | `/api/v2/employees` | Master, org-chart, documents, history; attendance/leave subresources added by their waves | HR permissions + field classification | HR core |
| Attendance/leave | `/api/v2/attendance`, `/api/v2/leave` | Check-in, records, balances, applications, approvals | Employee self + manager/HR policy | HR policy/provider |
| Payroll | `/api/v2/payroll` | Salary structures, runs, payslips, reimbursements | HR/finance + MFA/approval | Attendance + finance + CA validation |
| Recruitment | `/api/v2/recruitment` | Requisitions, applicants, interviews, offers, onboarding | HR/recruiter scopes | HR core + documents/email |
| CRM | `/api/v2/crm` | Leads, stages, activities, follow-ups, targets | Sales/division ownership | Organization |
| Institutions | `/api/v2/institutions` | Profiles, contacts, MoUs, program links, notes, renewals | Sales/relationship owner/division | CRM + programs + documents |
| Programs | `/api/v2/programs` | Catalogue, curriculum, batches, sessions | Content/program/faculty policy | Organization + institutions |
| LMS | `/api/v2/lms` | Courses, lessons, enrollments, progress, assessments, certificates | Faculty/student ownership | Programs + Students + storage |
| Students | `/api/v2/students` | Profiles, guardians, enrollment, fees, grievances | Student/guardian/institution scope | Programs + finance + privacy |
| Projects | `/api/v2/projects` | Existing core plus milestones, risks, sprints, time logs, client links | Project/division/ownership policy | Current project services |
| Finance/GST | `/api/v2/finance`, `/api/v2/gst` | Ledger, invoices, payments, expenses, tax artifacts | Finance + maker-checker + MFA/IP policy | Cost centres + CA validation |
| Inventory/procurement | `/api/v2/inventory`, `/api/v2/procurement` | Items, movements, requisitions, RFQ, PO, GRN | Department/cost-centre approvals | Finance + vendors |
| Assets/vendors | `/api/v2/assets`, `/api/v2/vendors` | Lifecycle, assignments, KYC, invoices, performance | HR/finance/procurement scopes | Storage + finance |
| CMS | `/api/v2/cms` | Public read endpoints plus protected draft/review/publish CRUD | Content permissions and publication state | Storage + program/HR references |
| Notifications/comms | `/api/v2/notifications`, `/api/v2/communications` | Inbox, templates, announcements, delivery logs | Recipient/role/division/provider permissions | Jobs/providers |
| Analytics | `/api/v2/analytics` | Read-only KPIs, reports, schedules, insights | Report-level access and export audit | Domain read models |
| Support/compliance | `/api/v2/support`, `/api/v2/compliance` | Tickets, SLA, knowledge, compliance calendar/evidence | Team/category/role scope | Storage/search/notifications |
| Webhooks | `/api/v2/webhooks` | Provider-specific signed inbound events | Signature/idempotency, no browser auth | External credentials |

## Versioning and compatibility rules

1. **No breaking v1 migration now.** Existing frontend uses v1 and remains the regression contract.
2. V2 controllers use explicit DTOs and response types. Do not reuse a v1 DTO merely to save code if semantics differ.
3. Shared application services may be reused behind both controllers, but authorization is evaluated in the service/policy layer for every request.
4. Add an `X-API-Version` or equivalent response metadata only if it helps observability; URL version remains authoritative.
5. New fields may be additive in v1 only when they are non-sensitive, optional and do not change authorization semantics. Sensitive HR/finance fields belong in v2 resources with field-level policies.
6. Use stable IDs, cursor pagination for large collections, explicit sort/filter allowlists, RFC 7807-style error shape, correlation IDs and consistent validation errors.
7. Version webhook payloads independently and verify signatures/idempotency keys. Never let a provider callback mutate finance twice.
8. Deprecate v1 only after all current clients, previews, mobile clients and integrations move to a measured v2 contract. Publish a sunset date and telemetry before removal.

## Auth and authorization contract

The v2 API should preserve the current secure sequence:

```text
POST /api/v2/auth/login
  -> short-lived access token + HttpOnly rotating refresh cookie
GET /api/v2/auth/me
  -> user + roles + permissions + org/division/department scope
request to domain endpoint
  -> JWT/session validity
  -> permission + ABAC/resource policy
  -> field masking and audit decision
```

Future HR/finance endpoints must add:

- step-up MFA state in the authenticated session;
- optional trusted-network/IP policy;
- explicit own/team/division/company scope;
- export/download permissions separate from read permissions;
- sensitive-field masking by default;
- audit events for reads where required by policy.

## REST versus GraphQL

Keep REST for V2-1 through V2-19. GraphQL is justified only when at least one concrete client (mobile, CEO dashboard, or partner portal) needs multiple nested aggregates with independently selectable fields and REST response duplication is measured as a material cost. If introduced, place it beside REST, keep the same service/policy layer, disable arbitrary field access to sensitive records, and version the schema through deprecation rather than silently changing v1.

## API implementation gates

Every new domain endpoint requires:

- DTO validation with whitelist/forbid-non-whitelisted behavior;
- Swagger tag, operation, response and auth documentation;
- backend permission and resource-policy tests, including cross-division 403 cases;
- audit event design for writes, exports, sensitive reads and approvals;
- pagination/filter/sort limits and rate-limit classification;
- consistent error mapping and request correlation;
- integration tests against PostgreSQL migrations;
- frontend loading, empty, error and unauthorized states;
- no secret or provider credential in client bundles.

## Migration sequence

```text
V2-1: shared v2 conventions + company/org contract
  -> V2-3 to V2-7: HR contracts
  -> V2-8 to V2-12: CRM, institutions, programs, LMS, students
  -> V2-13: project extensions
  -> V2-14/15: finance and GST
  -> V2-16: procurement, inventory, assets, vendors
  -> V2-17/18: CMS, communications, support, compliance
  -> V2-19/20: analytics and AI
  -> V2-21/22: integrations and mobile clients
  -> V2-23: production hardening, client-owned deployment, v1 deprecation decision
```

No endpoint rename or `/api/v2` implementation is part of this audit phase.

