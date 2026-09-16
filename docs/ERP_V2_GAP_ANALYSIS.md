# TechM4India ERP V2 — Gap Analysis

Companion to [ERP_V2_IMPLEMENTATION_MATRIX.md](ERP_V2_IMPLEMENTATION_MATRIX.md).
The matrix records *what* the state is. This document records *why it matters*, *what it
would take*, and *what is genuinely blocked*.

**Baseline:** commit `8feccb2`, 16 September 2026.

---

## 1. The shape of the gap

The repository is not a shell. Eleven domains have real transactional cores with state
machines, permission guards, organization scoping, audit logging and end-to-end tests: company
structure, HR employee master, recruitment, attendance, leave, payroll runs, CRM, institutions,
programmes/LMS, performance, supply chain, support, compliance, project delivery and finance
including a correct GST engine.

What is missing falls into five distinct categories, and conflating them is how a project of
this kind goes wrong.

| Category | Examples | Why it is missing | Can it be built now? |
| --- | --- | --- | --- |
| **A. Output and reporting** | P&L, balance sheet, trial balance, ageing, the 20-report library, 9 dashboard widgets | Never started. The data exists; the read models do not. | **Yes — highest value, no dependencies** |
| **B. Missing domain entities** | Exit management, shifts, L&D, MoU, student fees, guardians, KB articles, GRN, asset depreciation | Never started | **Yes — ordinary work** |
| **C. Infrastructure prerequisites** | File storage (S3), job queue (Redis/BullMQ), search, real-time | Not provisioned. Roughly 20 downstream features depend on these. | **Partially — architecture yes, provisioning no** |
| **D. Commercial integrations** | Razorpay, WhatsApp, SES, OpenAI, GA4, Zoom | Require accounts and credentials the developer does not hold | **Adapter + sandbox only** |
| **E. Regulated integrations** | GST portal (GSP), DigiLocker, Aadhaar eKYC, eSign, EPFO | Require licences, contracts or statutory onboarding | **BLOCKED — adapter only, and say so** |

The single most important consequence: **category A is where the perceived value is, and it
has no blockers.** A finance module that cannot produce a P&L is not a finance module, and
that is a pure engineering gap, not a procurement gap.

---

## 2. Findings ranked by severity

### S1 — CMS publishes into a void

`CmsPage` and `CmsRevision` implement the full draft → review → publish → archive workflow,
with the published revision pinned so the live copy cannot drift. It is good work. It is also
**unreachable**: there is no unauthenticated endpoint anywhere in the API, and the public
website renders from `lib/site-data.ts`, a 165-line file of static arrays.

The specification (§12) and the flow it mandates:

```
ERP CMS → Published content → API → Public website
```

Today the arrow from "Published content" onward does not exist. Editing content in the ERP
changes nothing a visitor can see. `CmsRevision` also carries only a `body` string — no title
override, meta description, OG image, or schema markup — so even with a delivery API the SEO
requirements of §12.2 could not be met.

Additionally the specification requires the Careers page to come from Recruitment, the
Programs page from Program Management, and the Team page from HR-controlled publishing. All
three are currently static.

**Severity:** highest. It is the only gap that makes an already-built module worthless, and
it is the one a client can see from outside the login page.

**Effort:** public delivery API + SEO fields + content-type expansion + wiring three website
sections ≈ 2–3 days.

### S2 — Finance produces no financial statements

`LedgerAccount`, `JournalEntry` and `JournalLine` enforce balanced double-entry with a posting
transition. The data required for a trial balance is therefore already in the database. But
§09.5 — profit & loss, balance sheet, cash flow, trial balance, ageing, division-wise P&L,
budget variance — has **no implementation at all**.

A chart of accounts with no P&L is a data-entry exercise. This is the largest functional gap
in the highest-scrutiny module.

**Severity:** high. **Effort:** ≈ 3–4 days, no external dependencies.

### S3 — File storage is absent, and roughly twenty features need it

There is no storage layer. Everything below is blocked behind that single decision:

employee documents · company document repository (MOA/AOA) · student documents · ticket
attachments · CMS media library · compliance evidence files · certificate PDFs · payslip PDFs
· offer letter documents · project task attachments · MoU storage · co-branded certificates ·
knowledge-base attachments · invoice/receipt PDFs · asset documents · resume storage · policy
repository · brochures · gallery · press kit

**Severity:** high, because it is a fan-out blocker rather than a single feature.
**Effort:** storage abstraction + local-disk driver for development + S3 driver ≈ 1–2 days;
each dependent feature is then ordinary work.

### S4 — No job queue, so nothing scheduled can exist

Scheduled publishing, compliance reminders, overdue-invoice alerts, scheduled reports, drip
campaigns, SLA escalation, and recurring invoices all require deferred execution. There is no
Redis and no BullMQ.

**Severity:** medium-high. **Effort:** ≈ 1 day for the queue plus a worker; each dependent
feature is then ordinary.

### S5 — Security controls the spec calls mandatory are absent

§22.1 requires MFA (described as *mandatory for finance and HR*), SSO, IP allowlisting for
sensitive modules, and API key management. None exist. §22.2 requires AES-256 encryption for
PII at rest — and the `Employee` model carries **no** Aadhaar, PAN, passport or bank fields at
all, so the requirement is unmet in the sense that the data cannot even be stored.

§20.2 requires `deletedAt` soft delete on all tables. There are **zero** occurrences in the
schema. Every delete is currently physical.

**Severity:** medium-high — this is the category a security reviewer checks first.
**Effort:** TOTP MFA ≈ 1 day; soft delete ≈ 1 day plus migration care; PII fields with
envelope encryption ≈ 1–2 days.

### S6 — Audit log is not tamper-evident and has no viewer

`AuditLog` records actor, action, entity and IP on every V2 mutation — genuinely good. But
§18.2 additionally requires old-value/new-value capture, failed-login tracking,
permission-change audit, export and document-access audit, append-only storage, and export for
a CA. None of those exist, and there is **no UI to read the audit log at all**.

**Severity:** medium. **Effort:** ≈ 2 days.

### S7 — Marketing automation and campaigns are entirely absent

§05.4 is a substantial section — email/WhatsApp/SMS campaigns, segmentation, drip sequences,
A/B testing, open/click analytics, unsubscribe and DND compliance. There is no `Campaign`
model. Note that this is category D: the architecture can be built, but actual sending
requires provider accounts.

**Severity:** medium. **Effort:** ≈ 3 days for the domain; sending blocked on providers.

### S8 — Student lifecycle stops short of the student

Programmes, batches, enrollments, progress, assignments and certificates all work. But there
is no `Guardian`, no `StudentFee`, no student document storage, no grievance workflow, and
**no student-facing route** — `/erp/student/*` does not exist. §07.4 describes a student
portal; the LMS is currently administered *about* students rather than *by* them.

**Severity:** medium. **Effort:** ≈ 3–4 days; fees additionally need Razorpay.

### S9 — Dashboard covers 2 of 11 required widgets

§13.1 specifies nine named widgets plus an alerts panel. Implemented: headcount/task counts
and a cross-domain rollup. Absent: revenue overview, sales pipeline, finance pulse,
institution health, website performance, AI alerts. The 20-report library of §13.2 does not
exist, nor does the report builder.

**Severity:** medium — highly visible to an executive audience.
**Effort:** ≈ 2–3 days once S2 (financial statements) lands, since several widgets read from it.

### S10 — UX density is inconsistent across modules

After the shell and design-system work in `9f746cf`, navigation is uniform and the controls
are consistent. But only Employees and Finance use dense data tables; thirteen modules still
render records as list cards. §Rule 4 calls for sorting, column controls, saved views, bulk
actions, row actions, detail drawers and master-detail layouts — none of which exist anywhere
yet.

**Severity:** medium. **Effort:** a shared `DataTable` with sort/filter/paginate/bulk-select
≈ 1–2 days, then ≈ 2 hours per module to adopt.

### S11 — Minor but real

- **Default password in source.** `backend/prisma/seed.ts` falls back to a hardcoded demo
  password when `DEMO_FOUNDER_PASSWORD` is unset, and the seed runs on every production
  deploy. Acceptable for a demo; unacceptable if this ever holds real data. Should fail closed
  in production instead.
- **Fifth division missing.** The spec names five divisions; the seed creates four. Horizon
  Startup School is absent.
- **Swagger annotations incomplete.** The module is wired but endpoints lack response DTOs, so
  the generated documentation is thin.
- **CSP not configured.** `helmet()` is applied with defaults; §22.2 asks for an explicit
  Content Security Policy.
- **`/lms`, `/students`, `/webhooks` base paths absent** versus §21.1.

---

## 3. Architectural decisions to record

Per Rule 2, changes that depart from the specification are documented rather than made
silently.

| Decision | Spec says | We do | Rationale |
| --- | --- | --- | --- |
| Hosting | Kubernetes (EKS or self-hosted) | Railway + Vercel | The spec's own §25 scale note says V2 serves ~500 employees. K8s at this scale is cost and operational burden with no benefit. Revisit if load demands it. Recorded as OUT OF SCOPE, not skipped. |
| ERP frontend | Next.js 14 App Router | React 19 + vinext (Vite, Next-compatible) | Pre-existing baseline; Rule 2 forbids a rewrite for cosmetic conformance. The routing and layout conventions match. |
| ORM version | Prisma 5 | Prisma 6.19.3 | Newer; no behavioural conflict. |
| GraphQL | Apollo layer alongside REST | REST only | Spec's stated rationale is "real-time dashboards & mobile". Neither exists yet. Adding a second API surface now doubles maintenance for no consumer. Revisit when mobile starts. |

None of these prevent a specified behaviour, which is the Rule 2 threshold for changing
architecture.

---

## 4. What is genuinely blocked, and by what

Blocked means *cannot be completed regardless of engineering effort*, because it requires an
external party.

| Capability | Blocking dependency | What we can still build |
| --- | --- | --- |
| E-invoicing / IRN, e-way bill, GSTR filing | Contract with a GST Suvidha Provider; statutory onboarding | Adapter interface, request/response models, validation, sandbox provider, audit trail |
| DigiLocker certificate push | Partner onboarding with NeGD | Adapter + certificate payload model |
| Aadhaar eKYC | AUA/KUA licence | Adapter only; do not store Aadhaar until encryption lands |
| eSign / DSC | Empanelled ESP contract | Adapter + signature-request model |
| EPFO ECR filing, MCA verification, GeM | Portal credentials | Adapters |
| Razorpay / Stripe | Merchant account and API keys | Full adapter + webhook handler + sandbox |
| WhatsApp Business API | Business verification with Meta | Adapter + template model |
| AWS SES / SNS, S3 | AWS account | Storage and mail abstractions with local drivers |
| OpenAI | API key | Provider interface + deterministic stub |
| GA4 / Search Console | Property access | Adapter |

**The rule we follow for all of these:** build the internal architecture and the adapter
interface, implement validation and error handling, provide a sandbox implementation for
development and tests, mark the external dependency explicitly, and never report the
production integration as complete. Per Rule 3, a sandbox provider is a development aid, not
a delivered integration.

---

## 5. Audit evidence

Every claim above is reproducible. These are the commands used.

```bash
# Model inventory (93)
grep -c '^model ' backend/prisma/schema.prisma

# Route inventory (341) and per-controller breakdown
grep -rhE '^\s*@(Get|Post|Patch|Put|Delete)\(' backend/src --include='*.controller*.ts' | wc -l

# Frontend routes (51)
find app -name page.tsx | wc -l

# Permission keys (158)
sed -n '47,206p' backend/prisma/seed.ts | grep -cE '^\s+"'

# Soft delete: zero occurrences
grep -c deletedAt backend/prisma/schema.prisma

# No MFA, no SSO
grep -rniE 'totp|mfa|two.factor' backend/src
grep -rniE 'oauth|passport-google|entra|saml' backend/src

# Rate limiting, helmet, Swagger: present
grep -rn 'ThrottlerGuard' backend/src/app.module.ts
grep -rn 'helmet\|SwaggerModule' backend/src/create-app.ts

# No public CMS endpoint
grep -rn 'Public\|@SkipAuth\|public/' backend/src --include='*.controller*.ts'

# CMS content types: 4 of 15
awk '/^enum CmsContentType/,/^}/' backend/prisma/schema.prisma

# Missing entities confirmed absent
grep -cE '^model (EmployeeDocument|Shift|Campaign|SalesTarget|Guardian|StudentFee|KnowledgeBaseArticle|SLAPolicy|Warehouse|PurchaseRequisition|AssetMaintenance|AssetDepreciation|BankAccount|ApiKey)' backend/prisma/schema.prisma

# Statutory payroll absent
grep -riE '\bepf\b|\besi\b|tds|form16' backend/src/payroll/

# Secret scan: clean
git ls-files | grep -iE '\.env'
git grep -nIE '(sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|BEGIN (RSA|OPENSSH|PRIVATE) KEY)'
```

Test baseline at this commit: backend 27 suites / 85 tests pass; frontend 99 tests pass;
`npm run lint` reports 0 errors in both trees; `tsc --noEmit` clean in both trees.
