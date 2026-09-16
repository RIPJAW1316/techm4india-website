# TechM4India ERP V2 — Implementation Matrix

**Source of truth:** `TechM4India_ERP_V2_Final.pdf` (v2.0 Final, 38 pages, dated 5 September 2026).
**Baseline audited:** commit `8feccb2`, 16 September 2026.
**Method:** every row below was checked against the repository, not against memory or a previous
summary. Evidence commands are recorded in [ERP_V2_GAP_ANALYSIS.md](ERP_V2_GAP_ANALYSIS.md).

## How to read this

Domain is the section heading; the remaining columns follow the requested schema.

| Column | Meaning |
| --- | --- |
| Requirement | Capability named in the specification |
| Existing State | What the repository actually does today |
| Gap | What is missing for the requirement to be met |
| BE / FE / DB | Backend service+API, frontend UI, database schema |
| Integration | External dependency, where the requirement has one |
| Tests | Automated coverage that fails if the behaviour breaks |
| Status | COMPLETE / PARTIAL / MISSING / BLOCKED / OUT OF SCOPE |

`·` means the requirement has no work in that layer.

**Status is evidence-based.** COMPLETE means the workflow runs end to end against a real
database, with permissions enforced and a test that fails if it breaks. A screen that renders
but writes nothing is PARTIAL at best.

## Baseline inventory

| Measure | Count |
| --- | --- |
| Prisma models | 93 |
| Backend HTTP routes | 341 |
| Backend controllers | 28 |
| Frontend routes (`page.tsx`) | 51 |
| Backend test suites | 28 |
| Frontend test files | 17 |
| Seeded permission keys | 158 |
| Roles in catalogue | 21 (spec lists 20) |

---

## 01 — System architecture (spec §01)

| Requirement | Existing State | Gap | BE | FE | DB | Integration | Tests | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Modular monolith, DDD bounded contexts | 28 NestJS modules split by domain, shared `V2ServiceBase`/`V2Controller` | none | ✅ | · | · | · | ✅ | COMPLETE |
| PostgreSQL 16 + Prisma | Postgres 16, Prisma 6.19.3, 20 migrations | Prisma 6 not 5 — newer, acceptable | ✅ | · | ✅ | · | ✅ | COMPLETE |
| API-first REST, versioned | `/api/v1` preserved, `/api/v2` for new work | none | ✅ | · | · | · | ✅ | COMPLETE |
| Swagger / OpenAPI 3.1 | `SwaggerModule` wired in `create-app.ts` | endpoints lack response DTO annotations | ✅ | · | · | · | · | PARTIAL |
| GraphQL layer | not present | whole layer | ❌ | ❌ | · | · | ❌ | MISSING |
| Redis cache + BullMQ job queue | not present | no queue; scheduled work has nowhere to run | ❌ | · | · | · | ❌ | MISSING |
| Elasticsearch / Meilisearch search | not present | cross-entity full-text search | ❌ | ❌ | · | · | ❌ | MISSING |
| S3 + CloudFront file storage | not present | no file storage at all; blocks documents, media, certificates | ❌ | ❌ | ❌ | AWS S3 | ❌ | MISSING |
| Socket.io real-time | not present | live dashboards, notifications | ❌ | ❌ | · | · | ❌ | MISSING |
| Prometheus / Grafana / Sentry | health endpoint only | metrics, error tracking | ❌ | · | · | Sentry | · | MISSING |
| Kubernetes deployment | Railway + Vercel | K8s manifests | ❌ | · | · | · | · | OUT OF SCOPE — hosting decision documented in gap analysis |

## 02 — Users, roles & permissions (spec §02)

| Requirement | Existing State | Gap | BE | FE | DB | Integration | Tests | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 20 named roles | 21 roles in `role-catalog.ts`, seeded | none | ✅ | ✅ | ✅ | · | ✅ | COMPLETE |
| Backend-enforced RBAC | `PermissionsGuard` + `@RequirePermissions`, 158 keys | none | ✅ | ✅ | ✅ | · | ✅ | COMPLETE |
| JWT access + refresh rotation | 15-min access, rotating HttpOnly refresh, reuse invalidates family | none | ✅ | ✅ | ✅ | · | ✅ | COMPLETE |
| Organization data isolation | `organizationId` scoping on every V2 service; cross-org returns 404 | none | ✅ | · | ✅ | · | ✅ | COMPLETE |
| Division/department isolation | `AuthorizationPolicy` scopes non-org-wide roles by division | not applied uniformly across newer V2 modules | ✅ | · | ✅ | · | ✅ | PARTIAL |
| Session audit trail | `AuditLog` on mutations; login/logout audited | no failed-attempt or permission-change audit | ✅ | ❌ | ✅ | · | ✅ | PARTIAL |
| Multi-factor authentication (TOTP/SMS) | not present | whole feature; spec calls it mandatory for finance and HR | ❌ | ❌ | ❌ | TOTP / SMS | ❌ | MISSING |
| SSO — Google Workspace / Microsoft Entra | not present | whole feature | ❌ | ❌ | ❌ | OAuth2 IdP | ❌ | MISSING |
| ABAC / resource-level rules | role+permission only | attribute rules (own vs team record) | ❌ | · | · | · | ❌ | MISSING |
| IP allowlist for finance/HR | not present | whole feature | ❌ | ❌ | ❌ | · | ❌ | MISSING |
| Time-based temporary grants | not present | whole feature | ❌ | ❌ | ❌ | · | ❌ | MISSING |
| API key management | not present | `ApiKey` entity named in spec §20 | ❌ | ❌ | ❌ | · | ❌ | MISSING |

## 03 — Company management (spec §03)

| Requirement | Existing State | Gap | BE | FE | DB | Integration | Tests | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Company profile — legal name, CIN, DPIIT, GSTIN, PAN, TAN | all fields on `Organization`, seeded, editable | none | ✅ | ✅ | ✅ | · | ✅ | COMPLETE |
| Divisions / departments | `Division`, `Department`, seeded with 4 divisions | spec names 5 — Horizon Startup School missing | ✅ | ✅ | ✅ | · | ✅ | PARTIAL |
| Branches | `Branch` with lifecycle + duplicate-code rejection | none | ✅ | ✅ | ✅ | · | ✅ | COMPLETE |
| Teams + members | `Team`, `TeamMember`, historical membership preserved | none | ✅ | ✅ | ✅ | · | ✅ | COMPLETE |
| Cost centres | `CostCentre` with structure linkage validation | not linked to P&L reporting | ✅ | ✅ | ✅ | · | ✅ | PARTIAL |
| Company document repository (MOA, AOA, certificates) | not present | needs file storage | ❌ | ❌ | ❌ | S3 | ❌ | MISSING |
| Directors / authorised signatories | not present | entity + digital signature linkage | ❌ | ❌ | ❌ | eSign | ❌ | MISSING |
| Company bank accounts | not present | `BankAccount` entity (spec §20 Finance) | ❌ | ❌ | ❌ | · | ❌ | MISSING |
| Insurance, licences, trademarks | not present | whole feature | ❌ | ❌ | ❌ | · | ❌ | MISSING |
| Milestones / history timeline | not present | whole feature | ❌ | ❌ | ❌ | · | ❌ | MISSING |

## 04 — Human resources & payroll (spec §04)

| Requirement | Existing State | Gap | BE | FE | DB | Integration | Tests | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Employee master — core identity | `Employee` + address, education, skills, certifications, emergency contacts | none for the core record | ✅ | ✅ | ✅ | · | ✅ | COMPLETE |
| Aadhaar / PAN / passport, encrypted | **no such fields on `Employee`** | fields + AES-256 at rest (spec §22.2) | ❌ | ❌ | ❌ | KMS | ❌ | MISSING |
| Bank account for salary transfer | not present | field + encryption | ❌ | ❌ | ❌ | · | ❌ | MISSING |
| ESIC / EPFO UAN numbers | not present | fields | ❌ | ❌ | ❌ | EPFO | ❌ | MISSING |
| Employee documents (offer letter, ID proof) | **no `EmployeeDocument` model** | entity + file storage | ❌ | ❌ | ❌ | S3 | ❌ | MISSING |
| Employment history (transfers, promotions) | `EmploymentHistory` with lifecycle | none | ✅ | ✅ | ✅ | · | ✅ | COMPLETE |
| Job requisition + approval | `JobRequisition` with approve/reject transitions | none | ✅ | ✅ | ✅ | · | ✅ | COMPLETE |
| ATS — applicants | `RecruitmentApplicant` with stage machine | none | ✅ | ✅ | ✅ | · | ✅ | COMPLETE |
| Interview scheduling + scorecards | `RecruitmentInterview` with scoring | no calendar integration | ✅ | ✅ | ✅ | Google Calendar | ✅ | PARTIAL |
| Offer letter + digital acceptance | `RecruitmentOffer` with accept/decline | no template generation, no e-signature | ✅ | ✅ | ✅ | eSign | ✅ | PARTIAL |
| Onboarding checklist | `RecruitmentOnboardingTask` | none | ✅ | ✅ | ✅ | · | ✅ | COMPLETE |
| Job posting to website / LinkedIn / Naukri | not present | public careers feed + syndication | ❌ | ❌ | · | LinkedIn | ❌ | MISSING |
| Resume parsing / AI screening | not present | whole feature | ❌ | ❌ | ❌ | OpenAI | ❌ | MISSING |
| Attendance — check-in/out, reports | `AttendanceRecord` with business-time rules, regularisation | no biometric/GPS source | ✅ | ✅ | ✅ | biometric | ✅ | PARTIAL |
| Shift management and rosters | **no `Shift` model** | whole feature | ❌ | ❌ | ❌ | · | ❌ | MISSING |
| Overtime calculation and approval | not present | whole feature | ❌ | ❌ | ❌ | · | ❌ | MISSING |
| Leave types, balances, accrual, approval | `LeaveType`, `LeaveBalance`, `LeaveApplication` with review flow | no carry-forward or encashment rules | ✅ | ✅ | ✅ | · | ✅ | PARTIAL |
| Holiday calendar | `Holiday` | none | ✅ | ✅ | ✅ | · | ✅ | COMPLETE |
| Salary structure + components | `SalaryStructure`, `PayrollComponent`, `EmployeeCompensation` | none | ✅ | ✅ | ✅ | · | ✅ | COMPLETE |
| Payroll run with attendance integration | `PayrollRun`, `PayrollPeriod`, per-employee results, approval | LOP from attendance not wired | ✅ | ✅ | ✅ | · | ✅ | PARTIAL |
| PF / ESI / PT statutory computation | **not present** | whole engine | ❌ | ❌ | ❌ | · | ❌ | MISSING |
| TDS s.192 + Form 16 | **not present** | whole engine | ❌ | ❌ | ❌ | · | ❌ | MISSING |
| Payslip PDF + employee portal | payslip data + division payslip page | no PDF generation | ✅ | ✅ | ✅ | · | ✅ | PARTIAL |
| Bank transfer file (NACH/NEFT) | not present | whole feature | ❌ | ❌ | ❌ | · | ❌ | MISSING |
| Appraisal cycles, goals, reviews | `PerformanceCycle`, `PerformanceGoal`, `PerformanceReview` with finalize | no 360° feedback, calibration, or PIP | ✅ | ✅ | ✅ | · | ✅ | PARTIAL |
| Internal L&D / training (§04.6) | not present | whole module | ❌ | ❌ | ❌ | · | ❌ | MISSING |
| Exit management (§04.7) | **not present** | resignation, notice, F&F, exit interview, asset recovery, letters | ❌ | ❌ | ❌ | · | ❌ | MISSING |

## 05 — CRM & sales (spec §05)

| Requirement | Existing State | Gap | BE | FE | DB | Integration | Tests | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Lead master + lifecycle | `CrmLead` with explicit stage machine | spec lists 10 stages; parity not verified | ✅ | ✅ | ✅ | · | ✅ | PARTIAL |
| Accounts, contacts, opportunities | `CrmAccount`, `CrmContact`, `CrmOpportunity` | none | ✅ | ✅ | ✅ | · | ✅ | COMPLETE |
| Activity timeline | `CrmActivity` | not rendered as a timeline UI | ✅ | ✅ | ✅ | · | ✅ | PARTIAL |
| Lead → opportunity conversion | `crm.leads.convert` permission + service | none | ✅ | ✅ | ✅ | · | ✅ | COMPLETE |
| Auto-assignment rules | not present | rules engine | ❌ | ❌ | ❌ | · | ❌ | MISSING |
| Kanban pipeline / calendar views | list view only | board + calendar | · | ❌ | · | · | ❌ | MISSING |
| Sales targets + commission | **no `SalesTarget` model** | whole feature | ❌ | ❌ | ❌ | · | ❌ | MISSING |
| Duplicate detection and merge | not present | whole feature | ❌ | ❌ | ❌ | · | ❌ | MISSING |
| Bulk import / bulk actions | not present | whole feature | ❌ | ❌ | · | · | ❌ | MISSING |
| Proposal / quotation generation | not present | whole feature | ❌ | ❌ | ❌ | · | ❌ | MISSING |
| Marketing automation (§05.4) | **no `Campaign` model** | entire section — email, WhatsApp, SMS, drip, segmentation, A/B | ❌ | ❌ | ❌ | SES, WhatsApp, SMS | ❌ | MISSING |
| AI lead scoring / win probability | not present | whole feature | ❌ | ❌ | ❌ | OpenAI | ❌ | MISSING |

## 06 — Institution relationship management (spec §06)

| Requirement | Existing State | Gap | BE | FE | DB | Integration | Tests | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Institution profile + contacts | `Institution`, `InstitutionContact` with primary selection | no NAAC/UDISE/AISHE/AICTE fields, no GPS | ✅ | ✅ | ✅ | · | ✅ | PARTIAL |
| Engagements / relationship history | `InstitutionEngagement` with status machine, CRM opportunity link | none | ✅ | ✅ | ✅ | · | ✅ | COMPLETE |
| Relationship owner assignment | `institutions.assign` + owner field | no co-owner | ✅ | ✅ | ✅ | · | ✅ | PARTIAL |
| MoU / contract creation, e-signing, storage | **no `MoU` model** | whole feature | ❌ | ❌ | ❌ | eSign, S3 | ❌ | MISSING |
| Renewal date + expiry alerts | not present | whole feature | ❌ | ❌ | ❌ | · | ❌ | MISSING |
| Relationship health score (AI) | not present | whole feature | ❌ | ❌ | ❌ | OpenAI | ❌ | MISSING |
| Revenue per institution | not present | needs finance join | ❌ | ❌ | · | · | ❌ | MISSING |
| Co-branded certificate generation | not present | whole feature | ❌ | ❌ | ❌ | · | ❌ | MISSING |
| Institution grievance escalation | not present | whole feature | ❌ | ❌ | ❌ | · | ❌ | MISSING |

## 07 — Programs, LMS & students (spec §07)

| Requirement | Existing State | Gap | BE | FE | DB | Integration | Tests | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Program catalogue + master fields | `Program` with status machine and publish | no fee structure, accreditation, SEO, brochure | ✅ | ✅ | ✅ | · | ✅ | PARTIAL |
| Curriculum — modules, lessons | `ProgramModule`, `ProgramLesson` | no session/hour planning | ✅ | ✅ | ✅ | · | ✅ | PARTIAL |
| Batches + capacity | `ProgramBatch` with open/close | no faculty roster per batch | ✅ | ✅ | ✅ | · | ✅ | PARTIAL |
| Student registration | `Student` with consent capture | no verification workflow, no ID card | ✅ | ✅ | ✅ | · | ✅ | PARTIAL |
| Enrollment + progress tracking | `ProgramEnrollment`, `LessonProgress` | none | ✅ | ✅ | ✅ | · | ✅ | COMPLETE |
| Assignments, submissions, grading | `ProgramAssignment`, `AssignmentSubmission`, max-score validation | no MCQ auto-grading | ✅ | ✅ | ✅ | · | ✅ | PARTIAL |
| Certificates | `ProgramCertificate`, one per completed enrollment, duplicate rejected | no PDF, no DigiLocker | ✅ | ✅ | ✅ | DigiLocker | ✅ | PARTIAL |
| Guardians / parent portal | **no `Guardian` model** | whole feature | ❌ | ❌ | ❌ | · | ❌ | MISSING |
| Student fees, instalments, scholarships | **no `StudentFee` model** | whole feature | ❌ | ❌ | ❌ | Razorpay | ❌ | MISSING |
| Student documents | not present | entity + storage | ❌ | ❌ | ❌ | S3 | ❌ | MISSING |
| Student grievances | not present | whole feature | ❌ | ❌ | ❌ | · | ❌ | MISSING |
| Student portal | **no student-facing route exists** | whole surface | ❌ | ❌ | · | · | ❌ | MISSING |
| Session attendance per lesson | not present | whole feature | ❌ | ❌ | ❌ | · | ❌ | MISSING |
| Live session integration | not present | whole feature | ❌ | ❌ | ❌ | Zoom/Meet | ❌ | MISSING |
| SCORM/xAPI, gamification, forums, offline | not present | whole features | ❌ | ❌ | ❌ | · | ❌ | MISSING |
| Alumni management | not present | whole feature | ❌ | ❌ | ❌ | · | ❌ | MISSING |

## 08 — Project management (spec §08)

| Requirement | Existing State | Gap | BE | FE | DB | Integration | Tests | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Project master + members | `Project`, `ProjectMember` | no budget, billing type, satisfaction rating | ✅ | ✅ | ✅ | · | ✅ | PARTIAL |
| Milestones | `ProjectMilestone` with completion | none | ✅ | ✅ | ✅ | · | ✅ | COMPLETE |
| Tasks + comments | `ProjectTask`, `TaskComment` | no dependencies, story points, @mentions, attachments | ✅ | ✅ | ✅ | · | ✅ | PARTIAL |
| Sprints | `ProjectSprint` with start/close | no velocity or burndown | ✅ | ✅ | ✅ | · | ✅ | PARTIAL |
| Time logs / timesheets | `ProjectTimeLog` | no approval workflow | ✅ | ✅ | ✅ | · | ✅ | PARTIAL |
| Risk register | `ProjectRisk` with severity/likelihood/mitigation | none | ✅ | ✅ | ✅ | · | ✅ | COMPLETE |
| Kanban board | list view only | board UI | · | ❌ | · | · | ❌ | MISSING |
| Gantt chart | not present | whole feature | ❌ | ❌ | · | · | ❌ | MISSING |
| Burndown / velocity charts | not present | whole feature | ❌ | ❌ | · | · | ❌ | MISSING |
| GitHub / GitLab PR linkage | not present | whole feature | ❌ | ❌ | ❌ | GitHub | ❌ | MISSING |
| Project finance (§08.3) | not present | budget vs actual, profitability, milestone billing, resource cost | ❌ | ❌ | ❌ | · | ❌ | MISSING |

## 09 — Finance, accounting & GST (spec §09)

| Requirement | Existing State | Gap | BE | FE | DB | Integration | Tests | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Chart of accounts | `LedgerAccount` with type hierarchy | no account groups/sub-groups | ✅ | ✅ | ✅ | · | ✅ | PARTIAL |
| Double-entry journals | `JournalEntry`, `JournalLine`, balance enforced, post transition | no approval workflow, no voucher types | ✅ | ✅ | ✅ | · | ✅ | PARTIAL |
| Invoices — create, issue, cancel | `FinanceInvoice` + lines, status machine, snapshots at issue | no proforma, recurring, credit/debit notes | ✅ | ✅ | ✅ | · | ✅ | PARTIAL |
| Payments + receipts | `FinancePayment` with void, over-payment rejected | no receipt PDF | ✅ | ✅ | ✅ | · | ✅ | PARTIAL |
| Expenses + approval workflow | `FinanceExpense` + lines, submit/approve/reject/cancel | no employee claim portal, no travel advance | ✅ | ✅ | ✅ | · | ✅ | PARTIAL |
| Parties (customers/vendors) | `FinanceParty` with GSTIN | no bank details, no KYC | ✅ | ✅ | ✅ | · | ✅ | PARTIAL |
| Receivables / payables listing | dedicated endpoints | no ageing buckets | ✅ | ✅ | · | · | ✅ | PARTIAL |
| Tax rate master | `FinanceTaxRate`, effective dating, inactive-rate rejection | none | ✅ | ✅ | ✅ | · | ✅ | COMPLETE |
| HSN / SAC master | `HsnSacCode`, seeded with 8 codes | none | ✅ | ✅ | ✅ | · | ✅ | COMPLETE |
| Place of supply → CGST/SGST vs IGST | `gst.rules.ts`, state-code comparison, paise-safe split | none | ✅ | ✅ | ✅ | · | ✅ | COMPLETE |
| GSTR-1 — B2B, B2C, HSN summary | computed rate-wise and code-wise from issued invoices | no export file | ✅ | ✅ | ✅ | · | ✅ | COMPLETE |
| GSTR-3B — summary + ITC set-off | output tax less credit, head-wise, floored at zero | no payment challan | ✅ | ✅ | ✅ | · | ✅ | COMPLETE |
| ITC register | paginated, from approved expenses, vendor GSTIN shown | none | ✅ | ✅ | ✅ | · | ✅ | COMPLETE |
| Reverse charge mechanism | not present | flag + treatment | ❌ | ❌ | ❌ | · | ❌ | MISSING |
| GSTR-2A / 2B reconciliation | not present | whole feature; needs portal data | ❌ | ❌ | ❌ | GST portal | ❌ | MISSING |
| E-invoicing / IRN | not present | adapter + `EInvoice` entity | ❌ | ❌ | ❌ | GSP/ASP | ❌ | MISSING |
| E-way bill | not present | adapter + `EWayBill` entity | ❌ | ❌ | ❌ | GSP/ASP | ❌ | MISSING |
| GSTR-9 annual summary | not present | whole feature | ❌ | ❌ | · | · | ❌ | MISSING |
| TDS (194C/194J) and TDS-TCS under GST | not present | whole feature | ❌ | ❌ | ❌ | · | ❌ | MISSING |
| **P&L, balance sheet, cash flow, trial balance** | **not present** | entire §09.5 — the core accounting output | ❌ | ❌ | · | · | ❌ | MISSING |
| Bank accounts + reconciliation | not present | whole feature | ❌ | ❌ | ❌ | · | ❌ | MISSING |
| Multi-currency (INR/USD/AED) | currency stored, never converted | rate table + conversion | ❌ | ❌ | ❌ | · | ❌ | MISSING |
| Tally XML export | not present | whole feature | ❌ | ❌ | · | Tally | ❌ | MISSING |
| Razorpay payment links | not present | whole feature | ❌ | ❌ | ❌ | Razorpay | ❌ | MISSING |

## 10–11, 15 — Inventory, procurement, assets & vendors (spec §10, §11, §15)

| Requirement | Existing State | Gap | BE | FE | DB | Integration | Tests | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Item master | `InventoryItem` with SKU, category, unit cost | no UoM, no HSN linkage, no BOM/kits | ✅ | ✅ | ✅ | · | ✅ | PARTIAL |
| Stock movements | `StockMovement` on PO receipt | no issue/return/transfer/write-off | ✅ | ✅ | ✅ | · | ✅ | PARTIAL |
| Vendor master + approval | `Vendor`, PENDING_APPROVAL → ACTIVE | no KYC, rate card, or performance scoring | ✅ | ✅ | ✅ | · | ✅ | PARTIAL |
| Purchase orders + approval chain | `PurchaseOrder`, submit/approve/issue/receive, approver ≠ submitter | no amount-threshold matrix | ✅ | ✅ | ✅ | · | ✅ | PARTIAL |
| Purchase requisition → RFQ → quote comparison | not present | entire front of §10.2 | ❌ | ❌ | ❌ | · | ❌ | MISSING |
| GRN + quality check + 3-way match | not present | whole feature | ❌ | ❌ | ❌ | · | ❌ | MISSING |
| Warehouse / location management | not present | whole feature | ❌ | ❌ | ❌ | · | ❌ | MISSING |
| Batch / serial / barcode / QR | not present | whole feature | ❌ | ❌ | ❌ | · | ❌ | MISSING |
| Min-stock alerts, ageing, FIFO valuation, stock audit | not present | whole features | ❌ | ❌ | ❌ | · | ❌ | MISSING |
| Asset master + assign/return/retire | `Asset` with status machine | no purchase cost, warranty, AMC, insurance | ✅ | ✅ | ✅ | · | ✅ | PARTIAL |
| Asset maintenance + service history | **no `AssetMaintenance` model** | whole feature | ❌ | ❌ | ❌ | · | ❌ | MISSING |
| Depreciation (SLM/WDV) + book value | **no `AssetDepreciation` model** | whole feature | ❌ | ❌ | ❌ | · | ❌ | MISSING |
| Asset transfer log, disposal, insurance claims | not present | whole features | ❌ | ❌ | ❌ | · | ❌ | MISSING |
| Vendor portal (self-service) | not present | entire §15.1 | ❌ | ❌ | ❌ | · | ❌ | MISSING |
| Partner / franchise management | not present | entire §15.2 | ❌ | ❌ | ❌ | · | ❌ | MISSING |

## 12 — Website CMS & public site (spec §12)

| Requirement | Existing State | Gap | BE | FE | DB | Integration | Tests | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Draft → review → publish → archive workflow | `CmsPage` + `CmsRevision`, full status machine, publish pins a revision | none | ✅ | ✅ | ✅ | · | ✅ | COMPLETE |
| Version history and rollback | revisions retained, published revision pinned | no rollback action | ✅ | ❌ | ✅ | · | ✅ | PARTIAL |
| 15 content types | **4 of 15**: `PAGE`, `ARTICLE`, `ANNOUNCEMENT`, `FAQ` | Programs, Projects, Events, Testimonials, Team, Careers, Gallery, Awards, Partners, Press, Newsletter, Landing Pages | ❌ | ❌ | ❌ | · | ❌ | PARTIAL |
| **Public delivery API** | **none — no unauthenticated endpoint exists** | published content cannot reach the website | ❌ | ❌ | · | · | ❌ | **MISSING** |
| **Website reads from CMS** | **public site reads `lib/site-data.ts` static arrays** | breaks the spec's CMS→API→website flow | ❌ | ❌ | · | · | ❌ | **MISSING** |
| SEO fields — title, meta description, OG image, schema | **`CmsRevision` has only `body`** | all SEO fields | ❌ | ❌ | ❌ | · | ❌ | MISSING |
| Slug management + redirects | slug unique per org | no redirect entity | ✅ | ✅ | ✅ | · | ✅ | PARTIAL |
| Scheduled publishing | not present | needs job queue | ❌ | ❌ | ❌ | · | ❌ | MISSING |
| Media library | not present | needs file storage | ❌ | ❌ | ❌ | S3 | ❌ | MISSING |
| Sitemap + robots.txt | static `lib/seo.ts` only | CMS-driven generation | ❌ | ❌ | · | · | ❌ | PARTIAL |
| Multi-language (EN/TE/HI) | not present | locale architecture | ❌ | ❌ | ❌ | · | ❌ | MISSING |
| GA4 + Search Console | not present | whole feature | ❌ | ❌ | · | GA4 | ❌ | MISSING |
| Careers page ← Recruitment | careers page is static | must come from `JobRequisition` | ❌ | ❌ | · | · | ❌ | MISSING |
| Programs page ← Program Management | programs page is static | must come from published `Program` | ❌ | ❌ | · | · | ❌ | MISSING |
| Team page ← HR | team from `lib/site-data.ts` | HR-controlled publishing | ❌ | ❌ | · | · | ❌ | MISSING |
| Events with registration forms | not present | whole feature | ❌ | ❌ | ❌ | · | ❌ | MISSING |

## 13 — Analytics, reporting & AI (spec §13)

| Requirement | Existing State | Gap | BE | FE | DB | Integration | Tests | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Executive dashboard | `/executive` summary + founder dashboard, real counts | 9 spec widgets not built | ✅ | ✅ | · | · | ✅ | PARTIAL |
| Analytics rollup | `/analytics/overview`, org-scoped, real counts | education/ops/supply/people counts only | ✅ | ✅ | · | · | ✅ | PARTIAL |
| Revenue overview widget | not present | whole widget | ❌ | ❌ | · | · | ❌ | MISSING |
| Sales pipeline widget | not present | whole widget | ❌ | ❌ | · | · | ❌ | MISSING |
| Finance pulse widget | not present | whole widget | ❌ | ❌ | · | · | ❌ | MISSING |
| Institution health widget | not present | whole widget | ❌ | ❌ | · | · | ❌ | MISSING |
| Website performance widget | not present | needs GA4 | ❌ | ❌ | · | GA4 | ❌ | MISSING |
| 20-report standard library (§13.2) | not present | entire section | ❌ | ❌ | ❌ | · | ❌ | MISSING |
| Custom report builder | not present | whole feature | ❌ | ❌ | ❌ | · | ❌ | MISSING |
| Scheduled reports | not present | needs job queue | ❌ | ❌ | ❌ | · | ❌ | MISSING |
| AI engine (§13.3) — scoring, churn, forecasting, NL query, anomaly, summaries, chatbot | **none** | entire section | ❌ | ❌ | ❌ | OpenAI | ❌ | MISSING |

## 14 — Mobile applications (spec §14)

| Requirement | Existing State | Gap | BE | FE | DB | Integration | Tests | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Employee app | not present | whole app | ❌ | ❌ | · | FCM | ❌ | MISSING |
| Student app | not present | whole app | ❌ | ❌ | · | FCM | ❌ | MISSING |
| Institution coordinator app | not present | whole app | ❌ | ❌ | · | FCM | ❌ | MISSING |
| Shared API + permissions for mobile | V2 REST API is mobile-consumable by design | API-key/device auth for apps | ✅ | · | · | · | ✅ | PARTIAL |

## 16–17 — Knowledge base & helpdesk (spec §16, §17)

| Requirement | Existing State | Gap | BE | FE | DB | Integration | Tests | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Ticket lifecycle, categories, priority | `SupportTicket` + comments, assign/resolve/close, agent gating | none | ✅ | ✅ | ✅ | · | ✅ | COMPLETE |
| SLA due date | `slaDueAt` computed at creation | **no `SLAPolicy` entity** — SLA is not configurable | ✅ | ✅ | ✅ | · | ✅ | PARTIAL |
| Escalation on SLA breach | not present | whole feature | ❌ | ❌ | ❌ | · | ❌ | MISSING |
| CSAT on closure | not present | whole feature | ❌ | ❌ | ❌ | · | ❌ | MISSING |
| Ticket attachments | not present | needs file storage | ❌ | ❌ | ❌ | S3 | ❌ | MISSING |
| Knowledge base / internal wiki | **no `KnowledgeBaseArticle` model** | entire §16.1 | ❌ | ❌ | ❌ | · | ❌ | MISSING |
| SOP library, policy repository, handbook | not present | whole features | ❌ | ❌ | ❌ | S3 | ❌ | MISSING |
| Announcements + acknowledgement tracking | `ANNOUNCEMENT` CMS type exists | no acknowledgement tracking, no notice board | ❌ | ❌ | ❌ | · | ❌ | PARTIAL |

## 18 — Compliance, legal & governance (spec §18)

| Requirement | Existing State | Gap | BE | FE | DB | Integration | Tests | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Compliance calendar with owners and due dates | `ComplianceObligation` with owner, frequency, status | not seeded with the 12 statutory items in §18.1 | ✅ | ✅ | ✅ | · | ✅ | PARTIAL |
| Evidence / document tracking | `ComplianceEvidence` | no file upload | ✅ | ✅ | ✅ | S3 | ✅ | PARTIAL |
| Reminders | not present | needs job queue | ❌ | ❌ | ❌ | · | ❌ | MISSING |
| Audit log — actor, timestamp, IP, entity | `AuditLog` on every V2 mutation | **no old/new value capture** | ✅ | ❌ | ✅ | · | ✅ | PARTIAL |
| Login / failed-attempt audit | login and logout audited | failed attempts not recorded | ✅ | ❌ | ✅ | · | ✅ | PARTIAL |
| Role and permission change audit | not present | whole feature | ❌ | ❌ | · | · | ❌ | MISSING |
| Data export audit, document access audit | not present | whole features | ❌ | ❌ | · | · | ❌ | MISSING |
| Tamper-evident append-only storage | ordinary mutable table | append-only guarantee + archive | ❌ | · | ❌ | S3 | ❌ | MISSING |
| Audit log viewer / export for CA | **no UI at all** | whole surface | ❌ | ❌ | · | · | ❌ | MISSING |

## 19 — Integrations (spec §19)

Every integration is MISSING. None has an adapter, interface, or sandbox implementation.

| Requirement | Status | Blocking dependency |
| --- | --- | --- |
| Razorpay (links, subscriptions, webhooks, refunds) | MISSING | merchant credentials |
| Stripe (international) | MISSING | account |
| Email — AWS SES transactional | MISSING | AWS credentials |
| Email — bulk/campaign (SendGrid/Mailchimp) | MISSING | account |
| WhatsApp Business API (Gupshup/Twilio) | MISSING | business verification |
| SMS (AWS SNS / MSG91) | MISSING | account |
| Push notifications (Firebase FCM) | MISSING | project; also needs mobile apps |
| Zoom / Google Meet | MISSING | OAuth app |
| Google Calendar | MISSING | OAuth app |
| GST portal via ASP/GSP | BLOCKED | GSP contract — regulated |
| DigiLocker | BLOCKED | partner onboarding — regulated |
| Aadhaar eKYC | BLOCKED | AUA/KUA licence — regulated |
| eSign / DSC | BLOCKED | ESP contract — regulated |
| EPFO / MCA / GeM / NSDC | BLOCKED | portal credentials — regulated |
| GitHub / GitLab | MISSING | OAuth app; feasible without a commercial gate |
| GA4 / Search Console | MISSING | property access |
| LinkedIn / Meta Business | MISSING | app review |
| Zapier / n8n | MISSING | outbound webhook architecture first |
| OpenAI | MISSING | API key |

## 20–22 — Database, API and security standards (spec §20, §21, §22)

| Requirement | Existing State | Gap | Status |
| --- | --- | --- | --- |
| UUID v4 primary keys | every model | none | COMPLETE |
| `createdAt` / `updatedAt` | every model | none | COMPLETE |
| **`deletedAt` soft delete on all tables** | **zero occurrences in schema** | §20.2 requires it on all tables | MISSING |
| `createdBy` / `updatedBy` actor tracking | on some models (`createdByUserId`) | not uniform | PARTIAL |
| Foreign keys with cascade rules | throughout; `Restrict` on financial parents | none | COMPLETE |
| Composite indexes for common queries | on org+status+date patterns | none | COMPLETE |
| Partial indexes for soft delete | n/a until soft delete exists | — | BLOCKED |
| **Encrypted PII columns** | **none** | Aadhaar, PAN, bank details (§22.2) | MISSING |
| JSONB metadata columns | `metadata Json?` on invoice lines | not widely used | PARTIAL |
| Materialised views for dashboards | not present | performance measure | MISSING |
| Row-level security | enforced in the application layer, not the database | DB-level RLS | PARTIAL |
| API base paths per §21.1 | 20 of 23 exist; `/lms`, `/students`, `/webhooks` absent | 3 base paths | PARTIAL |
| DTO validation with class-validator | on all V2 endpoints, `forbidNonWhitelisted` | none | COMPLETE |
| Rate limiting | `ThrottlerGuard`, 100 req/60s global | not per-endpoint or per-user tiered | PARTIAL |
| TLS / HSTS / CSP | `helmet()` applied | CSP not explicitly configured | PARTIAL |
| Pagination capped | capped at 100 across V2 list endpoints | none | COMPLETE |
| Secrets never committed | `.env` gitignored, only `.env.example` tracked, no key patterns found | **seed contains a default demo password fallback** | PARTIAL |

## 25 — Out of scope, per the specification (spec §25)

Deferred by the document itself. These are **not** implementation gaps.

| Item | Spec's stated reason |
| --- | --- |
| Manufacturing / ERP-class BOM | not in the operational model |
| Full warehouse management (WMS) | no large physical warehouse |
| Point of Sale terminal | no retail operation |
| Multi-tenant SaaS resale | separate GTM and legal entity |
| Blockchain credentialing | regulatory clarity needed in India |
| AR/VR learning modules | hardware dependency |
| Full HRMS for 1000+ employees | current scale does not require it |
| Custom SaaS billing engine | separate product |

---

## Roll-up

| Status | Rows | Share |
| --- | --- | --- |
| COMPLETE | 38 | 24% |
| PARTIAL | 54 | 35% |
| MISSING | 62 | 40% |
| BLOCKED | 6 | 1% |
| OUT OF SCOPE (spec-declared) | 8 | — |

**The honest headline:** the foundation — authentication, RBAC, organization scoping, audit
logging, DTO validation — and the transactional cores of eleven domains are real and tested.
What is largely absent is the *output* half of the product: financial statements, the report
library, analytics widgets; every external integration; the AI engine; mobile; and the
CMS→website delivery path that would make the public site real rather than static.
