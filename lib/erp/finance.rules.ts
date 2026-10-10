/**
 * TechM4India ERP - Commercial Engine
 * Module: Finance & Accounting Ledger Rules
 *
 * Compliant with:
 * - Double-Entry Bookkeeping Principles
 * - Indian GAAP / Tally-compatible Chart of Accounts (CoA) grouping
 * - Balance Sheet equation: Assets = Liabilities + Equity
 * - Real-time operational voucher to General Ledger mapping
 */

export type NaturalBalance = "DEBIT" | "CREDIT";
export type StatementType = "BALANCE_SHEET" | "PROFIT_AND_LOSS";
export type AccountType = "ASSET" | "LIABILITY" | "EQUITY" | "INCOME" | "EXPENSE" | "REVENUE";

export interface AccountNode {
  code: string;
  name: string;
  type: AccountType;
  naturalBalance: NaturalBalance;
  statement: StatementType;
  isGroup: boolean;
  parentId?: string;
  children?: AccountNode[];
}

type FinancialAccountInput = Pick<AccountNode, "code" | "name" | "type"> &
  Partial<Pick<AccountNode, "naturalBalance" | "isGroup">>;

export interface JournalLineItem {
  accountCode: string;
  ledgerAccountCode?: string;
  accountName: string;
  debit: number;
  credit: number;
  costCenterId?: string;
  description?: string;
}

export interface JournalVoucher {
  voucherNumber: string;
  voucherType: "SALES" | "PURCHASE" | "RECEIPT" | "PAYMENT" | "JOURNAL" | "PAYROLL";
  date: string;
  referenceId: string;
  referenceType: string;
  description: string;
  lines: JournalLineItem[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
}

/**
 * Standard TechM4India Chart of Accounts Hierarchy
 */
export const STANDARD_CHART_OF_ACCOUNTS: AccountNode[] = [
  // 1000 - ASSETS
  { code: "1000", name: "ASSETS", type: "ASSET", naturalBalance: "DEBIT", statement: "BALANCE_SHEET", isGroup: true },
  { code: "1100", name: "Current Assets", type: "ASSET", naturalBalance: "DEBIT", statement: "BALANCE_SHEET", isGroup: true, parentId: "1000" },
  { code: "1110", name: "Trade Receivables", type: "ASSET", naturalBalance: "DEBIT", statement: "BALANCE_SHEET", isGroup: false, parentId: "1100" },
  { code: "1120", name: "Cash & Bank", type: "ASSET", naturalBalance: "DEBIT", statement: "BALANCE_SHEET", isGroup: true, parentId: "1100" },
  { code: "1121", name: "Bank Operating Account", type: "ASSET", naturalBalance: "DEBIT", statement: "BALANCE_SHEET", isGroup: false, parentId: "1120" },
  { code: "1122", name: "Petty Cash", type: "ASSET", naturalBalance: "DEBIT", statement: "BALANCE_SHEET", isGroup: false, parentId: "1120" },
  { code: "1130", name: "Input Tax Credit (GST ITC)", type: "ASSET", naturalBalance: "DEBIT", statement: "BALANCE_SHEET", isGroup: true, parentId: "1100" },
  { code: "1131", name: "CGST Input", type: "ASSET", naturalBalance: "DEBIT", statement: "BALANCE_SHEET", isGroup: false, parentId: "1130" },
  { code: "1132", name: "SGST Input", type: "ASSET", naturalBalance: "DEBIT", statement: "BALANCE_SHEET", isGroup: false, parentId: "1130" },
  { code: "1133", name: "IGST Input", type: "ASSET", naturalBalance: "DEBIT", statement: "BALANCE_SHEET", isGroup: false, parentId: "1130" },
  { code: "1200", name: "Fixed Assets", type: "ASSET", naturalBalance: "DEBIT", statement: "BALANCE_SHEET", isGroup: true, parentId: "1000" },
  { code: "1210", name: "Robotics & Lab Equipment", type: "ASSET", naturalBalance: "DEBIT", statement: "BALANCE_SHEET", isGroup: false, parentId: "1200" },
  { code: "1220", name: "IT Hardware & Laptops", type: "ASSET", naturalBalance: "DEBIT", statement: "BALANCE_SHEET", isGroup: false, parentId: "1200" },
  { code: "1290", name: "Accumulated Depreciation", type: "ASSET", naturalBalance: "CREDIT", statement: "BALANCE_SHEET", isGroup: false, parentId: "1200" },

  // 2000 - LIABILITIES
  { code: "2000", name: "LIABILITIES", type: "LIABILITY", naturalBalance: "CREDIT", statement: "BALANCE_SHEET", isGroup: true },
  { code: "2100", name: "Current Liabilities", type: "LIABILITY", naturalBalance: "CREDIT", statement: "BALANCE_SHEET", isGroup: true, parentId: "2000" },
  { code: "2110", name: "Trade Payables (Vendors)", type: "LIABILITY", naturalBalance: "CREDIT", statement: "BALANCE_SHEET", isGroup: false, parentId: "2100" },
  { code: "2120", name: "Statutory Dues Payable", type: "LIABILITY", naturalBalance: "CREDIT", statement: "BALANCE_SHEET", isGroup: true, parentId: "2100" },
  { code: "2121", name: "PF Payable", type: "LIABILITY", naturalBalance: "CREDIT", statement: "BALANCE_SHEET", isGroup: false, parentId: "2120" },
  { code: "2122", name: "ESI Payable", type: "LIABILITY", naturalBalance: "CREDIT", statement: "BALANCE_SHEET", isGroup: false, parentId: "2120" },
  { code: "2123", name: "Professional Tax Payable", type: "LIABILITY", naturalBalance: "CREDIT", statement: "BALANCE_SHEET", isGroup: false, parentId: "2120" },
  { code: "2124", name: "TDS Payable (Salaries - Sec 192)", type: "LIABILITY", naturalBalance: "CREDIT", statement: "BALANCE_SHEET", isGroup: false, parentId: "2120" },
  { code: "2125", name: "TDS Payable (Vendors - Sec 194C/J)", type: "LIABILITY", naturalBalance: "CREDIT", statement: "BALANCE_SHEET", isGroup: false, parentId: "2120" },
  { code: "2130", name: "Salary Payable", type: "LIABILITY", naturalBalance: "CREDIT", statement: "BALANCE_SHEET", isGroup: false, parentId: "2100" },
  { code: "2140", name: "GST Output Tax Payable", type: "LIABILITY", naturalBalance: "CREDIT", statement: "BALANCE_SHEET", isGroup: true, parentId: "2100" },
  { code: "2141", name: "CGST Output", type: "LIABILITY", naturalBalance: "CREDIT", statement: "BALANCE_SHEET", isGroup: false, parentId: "2140" },
  { code: "2142", name: "SGST Output", type: "LIABILITY", naturalBalance: "CREDIT", statement: "BALANCE_SHEET", isGroup: false, parentId: "2140" },
  { code: "2143", name: "IGST Output", type: "LIABILITY", naturalBalance: "CREDIT", statement: "BALANCE_SHEET", isGroup: false, parentId: "2140" },

  // 3000 - EQUITY
  { code: "3000", name: "EQUITY", type: "EQUITY", naturalBalance: "CREDIT", statement: "BALANCE_SHEET", isGroup: true },
  { code: "3100", name: "Share Capital", type: "EQUITY", naturalBalance: "CREDIT", statement: "BALANCE_SHEET", isGroup: false, parentId: "3000" },
  { code: "3200", name: "Retained Earnings", type: "EQUITY", naturalBalance: "CREDIT", statement: "BALANCE_SHEET", isGroup: false, parentId: "3000" },
  { code: "3300", name: "Current Year Earnings", type: "EQUITY", naturalBalance: "CREDIT", statement: "BALANCE_SHEET", isGroup: false, parentId: "3000" },

  // 4000 - INCOME
  { code: "4000", name: "INCOME", type: "INCOME", naturalBalance: "CREDIT", statement: "PROFIT_AND_LOSS", isGroup: true },
  { code: "4010", name: "Operating Revenue", type: "INCOME", naturalBalance: "CREDIT", statement: "PROFIT_AND_LOSS", isGroup: false, parentId: "4000" },
  { code: "4100", name: "Institutional Delivery Revenue", type: "INCOME", naturalBalance: "CREDIT", statement: "PROFIT_AND_LOSS", isGroup: false, parentId: "4000" },
  { code: "4200", name: "Workshop & Training Revenue", type: "INCOME", naturalBalance: "CREDIT", statement: "PROFIT_AND_LOSS", isGroup: false, parentId: "4000" },
  { code: "4900", name: "Other Operating Income", type: "INCOME", naturalBalance: "CREDIT", statement: "PROFIT_AND_LOSS", isGroup: false, parentId: "4000" },

  // 5000 - EXPENSES
  { code: "5000", name: "EXPENSES", type: "EXPENSE", naturalBalance: "DEBIT", statement: "PROFIT_AND_LOSS", isGroup: true },
  { code: "5010", name: "General Salaries Expense", type: "EXPENSE", naturalBalance: "DEBIT", statement: "PROFIT_AND_LOSS", isGroup: false, parentId: "5000" },
  { code: "5030", name: "Office Rent Expense", type: "EXPENSE", naturalBalance: "DEBIT", statement: "PROFIT_AND_LOSS", isGroup: false, parentId: "5000" },
  { code: "5080", name: "Event & Workshop Expense", type: "EXPENSE", naturalBalance: "DEBIT", statement: "PROFIT_AND_LOSS", isGroup: false, parentId: "5000" },
  { code: "5100", name: "Employee Benefit Expense", type: "EXPENSE", naturalBalance: "DEBIT", statement: "PROFIT_AND_LOSS", isGroup: true, parentId: "5000" },
  { code: "5110", name: "Salaries & Wages", type: "EXPENSE", naturalBalance: "DEBIT", statement: "PROFIT_AND_LOSS", isGroup: false, parentId: "5100" },
  { code: "5120", name: "Employer PF Contribution", type: "EXPENSE", naturalBalance: "DEBIT", statement: "PROFIT_AND_LOSS", isGroup: false, parentId: "5100" },
  { code: "5130", name: "Employer ESI Contribution", type: "EXPENSE", naturalBalance: "DEBIT", statement: "PROFIT_AND_LOSS", isGroup: false, parentId: "5100" },
  { code: "5140", name: "Staff Welfare & Training", type: "EXPENSE", naturalBalance: "DEBIT", statement: "PROFIT_AND_LOSS", isGroup: false, parentId: "5100" },
  { code: "5200", name: "Operating & Delivery Costs", type: "EXPENSE", naturalBalance: "DEBIT", statement: "PROFIT_AND_LOSS", isGroup: false, parentId: "5000" },
  { code: "5300", name: "Administrative & General Expenses", type: "EXPENSE", naturalBalance: "DEBIT", statement: "PROFIT_AND_LOSS", isGroup: false, parentId: "5000" },
  { code: "5400", name: "Depreciation Expense", type: "EXPENSE", naturalBalance: "DEBIT", statement: "PROFIT_AND_LOSS", isGroup: false, parentId: "5000" },
];

export interface TrialBalanceItem {
  code: string;
  name: string;
  type: AccountType;
  debit: number;
  credit: number;
  balance: number;
}

export interface TrialBalanceReport {
  generatedAt: string;
  items: TrialBalanceItem[];
  totalDebit: number;
  totalCredit: number;
  difference: number;
  isBalanced: boolean;
}

export interface ProfitAndLossReport {
  period: string;
  revenue: { items: { code: string; name: string; amount: number }[]; total: number };
  expenses: { items: { code: string; name: string; amount: number }[]; total: number };
  netProfit: number;
}

export interface BalanceSheetReport {
  asOfDate: string;
  assets: { items: { code: string; name: string; amount: number }[]; total: number };
  liabilities: { items: { code: string; name: string; amount: number }[]; total: number };
  equity: { items: { code: string; name: string; amount: number }[]; total: number; currentPeriodProfit: number };
  totalAssets?: number;
  totalLiabilitiesAndEquity: number;
  isBalanced: boolean;
}

export interface AgeingItem {
  id: string;
  reference: string;
  partyName: string;
  dueDate: string;
  amount: number;
  daysOverdue: number;
  bucket: "0_30" | "31_60" | "61_90" | "90_PLUS";
}

export interface AgeingReport {
  referenceDate: string;
  items: AgeingItem[];
  bucketTotals: {
    b0_30: number;
    b31_60: number;
    b61_90: number;
    b90Plus: number;
    total: number;
  };
}

/**
 * 1. Double-Entry Voucher Validator
 */
export function validateVoucherBalance(
  lines: Array<{
    ledgerAccountCode?: string;
    accountCode?: string;
    debit?: number;
    credit?: number;
  }>,
) {
  const totalDebit = Math.round(lines.reduce((acc, l) => acc + (l.debit || 0), 0) * 100) / 100;
  const totalCredit = Math.round(lines.reduce((acc, l) => acc + (l.credit || 0), 0) * 100) / 100;
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  if (!isBalanced) {
    throw new Error(
      `Debit and credit totals must balance. Debit: ₹${totalDebit.toFixed(2)}, Credit: ₹${totalCredit.toFixed(2)}`,
    );
  }

  return {
    isValid: true,
    totalDebit,
    totalCredit,
  };
}

export function validateAndBalanceVoucher(
  lines: JournalLineItem[],
  header: Omit<JournalVoucher, "lines" | "totalDebit" | "totalCredit" | "isBalanced">
): JournalVoucher {
  const normalizedLines = lines.map((l) => ({
    ...l,
    accountCode: l.accountCode || l.ledgerAccountCode || "",
    ledgerAccountCode: l.ledgerAccountCode || l.accountCode || "",
  }));
  const totalDebit = Math.round(normalizedLines.reduce((acc, l) => acc + (l.debit || 0), 0) * 100) / 100;
  const totalCredit = Math.round(normalizedLines.reduce((acc, l) => acc + (l.credit || 0), 0) * 100) / 100;
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  return {
    ...header,
    lines: normalizedLines,
    totalDebit,
    totalCredit,
    isBalanced,
  };
}

/**
 * 2. Automated GL Posting Generators
 */

// Sales Voucher: On Invoice Issued
export function createSalesVoucher(invoice: {
  id?: string;
  voucherNumber?: string;
  voucherDate?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  clientName?: string;
  customerName?: string;
  taxableAmount: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  grandTotal?: number;
  totalInvoiceAmount?: number;
}): JournalVoucher {
  const client = invoice.clientName || invoice.customerName || "Customer";
  const invNum = invoice.invoiceNumber || invoice.voucherNumber || "INV";
  const invDate = invoice.invoiceDate || invoice.voucherDate || new Date().toISOString().slice(0, 10);
  const total = invoice.grandTotal ?? invoice.totalInvoiceAmount ?? (
    invoice.taxableAmount + (invoice.cgstAmount || 0) + (invoice.sgstAmount || 0) + (invoice.igstAmount || 0)
  );

  const lines: JournalLineItem[] = [
    {
      accountCode: "1110",
      accountName: "Trade Receivables",
      debit: total,
      credit: 0,
      description: `Receivable from ${client} - Inv ${invNum}`,
    },
    {
      accountCode: "4100",
      accountName: "Institutional Delivery Revenue",
      debit: 0,
      credit: invoice.taxableAmount,
      description: `Sales revenue for Inv ${invNum}`,
    },
  ];

  if ((invoice.cgstAmount || 0) > 0) {
    lines.push({
      accountCode: "2141",
      accountName: "CGST Output",
      debit: 0,
      credit: invoice.cgstAmount!,
      description: `CGST Output on Inv ${invNum}`,
    });
  }
  if ((invoice.sgstAmount || 0) > 0) {
    lines.push({
      accountCode: "2142",
      accountName: "SGST Output",
      debit: 0,
      credit: invoice.sgstAmount!,
      description: `SGST Output on Inv ${invNum}`,
    });
  }
  if ((invoice.igstAmount || 0) > 0) {
    lines.push({
      accountCode: "2143",
      accountName: "IGST Output",
      debit: 0,
      credit: invoice.igstAmount!,
      description: `IGST Output on Inv ${invNum}`,
    });
  }

  return validateAndBalanceVoucher(lines, {
    voucherNumber: invoice.voucherNumber || `V-SLS-${invNum}`,
    voucherType: "SALES",
    date: invDate,
    referenceId: invoice.id || invNum,
    referenceType: "INVOICE",
    description: `Sales Voucher: ${invNum} - ${client}`,
  });
}

// Receipt Voucher: On Client Payment Received
export function createReceiptVoucher(payment: {
  id?: string;
  voucherNumber?: string;
  voucherDate?: string;
  paymentNumber?: string;
  paymentDate?: string;
  clientName?: string;
  customerName?: string;
  amount?: number;
  amountReceived?: number;
  paymentMethod?: string;
  paymentMode?: string;
}): JournalVoucher {
  const client = payment.clientName || payment.customerName || "Customer";
  const num = payment.paymentNumber || payment.voucherNumber || "RCT";
  const pDate = payment.paymentDate || payment.voucherDate || new Date().toISOString().slice(0, 10);
  const amt = payment.amount ?? payment.amountReceived ?? 0;
  const method = payment.paymentMethod || payment.paymentMode || "BANK";

  const lines: JournalLineItem[] = [
    {
      accountCode: "1121",
      accountName: "Bank Operating Account",
      debit: amt,
      credit: 0,
      description: `Payment received via ${method} from ${client}`,
    },
    {
      accountCode: "1110",
      accountName: "Trade Receivables",
      debit: 0,
      credit: amt,
      description: `Clearing receivable for ${client}`,
    },
  ];

  return validateAndBalanceVoucher(lines, {
    voucherNumber: payment.voucherNumber || `V-RCT-${num}`,
    voucherType: "RECEIPT",
    date: pDate,
    referenceId: payment.id || num,
    referenceType: "PAYMENT",
    description: `Receipt Voucher: ${num} from ${client}`,
  });
}

// Purchase Voucher: On Vendor Expense Approved
export function createPurchaseVoucher(expense: {
  id?: string;
  voucherNumber?: string;
  voucherDate?: string;
  expenseNumber?: string;
  expenseDate?: string;
  vendorName: string;
  category?: string;
  expenseAccountCode?: string;
  taxableAmount: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  tdsDeducted?: number;
  grandTotal?: number;
  totalExpenseAmount?: number;
  isBlockedItc?: boolean;
  isSection17_5Blocked?: boolean;
}): JournalVoucher {
  const lines: JournalLineItem[] = [];
  const num = expense.expenseNumber || expense.voucherNumber || "EXP";
  const expDate = expense.expenseDate || expense.voucherDate || new Date().toISOString().slice(0, 10);
  const cat = expense.category || "General";
  const expCode = expense.expenseAccountCode || "5300";
  const isBlocked = !!(expense.isBlockedItc || expense.isSection17_5Blocked);
  const gstTotal = (expense.cgstAmount || 0) + (expense.sgstAmount || 0) + (expense.igstAmount || 0);
  const grandTotal = expense.grandTotal ?? expense.totalExpenseAmount ?? (expense.taxableAmount + gstTotal);

  if (isBlocked) {
    // If blocked under s.17(5), entire amount (taxable + tax) is debited to the expense account!
    lines.push({
      accountCode: expCode,
      accountName: `Operating Expense: ${cat}`,
      debit: expense.taxableAmount + gstTotal,
      credit: 0,
      description: `${cat} expense from ${expense.vendorName} (including non-creditable GST s.17(5))`,
    });
  } else {
    lines.push({
      accountCode: expCode,
      accountName: `Operating Expense: ${cat}`,
      debit: expense.taxableAmount,
      credit: 0,
      description: `${cat} expense from ${expense.vendorName}`,
    });

    if ((expense.cgstAmount || 0) > 0) {
      lines.push({
        accountCode: "1131",
        accountName: "CGST Input",
        debit: expense.cgstAmount!,
        credit: 0,
        description: `CGST Input on ${num}`,
      });
    }
    if ((expense.sgstAmount || 0) > 0) {
      lines.push({
        accountCode: "1132",
        accountName: "SGST Input",
        debit: expense.sgstAmount!,
        credit: 0,
        description: `SGST Input on ${num}`,
      });
    }
    if ((expense.igstAmount || 0) > 0) {
      lines.push({
        accountCode: "1133",
        accountName: "IGST Input",
        debit: expense.igstAmount!,
        credit: 0,
        description: `IGST Input on ${num}`,
      });
    }
  }

  const tds = expense.tdsDeducted || 0;
  if (tds > 0) {
    lines.push({
      accountCode: "2125",
      accountName: "TDS Payable (Vendors - Sec 194C/J)",
      debit: 0,
      credit: tds,
      description: `TDS deducted on ${num}`,
    });
  }

  const netPayableToVendor = Math.round((grandTotal - tds) * 100) / 100;
  lines.push({
    accountCode: "2110",
    accountName: "Trade Payables (Vendors)",
    debit: 0,
    credit: netPayableToVendor,
    description: `Payable to ${expense.vendorName}`,
  });

  return validateAndBalanceVoucher(lines, {
    voucherNumber: expense.voucherNumber || `V-PUR-${num}`,
    voucherType: "PURCHASE",
    date: expDate,
    referenceId: expense.id || num,
    referenceType: "EXPENSE",
    description: `Purchase Voucher: ${num} - ${expense.vendorName}`,
  });
}

// Payroll Disbursal Voucher: On Payroll Finalized/Paid
export function createPayrollVoucher(payroll: {
  periodId?: string;
  voucherNumber?: string;
  voucherDate?: string;
  periodLabel?: string;
  runDate?: string;
  grossEarnings?: number;
  grossSalaries?: number;
  employeePf?: number;
  employeeEpfTotal?: number;
  employerPfTotal?: number;
  employeeEsi?: number;
  employeeEsiTotal?: number;
  employerEsi?: number;
  employerEsiTotal?: number;
  professionalTax?: number;
  professionalTaxTotal?: number;
  tdsTotal?: number;
  tdsTaxTotal?: number;
  netPay?: number;
  netSalariesPayable?: number;
}): JournalVoucher {
  const pId = payroll.periodId || "PERIOD";
  const pLabel = payroll.periodLabel || "Current Month";
  const rDate = payroll.runDate || payroll.voucherDate || new Date().toISOString().slice(0, 10);
  const gross = payroll.grossEarnings ?? payroll.grossSalaries ?? 0;
  const empPf = payroll.employeePf ?? payroll.employeeEpfTotal ?? 0;
  const emplyrPf = payroll.employerPfTotal ?? 0;
  const empEsi = payroll.employeeEsi ?? payroll.employeeEsiTotal ?? 0;
  const emplyrEsi = payroll.employerEsi ?? payroll.employerEsiTotal ?? 0;
  const pt = payroll.professionalTax ?? payroll.professionalTaxTotal ?? 0;
  const tds = payroll.tdsTotal ?? payroll.tdsTaxTotal ?? 0;
  const net = payroll.netPay ?? payroll.netSalariesPayable ?? (gross - empPf - empEsi - pt - tds);

  const lines: JournalLineItem[] = [
    {
      accountCode: "5110",
      accountName: "Salaries & Wages",
      debit: gross,
      credit: 0,
      description: `Gross payroll for ${pLabel}`,
    },
    {
      accountCode: "5120",
      accountName: "Employer PF Contribution",
      debit: emplyrPf,
      credit: 0,
      description: `Employer PF (EPF + EPS + EDLI + Admin) for ${pLabel}`,
    },
  ];

  if (emplyrEsi > 0) {
    lines.push({
      accountCode: "5130",
      accountName: "Employer ESI Contribution",
      debit: emplyrEsi,
      credit: 0,
      description: `Employer ESI for ${pLabel}`,
    });
  }

  const totalPfDues = Math.round((empPf + emplyrPf) * 100) / 100;
  if (totalPfDues > 0) {
    lines.push({
      accountCode: "2121",
      accountName: "PF Payable",
      debit: 0,
      credit: totalPfDues,
      description: `EPFO Remittance Due for ${pLabel}`,
    });
  }

  if (empEsi + emplyrEsi > 0) {
    lines.push({
      accountCode: "2122",
      accountName: "ESI Payable",
      debit: 0,
      credit: Math.round((empEsi + emplyrEsi) * 100) / 100,
      description: `ESIC Remittance Due for ${pLabel}`,
    });
  }

  if (pt > 0) {
    lines.push({
      accountCode: "2123",
      accountName: "Professional Tax Payable",
      debit: 0,
      credit: pt,
      description: `Telangana PT Due for ${pLabel}`,
    });
  }

  if (tds > 0) {
    lines.push({
      accountCode: "2124",
      accountName: "TDS Payable (Salaries - Sec 192)",
      debit: 0,
      credit: tds,
      description: `Income Tax TDS Due for ${pLabel}`,
    });
  }

  lines.push({
    accountCode: "2130",
    accountName: "Salary Payable",
    debit: 0,
    credit: net,
    description: `Net salary payout to staff for ${pLabel}`,
  });

  return validateAndBalanceVoucher(lines, {
    voucherNumber: payroll.voucherNumber || `V-PAY-${pId}`,
    voucherType: "PAYROLL",
    date: rDate,
    referenceId: pId,
    referenceType: "PAYROLL_RUN",
    description: `Payroll Accrual Voucher: ${pLabel}`,
  });
}

/**
 * 3. Financial Statements Compilation Engine
 */
export function compileFinancialStatements(
  accountsOrTrialBalance: FinancialAccountInput[] | Array<{ code: string; name: string; type: AccountType; balance: number }>,
  postedVouchers?: JournalVoucher[]
): {
  trialBalance: TrialBalanceReport;
  profitAndLoss: ProfitAndLossReport & { totalRevenue?: number; totalExpenses?: number; netProfitOrLoss?: number };
  balanceSheet: BalanceSheetReport;
} {
  // If called directly with trial balance item balances
  if (Array.isArray(accountsOrTrialBalance) && !postedVouchers && accountsOrTrialBalance.length > 0 && "balance" in accountsOrTrialBalance[0]) {
    const rawRows = accountsOrTrialBalance as Array<{ code: string; name: string; type: AccountType; balance: number }>;
    let totalDebit = 0;
    let totalCredit = 0;
    const tbItems: TrialBalanceItem[] = [];

    let totalRevenue = 0;
    let totalExpenses = 0;
    const pnlRevenue: ProfitAndLossReport["revenue"]["items"] = [];
    const pnlExpenses: ProfitAndLossReport["expenses"]["items"] = [];

    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalEquity = 0;
    const bsAssets: BalanceSheetReport["assets"]["items"] = [];
    const bsLiabilities: BalanceSheetReport["liabilities"]["items"] = [];
    const bsEquity: BalanceSheetReport["equity"]["items"] = [];

    for (const row of rawRows) {
      const isDebit = row.balance > 0;
      const d = isDebit ? row.balance : 0;
      const c = isDebit ? 0 : Math.abs(row.balance);
      totalDebit += d;
      totalCredit += c;

      tbItems.push({
        code: row.code,
        name: row.name,
        type: row.type,
        debit: d,
        credit: c,
        balance: row.balance,
      });

      if (row.type === "REVENUE" || row.type === "INCOME") {
        const amt = Math.abs(row.balance);
        totalRevenue += amt;
        pnlRevenue.push({ code: row.code, name: row.name, amount: amt });
      } else if (row.type === "EXPENSE") {
        const amt = Math.abs(row.balance);
        totalExpenses += amt;
        pnlExpenses.push({ code: row.code, name: row.name, amount: amt });
      } else if (row.type === "ASSET") {
        totalAssets += row.balance;
        bsAssets.push({ code: row.code, name: row.name, amount: row.balance });
      } else if (row.type === "LIABILITY") {
        const amt = Math.abs(row.balance);
        totalLiabilities += amt;
        bsLiabilities.push({ code: row.code, name: row.name, amount: amt });
      } else if (row.type === "EQUITY") {
        const amt = Math.abs(row.balance);
        totalEquity += amt;
        bsEquity.push({ code: row.code, name: row.name, amount: amt });
      }
    }

    const netProfitOrLoss = totalRevenue - totalExpenses;
    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity + netProfitOrLoss;

    return {
      trialBalance: {
        generatedAt: new Date().toISOString(),
        items: tbItems,
        totalDebit,
        totalCredit,
        difference: Math.abs(totalDebit - totalCredit),
        isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
      },
      profitAndLoss: {
        period: "FY 2026-27",
        revenue: { items: pnlRevenue, total: totalRevenue },
        expenses: { items: pnlExpenses, total: totalExpenses },
        totalRevenue,
        totalExpenses,
        netProfit: netProfitOrLoss,
        netProfitOrLoss,
      },
      balanceSheet: {
        asOfDate: new Date().toISOString(),
        assets: { items: bsAssets, total: totalAssets },
        liabilities: { items: bsLiabilities, total: totalLiabilities },
        equity: { items: bsEquity, total: totalEquity, currentPeriodProfit: netProfitOrLoss },
        totalAssets,
        totalLiabilitiesAndEquity,
        isBalanced: Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01,
      },
    };
  }

  const accounts = accountsOrTrialBalance as FinancialAccountInput[];
  const vouchers = postedVouchers || [];
  const ledgerMap = new Map<string, { debit: number; credit: number }>();
  for (const acc of accounts) {
    ledgerMap.set(acc.code, { debit: 0, credit: 0 });
  }

  for (const voucher of vouchers) {
    if (!voucher.isBalanced) continue;
    for (const line of voucher.lines) {
      const entry = ledgerMap.get(line.accountCode) || { debit: 0, credit: 0 };
      entry.debit += line.debit;
      entry.credit += line.credit;
      ledgerMap.set(line.accountCode, entry);
    }
  }

  const tbItems: TrialBalanceItem[] = [];
  let totalDebit = 0;
  let totalCredit = 0;

  for (const acc of accounts) {
    if (acc.isGroup) continue;
    const totals = ledgerMap.get(acc.code) || { debit: 0, credit: 0 };
    if (totals.debit === 0 && totals.credit === 0) continue;

    const netDebit = totals.debit;
    const netCredit = totals.credit;
    totalDebit += netDebit;
    totalCredit += netCredit;

    const balance = acc.naturalBalance === "DEBIT" ? netDebit - netCredit : netCredit - netDebit;

    tbItems.push({
      code: acc.code,
      name: acc.name,
      type: acc.type,
      debit: Math.round(netDebit * 100) / 100,
      credit: Math.round(netCredit * 100) / 100,
      balance: Math.round(balance * 100) / 100,
    });
  }

  totalDebit = Math.round(totalDebit * 100) / 100;
  totalCredit = Math.round(totalCredit * 100) / 100;
  const difference = Math.round(Math.abs(totalDebit - totalCredit) * 100) / 100;

  const trialBalance: TrialBalanceReport = {
    generatedAt: new Date().toISOString(),
    items: tbItems,
    totalDebit,
    totalCredit,
    difference,
    isBalanced: difference < 0.01,
  };

  const pnlRevenueItems: { code: string; name: string; amount: number }[] = [];
  let totalRevenue = 0;
  const pnlExpenseItems: { code: string; name: string; amount: number }[] = [];
  let totalExpense = 0;

  for (const item of tbItems) {
    if (item.type === "INCOME") {
      const amount = item.credit - item.debit;
      pnlRevenueItems.push({ code: item.code, name: item.name, amount });
      totalRevenue += amount;
    } else if (item.type === "EXPENSE") {
      const amount = item.debit - item.credit;
      pnlExpenseItems.push({ code: item.code, name: item.name, amount });
      totalExpense += amount;
    }
  }

  totalRevenue = Math.round(totalRevenue * 100) / 100;
  totalExpense = Math.round(totalExpense * 100) / 100;
  const netProfit = Math.round((totalRevenue - totalExpense) * 100) / 100;

  const profitAndLoss = {
    period: "Current Financial Year",
    revenue: { items: pnlRevenueItems, total: totalRevenue },
    expenses: { items: pnlExpenseItems, total: totalExpense },
    totalRevenue,
    totalExpenses: totalExpense,
    netProfit,
    netProfitOrLoss: netProfit,
  };

  const bsAssetItems: { code: string; name: string; amount: number }[] = [];
  let totalAssets = 0;
  const bsLiabilityItems: { code: string; name: string; amount: number }[] = [];
  let totalLiabilities = 0;
  const bsEquityItems: { code: string; name: string; amount: number }[] = [];
  let totalEquity = 0;

  for (const item of tbItems) {
    if (item.type === "ASSET") {
      const amount = item.debit - item.credit;
      bsAssetItems.push({ code: item.code, name: item.name, amount });
      totalAssets += amount;
    } else if (item.type === "LIABILITY") {
      const amount = item.credit - item.debit;
      bsLiabilityItems.push({ code: item.code, name: item.name, amount });
      totalLiabilities += amount;
    } else if (item.type === "EQUITY") {
      const amount = item.credit - item.debit;
      bsEquityItems.push({ code: item.code, name: item.name, amount });
      totalEquity += amount;
    }
  }

  totalEquity += netProfit;

  totalAssets = Math.round(totalAssets * 100) / 100;
  totalLiabilities = Math.round(totalLiabilities * 100) / 100;
  totalEquity = Math.round(totalEquity * 100) / 100;
  const totalLiabilitiesAndEquity = Math.round((totalLiabilities + totalEquity) * 100) / 100;

  const balanceSheet: BalanceSheetReport = {
    asOfDate: new Date().toISOString(),
    assets: { items: bsAssetItems, total: totalAssets },
    liabilities: { items: bsLiabilityItems, total: totalLiabilities },
    equity: { items: bsEquityItems, total: totalEquity, currentPeriodProfit: netProfit },
    totalLiabilitiesAndEquity,
    isBalanced: Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.05,
  };

  return { trialBalance, profitAndLoss, balanceSheet };
}

/**
 * 4. Receivables & Payables Ageing Analysis
 */
export function calculateAgeing(
  documents: Array<{
    id: string;
    reference?: string;
    invoiceNumber?: string;
    partyName?: string;
    counterpartyName?: string;
    dueDate: string;
    balanceDue: number;
  }>,
  asOfDate = new Date()
) {
  const items: AgeingItem[] = [];
  let current_0_30 = 0;
  let days_31_60 = 0;
  let days_61_90 = 0;
  let days_90_plus = 0;
  let totalDue = 0;

  for (const doc of documents) {
    if (doc.balanceDue <= 0) continue;
    const dueTime = new Date(doc.dueDate).getTime();
    const diffDays = Math.max(0, Math.floor((asOfDate.getTime() - dueTime) / (1000 * 60 * 60 * 24)));

    let bucket: AgeingItem["bucket"] = "0_30";
    if (diffDays > 90) {
      bucket = "90_PLUS";
      days_90_plus += doc.balanceDue;
    } else if (diffDays > 60) {
      bucket = "61_90";
      days_61_90 += doc.balanceDue;
    } else if (diffDays > 30) {
      bucket = "31_60";
      days_31_60 += doc.balanceDue;
    } else {
      current_0_30 += doc.balanceDue;
    }
    totalDue += doc.balanceDue;

    items.push({
      id: doc.id,
      reference: doc.reference || doc.invoiceNumber || doc.id,
      partyName: doc.partyName || doc.counterpartyName || "Party",
      dueDate: doc.dueDate,
      amount: doc.balanceDue,
      daysOverdue: diffDays,
      bucket,
    });
  }

  return {
    referenceDate: asOfDate.toISOString(),
    totalDue: Math.round(totalDue * 100) / 100,
    buckets: {
      current_0_30: Math.round(current_0_30 * 100) / 100,
      days_31_60: Math.round(days_31_60 * 100) / 100,
      days_61_90: Math.round(days_61_90 * 100) / 100,
      days_90_plus: Math.round(days_90_plus * 100) / 100,
    },
    bucketTotals: {
      b0_30: Math.round(current_0_30 * 100) / 100,
      b31_60: Math.round(days_31_60 * 100) / 100,
      b61_90: Math.round(days_61_90 * 100) / 100,
      b90Plus: Math.round(days_90_plus * 100) / 100,
      total: Math.round(totalDue * 100) / 100,
    },
    items,
  };
}
