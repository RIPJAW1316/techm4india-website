# Payroll, Finance, GST & CRM — How They Actually Work, and How Ours Should

**Purpose.** This is the working reference for building the four commercial domains of the
TechM4India ERP. It records how established systems (Zoho Payroll, Keka, greytHR, TallyPrime,
ClearTax, HubSpot/Sugar-class CRMs) model these domains, what Indian statute actually requires
as of FY 2026-27, and — for each — the concrete target design for *our* schema, with what
already exists and what is missing.

It is deliberately specific. Generic advice ("build a payroll module") is useless; the value is
in the arithmetic, the state machines, and the exact statutory figures.

**Baseline:** repository at commit `29f9893`. Statutory figures verified September 2026 — see
[Sources](#sources). Tax rates change; re-verify before each financial year and keep the rate
tables in the database, never in code.

---

# Part 1 — Payroll

## 1.1 The three numbers everyone confuses

Every payroll conversation goes wrong because three different "salary" numbers get used
interchangeably. The system must model all three explicitly.

```
CTC          = Gross + Employer PF + Employer ESI + Gratuity accrual + other employer cost
Gross        = Basic + HRA + Conveyance + Special Allowance + LTA + other earnings
Net (take-home) = Gross − (Employee PF + Employee ESI + Professional Tax + TDS + other deductions)
```

The employee sees Net. The finance team pays CTC. The gap between them is entirely statutory
employer contribution, and it is the single most common source of payroll disputes — so the
payslip must show employer contributions even though they are not deducted from the employee.

**Structural convention in India:** Basic is typically 40–50% of Gross. HRA is typically 50% of
Basic in metro cities, 40% elsewhere. Basic matters enormously because it is the base for PF,
gratuity and HRA exemption — setting it too low to reduce PF cost is a known compliance risk.

## 1.2 Statutory engine — the part that must be exactly right

### Employees' Provident Fund (EPF)

| Item | Rule |
| --- | --- |
| Wage base | Basic + Dearness Allowance (+ retaining allowance) |
| Statutory wage ceiling | ₹15,000 per month |
| Employee contribution | 12% of wage base |
| Employer contribution | 12% of wage base, **split** below |
| → EPS (pension) | 8.33% of **min(wage base, ₹15,000)** → capped at **₹1,250** |
| → EPF (employer share) | 12% total − EPS portion |
| EDLI | 0.50% of min(wage base, ₹15,000) — employer only |
| Admin charges | 0.50% of wage base, subject to a monthly minimum — employer only |
| Reduced rate | 10% applies only to notified categories of establishment |
| Filing | Monthly **ECR** (Electronic Challan cum Return) to the EPFO portal |

The EPS split is the part implementations get wrong. Worked example, Basic + DA = ₹30,000:

```
Employee PF   = 12% × 30,000                = 3,600
Employer total= 12% × 30,000                = 3,600
  EPS         = 8.33% × min(30,000, 15,000) = 1,249.50 → capped 1,250
  Employer EPF= 3,600 − 1,250               = 2,350
EDLI          = 0.50% × 15,000              =    75
```

Note the employer's EPF share is *not* 3.67% of the full wage when the wage exceeds the ceiling —
it is the remainder after the capped EPS. Hard-coding 3.67% is a real and common bug.

**Design decision:** store `pfWageCeiling`, `epsRate`, `epfRate`, `edliRate`, `adminChargeRate`
and `epsWageCeiling` in a `StatutoryRateTable` with `effectiveFrom` / `effectiveTo`. The
Supreme Court is reviewing the wage ceiling; when it changes, this must be a data change with a
new effective-dated row, never a code deploy. Historical payroll runs must continue to
recompute identically.

### Employees' State Insurance (ESI)

| Item | Rule |
| --- | --- |
| Applicability | Gross wage ≤ **₹21,000/month** (₹25,000 for employees with disability) |
| Employee | **0.75%** of gross |
| Employer | **3.25%** of gross |
| Contribution periods | April–September, October–March |
| Continuation rule | An employee who crosses the ceiling mid-period **stays covered until the period ends** |
| Filing | Monthly contribution, half-yearly return |

That continuation rule is a state machine, not a formula. An employee earning ₹20,000 in April
who is raised to ₹23,000 in June remains ESI-covered through September. Recomputing eligibility
from the current month's gross alone is wrong. Store `esiCoverageUntil` on the employee when
coverage begins.

### Professional Tax — Telangana (our registered state)

| Monthly gross | Monthly PT |
| --- | --- |
| Up to ₹15,000 | Nil |
| ₹15,001 – ₹20,000 | ₹150 |
| Above ₹20,000 | ₹200 |

Flat twelve months — Telangana has no February spike (unlike Karnataka/Maharashtra patterns).
Annual maximum ₹2,400, within the ₹2,500 constitutional cap of Article 276. Remitted by the
10th of the following month. Deductible under s.16(iii), so it **reduces taxable income before
TDS** — order of operations matters.

**Design decision:** PT is state-specific and we will eventually have staff outside Telangana.
Model it as `ProfessionalTaxSlab { stateCode, fromAmount, toAmount, monthlyAmount, monthOverride?, effectiveFrom }`
keyed by the employee's work-location state, not the company's.

### TDS on salary — Section 192

The new regime under s.115BAC is the **default**. FY 2026-27 slabs:

| Taxable income | Rate |
| --- | --- |
| Up to ₹4,00,000 | Nil |
| ₹4,00,001 – ₹8,00,000 | 5% |
| ₹8,00,001 – ₹12,00,000 | 10% |
| ₹12,00,001 – ₹16,00,000 | 15% |
| ₹16,00,001 – ₹20,00,000 | 20% |
| ₹20,00,001 – ₹24,00,000 | 25% |
| Above ₹24,00,000 | 30% |

Plus: **standard deduction ₹75,000**; **s.87A rebate up to ₹60,000** where taxable income does
not exceed ₹12,00,000 (making ≈₹12.75 lakh effectively tax-free for a salaried employee);
**health & education cess 4%** on tax after rebate; surcharge above ₹50 lakh.

The computation is annual, then spread:

```
1. Estimate annual gross for the full financial year
2. Less: exemptions (HRA etc. — old regime only), standard deduction
3. Less: Chapter VI-A deductions (old regime), professional tax u/s 16(iii)
4. = Taxable income
5. Apply slabs → tax
6. Less: s.87A rebate if eligible
7. Plus: surcharge (if applicable), then 4% cess
8. = Annual tax liability
9. Less: TDS already deducted this FY
10. ÷ remaining months in the FY  = this month's TDS
```

Step 9 is what makes TDS self-correcting: a mid-year salary revision or a late investment
declaration reprices the remaining months automatically. A system that computes TDS monthly in
isolation will be wrong every time something changes.

**Regime choice** is per-employee, per-financial-year, declared once and stored. **Form 12BB**
captures investment declarations; proofs are verified before the final quarter. **Form 16** =
Part A (downloaded from TRACES, not generated by us) + Part B (generated by us). Quarterly
return **24Q**.

## 1.3 The pay run lifecycle

Zoho Payroll's model is: **Draft → Submitted for Approval → Approved → Paid**, with rejection
returning to draft. Keka's is Data collection → Gross calculation → Statutory deductions →
Verification & approval → Disbursement & payslip. Both separate *computing* from *approving*
from *paying*, which is the important structural insight: a payroll can be computed many times
but approved once, and paid only after approval.

**Our current enum** is `DRAFT | PROCESSING | REVIEW | FINALIZED`, which conflates "approved"
and "paid" and offers no reversal.

**Target state machine:**

```
DRAFT ──lock inputs──► INPUTS_LOCKED ──compute──► COMPUTED ──submit──► IN_REVIEW
                                           ▲                              │
                                           └──────recompute───────────────┤
                                                                     approve
                                                                          ▼
                                         CLOSED ◄──close period── PAID ◄─APPROVED
                                                                          │
                                                                    disburse
```

Rules that must be enforced server-side:

- **Recompute is allowed only before approval.** After `APPROVED`, figures are immutable.
- **Approver ≠ initiator.** We already enforce this pattern on purchase orders; reuse it.
- **One run per period.** Already enforced — `payrollPeriodId` is `@unique`.
- **Reversal, not deletion.** A mistake found after `PAID` is corrected by an adjustment in the
  next period (arrears / recovery), never by editing a closed run. This is an accounting
  requirement, not a preference.
- **Period close locks attendance and leave** for that month, so the inputs cannot drift after
  the fact.

### Inputs collected before compute

Following Zoho's model: LOP days for the current month, LOP *corrections* for prior months
(reversals), one-time earnings (bonus, incentive, arrears), one-time deductions (advance
recovery, asset loss), and per-employee notes. Bulk CSV import is expected — payroll operators
will not hand-enter 200 rows.

### LOP proration

```
Payable days = Working days − LOP days
Prorated earning = Monthly amount × (Payable days ÷ Working days)
```

Apply proration to **earnings only**. Statutory deductions recompute from the *prorated* wage
base, which is why order matters: prorate earnings first, then derive PF/ESI/PT/TDS from the
resulting figures. Our `PayrollEmployeeResult` already carries `workingDays`, `payableDays`,
`leaveWithoutPayDays` — the fields exist; the computation does not yet use them.

## 1.4 Outputs — including the emailed PDF you asked about

You are right that there is an emailed PDF, and in real systems there are **two distinct
emails** serving two different audiences. Conflating them is a common mistake.

### (a) To each employee — the payslip

Sent on publish, one PDF per employee, password-protected (convention: PAN + date of birth, or
employee code). Zoho gates this behind an explicit "send pay stub notification" setting, which
is the right pattern — never mail payslips automatically without an operator opting in.

Contents: employee identity and code, designation, department, PAN/UAN/ESI numbers, period,
working/payable/LOP days, bank account (masked), then three columns — **Earnings**,
**Deductions**, **Employer contributions** — with year-to-date figures alongside each, net pay
in figures and words, and the tax regime in force.

### (b) To the payroll administrator and approver — the payroll summary report

**This is the report you heard about.** It is sent when a run reaches `IN_REVIEW` (so the
approver can check before approving) and again on `PAID` (as the record of what went out).
greytHR calls its equivalent the Payroll Overview: a consolidated summary of payroll status,
headcount, payouts, deductions and exceptions for the month.

Ours should contain:

1. **Header** — period, run ID, initiated by, approved by, generated timestamp.
2. **Headcount reconciliation** — opening, joiners, leavers, closing. If this does not tie, the
   run is wrong.
3. **Totals** — gross earnings, total deductions, net payable, total employer contribution,
   total cost to company.
4. **Component-wise breakdown** — every earning and deduction with its total across all staff.
5. **Statutory summary with due dates** — PF (employee + employer + EPS + EDLI + admin), ESI
   (employee + employer), PT by state, TDS — each with the remittance deadline. This is what
   turns a report into an action list.
6. **Variance against the previous month** — per component, absolute and percentage, with
   anything beyond a threshold flagged. Variance analysis catches almost every payroll error
   before it reaches a bank.
7. **Exceptions** — employees with no bank details, negative net pay, zero payable days, missing
   PAN, compensation not approved, ESI/PF eligibility changes this month.
8. **Division and department split** — cost allocation for the P&L.

Format: PDF for the emailed summary (fixed layout, archivable, signable) with an XLSX
attachment of the register for anyone who wants to pivot it.

### (c) Machine outputs

| Output | Consumer | Format |
| --- | --- | --- |
| Payroll register | Finance, audit | XLSX / PDF |
| Bank advice | Bank NEFT/NACH upload | Bank-specific CSV/TXT |
| PF ECR | EPFO portal | Pipe-delimited TXT, exact column order |
| ESI contribution file | ESIC portal | CSV |
| PT challan summary | State portal | PDF |
| TDS worksheet / 24Q | Return filing, Form 16 Part B | XLSX |
| Journal entry | Our own finance ledger | Internal posting |

That last row matters: payroll must **post to the general ledger**, not float beside it. See §2.4.

## 1.5 Payroll gap summary for our codebase

| Capability | Status |
| --- | --- |
| Components, structures, compensation, periods, runs, results, line items | **Exists** — the skeleton is good |
| Snapshot of component code/name/type on line items | **Exists** — correct design, keeps history immutable |
| `calculationMetadata` JSON on line items | **Exists** — use it to store the *why* of each figure |
| Statutory rate tables (effective-dated) | **Missing** |
| PF / EPS / EDLI / admin computation | **Missing** |
| ESI with contribution-period continuation | **Missing** |
| Professional tax by state | **Missing** |
| TDS s.192 with regime, 87A, cess, spread | **Missing** |
| Form 12BB declarations, Form 16 Part B | **Missing** |
| LOP proration wired into compute | **Fields exist, logic missing** |
| Extended run state machine + reversal | **Partial** — needs `APPROVED`, `PAID`, approver ≠ initiator |
| Payslip PDF | **Missing** |
| Payroll summary PDF + email | **Missing** |
| Bank advice, ECR, ESI, 24Q files | **Missing** |
| GL posting from payroll | **Missing** |

---

# Part 2 — Finance & Accounting

## 2.1 Chart of accounts — ours is flat, and that is the core problem

TallyPrime ships 28 predefined groups: 15 primary (9 appearing in the Balance Sheet as capital
in nature, 6 in the Profit & Loss as revenue in nature) and 13 sub-groups. The hierarchy is the
point — it is what lets a trial balance roll up into statements without hand-mapping.

**Our `LedgerAccount` has `code`, `name`, `type` and no parent.** A flat list of accounts cannot
produce a grouped Balance Sheet. This single missing column is why §09.5 of the specification
(P&L, balance sheet, cash flow) has no implementation.

**Target structure:**

```
LedgerAccount
  + parentId          → self-relation, nullable
  + isGroup           → true for headings that cannot take postings
  + naturalBalance    → DEBIT | CREDIT
  + statement         → BALANCE_SHEET | PROFIT_AND_LOSS   (derived from type, stored for speed)
  + cashFlowCategory  → OPERATING | INVESTING | FINANCING | NONE
```

A worked hierarchy for our business:

```
ASSETS
  Current Assets
    Trade Receivables            ← invoices post here
    Cash & Bank
      Bank Accounts
      Petty Cash
    Input Tax Credit             ← GST ITC lands here, not in an expense
      CGST Input / SGST Input / IGST Input
    Prepaid Expenses
  Fixed Assets
    Lab Equipment / IT Equipment / Furniture
    Accumulated Depreciation     ← contra-asset, credit balance
LIABILITIES
  Current Liabilities
    Trade Payables
    Statutory Dues               ← payroll posts here
      PF Payable / ESI Payable / PT Payable / TDS Payable / GST Payable
    Salary Payable
EQUITY
  Share Capital / Reserves & Surplus
INCOME
  Programme Revenue / Consulting Revenue / Other Income
EXPENSES
  Employee Benefit Expense
    Salaries & Wages / Employer PF / Employer ESI / Gratuity / Staff Welfare
  Operating Expenses / Depreciation / Finance Costs
```

Note `Accumulated Depreciation` as a contra-asset and the GST input accounts as *assets*. Both
are routinely modelled wrongly as expenses, which silently corrupts the balance sheet.

## 2.2 Voucher types

TallyPrime ships 24 predefined voucher types. Every transaction is one of a small set, and the
type determines the posting template — this is what stops users hand-writing journal lines.

| Voucher | Debit | Credit | Our status |
| --- | --- | --- | --- |
| Sales | Trade Receivables | Revenue + GST Output | Invoice exists; **no GL posting** |
| Purchase | Expense/Asset + GST Input | Trade Payables | Expense exists; **no GL posting** |
| Receipt | Bank | Trade Receivables | Payment exists; **no GL posting** |
| Payment | Trade Payables / Expense | Bank | Payment exists; **no GL posting** |
| Contra | Bank A | Bank B / Cash | Missing |
| Journal | any | any | **Exists** — the only one we have |
| Credit Note | Revenue + GST Output | Trade Receivables | Missing |
| Debit Note | Trade Payables | Expense + GST Input | Missing |

**The central finance gap:** we have invoices, payments and expenses as operational records,
and we have a journal system, and *they are not connected*. Issuing an invoice should
automatically create a balanced Sales voucher. Until it does, the ledger is an empty parallel
universe and no statement can be produced from real activity.

## 2.3 The statements, and how each is derived

```
Transactions → Journal entries → Ledger (per account) → Trial Balance
                                                             ├─► Profit & Loss   (income, expense)
                                                             ├─► Balance Sheet   (asset, liability, equity)
                                                             └─► Cash Flow       (via cashFlowCategory)
```

- **Trial balance** — every posted account with closing debit/credit. Σ debits must equal
  Σ credits, always. This is a property test, not a unit test: generate random balanced
  journals, assert the trial balance balances.
- **Profit & Loss** — income less expenses for a period. Must support division-wise via cost
  centre, which the specification requires and which our `CostCentre` model can already carry.
- **Balance sheet** — as at a date. Assets = Liabilities + Equity, where Equity includes
  current-period profit carried from the P&L. If it does not balance, the period has an
  unposted or unbalanced entry.
- **Cash flow** — indirect method is the pragmatic choice: start from profit, adjust for
  non-cash items (depreciation) and working-capital movement.
- **Ageing** — receivables and payables in 0–30 / 31–60 / 61–90 / 90+ buckets from due date.
  Buckets must sum to the control-account balance, which is a useful self-check.

## 2.4 Period close

A financial period must be closable, after which postings are rejected. Without this, someone
back-dates an entry into a month already reported to the client's CA.

```
FiscalPeriod { year, month, status: OPEN | SOFT_CLOSED | CLOSED, closedByUserId, closedAt }
```

`SOFT_CLOSED` allows adjustment entries by a finance manager; `CLOSED` allows nothing. Payroll
period close and finance period close should be linked — you cannot close finance for a month
whose payroll has not been posted.

## 2.5 Finance gap summary

| Capability | Status |
| --- | --- |
| Invoices, payments, expenses, parties, tax rates | **Exists, tested** |
| Balanced double-entry journals with posting transition | **Exists, tested** |
| Account hierarchy (`parentId`, groups) | **Missing — blocks all statements** |
| Automatic GL posting from invoice/payment/expense/payroll | **Missing — the central gap** |
| Voucher types beyond Journal | **Missing** |
| Trial balance, P&L, balance sheet, cash flow | **Missing** |
| Ageing buckets | **Missing** |
| Bank accounts + reconciliation | **Missing** |
| Fiscal period close | **Missing** |
| Credit / debit notes | **Missing** |
| Multi-currency conversion | **Missing** (currency stored, never converted) |
| Tally XML export | **Missing** |

---

# Part 3 — GST

Our GST engine is the one part of the commercial stack that is already correct: place-of-supply
determines CGST+SGST against IGST, the split is paise-safe, GSTR-1 is computed rate-wise and
HSN/SAC-wise, GSTR-3B offsets input credit head-wise and never goes below zero, and the ITC
register reads from approved purchases. This section records what remains.

## 3.1 Return structure

**GSTR-1** (outward supplies, monthly) is organised by table: 4A registered supplies (B2B),
5 large inter-state unregistered, 6 exports, 7 consolidated small unregistered (B2C), 8
nil-rated and exempt, 9 amendments to prior periods, 11 advances received, **12 HSN/SAC
summary**, 13 documents issued. We currently produce 4A, 7 and 12 — the three that matter for
a services business supplying registered institutions and individual learners.

**GSTR-3B** (summary, monthly). Table 3.1 carries outward supplies *and* inward supplies liable
to reverse charge. Table 4 is the ITC block: 4(A) ITC available — auto-populated from GSTR-2B
in the real portal, with 4(A)(5) "all other ITC" being the usual line; 4(B) reversals, split
into 4(B)(1) non-reclaimable and 4(B)(2) reclaimable; 4(C) net ITC available. Table 5 is exempt
inward supplies.

We produce 3.1 and a simplified Table 4. To match the portal we need the 4(B) reversal split.

## 3.2 What remains

- **Reverse charge** — a flag on the invoice/expense plus the corresponding 3.1(d) treatment.
  Relevant to us for legal and professional services from unregistered suppliers.
- **Blocked credits under s.17(5)** — ITC cannot be claimed on motor vehicles, food and
  beverage, club membership and similar. Today every taxed purchase flows into the ITC
  register. A `itcEligibility: ELIGIBLE | BLOCKED | PROPORTIONATE` field on the expense line,
  defaulted from the HSN/SAC master, prevents an overclaim — which is a real financial risk,
  not a cosmetic one.
- **GSTR-2B reconciliation** — match our purchase register against the portal's 2B, classifying
  each line as matched / missing in 2B / missing in books / value mismatch. Needs portal data.
- **E-invoicing (IRN)** and **e-way bill** — architecture and adapter only; production access
  requires a GSP contract.
- **GSTR-9** annual summary, and **TDS/TCS under GST**.

---

# Part 4 — CRM

## 4.1 Lead and Opportunity are two different objects — and ours already gets this right

The specification lists a flat ten-stage lifecycle: New, Contacted, Qualified, Meeting
Scheduled, Demo Given, Proposal Sent, Negotiation, Won, Lost, Dormant. Modelling that as one
enum on one object would be a mistake, and mature CRMs do not.

The industry split is: a **Lead** is an unqualified person/company; qualification either
disqualifies them or **converts** them into an Account + Contact + **Opportunity**; the
Opportunity then carries deal stages, a value, an expected close date and a probability, and it
is the Opportunity — never the Lead — that appears in pipeline and revenue forecasts.

Our schema already does exactly this:

```
CrmLead        NEW → CONTACTED → QUALIFIED → CONVERTED   (or UNQUALIFIED / ARCHIVED)
                                      │
                                   convert
                                      ▼
CrmOpportunity PROSPECTING → QUALIFICATION → PROPOSAL → NEGOTIATION → WON / LOST
```

The specification's "Meeting Scheduled" and "Demo Given" are **activities**, not stages —
they belong in `CrmActivity` (which we have, with CALL/EMAIL/MEETING/FOLLOW_UP/NOTE). "Dormant"
is a lead state we should add. This is worth writing down because a future reader comparing the
spec to the code will otherwise think the enum is incomplete.

**Add:** `DORMANT` to lead status; `stageChangedAt` on the opportunity (for velocity);
`probability` per stage.

## 4.2 Lead scoring

Real scoring is two independent axes, kept separate because they mean different things:

- **Fit** (firmographic / demographic) — who they are. Institution type, student strength,
  board affiliation, geography, budget authority. Static, known at capture.
- **Engagement** (behavioural) — what they did. Site visits, brochure download, email opens,
  event attendance, reply latency. Dynamic, decays with time.

A two-axis matrix beats a single blended number, because "high fit / low engagement" (nurture)
and "low fit / high engagement" (probably not worth a rep's time) require opposite actions and
a single score of 50 hides both.

Benchmarks worth holding ourselves against: roughly 15% of MQLs become SQLs, 10–12% of those
become opportunities, and 6–9% of opportunities close.

**Start rule-based, not ML.** The specification calls for an ML model, but a model trained on
zero historical wins is astrology. Ship transparent rules with visible weights, accumulate
12–18 months of outcomes, then train. Whatever the method, the UI must show *why* a score is
what it is — an unexplained number gets ignored by salespeople.

## 4.3 Pipeline and forecasting

```
Weighted pipeline = Σ (opportunity value × stage probability)
```

Stage probabilities are calibrated from our own history, not invented — if 30% of Proposal-stage
deals actually close, the probability is 0.30.

Layer **forecast categories** on top of stage, because they answer a different question:

| Category | Meaning |
| --- | --- |
| Pipeline | In play, not yet credible for this period |
| Best Case | Could close if things go well |
| Commit | The rep is standing behind it |
| Closed | Won |

Stage is where the deal *is*; category is what the rep *believes*. Keeping both is what makes a
forecast reviewable.

**Velocity** = (number of opportunities × average value × win rate) ÷ average sales-cycle days.
It is the single most useful diagnostic number, because every input is separately actionable.

## 4.4 What our CRM still needs

| Capability | Status |
| --- | --- |
| Leads, accounts, contacts, opportunities, activities | **Exists, tested** |
| Lead → opportunity conversion with linkage | **Exists** |
| `DORMANT` lead state, stage timestamps, per-stage probability | **Missing** |
| Lead scoring (fit + engagement, explainable) | **Missing** |
| Auto-assignment by geography / type / score | **Missing** |
| Duplicate detection and merge | **Missing** |
| Sales targets and quota per executive/division | **Missing** |
| Commission computation | **Missing** |
| Weighted pipeline + forecast categories | **Missing** |
| Kanban board and calendar views | **Missing** |
| Activity timeline UI | **Data exists, UI missing** |
| Proposal / quotation generation | **Missing** |
| Campaigns and marketing automation | **Missing** (needs email/WhatsApp providers) |
| Follow-up SLA and overdue alerts | **Missing** (needs job queue) |

---

# Part 5 — Build order

Dependencies, not preference, decide this.

| # | Work | Why here |
| --- | --- | --- |
| 1 | `LedgerAccount.parentId` + groups + natural balance | Unblocks every financial statement |
| 2 | Automatic GL posting from invoice / payment / expense | Makes the ledger reflect reality |
| 3 | Trial balance → P&L → Balance sheet → Cash flow → Ageing | The single biggest visible gap |
| 4 | Fiscal period close | Protects everything above |
| 5 | Statutory rate tables (effective-dated) | Foundation for all payroll statute |
| 6 | PF / ESI / PT / TDS computation engines | The hard arithmetic |
| 7 | LOP proration + extended run state machine + reversal | Correctness of the run itself |
| 8 | PDF service (payslip, payroll summary, reports) | Needs file storage first |
| 9 | Payroll → GL posting | Closes the loop with Part 2 |
| 10 | Emailed payroll summary + payslip distribution | Needs PDF service and a mail provider |
| 11 | Statutory output files (ECR, ESI, 24Q, bank advice) | Once the engines are correct |
| 12 | CRM stages, scoring, targets, weighted forecast | Independent; can run in parallel |
| 13 | GST reverse charge, s.17(5) blocked credits, 2B recon | Extends a working engine |

Items 8 and 10 depend on infrastructure that does not yet exist — file storage and a mail
provider — which is why the execution plan puts those in an earlier infrastructure wave.

# Part 6 — Rules that apply to all four domains

1. **Rates live in the database, effective-dated.** PF ceilings, tax slabs, PT slabs, GST rates,
   stage probabilities. A statutory change must never require a deploy, and recomputing a
   historical period must reproduce the original figures exactly.
2. **Money is `Decimal`, never float.** Already true in our schema. Round at the point the
   statute specifies, not opportunistically.
3. **Snapshot at the point of commitment.** An issued invoice, an approved payroll result and a
   closed opportunity must carry copies of the names, codes and rates used. We already do this
   on invoice lines and payroll line items — keep doing it.
4. **Immutability after approval.** Corrections are new entries, never edits.
5. **Every figure traces to a query.** No hardcoded dashboard numbers anywhere in production
   code.
6. **Computations are separately testable.** `gst.rules.ts` is the pattern: pure arithmetic with
   no Nest or Prisma imports, so the rules can be read and tested on their own. Payroll statute
   and the forecast maths should follow it.

---

## Sources

Statutory figures and product behaviour were checked against these in September 2026. Tax rules
change — re-verify before each financial year.

**Payroll and statutory**
- [Rules for ESI and PF Deductions for payroll calculation — Empxtrack](https://empxtrack.com/blog/esi-pf-statutory-compliance/)
- [The Ultimate Guide to Statutory Compliance in Indian Payroll (2026-27) — TeamLease HCM](https://www.teamleasehrtech.com/blog/the-ultimate-guide-to-statutory-compliance-in-indian-payroll-2026-27/)
- [PF & ESI Compliance 2026: Rates, Ceilings & ECR Filing Guide — EZHRM](https://ezhrm.in/pf-esi-compliance-india-2026-ecr-filing-guide/)
- [India Tax and Payroll 2026 — teamed.](https://www.teamed.global/country-hiring-guides/india/tax-and-payroll)
- [Salary Structure in India 2026 — Remunance](https://remunance.com/blog/salary-structure-in-india/)
- [Professional Tax in Telangana 2026 — factoHR](https://factohr.com/professional-tax/telangana/)
- [Telangana professional tax — Zoho Payroll](https://www.zoho.com/in/payroll/academy/payroll-laws/telangana/professional-tax.html)
- [Professional Tax Telangana — ClearTax](https://cleartax.in/s/professional-tax-telangana)
- [TDS on Salary FY 2026-27: Section 192 Rates & Rules — Keka](https://www.keka.com/tds-on-salary)
- [Income Tax Slabs FY 2025-26 and FY 2026-27 — ClearTax](https://cleartax.in/s/income-tax-slabs)
- [Salaried Individuals for AY 2026-27 — Income Tax Department](https://www.incometax.gov.in/iec/foportal/help/individual/return-applicable-1)
- [New Tax Regime Slabs for FY 2026-27 — WealthMunshi](https://wealthmunshi.com/new-tax-regime-slabs-fy-2026-27/)

**Payroll product behaviour**
- [Pay Runs — Zoho Payroll Help](https://www.zoho.com/in/payroll/help/employer/pay-runs/)
- [Configure Approval Workflows — Zoho Payroll](https://www.zoho.com/in/payroll/help/employer/settings/configure-approvals.html)
- [Payroll Process Flowchart — Keka](https://www.keka.com/payroll-process-flowchart)
- [View Payroll Summary at a Glance — greytHR](https://www.greythr.com/help-admin/payroll/view-payroll-summary-glance/)
- [Employees' Pay Summary report — Zoho Payroll](https://www.zoho.com/us/payroll/help/employer/reports/employee-pay-summary.html)
- [How Payroll Software Simplifies PF, ESI, TDS & Compliances — HROne](https://hrone.cloud/blog/payroll-software-pf-esi-tds-statutory-compliance/)

**Accounting**
- [How to Use Chart of Accounts in TallyPrime — TallyHelp](https://help.tallysolutions.com/charts-of-accounts-tally/)
- [Ledgers and Groups in TallyPrime — TallyHelp](https://help.tallysolutions.com/ledgers-and-groups-in-tallyprime/)
- [Chart of Accounts in Tally Prime: A Complete Overview — ICA](https://www.icacourse.in/blog/chart-of-accounts-in-tally-prime)

**GST**
- [Table 4 of GSTR-3B — ClearTax](https://cleartax.in/s/table-4-of-gstr-3b)
- [GSTR-3B Table 4: ITC Availment, Reversal, and Updates — Swipe](https://getswipe.in/blog/article/gstr-3b-table4-itc)
- [GSTR-3B Format: Table-Wise Guide — The GST Calculator India](https://thegstcalculator.in/gstr-3b-format)
- [GSTR-3B Table 4 help text — GST Portal tutorial](https://tutorial.gst.gov.in/contextualhelp/3BV1/Help_Text_table4.htm)

**CRM**
- [Lead Lifecycle Management: From MQL to Closed-Won — RevenueTools](https://www.revenuetools.io/blog/lead-lifecycle-management)
- [CRM Pipeline Stages: What Actually Forecasts — Tomba](https://tomba.io/blog/crm-pipeline-stages)
- [MQL vs SQL: The Complete Guide to Lead Qualification 2026 — UpliftGTM](https://upliftgtm.com/blog/mql-vs-sql)
- [Leads vs Opportunities: Managing a Sales Pipeline in CRM — SugarClub](https://sugarclub.sugarcrm.com/ll/f/conversations/5921/leads-vs-opportunities-managing-a-sales-pipeline-in-crm)
- [Sales Pipeline Stages guide — GigRadar](https://gigradar.io/blog/sales-pipeline-stages)
