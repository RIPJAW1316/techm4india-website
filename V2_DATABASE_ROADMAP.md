# TechM4India ERP V2 database roadmap

## Current schema baseline

The current Prisma schema is a deliberately small PostgreSQL core. It contains 17 models:

```text
Organization
Division
Department
User
Role
Permission
UserRole
RolePermission
Employee
RefreshSession
Project
ProjectMember
ProjectTask
TaskComment
Notification
AuditLog
```

The schema uses UUID primary keys, PostgreSQL enums for lifecycle/status fields, compound uniqueness for organization/division/department/project membership, useful division/status/assignee/deadline indexes, foreign-key restrictions for organization ownership and cascades for dependent session/task/comment records. Three migrations exist: the initial core, auth/session metadata, and project/task metadata. Prisma 6 is the current ORM; the PDF's Prisma 5 recommendation is not a reason to downgrade.

The current model is suitable for the working employee vertical slice. It is not a complete V2 schema, and this document intentionally does not create a replacement schema or migration.

## Design rules for every future wave

1. Add one bounded domain at a time with a reviewable migration and seed delta.
2. Preserve UUID and timestamp conventions. Add `createdByUserId`/`updatedByUserId` only where actor history is meaningful; use `AuditLog` for immutable business events.
3. Do not put large binaries in PostgreSQL. Store object key, checksum, media type, size, classification, retention and owner metadata; serve private content through short-lived signed URLs.
4. Treat `deletedAt` as a policy choice, not a universal default. Financial records, audit records and statutory evidence should be immutable/voided rather than deleted. Employee/student records need retention and legal-erasure rules.
5. Keep tenant/org/division scope explicit in foreign keys and indexes. Do not infer division only from the current user at read time.
6. Use compound indexes that mirror authorization filters, e.g. `(divisionId, status)`, `(organizationId, deletedAt)`, `(assigneeId, status, dueDate)`.
7. Prefer append-only ledgers/history for payroll, finance, approvals, role grants and compliance evidence.
8. Use JSONB only for bounded metadata/custom fields, not for relational records that require reporting, constraints or authorization.
9. Introduce row-level security only after the tenancy model and connection/session strategy are defined; application policies remain mandatory.
10. Every migration must have rollback/restore notes, seed implications, data classification, indexes and an integration test.

## Domain expansion roadmap

| Wave | Domain | Planned entities / changes | Relationship to current core | PII sensitivity | Audit requirement | File storage | Likely indexes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| CORE-EXTENSION | Company/org | `CompanyProfile`, `CompanyAddress`, `CompanyBankAccount`, `CompanyDocument`, `Branch`, `CostCentre`, `Team`, `TeamMember`, `Designation`, `Grade` | `Organization` is the root; `Division`/`Department` remain stable; `Employee` gains branch/grade/designation references | Company confidential; bank HIGHLY_SENSITIVE | Changes to legal profile, signatories, bank accounts and org scope | `CompanyDocument` metadata only; signed URLs | org/status, branch/org, cost-centre/division, team/member |
| CORE-EXTENSION | Fifth division | Data row in `Division`, departments and optional program links; no new table required by itself | Reuses `Organization` -> `Division`; frontend/API config must recognize it | Internal | Seed/data migration and access-policy audit | No inherent storage | unique `(organizationId, slug)` already exists |
| HR-CORE | Employee profile | Extend `Employee`; `EmergencyContact`, `EmployeeAddress`, `EmployeeSkill`, `EmployeeCertification`, `EducationRecord`, `EmploymentHistory`, `EmployeeDocument` | `Employee.userId`, division/department/manager remain foreign keys | Personal CONFIDENTIAL; identity documents HIGHLY_SENSITIVE | Every sensitive read/export/update; effective-dated history | Private object storage for documents | employee/status, division/department/status, expiry dates, document owner |
| HR-CORE | HR reference data | `Designation`, `Grade`, `EmploymentType`, optional `ReportingLine` | Link to Employee; avoid free-text drift | Internal | Role/grade and reporting changes | None | active code, division scope |
| ATTENDANCE | Attendance/leave | `AttendanceRecord`, `AttendanceEvent`, `LeaveType`, `LeaveBalance`, `LeaveApplication`, `Holiday`, `Shift`, `ShiftAssignment`, `OvertimeRequest` | Employee, branch, manager/approver; payroll consumes approved results | Attendance CONFIDENTIAL; GPS/device data HIGHLY_SENSITIVE | Check-in, correction, approval and export audit | Optional evidence photo metadata | employee/date, division/date, status/approver, leave balance |
| RECRUITMENT | ATS/onboarding | `JobRequisition`, `JobPosting`, `Applicant`, `ApplicantDocument`, `InterviewRound`, `InterviewScore`, `OfferLetter`, `OnboardingChecklist`, `BackgroundCheck` | Applicant is not an Employee until conversion; Employee created at accepted onboarding | Applicant identity HIGHLY_SENSITIVE | Access/export, score changes, offer approvals | Resumes/offers private storage | requisition/status, applicant/email hash, interview/date |
| PERFORMANCE | Appraisal/L&D | `AppraisalCycle`, `GoalSheet`, `Goal`, `AppraisalForm`, `AppraisalScore`, `PerformanceImprovementPlan`, `TrainingProgram`, `TrainingRequest`, `TrainingAttendance`, `Certification` | Employee and manager relationships; certification can reuse HR document metadata | Performance CONFIDENTIAL | Cycle lock, score changes, manager approvals | Appraisal/training artifacts private | cycle/status, employee/cycle, expiry |
| PAYROLL | Payroll foundation | `SalaryStructure`, `SalaryComponent`, `EmployeeSalary`, `PayrollRun`, `PayrollLine`, `Payslip`, `TaxDeclaration`, `InvestmentProof`, `ReimbursementClaim`, `FullFinalSettlement` | Employee; approved attendance/leave; finance ledger/cost centre | Salary, tax and bank REGULATED/FINANCIAL | Immutable run snapshot, approval, export, payslip access | Payslip/proof metadata and signed URLs | run/month/status, employee/pay period, cost centre |
| CRM | Sales core | `Lead`, `LeadType`, `LeadSource`, `LeadStage`, `LeadAssignment`, `LeadActivity`, `FollowUp`, `LeadNote`, `SalesTarget`, `CommissionRule`, `Quote`, `Proposal`, `Contract` | Organization/division/user; optional institution/project links | Contact PII CONFIDENTIAL; contracts HIGHLY_SENSITIVE | Assignment, export, merge, stage and commission audit | Proposal/contract metadata | owner/stage, source/date, contact normalized hash, division |
| MARKETING | Campaigns | `Campaign`, `CampaignAudience`, `CampaignContact`, `CampaignMessage`, `CampaignEvent`, `Consent`, `SuppressionEntry`, `UTMAttribution` | Lead/contact references; communications provider logs | Contact/consent CONFIDENTIAL | Consent, opt-out, send and provider response audit | Creative/media metadata | campaign/status, consent/channel, event/time |
| INSTITUTIONS | Relationship master | `Institution`, `InstitutionContact`, `InstitutionAddress`, `InstitutionNote`, `InstitutionHealthSnapshot`, `InstitutionOwner` | CRM relationship; program, project and invoice references | Contact and contracts CONFIDENTIAL/HIGHLY_SENSITIVE | Contract/owner/export audit | MoU/contracts/private evidence | institution/type, owner/status, renewal date |
| INSTITUTIONS | MoU/delivery | `MoU`, `InstitutionProgram`, `InstitutionEvent`, `InstitutionInvoiceLink`, `InstitutionEscalation` | Institution -> Program/Batch/Invoice/Project | Contracts REGULATED/FINANCIAL where applicable | Signed version and renewal history | Signed MoU and branded files | institution/status, expiry, program/batch |
| PROGRAMS | Program catalogue | `ProgramCategory`, `Program`, `ProgramVersion`, `ProgramOutcome`, `ProgramFee`, `ProgramEligibility`, `ProgramFaculty` | Division/department; institution/program delivery | Public program data PUBLIC/INTERNAL; fees CONFIDENTIAL | Publication/version changes | Brochures/gallery/video metadata | slug/status, division/category, publishAt |
| PROGRAMS | Delivery | `Curriculum`, `CurriculumModule`, `Session`, `Batch`, `BatchSession`, `BatchFaculty`, `BatchInstitution` | Program -> curriculum -> batch/session; institution and faculty links | Scheduling INTERNAL; student roster CONFIDENTIAL | Roster/attendance/export audit | Session materials metadata | program/status, batch/date, institution |
| LMS | Courses/assessment | `Course`, `Lesson`, `LessonContent`, `Enrollment`, `Progress`, `Assignment`, `Submission`, `Grade`, `Certificate` | Program/batch/student/faculty; use separate Student identity | Student education CONFIDENTIAL; grades HIGHLY_SENSITIVE | Grade/certificate/access audit | Video/PDF/submission/certificate storage | enrollment/student, course/status, due dates |
| STUDENTS | Student lifecycle | `Student`, `StudentProfile`, `Guardian`, `StudentGuardian`, `StudentDocument`, `StudentFee`, `StudentPayment`, `StudentGrievance`, `StudentAttendance`, `AlumniProfile` | Student identity may link to User but must not be forced into Employee; enrollment links Program/Batch | Student/guardian/fees HIGHLY_SENSITIVE/REGULATED | Consent, export, grade/fee/document audit | ID/certificate/evidence metadata | institution/batch, student/status, fee/status |
| PROJECTS-V2 | Project extension | `ProjectType`, `ProjectObjective`, `ProjectDeliverable`, `Milestone`, `ProjectRisk`, `ProjectTag`, `ProjectCustomField`, `ProjectDependency` | Extend existing Project/Task; never rebuild core | Client and budget CONFIDENTIAL; contracts HIGHLY_SENSITIVE | Status, budget, risk, deliverable and export audit | Project docs/attachments metadata | project/status, milestone/due, risk/status, dependency |
| PROJECTS-V2 | Agile/time | `Sprint`, `SprintTask`, `TimeLog`, `TaskDependency`, `TaskAttachment`, `TaskMention`, `StandupNote` | ProjectTask/TaskComment remain base | Work logs CONFIDENTIAL | Time edits, status changes, mention notifications | Attachment metadata | project/sprint/status, assignee/date, task/dependency |
| FINANCE | Accounting | `Account`, `AccountGroup`, `Journal`, `JournalEntry`, `JournalLine`, `CostCentreAllocation`, `BankAccount`, `BankStatement`, `BankReconciliation` | Organization/cost centre; project/institution/vendor references | REGULATED/FINANCIAL | Append-only journal, approval, reversal, export; no destructive delete | Statements/receipts metadata | account/period, journal/status, bank/date, cost centre |
| FINANCE | Commercial | `Invoice`, `InvoiceItem`, `Payment`, `Receipt`, `Expense`, `ExpenseClaim`, `CreditNote`, `DebitNote`, `VendorBill` | CRM/institution/project/vendor; link to ledger | REGULATED/FINANCIAL | Immutable status transitions and webhook idempotency | Invoices/receipts private storage | customer/status/dueDate, payment/date, vendor |
| GST | Tax | `GSTRate`, `HSNCode`, `SACCode`, `GSTReturn`, `GSTReturnLine`, `EInvoice`, `EWayBill`, `ITCRegister`, `TDSRecord` | Finance ledger/invoice/vendor | REGULATED/FINANCIAL | Filing/reconciliation evidence and CA export | Filing acknowledgements | GSTIN/period/status, invoice/return |
| INVENTORY | Stock | `ItemCategory`, `Item`, `UnitOfMeasure`, `Warehouse`, `Stock`, `StockMovement`, `SerialNumber`, `BatchLot`, `StockAudit` | Branch/division/cost centre; procurement and assets | Operational INTERNAL; supplier pricing CONFIDENTIAL | Movement/adjustment/audit trail | Item images/manuals metadata | warehouse/item, serial, movement/date |
| PROCUREMENT | Purchase flow | `PurchaseRequisition`, `RFQ`, `RFQResponse`, `PurchaseOrder`, `GoodsReceiptNote`, `PurchaseApproval` | Department/cost centre/vendor/item/finance | Vendor/pricing REGULATED/FINANCIAL | Approval and three-way-match audit | Quotes/PO/GRN metadata | status/approver, vendor/date, PO/item |
| ASSETS | Lifecycle | `AssetCategory`, `Asset`, `AssetAssignment`, `AssetMovement`, `AssetMaintenance`, `AssetWarranty`, `AssetDepreciation`, `AssetDisposal` | Employee/branch/department/vendor/finance | Serial/location INTERNAL; insurance/financial CONFIDENTIAL | Assignment, transfer, maintenance, disposal | Invoice/warranty/inspection metadata | asset/status, assignee, warranty, branch |
| VENDORS | Vendor/partner | `Vendor`, `VendorContact`, `VendorDocument`, `VendorInvoice`, `VendorRating`, `Partner`, `PartnerAgreement`, `PartnerTerritory`, `RevenueShare` | Procurement/finance/CRM; external identity later | KYC/bank REGULATED/FINANCIAL | KYC, bank, invoice and agreement audit | KYC/contracts private storage | vendor/status, GSTIN hash, renewal |
| CMS | Content | `Page`, `Blog`, `Event`, `Testimonial`, `FAQ`, `PublicTeamMember`, `Career`, `Gallery`, `Award`, `Partner`, `PressRelease`, `Newsletter`, `LandingPage`, `ContentRevision`, `Publication` | References Program, Project, Employee/HR and Partner | Published content PUBLIC; drafts INTERNAL | Revision/publish/rollback audit | Media library metadata | slug/status, publishAt, locale, type |
| COMMUNICATIONS | Delivery | `EmailTemplate`, `NotificationTemplate`, `NotificationDelivery`, `WhatsAppLog`, `SMSLog`, `PushSubscription`, `Announcement`, `AnnouncementAcknowledgement` | Extends current Notification; user/division/role scopes | Contact/delivery INTERNAL/CONFIDENTIAL | Consent, send, failure and acknowledgement audit | Optional template media | recipient/status, channel/date, announcement expiry |
| SUPPORT | Helpdesk/wiki | `Ticket`, `TicketComment`, `TicketAttachment`, `SLAPolicy`, `TicketAssignment`, `KnowledgeBaseArticle`, `ArticleRevision`, `ArticleAccess` | Identity/org/team; links HR/LMS/finance contexts | Ticket content CONFIDENTIAL; student grievances HIGHLY_SENSITIVE | Access, escalation, attachment and export audit | Attachments/article media metadata | status/priority/SLA due, assignee, article access |
| COMPLIANCE | Governance | `ComplianceItem`, `ComplianceOwner`, `ComplianceLog`, `ComplianceReminder`, `LegalDocument`, `AuditArchiveManifest` | Company, HR, finance, IT, vendor | REGULATED/FINANCIAL | Append-only evidence, retention, legal hold | Evidence/archive storage | due/status/owner, retention, archive checksum |
| ANALYTICS | Reporting | `AnalyticsEvent`, `Report`, `ReportSchedule`, `ReportRun`, `DashboardWidget`, `AIInsight` | Read-model references, not write-path coupling | Aggregates INTERNAL; source PII inherits source classification | Query/export/schedule audit | Export files metadata | event/time, report/owner, run/status |

## Schema-wave dependency order

```text
Existing core
  -> CORE-EXTENSION (company, branch, teams, cost centres, fifth division decision)
  -> HR-CORE
       -> ATTENDANCE/LEAVE
       -> RECRUITMENT/ONBOARDING
       -> PERFORMANCE/L&D
       -> PAYROLL
  -> CRM
       -> INSTITUTIONS
            -> PROGRAMS
                 -> LMS
                 -> STUDENTS
  -> PROJECTS-V2
       -> project finance
  -> FINANCE
       -> GST
       -> PROCUREMENT/INVENTORY
       -> ASSETS/VENDORS
  -> CMS / COMMUNICATIONS / SUPPORT / COMPLIANCE
  -> ANALYTICS / AI / MOBILE / external integrations
```

Finance is deliberately placed after organization and before GST/procurement/assets. Payroll is not allowed to start until employee master, attendance/leave policy, salary policy and statutory validation exist.

## PII and sensitive-data classification

| Classification | Examples | Default access | Controls required before implementation |
| --- | --- | --- | --- |
| PUBLIC | Published pages, public program descriptions, approved press, public partner logos | Anonymous or public CMS reader | Publication workflow, moderation, SEO review |
| INTERNAL | Organization structure, project metadata, announcements, non-sensitive operational reports | Authenticated permitted users | Backend authorization, audit for changes, no public URLs |
| CONFIDENTIAL | Employee contact/profile data, CRM contacts, institution notes, project budgets, performance reviews, vendor pricing | Least-privilege role + division/department/resource scope | Access audit, masking in lists/exports, retention policy |
| HIGHLY_SENSITIVE | Aadhaar, PAN, passport, bank details, salary, student identity/grades, guardian data, KYC | HR/finance/authorized owner only; step-up MFA | Application envelope encryption with managed KMS, field-level masking, signed URLs, export audit, legal retention/erasure |
| REGULATED/FINANCIAL | Payroll runs, payslips, GST returns, journals, invoices, payments, tax declarations, statutory evidence | Explicit finance/HR/legal permission, approval workflow | Immutable ledger/history, maker-checker approvals, reconciliation, audit archive, CA/legal validation |

### Storage and retention posture

- Database stores structured metadata, classifications, hashes, owner/scope, and object keys; it does not store large documents/video blobs.
- Object storage must be private by default, encrypted at rest, access-logged, and served with short-lived signed URLs.
- Aadhaar/PAN/bank/salary fields should be encrypted before the first production record is accepted. Hashes may support lookup without exposing cleartext.
- Export endpoints must be separately permissioned and audited; list endpoints should mask sensitive fields.
- Retention, legal hold, deletion and archival periods require HR/finance/legal decisions. The current `AuditLog` is not yet a tamper-evident long-term archive.

## Migration guardrails

1. Never edit an applied migration; add a timestamped migration and a tested rollback/restore note.
2. Backfill reference data before adding non-null foreign keys.
3. Add indexes after checking query plans and authorization filters.
4. Keep seed idempotent and separate reference seed from demo persona seed.
5. Use feature flags or read-only shadow tables for high-risk finance/payroll cutovers.
6. Validate all new enums and state transitions at both DTO and service/domain levels.
7. Include data-classification and audit tests in every migration PR.

