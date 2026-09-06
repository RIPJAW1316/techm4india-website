# TechM4India ERP V2 requirements matrix

Audit basis: `TechM4India_ERP_V2_Final.pdf` (38 pages, Version 2.0 Final, dated September 05, 2026) and the repository at `erp-v2` / `d4d84b9`.

This is an audit artifact, not an implementation specification. The repository is the technical source of truth. `erp-core-demo` is unchanged and must remain the restore point.

## Status vocabulary

| Status | Meaning |
| --- | --- |
| IMPLEMENTED | Working in the current repository and covered by code/tests at the stated scope. |
| PARTIALLY_IMPLEMENTED | A useful slice exists, but V2 capability, data, workflow, or security is incomplete. |
| NOT_IMPLEMENTED | No supporting implementation exists in this repository. |
| ARCHITECTURE_ALREADY_SUPERSEDES_V2_RECOMMENDATION | Current technology is newer or safer for the present scope; do not downgrade to match the PDF. |
| CONFLICT_REQUIRES_DECISION | The PDF and current product/business facts disagree; client input is required. |
| DEFER_UNTIL_REQUIRED | Valid future capability, but adding it now would create infrastructure or product cost without a current use case. |
| EXTERNAL_INTEGRATION_DEPENDENCY | The capability depends on a provider, credential, contract, or government system not present in the repo. |
| REGULATORY_OR_BUSINESS_VALIDATION_REQUIRED | Technical work cannot be considered correct until an owner such as a CA, HR lead, or legal approver validates policy. |

## 00-01 Executive scope and architecture

| V2 section/page | Requirement | Current repository state | Status | Gap | Recommended action | Dependency | Wave |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 00 p2-3 | Company-wide operating platform | Working employee/project core only: org, identity, employees, projects, tasks, notifications | PARTIALLY_IMPLEMENTED | HR, CRM, education, finance, inventory, CMS, support, analytics and compliance domains are absent | Preserve core and add bounded contexts incrementally | Architecture decision and client priorities | V2-1 onward |
| 00 p2 | Five verticals including Horizon Startup School | Seed, route resolver, public content and tests model four divisions only | CONFLICT_REQUIRES_DECISION | Official name, slug, ownership, public positioning and launch timing for the fifth vertical are not confirmed | Confirm canonical name and treat it as a data/config migration, not a second application | Client business decision | V2-1 |
| 00 p2-3 | Growth from current team to 500/1,000+ users | UUID relational schema and indexed core are suitable for present scale; no load/replica/partition plan | PARTIALLY_IMPLEMENTED | Capacity, tenancy, reporting read model and retention strategy are unproven | Add measured performance baselines and scale controls when traffic/data justify them | Production usage data | V2-19/V2-23 |
| 01 p4-5 | API-first REST + GraphQL | REST NestJS API under `/api/v1`; Swagger is generated; no GraphQL | PARTIALLY_IMPLEMENTED | No GraphQL contract or resolver layer | Keep REST as the primary contract; revisit GraphQL only for a demonstrated client/query need | Mobile/complex dashboard requirements | V2-22 |
| 01 p4 | Modular monolith with bounded contexts | NestJS modules for auth, org, employees, projects, tasks, notifications, health, Prisma | IMPLEMENTED | Future domains need explicit ownership and dependency rules | Continue modular monolith; extract only after measured scaling pressure | Domain boundaries | V2-1 onward |
| 01 p4 | Micro-frontend unified shell | One Vinext application contains public pages and protected ERP shell | PARTIALLY_IMPLEMENTED | No independent frontend deployables | Keep one shell for velocity; define split criteria before any extraction | Team size, release coupling, SSR need | V2-23 |
| 01 p4 | Public React website | React 19.2.6 + Vinext beta + Vite 8 + TypeScript; static export | ARCHITECTURE_ALREADY_SUPERSEDES_V2_RECOMMENDATION | PDF says React 18 + Vite | Keep React 19/Vinext; do not downgrade | Current build and deployed routes | V2-1 onward |
| 01 p4 | Next.js 14 ERP admin | ERP is already inside current Vinext app with client auth provider and shared shell | CONFLICT_REQUIRES_DECISION | A migration would duplicate routing/auth/design work and risk the public site | Keep current ERP in Vinext for near-term waves; evaluate split later | SSR/scale evidence | V2-23 |
| 01 p4 | NestJS 10 | Backend runs NestJS 11 and builds/tests successfully | ARCHITECTURE_ALREADY_SUPERSEDES_V2_RECOMMENDATION | PDF version is older | Keep NestJS 11 | Current lockfile and test suite | V2-1 onward |
| 01 p4 | Prisma 5 | Backend uses Prisma 6 with migrations and validation | ARCHITECTURE_ALREADY_SUPERSEDES_V2_RECOMMENDATION | PDF version is older | Keep Prisma 6 | Existing migration history | V2-1 onward |
| 01 p4 | PostgreSQL 16 | Prisma datasource is PostgreSQL; Docker Compose provides local PostgreSQL; hosted Neon was used for prior deployment | IMPLEMENTED | Production ownership/backup policy remains to be approved | Keep PostgreSQL; standardize local/staging/prod runbooks later | Client hosting decision | V2-23 |
| 01 p4-5 | Redis, BullMQ, search, S3, Socket.io, Kubernetes, observability | None of these are required by current core; no packages are installed for them | DEFER_UNTIL_REQUIRED | V2 document lists target infrastructure before feature need is known | Introduce per module trigger in architecture delta | Specific workload/provider | V2-8 onward |
| 01 p4 | Swagger/OpenAPI | Swagger setup exists at `/api/docs` in Nest bootstrap | PARTIALLY_IMPLEMENTED | Only current controllers are documented and description is still foundation-level | Add tags/schemas/examples as each module is delivered | DTO and endpoint work | V2-1 onward |

## 02 Users, roles, permissions and security

| V2 section/page | Requirement | Current repository state | Status | Gap | Recommended action | Dependency | Wave |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 02 p6 | Backend-enforced RBAC | `User`, `Role`, `Permission`, `UserRole`, `RolePermission`; permission guard and policy service | IMPLEMENTED | Role catalog is V1/core-sized | Extend permission namespace per bounded context; never rely on frontend hiding | New modules | V2-1 onward |
| 02 p6 | Division/department isolation | Employee carries division/department; project/task policies check division, membership, ownership | IMPLEMENTED | Branch/team/cost-centre attributes do not yet exist | Extend principal and policy inputs without replacing current policy | Organization extension | V2-1 |
| 02 p6 | Resource-level ownership | Project membership, manager, task assignee and comments are enforced | IMPLEMENTED | No generic policy engine for future resources | Keep policy methods explicit; add shared subject/resource predicates when duplication appears | New domains | V2-1 onward |
| 02 p6 | V2 role catalog | Seed has 11 roles: SUPER_ADMIN, DIRECTOR, DIVISION_HEAD, HR_MANAGER, SALES_MANAGER, SALES_EXECUTIVE, FINANCE_MANAGER, PROJECT_MANAGER, EMPLOYEE, CONTENT_MANAGER, VIEWER | PARTIALLY_IMPLEMENTED | Missing CEO, HR_EXECUTIVE, FINANCE_EXECUTIVE, MARKETING_MANAGER, FACULTY/TRAINER, STUDENT, INSTITUTION_ADMIN, IT_ADMIN, VENDOR | Add roles only with approved permissions and persona tests; do not silently widen existing roles | Business role approval | V2-1/V2-3 onward |
| 02 p6 | Multi-role users | Many-to-many user-role schema exists | IMPLEMENTED | No temporal assignment, source, grantor or expiry fields | Add role assignment audit/expiry when temporary grants are required | Governance decision | V2-1/V2-18 |
| 02 p6 | OAuth2/SSO | Company email/password, JWT access token and opaque rotating refresh sessions exist; no OAuth/SSO | PARTIALLY_IMPLEMENTED | External identity mapping, provider trust and account linking absent | Add provider abstraction only after Google Workspace/Entra choice | Client identity provider | V2-1/V2-23 |
| 02 p6 | MFA for HR/finance | No MFA challenge or enrollment | NOT_IMPLEMENTED | Sensitive modules cannot yet enforce step-up authentication | Add TOTP first; SMS only with an approved provider and threat model | Identity provider and recovery policy | V2-3/V2-14 |
| 02 p6 | IP allowlist for sensitive modules | No IP policy | NOT_IMPLEMENTED | HR/finance requests are not network restricted | Add trusted-network policy at gateway/app layer after hosting is fixed | Production network | V2-14/V2-23 |
| 02 p6 | Time-based permissions | No grant validity window | NOT_IMPLEMENTED | Temporary access cannot be expressed | Add `RoleGrant`/permission grant validity and audit | Role governance | V2-18 |
| 02 p6 | Session audit and revocation | Refresh sessions track hash, expiry, replacement, revocation, IP/user agent; audit events cover login/logout/rotation/reuse | IMPLEMENTED | Device inventory/fingerprint and password-change global revocation are not present | Extend session metadata only for a concrete security requirement | MFA/SSO threat model | V2-1/V2-23 |
| 22 p32 | Argon2id password hashing | Password service uses Argon2id | IMPLEMENTED | Password policy/reset/recovery flow not present | Add reset flow with one-time hashed tokens and audit | Email provider and HR policy | V2-3 |
| 22 p32 | CSRF and secure cookies | HttpOnly refresh cookie, SameSite configuration, CORS allowlist, Helmet, trusted-origin guard | PARTIALLY_IMPLEMENTED | Cross-domain deployment and future state-changing clients need formal CSRF review | Keep same-site deployment where possible; add CSRF strategy before broader cookie use | Deployment decision | V2-23 |
| 22 p32 | Encryption/KMS for sensitive PII | No encrypted PII columns or KMS integration because PII domains do not exist | NOT_IMPLEMENTED | Aadhaar, PAN, bank and salary data would be plaintext if added naively | Design envelope encryption and key rotation before HR/payroll schema | Managed KMS ownership | V2-3/V2-7 |

## 03 Company and organization

| V2 section/page | Requirement | Current repository state | Status | Gap | Recommended action | Dependency | Wave |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 03 p8 | Organization master | `Organization` with legalName, slug, status and timestamps | PARTIALLY_IMPLEMENTED | CIN, DPIIT, GSTIN, PAN, TAN, addresses, legal docs, bank accounts and signatories absent | Add a legal/company profile aggregate with classified fields | Legal profile approval | V2-1 |
| 03 p8 | Five divisions | Four seeded divisions and four frontend route configs | CONFLICT_REQUIRES_DECISION | Horizon Startup School is not represented | Approve canonical fifth division and migration impact before code | Client naming/positioning | V2-1 |
| 03 p8 | Departments | `Department` belongs to a division with unique slug and status | PARTIALLY_IMPLEMENTED | V2 standard department taxonomy, sub-departments and teams absent | Add department metadata and teams after organization owners confirm structure | Org chart | V2-1/V2-2 |
| 03 p8 | Branches and partner lab locations | No branch entity | NOT_IMPLEMENTED | Staff/assets/contacts cannot be location-scoped | Add Branch with organization/division relation and active dates | Actual locations | V2-2 |
| 03 p8 | Teams and cross-functional teams | Project membership only; no reusable team | NOT_IMPLEMENTED | Program/project teams cannot be reused | Add Team/TeamMember with scope and lead | Department model | V2-2/V2-13 |
| 03 p8 | Cost centres/P&L units | No cost-centre entity | NOT_IMPLEMENTED | Finance cannot allocate by division/department | Add CostCentre and mappings before finance | Finance chart of accounts | V2-2/V2-14 |
| 03 p8 | Governance/compliance calendar | AuditLog exists; no compliance calendar or legal document store | PARTIALLY_IMPLEMENTED | Due dates, owners, reminders and documents absent | Add compliance domain after legal/finance owners validate obligations | Regulatory calendar | V2-18 |

## 04 Human resources and payroll

| V2 section/page | Requirement | Current repository state | Status | Gap | Recommended action | Dependency | Wave |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 04.1 p9 | Employee master identity/org fields | Employee has code, name, photo URL, phone, designation, joining date, status, manager, division, department | PARTIALLY_IMPLEMENTED | Gender, DOB, nationality, grade/band, branch, employment type, addresses, blood group, emergency contacts, official/personal contacts absent | Extend in HR-core migration with field classification and history | Client HR field policy | V2-3 |
| 04.1 p9 | Skills, certifications, education | No entities | NOT_IMPLEMENTED | No structured capability profile or expiry tracking | Add normalized skill/certification/education records | Employee master | V2-3/V2-6 |
| 04.1 p9 | Aadhaar/PAN/passport and bank data | No fields/entities | NOT_IMPLEMENTED | Regulated/highly sensitive storage required | Add encrypted vault-backed fields only after KMS and access policy approval | Security + HR/legal | V2-7 |
| 04.1 p9 | Employee documents | No document metadata or object storage | NOT_IMPLEMENTED | Offer/ID/appointment documents unsupported | Add metadata and signed URL abstraction; store blobs outside DB | Object storage decision | V2-3 |
| 04.1 p9 | Employment history | No history tables | NOT_IMPLEMENTED | Transfers/promotions/status changes not auditable as HR history | Add append-only employment history with actor and effective dates | Employee master | V2-3 |
| 04.2 p9 | Recruitment/ATS | No recruitment module | NOT_IMPLEMENTED | Requisitions, applicants, interviews, offers and onboarding absent | Add recruitment bounded context after employee/org foundation | HR core + email | V2-5 |
| 04.3 p9-10 | Attendance, leave, holidays, shifts | No attendance/leave entities or APIs | NOT_IMPLEMENTED | No balances, approval, GPS/biometric or overtime workflows | Implement policy-driven attendance/leave before payroll | HR policy and device/provider | V2-4 |
| 04.4 p9 | Payroll engine | No payroll entities or calculations | NOT_IMPLEMENTED | Salary, payslip, deductions, PF/ESI/PT/TDS and settlements absent | Design with CA/HR validation; add immutable payroll run snapshots | Attendance + statutory rules | V2-7 |
| 04.5 p9-10 | Appraisal/OKR/PIP | No appraisal module | NOT_IMPLEMENTED | Goals, feedback, cycles, ratings and increments absent | Add after employee history and HR policy | HR leadership | V2-6 |
| 04.6 p10 | Internal L&D | No training module | NOT_IMPLEMENTED | Requests, sessions, attendance and certification absent | Keep separate from public LMS; reuse documents/notifications later | HR core | V2-6 |
| 04.7 p10 | Exit management | No exit workflow | NOT_IMPLEMENTED | Resignation, revocation, asset recovery and F&F absent | Add after payroll/assets foundations | Payroll + assets + HR policy | V2-7/V2-16 |

## 05 CRM, marketing and institutions

| V2 section/page | Requirement | Current repository state | Status | Gap | Recommended action | Dependency | Wave |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 05 p11 | Lead master and lead types | No CRM tables or APIs | NOT_IMPLEMENTED | B2B/B2C/government/CSR/international/partner leads absent | Add CRM core with normalized type/source/stage | Organization + sales rules | V2-8 |
| 05 p11 | Pipeline stages and activities | No pipeline, calls, meetings, notes or follow-ups | NOT_IMPLEMENTED | Sales lifecycle unavailable | Add activities/timeline and assignment policies | Lead core | V2-8 |
| 05 p11 | Targets, commissions and forecasting | No sales targets/commission data | NOT_IMPLEMENTED | Finance-linked incentives and forecasts absent | Add deterministic targets first; AI scoring later | CRM + finance policy | V2-8/V2-19 |
| 05 p11-12 | Campaigns/email/WhatsApp/SMS | No campaign or provider integration | NOT_IMPLEMENTED | Automation, segmentation, unsubscribe/DND absent | Build campaign model and queue abstraction; providers are separate | Consent + provider credentials | V2-8/V2-21 |
| 05 p11 | Lead scoring/AI | No AI engine | DEFER_UNTIL_REQUIRED | Requires historical outcomes and evaluation | Start with explainable rules; add model only after data volume | CRM history + AI governance | V2-20 |
| 06 p13 | Institution master/contacts | No institution domain | NOT_IMPLEMENTED | Profiles, contacts, health, approvals and relationship owner absent | Add institution master and contact timeline | CRM + org | V2-9 |
| 06 p13 | MoUs/contracts and renewals | No contract/document model | NOT_IMPLEMENTED | Signed documents, expiry and reminders absent | Add metadata/document workflow with signed URLs | Object storage + legal review | V2-9 |
| 06 p13 | Institution programs/enrollment/invoices/events | No institution relationships | NOT_IMPLEMENTED | Delivery and finance linkage absent | Link institution to program, student batch, project and invoice aggregates | Programs + finance | V2-9/V2-10/V2-14 |
| 06 p13 | Institution AI health score | No AI/health metric | DEFER_UNTIL_REQUIRED | No interaction/revenue/enrollment history | Define deterministic health score first | Institution data | V2-19/V2-20 |

## 06 Programs, LMS, students and certification

| V2 section/page | Requirement | Current repository state | Status | Gap | Recommended action | Dependency | Wave |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 07 p14 | Program catalogue/master | No program entities; four public pages are hardcoded editorial content | NOT_IMPLEMENTED | Program version, category, eligibility, fee, capacity and SEO metadata absent | Add program catalogue independent of LMS | Organization/fifth division decision | V2-10 |
| 07 p14 | Curriculum/modules/sessions/batches | No entities | NOT_IMPLEMENTED | Delivery model cannot be scheduled | Add program structure and delivery scheduling | Program master | V2-10 |
| 07 p14-15 | Course/lesson/content LMS | No LMS | NOT_IMPLEMENTED | Course builder, progress, discussion and offline content absent | Add LMS bounded context and storage metadata | Program catalogue + object storage | V2-11 |
| 07 p14 | Assessments/assignments/grades | No education assessment domain | NOT_IMPLEMENTED | Submission, grading and analytics absent | Add assessment child entities with faculty/student policy | LMS + student identity | V2-11/V2-12 |
| 07 p14-15 | Certificates/transcripts | No certificate generator or verification | NOT_IMPLEMENTED | PDF generation and public verification absent | Add signed certificate metadata and job processing | LMS + object storage + queue | V2-11 |
| 07 p14-15 | Student registration/enrollment/fees | No student domain | NOT_IMPLEMENTED | Guardian, enrollment, batches, fees and grievances absent | Add student identity separate from employee User semantics | Program + finance + privacy policy | V2-12 |
| 07 p15 | Parent/guardian and alumni | No entities | NOT_IMPLEMENTED | Parent portal and alumni network absent | Add after student master and consent model | Student policy | V2-12 |
| 07 p14 | Faculty/trainers | No faculty role or assignment model | NOT_IMPLEMENTED | Trainer access, grading and delivery ownership absent | Add role plus program-scoped assignments | HR core + program model | V2-10/V2-11 |

## 07 Project management V2 delta

| V2 section/page | Requirement | Current repository state | Status | Gap | Recommended action | Dependency | Wave |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 08 p16 | Project master, membership, tasks, comments, status, priority, progress | Project, ProjectMember, ProjectTask, TaskComment and policy-backed APIs are working | IMPLEMENTED | V2 metadata and workflow are absent | Extend current entities; do not rebuild them | Existing project contract | V2-13 |
| 08 p16 | Project type/objectives/deliverables/client link | No type/objective/deliverable/client fields | PARTIALLY_IMPLEMENTED | Client/institution linkage and delivery acceptance absent | Add ProjectType, objective/deliverable children and nullable institution/client relations | CRM/institutions | V2-9/V2-13 |
| 08 p16 | Milestones/Gantt | No milestone entity | NOT_IMPLEMENTED | Timeline is only start/due/progress | Add milestones and dependency edges; derive Gantt views | Project core | V2-13 |
| 08 p16 | Risk register | No risks | NOT_IMPLEMENTED | Project risks cannot be tracked | Add project risk with owner/status/mitigation | Project governance | V2-13 |
| 08 p16 | Budget/billing/project finance | No budget, timesheet, invoice or cost allocation | FINANCE DEPENDENCY | Profitability cannot be calculated | Add project finance after finance/cost-centre model | Finance + cost centres | V2-14 |
| 08 p16 | Sprints/story points/burndown/velocity | No sprint/time log/story point entities | NOT_IMPLEMENTED | Agile reporting absent | Add only if delivery teams use Scrum; keep optional | Team/process decision | V2-13 |
| 08 p16 | Dependencies/attachments/@mentions | Comments exist; no dependency/attachment/mention model | PARTIALLY_IMPLEMENTED | Blockers and files unsupported | Add dependency edges and file metadata; mentions reuse notifications | Object storage + notifications | V2-13 |
| 08 p16 | GitHub/GitLab linkage | No provider integration | EXTERNAL_INTEGRATION_DEPENDENCY | PR/CI status requires OAuth/webhooks | Add provider adapter after repository/workflow choice | Git provider credentials | V2-21 |

## 08-11 Finance, GST, inventory, assets and vendors

| V2 section/page | Requirement | Current repository state | Status | Gap | Recommended action | Dependency | Wave |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 09 p17-18 | Chart of accounts/double entry/journals | No finance schema | NOT_IMPLEMENTED | No accounting ledger or approval model | Design immutable double-entry model with accountant review | CA/accounting policy | V2-14 |
| 09 p17 | Invoices/receivables/payments/expenses | No finance entities | NOT_IMPLEMENTED | No invoice or collection state | Add finance core and link institutions/projects/vendors | Chart of accounts | V2-14 |
| 09 p17 | Bank accounts/reconciliation/cash | No bank/statement/reconciliation | NOT_IMPLEMENTED | Cash position cannot be reconciled | Add import/reconciliation workflow | Bank formats + finance owner | V2-14 |
| 09 p17-18 | GST rates/GSTR/e-invoice/EWB/ITC/TDS | No GST domain | REGULATORY_OR_BUSINESS_VALIDATION_REQUIRED | Statutory rules, ASP/GSP credentials and filing semantics absent | Validate with CA; implement computation before filing integration | Finance ledger + GST registration | V2-15 |
| 09 p17-18 | P&L, balance sheet, cash flow, Tally export | No reports | REGULATORY_OR_BUSINESS_VALIDATION_REQUIRED | Report correctness is unproven | Build from immutable ledger and reconcile against accountant statements | Finance core | V2-14/V2-15 |
| 09 p17 | Razorpay/Stripe | No payment integration in current repo | EXTERNAL_INTEGRATION_DEPENDENCY | Credentials, webhooks and reconciliation absent | Add adapter only for approved payment use case | Provider account + finance | V2-14/V2-21 |
| 10 p19 | Item/warehouse/stock/serial/valuation | No inventory | NOT_IMPLEMENTED | Kits and consumables cannot be tracked | Add inventory bounded context; start with item/stock movement | Operations + warehouses | V2-16 |
| 10 p19 | Procurement/RFQ/PO/GRN/three-way match | No procurement | NOT_IMPLEMENTED | Purchase approval and invoice matching absent | Add requisition -> RFQ -> PO -> GRN workflow | Vendor + finance | V2-16 |
| 11 p19-20 | Asset lifecycle/assignments/maintenance/depreciation | No asset domain | NOT_IMPLEMENTED | IT/lab assets cannot be assigned or depreciated | Add asset master and movement/assignment history | Procurement + finance + HR | V2-16 |
| 15 p24 | Vendor KYC/invoices/PO/delivery/performance | No vendor domain | NOT_IMPLEMENTED | Vendor portal and payments absent | Add vendor master and restricted external identity later | Procurement + finance + security | V2-16 |
| 15 p24 | Partner/franchise management | No partner domain | DEFER_UNTIL_REQUIRED | No current confirmed channel model | Model after partner business model is approved | Commercial decision | V2-16/V2-21 |

## 12-14 CMS, analytics, AI and mobile

| V2 section/page | Requirement | Current repository state | Status | Gap | Recommended action | Dependency | Wave |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 12 p21 | Public pages/programs/projects/blog/events/team/FAQ/careers/gallery/awards/partners/press/newsletter | Public site content is hardcoded in React/lib data; no CMS API | PARTIALLY_IMPLEMENTED | No editorial CRUD, workflow, versioning or content permissions | Introduce CMS only after content ownership and publishing workflow are approved | Program/HR/project content | V2-17 |
| 12 p21 | Draft/review/publish/version/rollback | No CMS workflow | NOT_IMPLEMENTED | Public content changes require code deploy | Add content revisions and publication states | CMS storage/auth | V2-17 |
| 12 p21 | Media library/CDN/multilingual/SEO | Static assets and metadata exist; no managed media or translations | PARTIALLY_IMPLEMENTED | Storage, signed access, translations and redirects absent | Store metadata in DB and media in object storage; preserve current SEO until migration | Object storage + CMS | V2-17 |
| 13 p22 | Deterministic dashboards/reports | Current dashboard is employee projects/tasks/notifications only | PARTIALLY_IMPLEMENTED | No CEO, sales, HR, finance, program or operational reports | Add read models per domain; avoid direct cross-domain joins in UI | Domain data | V2-19 |
| 13 p22 | Scheduled reports/materialized views | None | NOT_IMPLEMENTED | No schedules or reporting read models | Add when first report has measured query cost | Redis/BullMQ or provider | V2-19 |
| 13 p22 | AI scoring/forecasting/chatbot/anomaly detection | No AI integration | DEFER_UNTIL_REQUIRED | No clean historical data, evaluation, privacy boundary or budget | Establish deterministic baseline and AI governance first | Analytics + provider decision | V2-20 |
| 14 p23 | Employee/student/institution mobile apps | No React Native app | DEFER_UNTIL_REQUIRED | Mobile API/auth/offline/push requirements not settled | Reuse versioned REST contracts; do not duplicate backend | Stable domains + FCM decision | V2-22 |

## 15-19 Communications, support, compliance and integrations

| V2 section/page | Requirement | Current repository state | Status | Gap | Recommended action | Dependency | Wave |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 16 p25 | Knowledge base/wiki/SOP/policies | No knowledge domain | NOT_IMPLEMENTED | No article versioning/access/search/feedback | Add article/revision/access model; PostgreSQL search first | Document storage + permissions | V2-18 |
| 16 p25 | Internal announcements | Notifications are task/system inbox only | PARTIALLY_IMPLEMENTED | No scheduled/pinned/acknowledged announcements | Add announcement aggregate reusing notifications | Communications policy | V2-18 |
| 17 p26 | Helpdesk tickets/comments/SLA/CSAT | No support domain | NOT_IMPLEMENTED | IT/HR/finance/academic/student support absent | Add support tickets and SLA policies | Knowledge base + org teams | V2-18 |
| 18 p27 | Compliance calendar/reminders | Audit log exists; no calendar/reminders | PARTIALLY_IMPLEMENTED | Statutory tasks and owners absent | Add compliance records with due dates and reminder jobs | Finance/HR/legal validation | V2-18 |
| 18 p27 | Tamper-evident long-term audit archive | AuditLog is mutable relational data with metadata and old/new JSON fields; no archive | PARTIALLY_IMPLEMENTED | No append-only/WORM/S3 archive or export controls | Define retention and archive before sensitive modules | Object storage + legal policy | V2-18/V2-23 |
| 19 p28 | Payment/communication/government integrations | No external integrations in core | EXTERNAL_INTEGRATION_DEPENDENCY | Provider credentials, contracts, webhook verification absent | Introduce adapters per approved module, with idempotency and audit | Provider/legal credentials | V2-14/V2-21 |
| 19 p28 | GitHub/GitLab/analytics/automation integrations | No integration hub | DEFER_UNTIL_REQUIRED | No current workflow needs it | Add signed webhook boundary and provider registry later | Provider decision | V2-13/V2-21 |

## 20-22 Data, API and infrastructure requirements

| V2 section/page | Requirement | Current repository state | Status | Gap | Recommended action | Dependency | Wave |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 20 p29 | UUID primary keys | Current core uses UUID primary keys | IMPLEMENTED | Future entities must preserve convention | Keep UUIDs and explicit compound uniqueness | Schema review | All |
| 20 p29-30 | Soft delete on all tables | Core uses status/revocation/removedAt selectively; no universal deletedAt | PARTIALLY_IMPLEMENTED | Hard deletion semantics vary | Define retention/deletion policy per domain; do not blindly add deletedAt everywhere | Legal/business policy | V2-1 onward |
| 20 p30 | Actor timestamps/JSON metadata/indexes | Core has created/updated, selected metadata and useful indexes | PARTIALLY_IMPLEMENTED | createdBy/updatedBy and audit strategy not universal | Add actor fields where audit needs them; keep JSONB bounded | Domain sensitivity | V2-1 onward |
| 20 p30 | Row-level security | App-level policies exist; PostgreSQL RLS is not configured | PARTIALLY_IMPLEMENTED | DB is not an independent isolation boundary | Evaluate RLS when multi-tenant/managed reporting requires it | Tenant model/hosting | V2-23 |
| 20 p30 | Read replicas/materialized views/event sourcing | None | DEFER_UNTIL_REQUIRED | No evidence current scale needs them | Add per query/transaction workload, especially finance | Production metrics | V2-14/V2-19 |
| 21 p31 | `/api/v2` domain endpoints | Only `/api/v1` is implemented | NOT_IMPLEMENTED | V2 contracts do not exist | Preserve v1; add v2 by domain with compatibility facades | API migration decision | V2-1 onward |
| 22 p32 | TLS/HSTS/Helmet/input validation/rate limiting | HTTPS host, Helmet, DTO validation, global throttler, auth throttles are present in code/deployment | PARTIALLY_IMPLEMENTED | HSTS/WAF/SAST/DAST/dependency scanning and formal threat model absent | Add to production hardening checklist | Hosting approval | V2-23 |
| 22 p32 | Secrets manager/private network/WAF | Environment variables and Vercel/Neon history exist; no client-owned managed perimeter | DEFER_UNTIL_REQUIRED | Production ownership and network topology are deferred | Document target only; implement after approval | Client cloud account | V2-23 |
| 22 p32 | Monitoring/Sentry/Prometheus/Grafana | No telemetry integrations in repo | DEFER_UNTIL_REQUIRED | Operational visibility is basic logs/health only | Add error tracking and metrics before production scale | Hosting budget | V2-23 |

## 23-26 roadmap, DoD and scope boundaries

| V2 section/page | Requirement | Current repository state | Status | Gap | Recommended action | Dependency | Wave |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 23 p33-34 | 24-phase implementation plan | V1/core is already complete through auth/org/projects/tasks/workspaces; PDF phases assume a new build | CONFLICT_REQUIRES_DECISION | Repeating PDF phases would duplicate completed work | Use dependency-based V2 waves in `V2_IMPLEMENTATION_ROADMAP.md` | This audit | V2-0 |
| 24 p35 | Every module has migration, Swagger, RBAC, validation, audit, tests, docs | Current core has migrations, Swagger bootstrap, validation, policy guards, audits and tests; coverage is not a universal percentage | PARTIALLY_IMPLEMENTED | Future modules need a reusable gate and performance/accessibility evidence | Apply module DoD checklist to every wave | CI/staging | All |
| 25 p36 | Deferred scope boundaries | PDF defers manufacturing BOM, full WMS, POS, multi-tenant SaaS, blockchain, AR/VR, full 1,000-person HRMS, custom SaaS billing | IMPLEMENTED | These are roadmap boundaries, not repository features | Keep explicitly out of V2 unless client reopens scope | Client change control | V2-23 |
| 26 p37-38 | Unified secure platform and final product definition | Core is a working vertical slice, not the full V2 platform | PARTIALLY_IMPLEMENTED | Most business domains remain future work | Deliver by bounded waves with UAT and regulatory sign-off | All domain owners | V2-1 onward |

## Fifth vertical impact summary

The fifth vertical is not a simple label addition. The eventual migration must cover:

1. Seed data: a canonical division row, departments, demo/persona policy, roles and permissions.
2. Frontend configuration: `lib/erp/divisions.ts`, public navigation/content, metadata, sitemap decisions, workspace route and tests.
3. Backend authorization: division-scoped policy tests and project/program associations.
4. Domain ownership: program catalogue, institution relationships, CRM ownership, cost centre and reporting scope.
5. Product identity: the PDF calls it `Horizon Startup School`; the current public code has no such vertical. Treat the name and legal/operational boundary as client input before implementation.

No fifth-vertical code is implemented by this audit.

