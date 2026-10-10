import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateEpfEpsSplit,
  calculateEsiContribution,
  calculateProfessionalTaxTelangana,
  calculateSection192TdsAnnual,
  calculateMonthlyTdsDeduction,
  calculateLossOfPayProration,
  generatePayslipSnapshot,
} from "../lib/erp/payroll.rules.ts";

import {
  STANDARD_CHART_OF_ACCOUNTS,
  validateVoucherBalance,
  createSalesVoucher,
  createReceiptVoucher,
  createPurchaseVoucher,
  createPayrollVoucher,
  compileFinancialStatements,
  calculateAgeing,
} from "../lib/erp/finance.rules.ts";

import {
  isIntraState,
  isSection17_5Blocked,
  calculateRule88AOffset,
  compileGstr3bTable4,
} from "../lib/erp/gst.rules.ts";

import {
  calculateLeadScore,
  calculatePipelineForecast,
  generateContractMilestones,
} from "../lib/erp/crm.rules.ts";

// ============================================================================
// PART 1 — ADVANCED PAYROLL STATUTORY ENGINE TESTS
// ============================================================================

test("Payroll: EPF/EPS ceiling split conforms to EPFO statutory rules", () => {
  // Case A: Basic <= ₹15,000 (e.g. ₹15,000 ceiling exactly)
  const atCeiling = calculateEpfEpsSplit(15000, 15000, false);
  assert.equal(atCeiling.pfWage, 15000);
  assert.equal(atCeiling.employeeEpf, 1800); // 12% of 15,000
  assert.equal(atCeiling.employerEps, 1250); // 8.33% capped at 1,250
  assert.equal(atCeiling.employerEpf, 550); // 1800 - 1250
  assert.equal(atCeiling.totalPfRemitted, 3600); // 1800 + 1800

  // Case B: Basic > ₹15,000 (e.g. ₹30,000) with standard statutory cap applied
  const standardCap = calculateEpfEpsSplit(30000, 30000, false);
  assert.equal(standardCap.pfWage, 15000); // capped at statutory ceiling
  assert.equal(standardCap.employeeEpf, 1800);
  assert.equal(standardCap.employerEps, 1250);
  assert.equal(standardCap.employerEpf, 550);

  // Case C: Basic > ₹15,000 (e.g. ₹30,000) with un-capped joint election
  const unCapped = calculateEpfEpsSplit(30000, 30000, true);
  assert.equal(unCapped.pfWage, 30000);
  assert.equal(unCapped.employeeEpf, 3600); // 12% of 30,000
  assert.equal(unCapped.employerEps, 1250); // EPS remains strictly capped at 1,250
  assert.equal(unCapped.employerEpf, 2350); // 3600 - 1250 = 2350
  assert.equal(unCapped.totalPfRemitted, 7200);
});

test("Payroll: ESI wage threshold and semi-annual period continuation", () => {
  // Case A: Gross <= ₹21,000 (e.g. ₹20,000) -> Eligible
  const eligible = calculateEsiContribution(20000, 20000, false);
  assert.equal(eligible.isCovered, true);
  assert.equal(eligible.employeeEsi, 150); // 0.75% of 20,000
  assert.equal(eligible.employerEsi, 650); // 3.25% of 20,000
  assert.equal(eligible.totalEsiRemitted, 800);

  // Case B: Wage increment in period -> Continues coverage per ESI Act §46
  const wageHikeInPeriod = calculateEsiContribution(26000, 20000, true);
  assert.equal(wageHikeInPeriod.isCovered, true);
  assert.equal(wageHikeInPeriod.employeeEsi, 195); // 0.75% of 26,000
  assert.equal(wageHikeInPeriod.employerEsi, 845); // 3.25% of 26,000

  // Case C: Inception gross > ₹21,000 -> Excluded
  const excluded = calculateEsiContribution(35000, 35000, false);
  assert.equal(excluded.isCovered, false);
  assert.equal(excluded.employeeEsi, 0);
  assert.equal(excluded.employerEsi, 0);
});

test("Payroll: Telangana Professional Tax statutory slabs", () => {
  // Gross <= ₹15,000 -> ₹0
  assert.equal(calculateProfessionalTaxTelangana(12000), 0);
  assert.equal(calculateProfessionalTaxTelangana(15000), 0);

  // Gross ₹15,001 to ₹20,000 -> ₹150
  assert.equal(calculateProfessionalTaxTelangana(15001), 150);
  assert.equal(calculateProfessionalTaxTelangana(18500), 150);
  assert.equal(calculateProfessionalTaxTelangana(20000), 150);

  // Gross > ₹20,000 -> ₹200
  assert.equal(calculateProfessionalTaxTelangana(20001), 200);
  assert.equal(calculateProfessionalTaxTelangana(100000), 200);
});

test("Payroll: Section 192 TDS New Tax Regime FY 2026-27 calculation", () => {
  // Case A: Annual CTC ₹12,00,000 (annualPt = 0 for pure slab check)
  // Standard Deduction: ₹75,000 -> Net Taxable ₹11,25,000
  // Tax before rebate: 4L-8L (20k) + 8L-11.25L (32.5k) = 52,500
  // Under ₹12L limit -> s.87A rebate covers up to ₹60,000 -> Net Tax is ₹0!
  const ctc12L = calculateSection192TdsAnnual({ annualGrossSalary: 1200000, annualPt: 0 });
  assert.equal(ctc12L.standardDeduction, 75000);
  assert.equal(ctc12L.netTaxableIncome, 1125000);
  assert.equal(ctc12L.isEligibleFor87ARebate, true);
  assert.equal(ctc12L.section87ARebate, 52500);
  assert.equal(ctc12L.netAnnualTaxPayable, 0);

  // Case B: Annual CTC ₹16,00,000 (Taxable > ₹12L -> no 87A rebate)
  const ctc16L = calculateSection192TdsAnnual({ annualGrossSalary: 1600000, annualPt: 0 });
  assert.equal(ctc16L.standardDeduction, 75000);
  assert.equal(ctc16L.netTaxableIncome, 1525000);
  assert.equal(ctc16L.isEligibleFor87ARebate, false);
  // Slabs: 4L-8L: 20k; 8L-12L: 40k; 12L-15.25L: 15% of 3.25L = 48,750. Total = 108,750
  // 4% cess: 4,350 -> Total = 113,100
  assert.equal(ctc16L.healthAndEducationCess, 4350);
  assert.equal(ctc16L.netAnnualTaxPayable, 113100);

  // Monthly spread across 12 remaining months
  const monthlyTds = calculateMonthlyTdsDeduction(113100, 0, 12);
  assert.equal(monthlyTds, 9425);
});

test("Payroll: Loss of Pay (LOP) calendar-day proration and full payslip generation", () => {
  const proration = calculateLossOfPayProration({
    daysInMonth: 30,
    lossOfPayDays: 3,
    monthlyBasic: 30000,
    monthlyHra: 12000,
    monthlyAllowances: 8000,
  });
  assert.equal(proration.payableDays, 27);
  assert.equal(proration.prorationFactor, 0.9); // 27/30
  assert.equal(proration.earnedBasic, 27000);
  assert.equal(proration.earnedHra, 10800);
  assert.equal(proration.earnedAllowances, 7200);
  assert.equal(proration.earnedGrossEarnings, 45000);

  const payslip = generatePayslipSnapshot({
    employeeId: "EMP-001",
    employeeCode: "TM4I-042",
    employeeName: "Aditya Sharma",
    designation: "Lead Systems Engineer",
    pan: "ABCDE1234F",
    uan: "100900800700",
    daysInMonth: 30,
    lossOfPayDays: 0,
    monthlyBasic: 40000,
    monthlyHra: 16000,
    monthlyAllowances: 14000,
    annualCtc: 840000,
    tdsDeductedTillDate: 0,
    remainingMonthsInFy: 12,
  });

  assert.equal(payslip.grossEarnings, 70000);
  assert.equal(payslip.statutoryDeductions.professionalTax, 200);
  assert.equal(payslip.statutoryDeductions.employeeEpf, 1800); // capped at 15k basic
  assert.equal(payslip.statutoryDeductions.employeeEsi, 0); // gross > 21k
  assert.ok(payslip.netPayableSalary > 0);
  assert.equal(
    payslip.netPayableSalary,
    payslip.grossEarnings - payslip.totalDeductions,
  );
});

// ============================================================================
// PART 2 — FINANCE & DOUBLE-ENTRY ACCOUNTING ENGINE TESTS
// ============================================================================

test("Finance: Standard Chart of Accounts structure integrity", () => {
  const accounts = STANDARD_CHART_OF_ACCOUNTS;
  assert.ok(accounts.length >= 25);
  // Verifies account classes
  const asset = accounts.find((a) => a.code === "1110");
  assert.equal(asset?.type, "ASSET");
  assert.equal(asset?.name, "Trade Receivables");

  const revenue = accounts.find((a) => a.code === "4010");
  assert.equal(revenue?.type, "INCOME");

  const pfLiability = accounts.find((a) => a.code === "2120");
  assert.equal(pfLiability?.type, "LIABILITY");
});

test("Finance: Double-entry voucher balance invariant validation", () => {
  // Balanced voucher
  const balanced = validateVoucherBalance([
    { ledgerAccountCode: "1110", debit: 5000, credit: 0 },
    { ledgerAccountCode: "4010", debit: 0, credit: 5000 },
  ]);
  assert.equal(balanced.isValid, true);
  assert.equal(balanced.totalDebit, 5000);
  assert.equal(balanced.totalCredit, 5000);

  // Unbalanced voucher throws error
  assert.throws(
    () =>
      validateVoucherBalance([
        { ledgerAccountCode: "1110", debit: 5000, credit: 0 },
        { ledgerAccountCode: "4010", debit: 0, credit: 4999 },
      ]),
    /Debit and credit totals must balance/,
  );
});

test("Finance: Auto-GL posting generators for Sales, Purchase, and Payroll", () => {
  // 1. Sales Voucher (Invoice with 18% intra-state GST)
  const sales = createSalesVoucher({
    voucherNumber: "SALES-001",
    voucherDate: "2026-09-01",
    customerName: "Osmania University",
    taxableAmount: 100000,
    cgstAmount: 9000,
    sgstAmount: 9000,
    igstAmount: 0,
    totalInvoiceAmount: 118000,
  });
  const salesVal = validateVoucherBalance(sales.lines);
  assert.equal(salesVal.isValid, true);
  assert.equal(salesVal.totalDebit, 118000); // Debits Trade Receivables
  assert.equal(salesVal.totalCredit, 118000); // Credits Revenue (100k) + CGST Output (9k) + SGST Output (9k)

  // 2. Receipt Voucher
  const receipt = createReceiptVoucher({
    voucherNumber: "REC-001",
    voucherDate: "2026-09-10",
    customerName: "Osmania University",
    amountReceived: 118000,
    paymentMode: "BANK",
  });
  const recVal = validateVoucherBalance(receipt.lines);
  assert.equal(recVal.isValid, true);
  assert.equal(recVal.totalDebit, 118000); // Debits Bank
  assert.equal(recVal.totalCredit, 118000); // Credits Trade Receivables

  // 3. Purchase Voucher with Section 17(5) blocked credit (Catering)
  const purchaseBlocked = createPurchaseVoucher({
    voucherNumber: "PUR-001",
    voucherDate: "2026-09-15",
    vendorName: "Taj Catering Services",
    expenseAccountCode: "5080", // Event & workshop expense
    taxableAmount: 50000,
    cgstAmount: 4500,
    sgstAmount: 4500,
    igstAmount: 0,
    isSection17_5Blocked: true,
  });
  const purVal = validateVoucherBalance(purchaseBlocked.lines);
  assert.equal(purVal.isValid, true);
  // Blocked GST added to expense debit instead of input credit asset!
  const expenseLine = purchaseBlocked.lines.find((l) => l.ledgerAccountCode === "5080");
  assert.equal(expenseLine?.debit, 59000); // 50k + 9k blocked tax

  // 4. Payroll Voucher
  const payroll = createPayrollVoucher({
    voucherNumber: "PAY-2026-09",
    voucherDate: "2026-09-30",
    periodLabel: "September 2026",
    grossSalaries: 500000,
    employeeEpfTotal: 25000,
    employerPfTotal: 25000,
    employeeEsiTotal: 2000,
    employerEsiTotal: 6500,
    professionalTaxTotal: 4000,
    tdsTaxTotal: 15000,
    netSalariesPayable: 454000,
  });
  const payVal = validateVoucherBalance(payroll.lines);
  assert.equal(payVal.isValid, true);
  assert.equal(payVal.totalDebit, 531500); // Gross Salaries (500k) + Employer PF (25k) + Employer ESI (6.5k)
  assert.equal(payVal.totalCredit, 531500);
});

test("Finance: Financial Statements compilation (Trial Balance, P&L, Balance Sheet)", () => {
  const trialBalances = [
    { code: "1110", name: "Bank", type: "ASSET", balance: 500000 },
    { code: "1210", name: "Receivables", type: "ASSET", balance: 200000 },
    { code: "2010", name: "Payables", type: "LIABILITY", balance: -150000 },
    { code: "3010", name: "Share Capital", type: "EQUITY", balance: -300000 },
    { code: "4010", name: "Revenue", type: "REVENUE", balance: -800000 },
    { code: "5010", name: "Salaries Expense", type: "EXPENSE", balance: 450000 },
    { code: "5030", name: "Rent Expense", type: "EXPENSE", balance: 100000 },
  ];

  const statements = compileFinancialStatements(trialBalances);
  // Trial balance debit/credit balance
  assert.equal(statements.trialBalance.totalDebit, 1250000);
  assert.equal(statements.trialBalance.totalCredit, 1250000);
  assert.equal(statements.trialBalance.isBalanced, true);

  // Profit & Loss: Revenue 800k - Expenses 550k = Net Profit 250k
  assert.equal(statements.profitAndLoss.totalRevenue, 800000);
  assert.equal(statements.profitAndLoss.totalExpenses, 550000);
  assert.equal(statements.profitAndLoss.netProfitOrLoss, 250000);

  // Balance Sheet: Assets (700k) = Liabilities (150k) + Capital (300k) + Retained Profit (250k)
  assert.equal(statements.balanceSheet.totalAssets, 700000);
  assert.equal(statements.balanceSheet.totalLiabilitiesAndEquity, 700000);
  assert.equal(statements.balanceSheet.isBalanced, true);
});

test("Finance: Receivables and Payables 30/60/90 ageing analysis", () => {
  const ageing = calculateAgeing(
    [
      { id: "1", counterpartyName: "College A", invoiceNumber: "INV-1", dueDate: "2026-09-20", balanceDue: 50000 },
      { id: "2", counterpartyName: "College B", invoiceNumber: "INV-2", dueDate: "2026-08-15", balanceDue: 30000 },
      { id: "3", counterpartyName: "College C", invoiceNumber: "INV-3", dueDate: "2026-07-01", balanceDue: 20000 },
      { id: "4", counterpartyName: "College D", invoiceNumber: "INV-4", dueDate: "2026-05-01", balanceDue: 10000 },
    ],
    new Date("2026-09-26"),
  );

  assert.equal(ageing.totalDue, 110000);
  assert.equal(ageing.buckets.current_0_30, 50000);
  assert.equal(ageing.buckets.days_31_60, 30000);
  assert.equal(ageing.buckets.days_61_90, 20000);
  assert.equal(ageing.buckets.days_90_plus, 10000);
});

// ============================================================================
// PART 3 — ADVANCED GST STATUTORY ENGINE TESTS
// ============================================================================

test("GST: Place of supply intra-state vs inter-state determination", () => {
  // Supplier in Telangana (36)
  assert.equal(isIntraState("36AABCT1234F1Z1", "36-Telangana"), true);
  assert.equal(isIntraState("36AABCT1234F1Z1", "29-Karnataka"), false); // Inter-state
  assert.equal(isIntraState("36AABCT1234F1Z1", null, "36AABCK5678F1Z2"), true);
});

test("GST: Section 17(5) blocked credit recognition", () => {
  // Blocked SAC 9963 (Catering & Food)
  const catering = isSection17_5Blocked("996311", "FOOD_AND_BEVERAGE");
  assert.equal(catering.blocked, true);
  assert.match(catering.reason || "", /Section 17\(5\)/);

  // Blocked SAC 9996 (Club memberships)
  const club = isSection17_5Blocked("999612", "CLUB_MEMBERSHIP");
  assert.equal(club.blocked, true);

  // Eligible SAC 9983 (IT consulting)
  const itServices = isSection17_5Blocked("998311", "PROFESSIONAL_SERVICES");
  assert.equal(itServices.blocked, false);
});

test("GST: Rule 88A head-wise set-off cascade and RCM cash requirement", () => {
  // Output liability: IGST 10k, CGST 15k, SGST 15k
  // Available ITC: IGST 20k, CGST 5k, SGST 5k
  // RCM inward liability: CGST 1k, SGST 1k
  const result = calculateRule88AOffset(
    { cgst: 15000, sgst: 15000, igst: 10000, cess: 0 },
    { cgst: 5000, sgst: 5000, igst: 20000, cess: 0 },
    { cgst: 1000, sgst: 1000, igst: 0, cess: 0 },
  );

  // Step 1: IGST ITC (20k) exhausts IGST liability (10k)
  assert.equal(result.itcUtilized.igstAgainstIgst, 10000);

  // Step 1b & 1c: Remaining IGST ITC (10k) covers 10k of CGST liability
  assert.equal(result.itcUtilized.igstAgainstCgst, 10000);

  // Step 2: CGST ITC (5k) covers remaining CGST liability (5k) -> CGST fully cleared
  assert.equal(result.itcUtilized.cgstAgainstCgst, 5000);

  // Step 3: SGST ITC (5k) covers 5k of SGST liability -> Remaining regular SGST liability is 10k
  assert.equal(result.itcUtilized.sgstAgainstSgst, 5000);
  assert.equal(result.netTaxPayableInCash.sgst, 10000);

  // Statutory Invariant: RCM must be paid in cash and added to total cash payable
  assert.equal(result.totalCashPayable.cgst, 1000); // 0 regular + 1000 RCM cash
  assert.equal(result.totalCashPayable.sgst, 11000); // 10000 regular + 1000 RCM cash
});

test("GST: GSTR-3B Table 4 compilation with 17(5) blocked credit segregation", () => {
  const table4 = compileGstr3bTable4({
    allOtherItc: { cgst: 18000, sgst: 18000, igst: 10000, cess: 0 },
    rcmSupplies: { cgst: 2000, sgst: 2000, igst: 0, cess: 0 },
    section17_5Blocked: { cgst: 3000, sgst: 3000, igst: 0, cess: 0 },
  });

  // Table 4(A) total available = 20k CGST, 20k SGST, 10k IGST
  assert.equal(table4.table4A_Available.total.cgst, 20000);
  assert.equal(table4.table4A_Available.total.sgst, 20000);

  // Table 4(B)(1) permanent reversal = 3k CGST, 3k SGST
  assert.equal(table4.table4B_Reversed.section17_5Blocked.cgst, 3000);

  // Table 4(C) net ITC = 4(A) - 4(B) = 17k CGST, 17k SGST, 10k IGST
  assert.equal(table4.table4C_NetItc.cgst, 17000);
  assert.equal(table4.table4C_NetItc.sgst, 17000);
  assert.equal(table4.table4C_NetItc.igst, 10000);
});

// ============================================================================
// PART 4 — ADVANCED CRM ENGINE TESTS
// ============================================================================

test("CRM: Two-axis lead scoring with explainable factor breakdown and recency decay", () => {
  // Case A: High Fit, High Engagement -> HOT_LEAD
  const hotLead = calculateLeadScore({
    institutionCategory: "UNIVERSITY",
    studentStrength: 8000,
    decisionMakerRole: "VICE_CHANCELLOR",
    geographicTier: "TELANGANA",
    estimatedValue: 1500000,
    activities: [
      { type: "DEMO_COMPLETED", occurredAt: new Date(Date.now() - 2 * 86400000) },
      { type: "MEETING_HELD", occurredAt: new Date(Date.now() - 4 * 86400000) },
      { type: "PROPOSAL_REQUESTED", occurredAt: new Date(Date.now() - 6 * 86400000) },
    ],
  });

  assert.ok(hotLead.fitScore >= 80);
  assert.ok(hotLead.engagementScore >= 60);
  assert.equal(hotLead.quadrant, "HOT_LEAD");
  assert.match(hotLead.recommendation, /Sales Ready/);
  assert.ok(hotLead.breakdown.length >= 6);

  // Case B: High Fit, Low Engagement -> NURTURE
  const nurture = calculateLeadScore({
    institutionCategory: "ENGINEERING_COLLEGE",
    studentStrength: 3000,
    decisionMakerRole: "DIRECTOR",
    geographicTier: "TIER_1_METRO",
    estimatedValue: 600000,
    activities: [], // No engagement yet
  });
  assert.ok(nurture.fitScore >= 60);
  assert.ok(nurture.engagementScore < 50);
  assert.equal(nurture.quadrant, "NURTURE");
  assert.match(nurture.recommendation, /Strategic Target/);
});

test("CRM: Weighted pipeline forecasting and sales velocity diagnostic", () => {
  const deals = [
    { id: "1", name: "University MoU", stage: "PROPOSAL", value: 1000000 }, // 50% = 500k
    { id: "2", name: "Engineering College Batch", stage: "NEGOTIATION", value: 500000 }, // 75% = 375k
    { id: "3", name: "Vocational Skill Academy", stage: "QUALIFICATION", value: 200000 }, // 25% = 50k
  ];

  const forecast = calculatePipelineForecast(deals, 15, 35, 40);
  assert.equal(forecast.totalOpportunities, 3);
  assert.equal(forecast.totalUnweightedValue, 1700000);
  assert.equal(forecast.totalWeightedValue, 925000); // 500k + 375k + 50k
  assert.equal(forecast.salesVelocity.activeOpportunitiesCount, 3);
  assert.ok(forecast.salesVelocity.velocityPerDay > 0);
  assert.ok(forecast.salesVelocity.expectedRevenuePerMonth > 0);
});

test("CRM: Closed-Won commercial delivery and billing milestones generation", () => {
  const milestones = generateContractMilestones(1000000, "ACADEMIC_TRAINING");
  assert.equal(milestones.length, 3);

  // Milestone 1: 30% advance on signing
  assert.equal(milestones[0].percentage, 30);
  assert.equal(milestones[0].amount, 300000);
  assert.equal(milestones[0].hsnSacCode, "999293");

  // Milestone 2: 40% mid-term
  assert.equal(milestones[1].percentage, 40);
  assert.equal(milestones[1].amount, 400000);

  // Milestone 3: 30% final certification & placement
  assert.equal(milestones[2].percentage, 30);
  assert.equal(milestones[2].amount, 300000);
});
