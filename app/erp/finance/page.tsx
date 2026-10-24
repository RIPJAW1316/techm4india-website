'use client';

import React, { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { hrmsClient } from '@/lib/hrms-client';
import './finance.css';
import { FinanceHeader } from './components/FinanceHeader';
import { FinancialOverview } from './components/FinancialOverview';
import { GeneralLedger } from './components/GeneralLedger';
import { InvoicingPipeline } from './components/InvoicingPipeline';
import { PayablesExpenses } from './components/PayablesExpenses';
import { GstComplianceCenter } from './components/GstComplianceCenter';
import { FinancialStatements } from './components/FinancialStatements';
import {
  AccountItem,
  DivisionCode,
  ExpenseItem,
  InvoiceItem,
  JournalEntryItem,
  VendorItem,
  HrmsClaimItem,
} from './types';

// ==============================================================================
// CHART OF ACCOUNTS MASTER (Zero Baseline - Ready for live operations)
// ==============================================================================

const initialAccounts: AccountItem[] = [
  // Assets
  { id: 'acc-1010', code: '1010', name: 'HDFC Bank Operating Current A/C', type: 'ASSET', category: 'BANK_ACCOUNTS', currency: 'INR', balance: 0, isActive: true },
  { id: 'acc-1020', code: '1020', name: 'ICICI Bank Secondary Operating A/C', type: 'ASSET', category: 'BANK_ACCOUNTS', currency: 'INR', balance: 0, isActive: true },
  { id: 'acc-1030', code: '1030', name: 'Petty Cash Hyderabad HQ', type: 'ASSET', category: 'CASH', currency: 'INR', balance: 0, isActive: true },
  { id: 'acc-1100', code: '1100', name: 'Accounts Receivable (Trade Debtors)', type: 'ASSET', category: 'CURRENT_ASSETS', currency: 'INR', balance: 0, isActive: true },
  { id: 'acc-1200', code: '1200', name: 'Input Tax Credit - IGST Receivable', type: 'ASSET', category: 'TAX_RECEIVABLE', currency: 'INR', balance: 0, isActive: true },
  { id: 'acc-1210', code: '1210', name: 'Input Tax Credit - CGST Receivable', type: 'ASSET', category: 'TAX_RECEIVABLE', currency: 'INR', balance: 0, isActive: true },
  { id: 'acc-1220', code: '1220', name: 'Input Tax Credit - SGST Receivable', type: 'ASSET', category: 'TAX_RECEIVABLE', currency: 'INR', balance: 0, isActive: true },
  { id: 'acc-1500', code: '1500', name: 'STEM Labs & Hardware Equipment', type: 'ASSET', category: 'FIXED_ASSETS', currency: 'INR', balance: 0, isActive: true },

  // Liabilities
  { id: 'acc-2010', code: '2010', name: 'Accounts Payable (Trade Creditors)', type: 'LIABILITY', category: 'CURRENT_LIABILITIES', currency: 'INR', balance: 0, isActive: true },
  { id: 'acc-2100', code: '2100', name: 'Output GST Payable (Net Central & State)', type: 'LIABILITY', category: 'TAX_PAYABLE', currency: 'INR', balance: 0, isActive: true },
  { id: 'acc-2150', code: '2150', name: 'TDS Payable (Section 194C & 194J)', type: 'LIABILITY', category: 'TAX_PAYABLE', currency: 'INR', balance: 0, isActive: true },

  // Equity
  { id: 'acc-3010', code: '3010', name: 'Paid-up Equity Share Capital', type: 'EQUITY', category: 'SHARE_CAPITAL', currency: 'INR', balance: 0, isActive: true },
  { id: 'acc-3020', code: '3020', name: 'Retained Earnings & Reserves', type: 'EQUITY', category: 'RESERVES', currency: 'INR', balance: 0, isActive: true },

  // Income / Revenue (Division-wise)
  { id: 'acc-4010', code: '4010', name: 'Revenue: TechM4Solutions Software', type: 'INCOME', category: 'OPERATING_REVENUE', currency: 'INR', balance: 0, isActive: true },
  { id: 'acc-4020', code: '4020', name: 'Revenue: TechM4Engineering COE Labs', type: 'INCOME', category: 'OPERATING_REVENUE', currency: 'INR', balance: 0, isActive: true },
  { id: 'acc-4030', code: '4030', name: 'Revenue: TechM4Schools STEM Programs', type: 'INCOME', category: 'OPERATING_REVENUE', currency: 'INR', balance: 0, isActive: true },
  { id: 'acc-4040', code: '4040', name: 'Revenue: TechM4Space CanSat Aerospace', type: 'INCOME', category: 'OPERATING_REVENUE', currency: 'INR', balance: 0, isActive: true },
  { id: 'acc-4050', code: '4050', name: 'Revenue: Horizon Startup School', type: 'INCOME', category: 'OPERATING_REVENUE', currency: 'INR', balance: 0, isActive: true },

  // Expenses
  { id: 'acc-5010', code: '5010', name: 'Cloud Infrastructure & GPU Compute', type: 'EXPENSE', category: 'DIRECT_COSTS', currency: 'INR', balance: 0, isActive: true },
  { id: 'acc-5020', code: '5020', name: 'Lab Hardware & Components Procurement', type: 'EXPENSE', category: 'DIRECT_COSTS', currency: 'INR', balance: 0, isActive: true },
  { id: 'acc-5030', code: '5030', name: 'Technical Honorarium & SME Payouts', type: 'EXPENSE', category: 'DIRECT_COSTS', currency: 'INR', balance: 0, isActive: true },
  { id: 'acc-5100', code: '5100', name: 'Employee Salaries & Allowances', type: 'EXPENSE', category: 'OPERATING_EXPENSES', currency: 'INR', balance: 0, isActive: true },
  { id: 'acc-5200', code: '5200', name: 'Corporate Office Rent & Facility', type: 'EXPENSE', category: 'ADMIN_OVERHEADS', currency: 'INR', balance: 0, isActive: true },
];

const initialJournalEntries: JournalEntryItem[] = [];
const initialInvoices: InvoiceItem[] = [];
const initialVendors: VendorItem[] = [];
const initialExpenses: ExpenseItem[] = [];
const initialHrmsClaims: HrmsClaimItem[] = [];

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedDivision, setSelectedDivision] = useState<DivisionCode>('ALL');

  // Application Data States
  const [accounts, setAccounts] = useState<AccountItem[]>(initialAccounts);
  const [journalEntries, setJournalEntries] = useState<JournalEntryItem[]>(initialJournalEntries);
  const [invoices, setInvoices] = useState<InvoiceItem[]>(initialInvoices);
  const [vendors, setVendors] = useState<VendorItem[]>(initialVendors);
  const [expenses, setExpenses] = useState<ExpenseItem[]>(initialExpenses);
  const [hrmsClaims, setHrmsClaims] = useState<HrmsClaimItem[]>(initialHrmsClaims);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync with live HRMS claims if API is accessible
  useEffect(() => {
    hrmsClient
      .getApprovedClaimsForFinance()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setHrmsClaims(res.data);
        }
      })
      .catch(() => {
        // Fallback to initial seed gracefully
      });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handlers
  const handleAddJournalEntry = (entry: any) => {
    const newEntry: JournalEntryItem = {
      id: `jv-${Date.now()}`,
      entryNumber: `JV-2026-${String(journalEntries.length + 42).padStart(5, '0')}`,
      date: entry.date,
      voucherType: entry.voucherType,
      reference: entry.reference,
      narration: entry.narration,
      status: 'DRAFT',
      division: entry.division,
      totalDebit: entry.lineItems.reduce((acc: number, l: any) => acc + l.debitAmount, 0),
      totalCredit: entry.lineItems.reduce((acc: number, l: any) => acc + l.creditAmount, 0),
      lineItems: entry.lineItems,
    };

    setJournalEntries([newEntry, ...journalEntries]);
    showToast(`Journal Entry ${newEntry.entryNumber} created in DRAFT state.`);
  };

  const handlePostJournal = (id: string) => {
    const target = journalEntries.find((j) => j.id === id);
    if (!target) return;

    // Update entry status
    setJournalEntries(
      journalEntries.map((j) => (j.id === id ? { ...j, status: 'POSTED' } : j)),
    );

    // Update account balances
    const updatedAccounts = accounts.map((acc) => {
      const line = target.lineItems.find((l) => l.accountId === acc.id);
      if (!line) return acc;

      const isDebitClass = acc.type === 'ASSET' || acc.type === 'EXPENSE';
      const delta = isDebitClass
        ? line.debitAmount - line.creditAmount
        : line.creditAmount - line.debitAmount;

      return {
        ...acc,
        balance: acc.balance + delta,
      };
    });

    setAccounts(updatedAccounts);
    showToast(`Journal ${target.entryNumber} posted to General Ledger.`);
  };

  const handleReverseJournal = (id: string) => {
    const target = journalEntries.find((j) => j.id === id);
    if (!target) return;

    // Mark original as reversed
    const updatedJournals = journalEntries.map((j) =>
      j.id === id ? { ...j, status: 'REVERSED' as const, isReversed: true } : j,
    );

    // Create offsetting reversal journal
    const reversalEntry: JournalEntryItem = {
      id: `rev-${Date.now()}`,
      entryNumber: `REV-2026-${String(journalEntries.length + 50).padStart(5, '0')}`,
      date: new Date().toISOString().slice(0, 10),
      voucherType: target.voucherType,
      reference: `REVERSAL of ${target.entryNumber}`,
      narration: `Reversal of ${target.entryNumber}: Offset adjustment`,
      status: 'POSTED',
      division: target.division,
      totalDebit: target.totalCredit,
      totalCredit: target.totalDebit,
      lineItems: target.lineItems.map((l) => ({
        ...l,
        debitAmount: l.creditAmount,
        creditAmount: l.debitAmount,
        description: `Offsetting reversal`,
      })),
    };

    setJournalEntries([reversalEntry, ...updatedJournals]);
    showToast(`Reversal entry ${reversalEntry.entryNumber} created & posted.`);
  };

  const handleCreateInvoice = (inv: any) => {
    const count = invoices.length + 104;
    const invoiceNumber = `INV-2026-${String(count).padStart(5, '0')}`;
    const newInvoice: InvoiceItem = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      customerId: `cust-${Date.now()}`,
      customerName: inv.customerName,
      customerGstin: inv.customerGstin,
      stateCode: inv.stateCode,
      placeOfSupply: inv.placeOfSupply,
      type: inv.type,
      status: 'SENT',
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: inv.dueDate,
      currency: 'INR',
      subtotal: inv.subtotal,
      discount: inv.discount,
      taxableAmount: inv.taxableAmount,
      cgst: inv.cgst,
      sgst: inv.sgst,
      igst: inv.igst,
      totalAmount: inv.totalAmount,
      amountPaid: 0,
      balanceDue: inv.totalAmount,
      paymentTerms: 'Net 30',
      division: inv.division,
      razorpayPaymentLink: `https://rzp.io/i/tm4_${invoiceNumber.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      irn: `irn_${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      items: inv.items,
    };

    setInvoices([newInvoice, ...invoices]);
    showToast(`Invoice ${invoiceNumber} issued with GST calculations.`);
  };

  const handleRecordPayment = (invoiceId: string, amount: number) => {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv) return;

    const newAmountPaid = inv.amountPaid + amount;
    const newBalanceDue = Math.max(0, inv.balanceDue - amount);
    const newStatus = newBalanceDue <= 0.01 ? 'PAID' : 'PARTIALLY_PAID';

    setInvoices(
      invoices.map((i) =>
        i.id === invoiceId
          ? {
              ...i,
              amountPaid: newAmountPaid,
              balanceDue: newBalanceDue,
              status: newStatus,
            }
          : i,
      ),
    );

    // Update liquid bank account balance
    setAccounts(
      accounts.map((a) =>
        a.id === 'acc-1010' ? { ...a, balance: a.balance + amount } : a,
      ),
    );

    showToast(`Payment of ₹${amount.toLocaleString('en-IN')} recorded against ${inv.invoiceNumber}.`);
  };

  const handleCreateExpense = (exp: any) => {
    const count = expenses.length + 53;
    const expenseNumber = `EXP-2026-${String(count).padStart(5, '0')}`;
    const newExp: ExpenseItem = {
      id: `exp-${Date.now()}`,
      expenseNumber,
      vendorId: exp.vendorId,
      vendorName: exp.vendorName,
      category: exp.category,
      division: exp.division,
      description: exp.description,
      invoiceNumber: exp.invoiceNumber,
      dueDate: exp.dueDate,
      grossAmount: exp.grossAmount,
      tdsSection: exp.tdsSection,
      tdsRate: exp.tdsRate,
      tdsAmount: exp.tdsAmount,
      netPayable: exp.netPayable,
      status: 'SUBMITTED',
      approvalLevel: exp.approvalLevel,
      poNumber: exp.poNumber,
    };

    setExpenses([newExp, ...expenses]);
    showToast(`Bill ${expenseNumber} booked with Level ${exp.approvalLevel} routing.`);
  };

  const handleApproveExpense = (id: string) => {
    setExpenses(
      expenses.map((e) => (e.id === id ? { ...e, status: 'APPROVED' } : e)),
    );
    showToast(`Expense bill approved for payment.`);
  };

  const handlePayExpense = (id: string) => {
    const exp = expenses.find((e) => e.id === id);
    if (!exp) return;

    setExpenses(
      expenses.map((e) => (e.id === id ? { ...e, status: 'PAID' } : e)),
    );

    // Deduct from bank
    setAccounts(
      accounts.map((a) =>
        a.id === 'acc-1010' ? { ...a, balance: a.balance - exp.netPayable } : a,
      ),
    );

    showToast(`Payment of ₹${exp.netPayable.toLocaleString('en-IN')} disbursed for ${exp.expenseNumber}.`);
  };


  const handleSettleHrmsClaim = async (claimId: string, notes?: string) => {
    const claim = hrmsClaims.find((c) => c.id === claimId);
    if (!claim) return;

    const batchRef = `NEFT-TM4-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 9000 + 1000))}`;
    
    // Attempt backend settlement
    try {
      await hrmsClient.settleClaimInFinance(claimId, {
        batchReference: batchRef,
        notes: notes || 'Disbursed via Corporate HDFC NEFT Gateway',
      });
    } catch {
      // Continue optimistic local update
    }

    // Update claim status
    setHrmsClaims(
      hrmsClaims.map((c) =>
        c.id === claimId
          ? {
              ...c,
              status: 'SETTLED',
              settlementBatchRef: batchRef,
              reimbursementDate: new Date().toISOString().slice(0, 10),
            }
          : c
      )
    );

    // Create and post Payment Journal Voucher in GL
    const jvNumber = `JV-2026-${String(journalEntries.length + 50).padStart(5, '0')}`;
    const newJournal: JournalEntryItem = {
      id: `jv-${Date.now()}`,
      entryNumber: jvNumber,
      date: new Date().toISOString().slice(0, 10),
      voucherType: 'PAYMENT',
      reference: `REIMB-${claim.claimNumber}`,
      narration: `Settlement of HRMS Claim #${claim.claimNumber} for ${claim.employee?.firstName} ${claim.employee?.lastName} via NEFT. Batch: ${batchRef}`,
      status: 'POSTED',
      division: 'GENERAL_OVERHEAD',
      totalDebit: claim.totalAmount,
      totalCredit: claim.totalAmount,
      lineItems: [
        {
          accountId: 'acc-5100',
          accountName: 'Employee Salaries & Allowances',
          debitAmount: claim.totalAmount,
          creditAmount: 0,
          description: `Employee Reimbursement Expense: ${claim.claimNumber}`,
        },
        {
          accountId: 'acc-1010',
          accountName: 'HDFC Bank Operating Current A/C',
          debitAmount: 0,
          creditAmount: claim.totalAmount,
          description: `NEFT Disbursal to ${claim.employee?.bankName || 'Bank'} A/C ${claim.employee?.bankAccountNumber || ''}`,
        },
      ],
    };

    setJournalEntries([newJournal, ...journalEntries]);

    // Deduct from HDFC Bank Operating Account
    setAccounts(
      accounts.map((a) =>
        a.id === 'acc-1010' ? { ...a, balance: a.balance - claim.totalAmount } : a
      )
    );

    showToast(`Claim ${claim.claimNumber} settled via NEFT! Posted Payment Voucher ${jvNumber} to General Ledger.`);
  };

  const handleAccruePayrollRun = async () => {
    const grossSalary = 200000;
    const employerPf = 24000;
    const netSalary = 178800;
    const epfLiability = 48000;
    const ptLiability = 1000;
    const tdsLiability = 4200;

    const jvNumber = `JV-PAYROLL-2026-10`;
    const newJournal: JournalEntryItem = {
      id: `jv-${Date.now()}`,
      entryNumber: jvNumber,
      date: new Date().toISOString().slice(0, 10),
      voucherType: 'JOURNAL',
      reference: 'PAYROLL-RUN-2026-10',
      narration: 'Payroll Accrual for October 2026 (5 staff engineers). Gross Salary + Employer PF accrued against statutory liabilities and net disbursals.',
      status: 'POSTED',
      division: 'GENERAL_OVERHEAD',
      totalDebit: 224000,
      totalCredit: 224000,
      lineItems: [
        {
          accountId: 'acc-5100',
          accountName: 'Employee Salaries & Allowances',
          debitAmount: grossSalary,
          creditAmount: 0,
          description: 'Gross Salaries & Wages for October 2026',
        },
        {
          accountId: 'acc-5010',
          accountName: 'Employer EPF Contribution (12%)',
          debitAmount: employerPf,
          creditAmount: 0,
          description: 'Employer PF 12% Statutory Contribution',
        },
        {
          accountId: 'acc-2010',
          accountName: 'Accounts Payable (Net Salaries Payable)',
          debitAmount: 0,
          creditAmount: netSalary,
          description: 'Net Salary Payable to 5 Employees',
        },
        {
          accountId: 'acc-2100',
          accountName: 'EPF Statutory Remittance Payable',
          debitAmount: 0,
          creditAmount: epfLiability,
          description: 'EPF Remittance Liability (Employee 12% + Employer 12%)',
        },
        {
          accountId: 'acc-2150',
          accountName: 'Professional Tax Payable',
          debitAmount: 0,
          creditAmount: ptLiability,
          description: 'Telangana Professional Tax Withheld',
        },
        {
          accountId: 'acc-2150',
          accountName: 'TDS on Salaries Payable (Sec 192)',
          debitAmount: 0,
          creditAmount: tdsLiability,
          description: 'Income Tax TDS Withholding under Section 192',
        },
      ],
    };

    setJournalEntries([newJournal, ...journalEntries]);
    showToast('October 2026 Payroll Run Accrued! Balanced JV-PAYROLL-2026-10 posted to General Ledger.');
  };

  const handleExportTally = () => {
    // Generate standard Tally XML envelope
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<ENVELOPE>\n  <HEADER>\n    <TALLYREQUEST>Import Data</TALLYREQUEST>\n  </HEADER>\n  <BODY>\n    <IMPORTDATA>\n      <REQUESTDESC>\n        <REPORTNAME>All Masters and Vouchers</REPORTNAME>\n      </REQUESTDESC>\n      <REQUESTDATA>\n`;

    // Ledgers
    for (const acc of accounts) {
      xml += `        <TALLYMESSAGE xmlns:UDF="TallyUDF">\n          <LEDGER NAME="${acc.name}" RESERVEDNAME="">\n            <NAME>${acc.name}</NAME>\n            <PARENT>${acc.category}</PARENT>\n            <OPENINGBALANCE>${acc.balance}</OPENINGBALANCE>\n          </LEDGER>\n        </TALLYMESSAGE>\n`;
    }

    // Invoices
    for (const inv of invoices) {
      xml += `        <TALLYMESSAGE xmlns:UDF="TallyUDF">\n          <VOUCHER VCHTYPE="Sales" ACTION="Create">\n            <DATE>${inv.issueDate.replace(/-/g, '')}</DATE>\n            <VOUCHERNUMBER>${inv.invoiceNumber}</VOUCHERNUMBER>\n            <PARTYNAME>${inv.customerName}</PARTYNAME>\n            <AMOUNT>${inv.totalAmount}</AMOUNT>\n          </VOUCHER>\n        </TALLYMESSAGE>\n`;
    }

    xml += `      </REQUESTDATA>\n    </IMPORTDATA>\n  </BODY>\n</ENVELOPE>`;

    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TechM4India_Tally_FY2627_${new Date().toISOString().slice(0, 10)}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Tally Prime XML package exported successfully!');
  };

  return (
    <div className="finance-workbench min-h-screen text-[#20283b]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1f2946] border border-[#37446b] text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toastMessage}
        </div>
      )}


      {/* Port & Subdomain Banner */}
      <div className="bg-[#1f2946] text-white px-6 py-2 text-xs border-b border-[#37446b]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              <strong>TechM4 Finance ERP</strong> is configured as a standalone application on <strong>Port :3002</strong> (Local) &amp; Subdomain <strong>finance.techm4india.com</strong> (Production).
            </span>
          </div>
          <a
            href="http://localhost:3002"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#c62d37] hover:bg-[#a8222e] text-white font-semibold rounded-md transition shadow-xs text-[11px]"
          >
            <span>Launch Standalone App (:3002)</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Finance Header Navigation */}
      <FinanceHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedDivision={selectedDivision}
        setSelectedDivision={setSelectedDivision}
        onOpenNewInvoice={() => setActiveTab('invoicing')}
        onOpenNewJournal={() => setActiveTab('ledger')}
        onOpenNewExpense={() => setActiveTab('payables')}
        onExportTally={handleExportTally}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === 'overview' && (
          <FinancialOverview
            selectedDivision={selectedDivision}
            onNavigateTab={(tab) => setActiveTab(tab)}
            accounts={accounts}
            invoices={invoices}
            expenses={expenses}
          />
        )}

        {activeTab === 'ledger' && (
          <GeneralLedger
            accounts={accounts}
            journalEntries={journalEntries}
            onAddJournalEntry={handleAddJournalEntry}
            onPostJournal={handlePostJournal}
            onReverseJournal={handleReverseJournal}
            onImportPayrollAccrual={handleAccruePayrollRun}
          />
        )}

        {activeTab === 'invoicing' && (
          <InvoicingPipeline
            invoices={invoices}
            onCreateInvoice={handleCreateInvoice}
            onRecordPayment={handleRecordPayment}
          />
        )}

        {activeTab === 'payables' && (
          <PayablesExpenses
            expenses={expenses}
            vendors={vendors}
            hrmsClaims={hrmsClaims}
            onCreateExpense={handleCreateExpense}
            onApproveExpense={handleApproveExpense}
            onPayExpense={handlePayExpense}
            onSettleHrmsClaim={handleSettleHrmsClaim}
          />
        )}

        {activeTab === 'gst' && (
          <GstComplianceCenter
            onExportTally={handleExportTally}
            invoices={invoices}
            expenses={expenses}
          />
        )}

        {activeTab === 'statements' && (
          <FinancialStatements
            selectedDivision={selectedDivision}
            onExportTally={handleExportTally}
            accounts={accounts}
            invoices={invoices}
            expenses={expenses}
          />
        )}
      </main>
    </div>
  );
}
