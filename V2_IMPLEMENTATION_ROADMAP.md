# TechM4India ERP V2 implementation roadmap

## Roadmap principles

This roadmap starts after the working V1/core checkpoint. It does not repeat the completed login, refresh-session, RBAC, organization, employee, project, task, notification and four-workspace work. Each wave is a bounded delivery slice with its own migration, API contract, authorization, tests and definition of done.

Production hosting transfer is intentionally late. Current development remains the existing frontend environment, local NestJS and local PostgreSQL through Docker, as requested. Managed hosting, Redis, object storage and Kubernetes are introduced only when the relevant wave or client approval requires them.

## Waves

| Phase | Objective | Backend work | Database work | Frontend work | Security work | Tests | Dependencies | Complexity | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| V2-0 | Delta audit and architecture gate | No code; document current boundaries, API/database/infrastructure deltas | No schema/migration | No UI changes | Classify current and required controls | Read-only audit, current health checks | Current core + V2 PDF | Complete | Low |
| V2-1 | Core contract and organization foundation | Establish v2 conventions, correlation/error contract, company/org services, explicit principal scope extension | Company profile metadata, Branch, Team/TeamMember, CostCentre; only after business fields approved | Small shared resolver/config seam for future division/branch scope; no redesign | Permission namespace, role-grant audit, cross-scope tests, fifth-division decision record | Migration/integration/policy tests; Swagger contract tests | Client legal/org decisions | Medium | Medium |
| V2-2 | Company governance completion | Company profile, addresses, signatories, compliance references, org chart read APIs | Legal profile, company documents metadata, branch/cost centre relationships | Admin read/edit forms only if approved; preserve public pages | Sensitive company/bank field permissions and audit | Approval and export tests | V2-1 + legal profile | Medium | High |
| V2-3 | HR employee master | Employee aggregate, history, documents, designations/grades, org-chart services | HR core entities and document metadata | Protected employee profile, directory and document access states | PII classification, masking, HR permissions, access audit | Field policy, cross-division, document authorization | V2-1/V2-2 | Medium-high | High |
| V2-4 | Attendance and leave | Attendance records, holiday/shift policy, balances, applications and approvals | Attendance/leave/shift entities | Employee check-in/history, leave request/approval views | GPS/device data policy, correction audit, manager scope | Rule tests, timezone tests, approval E2E | V2-3 + HR policy/provider | High | High |
| V2-5 | Recruitment and onboarding | Requisitions, applicants, interviews, offers, onboarding checklist | ATS entities and applicant/document metadata | Recruiter pipeline and candidate self-service boundaries | Applicant PII, restricted interview scores, consent | Workflow, duplicate, document and audit tests | V2-3 + email/storage | High | High |
| V2-6 | Appraisal and internal L&D | Goals, cycles, feedback, PIP, training requests/sessions | Performance/L&D entities | Employee/manager cycle views and training calendar | Confidential performance access and immutable cycle lock | Cycle state, scoring, manager-scope tests | V2-3 + HR policy | Medium-high | High |
| V2-7 | Payroll foundation | Salary structures, payroll run preview/approval, payslips, reimbursements | Payroll snapshots, components, tax declarations, settlement records | Restricted payslip and declaration views | Mandatory MFA/step-up, finance/HR scopes, masking, export audit | Golden payroll fixtures, reconciliation, no-double-run tests | V2-3/V2-4 + CA/HR validation | Very high | Very high |
| V2-8 | CRM core | Leads, pipeline, activities, follow-ups, assignment, targets | CRM tables and indexes | Sales pipeline/list views and ownership states | Lead ownership, export/merge audit, consent fields | Stage transitions, assignment, duplicate and pagination tests | V2-1 + sales rules | High | Medium-high |
| V2-9 | Institutions | Institution profile, contacts, MoUs, renewal timeline, relationship owner | Institution and contract metadata | Relationship workspace and renewal queues | Contract/document scope, institution data isolation | Relationship, renewal and document authorization tests | V2-8 + legal/storage | High | High |
| V2-10 | Programs and delivery | Program catalogue, curriculum, batches, sessions, faculty assignment | Program/curriculum/batch entities | Programme catalogue/admin delivery views | Program publishing and faculty scope | Capacity, schedule, institution link tests | V2-9 + fifth division decision | High | Medium-high |
| V2-11 | LMS and certification | Course/lesson, enrollment, progress, assignment, grading, certificate jobs | LMS entities and certificate metadata | Faculty authoring and learner course/assessment views | Student/faculty resource scope, grade/certificate audit | Enrollment, grading, certificate and retry tests | V2-10 + storage/jobs | Very high | High |
| V2-12 | Students and admissions | Student/guardian, enrollment, fees link, grievance, alumni | Student entities, consent and enrollment history | Student/guardian/institution views | Child/student privacy, guardian consent, masked fees/grades | Enrollment, guardian, grievance and access tests | V2-10/V2-11 + privacy policy | Very high | Very high |
| V2-13 | Advanced projects | Extend current projects with types, objectives, deliverables, milestones, risks, sprints, time logs, dependencies | Child entities only; preserve current Project/Task IDs | Project planning, milestone, risk, agile and timesheet views | Project/client/institution scope, time-log approval, export audit | Backward compatibility, Gantt data, policy and time tests | Current project core + V2-1; finance link deferred | High | Medium-high |
| V2-14 | Finance core | Accounts, journals, invoices, payments, expenses, reconciliation, reports | Double-entry ledger, cost-centre allocations, commercial entities | Finance operations and approval views | MFA/IP allowlist, maker-checker, immutable entries, field masking | Ledger balancing, idempotency, reconciliation and CA fixture tests | V2-1/V2-2 + accountant validation | Very high | Very high |
| V2-15 | GST and statutory tax | GST computations, e-invoice/EWB/returns adapters, TDS/ITC records | GST/tax entities and immutable filing evidence | Tax review/reconciliation views | Restricted filing/export, signed provider webhooks | CA-approved tax fixtures, reconciliation and provider sandbox tests | V2-14 + GSTIN/ASP/GSP credentials | Very high | Very high |
| V2-16 | Procurement, inventory, assets and vendors | Requisitions, RFQ/PO/GRN, stock movements, asset lifecycle, vendor workflows | Inventory/procurement/assets/vendor entities | Operations, asset assignment, vendor and approval views | KYC/bank masking, approval thresholds, movement audit | Three-way match, stock valuation, depreciation and assignment tests | V2-2/V2-14 + operational policy | Very high | High |
| V2-17 | CMS and public content pipeline | CMS CRUD, revisions, preview, publish/schedule, redirects and public read API | Content types, revisions, publication, media metadata | Protected editorial UI; public routes migrate type-by-type | Content roles, publish approval, signed media URLs | Preview/publish/rollback, SEO/sitemap and accessibility tests | Programs/HR/projects + object storage | High | Medium-high |
| V2-18 | Communications, knowledge, support and compliance | Announcements, delivery logs, wiki/SOPs, tickets, SLAs, compliance calendar | Communication/support/compliance entities and archive metadata | Inbox/notice board, helpdesk, knowledge and compliance views | Article/ticket scope, retention, export and archive audit | SLA/escalation, notification delivery, retention and access tests | V2-3/V2-14 + storage/jobs/search as needed | High | High |
| V2-19 | Deterministic analytics and reporting | Read models, dashboard KPIs, report builder, scheduled report service | Analytics events, report definitions/runs, materialized views only where measured | Role-specific CEO/division/domain dashboards | Report-level scope, aggregate masking, export audit | Reconciliation against source domains, query/perf tests | Stable domain data from V2-8 onward | High | Medium-high |
| V2-20 | AI features | Explainable lead score, anomaly/summary interfaces, provider adapter | AI insight/evaluation/prompt metadata, no raw sensitive leakage | Opt-in insights and explanation states | Prompt/data minimization, human review, provider audit, no autonomous financial decisions | Offline eval sets, privacy tests, fallback/error tests | V2-19 + client/provider/governance decision | High | High |
| V2-21 | External integrations hub | Provider adapters, signed webhooks, idempotency, retries, integration health | Provider credentials metadata, webhook receipts and delivery logs | Admin connection/status and reauthorization states | Secret manager, signature verification, least-privilege scopes | Sandbox contract tests and replay/idempotency tests | Approved vendors and client accounts | High | Very high |
| V2-22 | Mobile clients | React Native employee/student/institution apps against stable contracts | No duplicated domain schema; push/device subscription metadata only | Mobile apps, offline cache and push UX | Device/session policy, mobile token/revocation, secure storage | Device E2E, offline conflict, accessibility and API compatibility | Stable v2 APIs + FCM/provider decision | Very high | High |
| V2-23 | Production hardening and client-owned deployment | CI/CD, staging, observability, runbooks, performance and security operations | Backup/restore, retention, archive and replica plan | Staging/UAT polish, responsive/accessibility audit | WAF, HSTS, KMS, SAST/DAST, penetration test, incident response | Full E2E, load, security, UAT and disaster recovery tests | Client approval, managed hosting, all production modules | Very high | Very high |

## Module definition of done

Every wave must satisfy this checklist before it is called complete:

- [ ] Migration is additive, reviewed, tested against a disposable PostgreSQL database, and documented with backup/rollback notes.
- [ ] Seed/reference data is idempotent; demo data is never created in production.
- [ ] DTOs use whitelist/forbid-non-whitelisted validation and explicit enum/state transitions.
- [ ] Swagger documents every endpoint, response, auth requirement and representative error.
- [ ] Authorization is backend-enforced and includes role, division/department/branch/team/resource ownership as relevant.
- [ ] Sensitive reads, exports, approvals, role changes and mutations emit audit events.
- [ ] PII classification, masking, retention and storage path are documented before data is accepted.
- [ ] Unit/service tests cover policy and business rules; integration tests cover PostgreSQL paths; critical user workflows have E2E coverage.
- [ ] Loading, empty, error, unauthorized and retry states exist in the frontend.
- [ ] Public-facing UI remains WCAG 2.1 AA-oriented and responsive at the existing breakpoints.
- [ ] Performance is measured for the changed endpoints; a 300ms p95 target is treated as a goal to validate, not an unverified claim.
- [ ] Environment variables and secrets are documented without values; no secret is committed or sent to the browser.
- [ ] Runbook, support ownership and operational alerts are updated.

## Exactly one next implementation phase

### V2-1 - Core organization and authorization extension

This is the next phase. It is intentionally smaller than “implement HR” or “implement all database entities.” It should:

1. Confirm the official fifth-division identity with the client, without implementing its public/product surface yet.
2. Add only the approved organization foundation: company profile metadata, Branch, Team/TeamMember and CostCentre where required by the confirmed operating model.
3. Extend the authenticated principal and policy test fixtures to represent branch/team/cost-centre scope without weakening current division/resource isolation.
4. Establish `/api/v2` conventions (error envelope, correlation ID, pagination, Swagger grouping) with one small company/context read contract; leave existing `/api/v1` untouched.
5. Add migrations, seed/reference updates, audit events and cross-scope integration tests.

It should **not** implement HR, payroll, CRM, the Horizon workspace, Redis, GraphQL, object storage, MFA/SSO, or any frontend redesign. Those are later waves or client decisions. This phase is the dependency because every future domain needs stable organizational scope, cost ownership and API/security conventions.

