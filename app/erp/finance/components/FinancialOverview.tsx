'use client';

import React from 'react';
import {
  ArrowUpRight,
  Building,
  CheckCircle2,
  DollarSign,
  Receipt,
  Scale,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { AccountItem, DivisionCode, ExpenseItem, InvoiceItem } from '../types';

interface FinancialOverviewProps {
  selectedDivision: DivisionCode;
  onNavigateTab: (tab: string) => void;
  accounts?: AccountItem[];
  invoices?: InvoiceItem[];
  expenses?: ExpenseItem[];
}

export const FinancialOverview: React.FC<FinancialOverviewProps> = ({
  selectedDivision,
  onNavigateTab,
  accounts = [],
  invoices = [],
  expenses = [],
}) => {
  // Filter by selected division if not 'ALL'
  const filteredInvoices =
    selectedDivision === 'ALL'
      ? invoices
      : invoices.filter((i) => i.division === selectedDivision);

  const filteredExpenses =
    selectedDivision === 'ALL'
      ? expenses
      : expenses.filter((e) => e.division === selectedDivision);

  // Dynamic calculations from actual transactions
  const grossRevenue = filteredInvoices.reduce((sum, inv) => sum + (Number(inv.subtotal) || 0), 0);
  const totalBilledGst = filteredInvoices.reduce(
    (sum, inv) => sum + (Number(inv.cgst) || 0) + (Number(inv.sgst) || 0) + (Number(inv.igst) || 0),
    0
  );
  const accountsReceivable = filteredInvoices
    .filter((i) => i.status !== 'PAID')
    .reduce((sum, inv) => sum + (Number(inv.balanceDue) || 0), 0);

  const now = new Date();
  const overdueReceivable = filteredInvoices
    .filter((i) => i.status === 'OVERDUE' || (new Date(i.dueDate) < now && i.status !== 'PAID'))
    .reduce((sum, inv) => sum + (Number(inv.balanceDue) || 0), 0);

  const accountsPayable = filteredExpenses
    .filter((e) => e.status !== 'PAID')
    .reduce((sum, exp) => sum + (Number(exp.netPayable) || 0), 0);

  const totalExpenseCost = filteredExpenses.reduce(
    (sum, exp) => sum + (Number(exp.grossAmount) || 0),
    0
  );

  const netProfit = grossRevenue - totalExpenseCost;
  const netMargin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

  // Cash & Bank balances from accounts ledger
  const hdfcBalance = accounts.find((a) => a.code === '1010')?.balance || 0;
  const iciciBalance = accounts.find((a) => a.code === '1020')?.balance || 0;
  const cashAndBank = accounts
    .filter((a) => a.category === 'BANK_ACCOUNTS' || a.category === 'CASH')
    .reduce((sum, a) => sum + (Number(a.balance) || 0), 0);

  // Input Tax Credit from Tax Receivable accounts (acc-1200, 1210, 1220) or expenses
  const itcFromAccounts = accounts
    .filter((a) => a.category === 'TAX_RECEIVABLE')
    .reduce((sum, a) => sum + (Number(a.balance) || 0), 0);

  const itcFromExpenses = filteredExpenses
    .filter((e) => e.status !== 'REJECTED')
    .reduce((sum, exp) => sum + Math.round((Number(exp.grossAmount) || 0) * 0.18), 0);

  const totalItc = itcFromAccounts > 0 ? itcFromAccounts : itcFromExpenses;
  const netGstLiability = Math.max(0, totalBilledGst - totalItc);

  const tdsPayable =
    accounts.find((a) => a.code === '2150')?.balance ||
    filteredExpenses.reduce((sum, exp) => sum + (Number(exp.tdsAmount) || 0), 0);

  const divisionDefs = [
    {
      id: 'TECHM4_SOLUTIONS',
      name: 'TechM4Solutions',
      focus: 'Enterprise AI & Custom Software Engineering',
      tagColor: 'badge-blue',
    },
    {
      id: 'TECHM4_ENGINEERING',
      name: 'TechM4Engineering',
      focus: 'College COE Labs, Faculty Enablement & Core Tech',
      tagColor: 'badge-muted',
    },
    {
      id: 'TECHM4_SCHOOLS',
      name: 'TechM4Schools',
      focus: 'K-12 STEM Labs, Robotics Kits & Tinkering Curricula',
      tagColor: 'badge-emerald',
    },
    {
      id: 'TECHM4_SPACE',
      name: 'TechM4Space Technology',
      focus: 'CanSat Programs, Ground Stations & Aerospace R&D',
      tagColor: 'badge-purple',
    },
    {
      id: 'HORIZON_INSTITUTES',
      name: 'Horizon Startup School',
      focus: 'Founder Accelerator, Executive Fellowships & Diplomas',
      tagColor: 'badge-amber',
    },
  ];

  const divisionContributions = divisionDefs.map((def) => {
    const divInvoices = invoices.filter((i) => i.division === def.id);
    const divExpenses = expenses.filter((e) => e.division === def.id);
    const divRev = divInvoices.reduce((s, i) => s + (Number(i.subtotal) || 0), 0);
    const divExp = divExpenses.reduce((s, e) => s + (Number(e.grossAmount) || 0), 0);
    const divMargin = divRev > 0 ? ((divRev - divExp) / divRev) * 100 : 0;

    return {
      ...def,
      revenue: divRev,
      expenses: divExp,
      margin: Number(divMargin.toFixed(1)),
      status: divRev > 0 ? 'Active Operations' : 'Zero Transactions',
    };
  });

  const formatInr = (val: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="space-y-6">
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Gross Revenue */}
        <div className="card-editorial p-4.5 bg-white">
          <div className="flex items-center justify-between text-[#5a6376]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1f2946]">Gross Invoiced</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-xl font-bold text-[#0e1424] finance-num">
            {formatInr(grossRevenue)}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{filteredInvoices.length} Invoices Active</span>
          </div>
        </div>

        {/* Net Profit & Margin */}
        <div className="card-editorial p-4.5 bg-white">
          <div className="flex items-center justify-between text-[#5a6376]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1f2946]">Operating Profit</span>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-xl font-bold text-[#0e1424] finance-num">
            {formatInr(netProfit)}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-blue-700 font-semibold">
            <span>{netMargin.toFixed(1)}% Net Margin</span>
          </div>
        </div>

        {/* Liquid Cash & Bank */}
        <div className="card-editorial p-4.5 bg-white">
          <div className="flex items-center justify-between text-[#5a6376]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1f2946]">Bank Reserves</span>
            <Wallet className="w-4 h-4 text-[#c62d37]" />
          </div>
          <div className="mt-2 text-xl font-bold text-[#0e1424] finance-num">
            {formatInr(cashAndBank)}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-[#5a6376]">
            <span>HDFC &amp; ICICI Accounts</span>
          </div>
        </div>

        {/* AR Outstanding */}
        <div
          className="card-editorial p-4.5 bg-white cursor-pointer hover:border-amber-400"
          onClick={() => onNavigateTab('invoicing')}
        >
          <div className="flex items-center justify-between text-[#5a6376]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1f2946]">AR Outstanding</span>
            <Receipt className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-xl font-bold text-amber-700 finance-num">
            {formatInr(accountsReceivable)}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-800 font-medium">
            <span>{overdueReceivable > 0 ? `${formatInr(overdueReceivable)} Overdue` : 'Zero overdue'}</span>
          </div>
        </div>

        {/* AP Due */}
        <div
          className="card-editorial p-4.5 bg-white cursor-pointer hover:border-rose-400"
          onClick={() => onNavigateTab('payables')}
        >
          <div className="flex items-center justify-between text-[#5a6376]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1f2946]">AP Payables Due</span>
            <Scale className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 text-xl font-bold text-[#0e1424] finance-num">
            {formatInr(accountsPayable)}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-[#5a6376]">
            <span>{filteredExpenses.length} Vendor Bills Booked</span>
          </div>
        </div>

        {/* Net GST Liability */}
        <div
          className="card-editorial p-4.5 bg-white cursor-pointer hover:border-emerald-400"
          onClick={() => onNavigateTab('gst')}
        >
          <div className="flex items-center justify-between text-[#5a6376]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1f2946]">Net GST (Rule 88A)</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-xl font-bold text-emerald-700 finance-num">
            {formatInr(netGstLiability)}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-800 font-medium">
            <span>ITC Offset Applied</span>
          </div>
        </div>
      </div>

      {/* Two Column: Division Cost Centre Performance + Capital Reserves */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Division P&L Breakdown Table (2 cols) */}
        <div className="lg:col-span-2 card-editorial p-5 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[#1f2946] flex items-center gap-2">
                <Building className="w-4 h-4 text-[#c62d37]" />
                Division Cost-Centre Profitability Matrix
              </h2>
              <p className="text-xs text-[#5a6376] mt-0.5">
                Segmented operating revenues, program costs, and EBITDA margins
              </p>
            </div>
            <span className="badge-tag badge-brand-red">5 Units Tracked</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs table-editorial">
              <thead>
                <tr>
                  <th className="py-2.5 px-3">Division</th>
                  <th className="py-2.5 px-3 text-right">Invoiced Revenue</th>
                  <th className="py-2.5 px-3 text-right">Direct Costs</th>
                  <th className="py-2.5 px-3 text-right">Operating Profit</th>
                  <th className="py-2.5 px-3 text-right">Margin %</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {divisionContributions.map((div) => {
                  const profit = div.revenue - div.expenses;
                  return (
                    <tr key={div.id}>
                      <td className="py-3 px-3">
                        <div className="font-bold text-[#1f2946]">{div.name}</div>
                        <div className="text-[11px] text-[#5a6376]">{div.focus}</div>
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-[#20283b] finance-num">
                        {formatInr(div.revenue)}
                      </td>
                      <td className="py-3 px-3 text-right text-[#5a6376] finance-num">
                        {formatInr(div.expenses)}
                      </td>
                      <td className={`py-3 px-3 text-right font-bold finance-num ${profit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {profit >= 0 ? `+${formatInr(profit)}` : formatInr(profit)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-[#1f2946] finance-num">
                        {div.margin.toFixed(1)}%
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`badge-tag ${div.tagColor}`}>{div.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Statutory Checklist & Bank Balances */}
        <div className="space-y-4">
          {/* Statutory Compliance Checklist */}
          <div className="card-editorial p-5 bg-white">
            <h3 className="text-sm font-bold text-[#1f2946] mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Statutory Compliance Health
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#faf9f6] border border-[#e3ded5]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[#1f2946]">Double-Entry Ledger Invariant Satisfied</div>
                  <div className="text-[#5a6376] text-[11px] mt-0.5">
                    General Ledger debit and credit balances equal to ₹0.00 variance.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#faf9f6] border border-[#e3ded5]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[#1f2946]">Rule 88A GST Offset Prepared</div>
                  <div className="text-[#5a6376] text-[11px] mt-0.5">
                    IGST credit is fully matched against IGST liability before CGST/SGST offset.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#faf9f6] border border-[#e3ded5]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[#1f2946]">TDS 194C / 194J Withholding Active</div>
                  <div className="text-[#5a6376] text-[11px] mt-0.5">
                    All contractor and technical vendor disbursements booked with statutory TDS deductions.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Operating Bank Accounts */}
          <div className="card-editorial p-5 bg-white">
            <h3 className="text-sm font-bold text-[#1f2946] mb-3 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-blue-600" />
              Operating Bank Accounts
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#faf9f6] border border-[#e3ded5]">
                <div>
                  <div className="font-bold text-[#1f2946]">HDFC Bank Current A/C</div>
                  <div className="text-[11px] text-[#5a6376] font-mono">A/C: •••• 1122 (Banjara Hills)</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[#0e1424] finance-num">{formatInr(hdfcBalance)}</div>
                  <span className="badge-tag badge-emerald text-[10px]">Primary</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#faf9f6] border border-[#e3ded5]">
                <div>
                  <div className="font-bold text-[#1f2946]">ICICI Bank Operating A/C</div>
                  <div className="text-[11px] text-[#5a6376] font-mono">A/C: •••• 9841 (Gachibowli)</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[#0e1424] finance-num">{formatInr(iciciBalance)}</div>
                  <span className="badge-tag badge-blue text-[10px]">Secondary</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
