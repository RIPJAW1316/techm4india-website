'use client';

import React, { useState } from 'react';
import {
  Building2,
  Calendar,
  ChevronDown,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Printer,
  Scale,
} from 'lucide-react';
import { DivisionCode } from '../types';

interface FinancialStatementsProps {
  selectedDivision: DivisionCode;
  onExportTally: () => void;
}

export const FinancialStatements: React.FC<FinancialStatementsProps> = ({
  selectedDivision,
  onExportTally,
}) => {
  const [statementType, setStatementType] = useState<'pnl' | 'balance_sheet' | 'cash_flow'>('pnl');

  const formatInr = (val: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="space-y-6">
      {/* Statement Selector & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e3ded5] pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatementType('pnl')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              statementType === 'pnl'
                ? 'bg-[#1f2946] text-white'
                : 'text-[#5a6376] hover:text-[#1f2946] hover:bg-[#f1efe9]'
            }`}
          >
            Profit &amp; Loss Statement (P&amp;L)
          </button>
          <button
            onClick={() => setStatementType('balance_sheet')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              statementType === 'balance_sheet'
                ? 'bg-[#1f2946] text-white'
                : 'text-[#5a6376] hover:text-[#1f2946] hover:bg-[#f1efe9]'
            }`}
          >
            Balance Sheet
          </button>
          <button
            onClick={() => setStatementType('cash_flow')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              statementType === 'cash_flow'
                ? 'bg-[#1f2946] text-white'
                : 'text-[#5a6376] hover:text-[#1f2946] hover:bg-[#f1efe9]'
            }`}
          >
            Cash Flow Statement
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportTally}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#f7f6f2] border border-[#d1cbbf] text-[#1f2946] text-xs font-semibold shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5 text-[#15803d]" />
            Tally XML
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#f7f6f2] border border-[#d1cbbf] text-[#5a6376] text-xs font-semibold shadow-xs transition"
          >
            <Printer className="w-3.5 h-3.5 text-[#5a6376]" />
            Print Report
          </button>
        </div>
      </div>

      {/* P&L STATEMENT */}
      {statementType === 'pnl' && (
        <div className="card-editorial bg-white p-6 space-y-6 max-w-4xl mx-auto border border-[#e3ded5] rounded-xl shadow-xs">
          {/* Header */}
          <div className="text-center border-b border-[#e3ded5] pb-4">
            <h2 className="text-lg font-bold text-[#1f2946] uppercase tracking-wider">
              TechM4India Innovations Pvt. Ltd.
            </h2>
            <p className="text-xs text-[#5a6376] mt-1">
              Statement of Profit &amp; Loss for the Period Ended 31 October 2026 (FY 2026-27)
            </p>
            <div className="mt-2 inline-flex items-center gap-2 text-[11px] font-mono text-[#1f2946] bg-[#f1efe9] px-3 py-0.5 rounded-full border border-[#d1cbbf]">
              <span>Cost Centre: {selectedDivision.replace('_', ' ')}</span>
              <span>· Currency: INR (₹)</span>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* 1. REVENUE FROM OPERATIONS */}
            <div>
              <div className="flex items-center justify-between font-bold text-[#1f2946] text-sm border-b border-[#e3ded5] pb-2">
                <span>I. REVENUE FROM OPERATIONS</span>
                <span className="font-mono text-[#15803d]">{formatInr(4850000)}</span>
              </div>
              <div className="divide-y divide-[#ebe7df] pt-2">
                <div className="py-1.5 flex justify-between text-[#1f2946]">
                  <span className="pl-4">TechM4Solutions (Enterprise Software &amp; AI Systems)</span>
                  <span className="font-mono font-medium">{formatInr(1950000)}</span>
                </div>
                <div className="py-1.5 flex justify-between text-[#1f2946]">
                  <span className="pl-4">TechM4Engineering (COE Labs &amp; Faculty Enablement)</span>
                  <span className="font-mono font-medium">{formatInr(1250000)}</span>
                </div>
                <div className="py-1.5 flex justify-between text-[#1f2946]">
                  <span className="pl-4">TechM4Schools (STEM Tinkering &amp; Robotics Curricula)</span>
                  <span className="font-mono font-medium">{formatInr(850000)}</span>
                </div>
                <div className="py-1.5 flex justify-between text-[#1f2946]">
                  <span className="pl-4">TechM4Space Technology (CanSat Kits &amp; Satellite Labs)</span>
                  <span className="font-mono font-medium">{formatInr(520000)}</span>
                </div>
                <div className="py-1.5 flex justify-between text-[#1f2946]">
                  <span className="pl-4">Horizon Startup School (Executive Programs &amp; Fellowships)</span>
                  <span className="font-mono font-medium">{formatInr(280000)}</span>
                </div>
              </div>
            </div>

            {/* 2. COST OF GOODS & DIRECT EXPENSES */}
            <div>
              <div className="flex items-center justify-between font-bold text-[#1f2946] text-sm border-b border-[#e3ded5] pb-2">
                <span>II. DIRECT DELIVERY &amp; PROGRAM COSTS</span>
                <span className="font-mono text-[#be123c]">{formatInr(1450000)}</span>
              </div>
              <div className="divide-y divide-[#ebe7df] pt-2">
                <div className="py-1.5 flex justify-between text-[#5a6376]">
                  <span className="pl-4">Hardware Components &amp; STEM Lab Kits Manufacturing</span>
                  <span className="font-mono">{formatInr(620000)}</span>
                </div>
                <div className="py-1.5 flex justify-between text-[#5a6376]">
                  <span className="pl-4">Dedicated GPU Cloud Compute &amp; Infrastructure (AWS/Render)</span>
                  <span className="font-mono">{formatInr(510000)}</span>
                </div>
                <div className="py-1.5 flex justify-between text-[#5a6376]">
                  <span className="pl-4">External Technical SME &amp; Master Trainer Honorariums</span>
                  <span className="font-mono">{formatInr(320000)}</span>
                </div>
              </div>
            </div>

            {/* GROSS PROFIT */}
            <div className="p-3 rounded-lg bg-[#fcfbf9] border border-[#e3ded5] flex justify-between font-bold text-[#1f2946] text-sm">
              <span>GROSS PROFIT (I - II)</span>
              <span className="font-mono text-[#15803d]">{formatInr(3400000)} (70.1% Margin)</span>
            </div>

            {/* 3. OPERATING & ADMIN EXPENSES */}
            <div>
              <div className="flex items-center justify-between font-bold text-[#1f2946] text-sm border-b border-[#e3ded5] pb-2">
                <span>III. OPERATING, EMPLOYEE &amp; ADMINISTRATIVE EXPENSES</span>
                <span className="font-mono text-[#be123c]">{formatInr(1980000)}</span>
              </div>
              <div className="divide-y divide-[#ebe7df] pt-2">
                <div className="py-1.5 flex justify-between text-[#5a6376]">
                  <span className="pl-4">Employee Salaries &amp; Retainers</span>
                  <span className="font-mono">{formatInr(1320000)}</span>
                </div>
                <div className="py-1.5 flex justify-between text-[#5a6376]">
                  <span className="pl-4">Corporate Office Lease &amp; Utilities (Hyderabad HQ)</span>
                  <span className="font-mono">{formatInr(310000)}</span>
                </div>
                <div className="py-1.5 flex justify-between text-[#5a6376]">
                  <span className="pl-4">Client On-Site Travel &amp; Institutional Outreach</span>
                  <span className="font-mono">{formatInr(190000)}</span>
                </div>
                <div className="py-1.5 flex justify-between text-[#5a6376]">
                  <span className="pl-4">Software Licenses, Legal &amp; Audit Fees</span>
                  <span className="font-mono">{formatInr(160000)}</span>
                </div>
              </div>
            </div>

            {/* NET OPERATING PROFIT (EBITDA) */}
            <div className="p-4 rounded-xl bg-[#ecfdf5] border border-[#a7f3d0] flex justify-between font-bold text-[#065f46] text-base">
              <span>NET OPERATING PROFIT (EBITDA)</span>
              <span className="font-mono text-[#065f46]">{formatInr(1420000)} (29.3% Margin)</span>
            </div>
          </div>
        </div>
      )}

      {/* BALANCE SHEET */}
      {statementType === 'balance_sheet' && (
        <div className="card-editorial bg-white p-6 space-y-6 max-w-4xl mx-auto border border-[#e3ded5] rounded-xl shadow-xs">
          <div className="text-center border-b border-[#e3ded5] pb-4">
            <h2 className="text-lg font-bold text-[#1f2946] uppercase tracking-wider">
              TechM4India Innovations Pvt. Ltd.
            </h2>
            <p className="text-xs text-[#5a6376] mt-1">
              Statement of Financial Position (Balance Sheet) as on 31 October 2026
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
            {/* ASSETS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between font-bold text-[#1f2946] text-sm border-b border-[#e3ded5] pb-2 font-sans">
                <span>TOTAL ASSETS</span>
                <span className="text-[#15803d]">{formatInr(5840000)}</span>
              </div>
              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-[#fcfbf9] border border-[#e3ded5] flex justify-between">
                  <span className="font-sans text-[#1f2946]">Cash &amp; Bank Balances (Liquid)</span>
                  <span className="text-[#1f2946] font-bold">{formatInr(3240000)}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#fcfbf9] border border-[#e3ded5] flex justify-between">
                  <span className="font-sans text-[#1f2946]">Accounts Receivable (AR)</span>
                  <span className="text-[#1f2946] font-bold">{formatInr(1180000)}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#fcfbf9] border border-[#e3ded5] flex justify-between">
                  <span className="font-sans text-[#1f2946]">GST Input Tax Credit (ITC)</span>
                  <span className="text-[#1f2946] font-bold">{formatInr(588600)}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#fcfbf9] border border-[#e3ded5] flex justify-between">
                  <span className="font-sans text-[#1f2946]">Fixed Hardware &amp; Lab Equipment</span>
                  <span className="text-[#1f2946] font-bold">{formatInr(831400)}</span>
                </div>
              </div>
            </div>

            {/* LIABILITIES & EQUITY */}
            <div className="space-y-4">
              <div className="flex items-center justify-between font-bold text-[#1f2946] text-sm border-b border-[#e3ded5] pb-2 font-sans">
                <span>LIABILITIES &amp; EQUITY</span>
                <span className="text-[#1f2946]">{formatInr(5840000)}</span>
              </div>
              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-[#fcfbf9] border border-[#e3ded5] flex justify-between">
                  <span className="font-sans text-[#1f2946]">Accounts Payable (Vendors)</span>
                  <span className="text-[#1f2946] font-bold">{formatInr(640000)}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#fcfbf9] border border-[#e3ded5] flex justify-between">
                  <span className="font-sans text-[#1f2946]">Statutory Dues (GST &amp; TDS Payable)</span>
                  <span className="text-[#1f2946] font-bold">{formatInr(128000)}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#fcfbf9] border border-[#e3ded5] flex justify-between">
                  <span className="font-sans text-[#1f2946]">Paid-up Share Capital</span>
                  <span className="text-[#1f2946] font-bold">{formatInr(1000000)}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#fcfbf9] border border-[#e3ded5] flex justify-between">
                  <span className="font-sans text-[#1f2946]">Retained Earnings / Surplus</span>
                  <span className="text-[#1f2946] font-bold">{formatInr(4072000)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#ecfdf5] border border-[#a7f3d0] text-center text-xs font-mono text-[#065f46]">
            ✓ Balance Sheet Equilibrium Verified: Assets (₹58,40,000) = Liabilities + Equity (₹58,40,000)
          </div>
        </div>
      )}

      {/* CASH FLOW STATEMENT */}
      {statementType === 'cash_flow' && (
        <div className="card-editorial bg-white p-6 space-y-4 max-w-4xl mx-auto text-xs border border-[#e3ded5] rounded-xl shadow-xs">
          <div className="text-center border-b border-[#e3ded5] pb-4">
            <h2 className="text-lg font-bold text-[#1f2946] uppercase tracking-wider">
              TechM4India Innovations Pvt. Ltd.
            </h2>
            <p className="text-xs text-[#5a6376] mt-1">
              Statement of Cash Flows (Indirect Method) for the Period Ended 31 October 2026
            </p>
          </div>

          <div className="space-y-3 font-mono">
            <div className="p-3 bg-[#fcfbf9] border border-[#e3ded5] rounded-lg flex justify-between font-bold text-[#1f2946] font-sans">
              <span>Operating Cash Inflows (Client Collections)</span>
              <span className="text-[#15803d]">+{formatInr(3670000)}</span>
            </div>
            <div className="p-3 bg-[#fcfbf9] border border-[#e3ded5] rounded-lg flex justify-between font-bold text-[#1f2946] font-sans">
              <span>Operating Cash Outflows (Salaries, Vendors &amp; Overheads)</span>
              <span className="text-[#be123c]">-{formatInr(2430000)}</span>
            </div>
            <div className="p-3 bg-[#fcfbf9] border border-[#e3ded5] rounded-lg flex justify-between font-bold text-[#1f2946] font-sans">
              <span>Statutory Tax Disbursements (GST &amp; TDS Challans)</span>
              <span className="text-[#be123c]">-{formatInr(180000)}</span>
            </div>
            <div className="p-3.5 bg-[#ecfdf5] border border-[#a7f3d0] rounded-xl flex justify-between font-bold text-[#065f46] text-sm font-sans">
              <span>Net Increase in Cash &amp; Cash Equivalents</span>
              <span className="font-mono">+{formatInr(1060000)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
