# TechM4India ERP V2 — Execution Plan

Derived from [ERP_V2_IMPLEMENTATION_MATRIX.md](ERP_V2_IMPLEMENTATION_MATRIX.md) and
[ERP_V2_GAP_ANALYSIS.md](ERP_V2_GAP_ANALYSIS.md). Ordered by dependency, then by value.

**Baseline:** commit `8feccb2`, 16 September 2026.

---

## Sequencing principle

Three rules decide the order:

1. **Unblock fan-out first.** File storage blocks ~20 features and the job queue blocks ~7.
   Building either late means revisiting every dependent module.
2. **Then build what has no blockers and the most visible value.** Financial statements and
   the CMS delivery path are both pure engineering and both highly visible.
3. **Adapters last, and honestly.** Integrations produce no user-visible value until
   credentials exist, so they are built as interfaces with sandbox providers and reported as
   external dependencies — never as delivered integrations.

A wave is not finished until its exit criteria are met. Exit criteria are testable claims,
not opinions.

---

## Wave 0 — Documentation and baseline (done)

| Item | Status |
| --- | --- |
| Full specification read (38 pages) | done |
| Requirements matrix with repository evidence | done |
| Gap analysis with severity and blockers | done |
| Execution plan | done |
| Prettier standard, 0 lines > 300 chars | done — `ec1f3bb` |
| Unified ERP shell + design system | done — `9f746cf` |
| GST return workings per §09.4 | done — `8c17278` |

**Exit criteria met:** three documents exist and are evidence-backed; backend 27 suites /
85 tests and frontend 99 tests pass; both lints clean.

---

## Wave 1 — Public content delivery (S1)

**Why first:** it is the only gap that renders an already-built module worthless, it is
visible without logging in, and it has no external dependency.

| # | Task | Layer |
| --- | --- | --- |
| 1.1 | Extend `CmsContentType` to the 15 types in §12.1 | DB |
| 1.2 | Add SEO fields to `CmsRevision` — `metaTitle`, `metaDescription`, `ogImageUrl`, `canonicalUrl`, `schemaJson`, `locale`, `excerpt` | DB |
| 1.3 | Public delivery controller at `/api/v2/cms/public/*` — unauthenticated, published-only, org-scoped, cacheable, paginated | BE |
| 1.4 | Never expose drafts: enforce `status = PUBLISHED` and serve only the pinned revision | BE |
| 1.5 | Wire the public website to fetch published content, retaining static data as fallback | FE |
| 1.6 | Careers page reads open `JobRequisition` records | BE + FE |
| 1.7 | Programs page reads published `Program` records | BE + FE |
| 1.8 | Sitemap and `robots.txt` generated from published content | BE |

**Exit criteria**

- A page published in the ERP appears on the public website without a code change.
- A draft is never served: a test asserts a 404 for unpublished slugs.
- Public endpoints require no token and leak no unpublished content or internal fields.
- Careers and Programs render from the database.
- Public endpoints are rate-limited and paginated.

**Tests:** `backend/test/cms-public.e2e-spec.ts` (draft invisible, published visible,
cross-org isolation, unauthenticated access, no internal field leakage);
`tests/public-content.test.mjs` (website consumes the API).

---

## Wave 2 — Financial statements (S2)

**Why second:** highest-scrutiny module, no blockers, and several dashboard widgets in Wave 6
read from it.

| # | Task | Layer |
| --- | --- | --- |
| 2.1 | Account groups / sub-groups on `LedgerAccount` | DB |
| 2.2 | Trial balance from posted journal lines | BE |
| 2.3 | Profit & loss — monthly, quarterly, annual; division-wise via cost centre | BE |
| 2.4 | Balance sheet | BE |
| 2.5 | Cash flow statement | BE |
| 2.6 | Receivables and payables ageing buckets (0–30/31–60/61–90/90+) | BE |
| 2.7 | Reports UI — period selector, drill-down, export | FE |
| 2.8 | Tally XML export | BE |

**Exit criteria**

- Trial balance always balances; a property test asserts debits equal credits.
- P&L and balance sheet reconcile against the same journal set.
- Ageing buckets sum to the receivables/payables totals already reported.
- Every report is organization-scoped and permission-gated.
- No unbounded queries: all aggregation happens in the database, not in JavaScript.

---

## Wave 3 — Infrastructure prerequisites (S3, S4)

| # | Task | Layer |
| --- | --- | --- |
| 3.1 | Storage abstraction — `StorageProvider` interface; local-disk driver for dev/test, S3 driver behind config | BE |
| 3.2 | `FileObject` entity — metadata only, never bytes in the database | DB |
| 3.3 | Signed-URL access with short TTL and per-resource permission checks | BE |
| 3.4 | Upload endpoints with MIME and size validation | BE |
| 3.5 | Job queue — BullMQ + Redis, worker process, retry and dead-letter | BE |
| 3.6 | Scheduled-job registry: publishing, reminders, escalation, recurring invoices | BE |

**Exit criteria**

- A file uploads, stores, and downloads through a signed URL in tests using the local driver,
  with no AWS account required.
- Access control is enforced on download, not only on upload.
- A queued job runs, fails, retries, and lands in the dead-letter queue under test.
- S3 is configuration, not a code change.

---

## Wave 4 — Security and data-integrity gaps (S5, S6)

| # | Task | Layer |
| --- | --- | --- |
| 4.1 | `deletedAt` soft delete across all tables + partial indexes + global query filter | DB |
| 4.2 | Encrypted PII columns on `Employee` — Aadhaar, PAN, passport, bank; envelope encryption | DB + BE |
| 4.3 | TOTP MFA, enforced for finance and HR roles per §22.1 | BE + FE |
| 4.4 | Failed-login and permission-change audit | BE |
| 4.5 | Old-value/new-value capture in `AuditLog` | BE |
| 4.6 | Audit log viewer with filters and CSV export | FE |
| 4.7 | Explicit Content Security Policy | BE |
| 4.8 | Seed fails closed in production when `DEMO_FOUNDER_PASSWORD` is unset | BE |

**Exit criteria**

- A soft-deleted record is invisible to every list endpoint; a test asserts it.
- PII is unreadable in a raw database dump; a test asserts ciphertext at rest.
- A finance user without MFA enrolled cannot reach finance endpoints.
- Audit entries carry before/after values for updates.

---

## Wave 5 — Missing domain entities (S7, S8, and category B)

Ordered by business value within the wave.

| # | Domain | Adds |
| --- | --- | --- |
| 5.1 | HR exit management | resignation, notice period, exit interview, asset recovery, F&F, letters |
| 5.2 | Student lifecycle | `Guardian`, `StudentFee` with instalments, documents, grievances, student portal route |
| 5.3 | Institutions | `MoU` with lifecycle, renewal alerts, revenue-per-institution |
| 5.4 | Support | `SLAPolicy`, escalation, CSAT, `KnowledgeBaseArticle` with search |
| 5.5 | Procurement | purchase requisition, RFQ, quote comparison, GRN, 3-way match |
| 5.6 | Assets | maintenance, depreciation (SLM/WDV), transfers, disposal |
| 5.7 | CRM | `SalesTarget`, commission, `Campaign` domain, duplicate detection, bulk import |
| 5.8 | HR | `Shift` + rosters, overtime, L&D module |
| 5.9 | Payroll | PF/ESI/PT and TDS s.192 computation, Form 16, bank transfer file |

**Exit criteria per entity:** state machine explicit, permissions enforced, organization
scoped, audited, DTO-validated, covered by an end-to-end test, surfaced in the UI.

---

## Wave 6 — Analytics, reporting and UX density (S9, S10)

| # | Task | Layer |
| --- | --- | --- |
| 6.1 | Shared `DataTable` — sort, filter, paginate, column controls, bulk select, row actions | FE |
| 6.2 | Adopt `DataTable` across the thirteen list-card modules | FE |
| 6.3 | Detail drawers and master-detail layouts | FE |
| 6.4 | Activity timelines for CRM, institutions, tickets | FE |
| 6.5 | Nine dashboard widgets from §13.1 | BE + FE |
| 6.6 | Standard report library from §13.2 | BE + FE |
| 6.7 | Custom report builder | BE + FE |
| 6.8 | Scheduled reports (needs Wave 3 queue) | BE |

**Exit criteria**

- Every list screen supports sort, filter and pagination server-side — no client-side
  filtering of server datasets.
- Every dashboard figure traces to a database query; no hardcoded KPIs anywhere in production
  code; a test asserts it.

---

## Wave 7 — Integration architecture (category D and E)

Built as adapters with sandbox providers. **Reported as architecture, never as delivered
integrations.**

| # | Task |
| --- | --- |
| 7.1 | `IntegrationProvider` interface — configuration, health, retry, error taxonomy |
| 7.2 | Outbound webhook infrastructure + `/api/v2/webhooks` inbound with signature verification |
| 7.3 | Payments adapter (Razorpay/Stripe) + sandbox + webhook handler |
| 7.4 | Messaging adapters (SES, WhatsApp, SMS, FCM) + sandbox |
| 7.5 | GST GSP adapter — e-invoice/IRN, e-way bill — sandbox only, clearly marked BLOCKED |
| 7.6 | DigiLocker, eSign, Aadhaar adapters — interface only, clearly marked BLOCKED |
| 7.7 | GitHub/GitLab, Google Calendar, Zoom/Meet, GA4 adapters |
| 7.8 | OpenAI provider interface + deterministic stub for tests |

**Exit criteria**

- Every adapter has a sandbox implementation that tests run against with no network access.
- Every adapter reports its credential state through a health endpoint.
- The UI shows an explicit "not connected" state rather than implying success.
- No adapter is described as complete in any status report.

---

## Wave 8 — AI engine (§13.3)

Depends on Wave 7.8. Lead scoring, churn prediction, revenue forecasting, natural-language
query, anomaly detection, report summaries, chatbot.

**Non-negotiables:** outputs explainable in the UI; inputs respect the caller's permission
boundary — an AI answer must never surface data the asker could not query directly; a
deterministic stub backs every test.

---

## Wave 9 — Mobile (§14)

React Native, three apps, consuming the same V2 API and permissions. Requires Wave 7.4 for
push. Deliberately last: the spec allots 14–20 days and it depends on almost everything above.

---

## Wave 10 — Production readiness (§24)

Full gate from the specification's Definition of Done: build, lint, types, migrations, seed,
all test tiers, permission tests, security scan, no committed secrets, no dead navigation, no
console errors, responsive states, no unbounded queries, environment variables documented,
backup/restore documented, deployment runbook, health checks, staging verification.

---

## Effort against the specification's own estimate

The specification (page 34) budgets **60–120 working days**, and states that "a solo developer
with AI assistance should target 120 days for a production-quality V2."

| Wave | Estimate |
| --- | --- |
| 1 — Public content delivery | 2–3 days |
| 2 — Financial statements | 3–4 days |
| 3 — Infrastructure | 3–4 days |
| 4 — Security & integrity | 4–5 days |
| 5 — Missing entities | 20–28 days |
| 6 — Analytics & UX density | 8–12 days |
| 7 — Integration architecture | 6–9 days |
| 8 — AI engine | 8–12 days |
| 9 — Mobile | 14–20 days |
| 10 — Production readiness | 8–12 days |
| **Total** | **76–109 days** |

This is consistent with the specification's own figure. Any claim that the remaining scope
can be completed in a single session would be false, and stating otherwise would set the
client engagement up to fail.

## Reporting protocol

At each checkpoint: what was implemented, what was tested (with the commands run), what
remains, what is blocked, and the exact files changed. A wave is reported complete only when
its exit criteria are demonstrably met — and the matrix is updated in the same commit, so the
documents never drift from the code.
