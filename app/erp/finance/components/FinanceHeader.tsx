'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  Calendar,
  Clock,
  Download,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Layers,
  PlusCircle,
  Receipt,
  Scale,
  Sparkles,
} from 'lucide-react';
import { DivisionCode } from '../types';

interface FinanceHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedDivision: DivisionCode;
  setSelectedDivision: (div: DivisionCode) => void;
  onOpenNewInvoice: () => void;
  onOpenNewJournal: () => void;
  onOpenNewExpense: () => void;
  onExportTally: () => void;
}

export const FinanceHeader: React.FC<FinanceHeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedDivision,
  setSelectedDivision,
  onOpenNewInvoice,
  onOpenNewJournal,
  onOpenNewExpense,
  onExportTally,
}) => {
  const tabs = [
    { id: 'overview', label: 'Executive MIS', icon: Sparkles },
    { id: 'ledger', label: 'General Ledger & COA', icon: Scale },
    { id: 'invoicing', label: 'Invoicing & AR', icon: FileText },
    { id: 'payables', label: 'Expenses & AP', icon: Receipt },
    { id: 'gst', label: 'GST Compliance & Rule 88A', icon: FileCheck2 },
    { id: 'statements', label: 'Financial Statements', icon: FileSpreadsheet },
  ];

  return (
    <header className="border-b border-[#e3ded5] bg-white/95 backdrop-blur-md sticky top-0 z-40 px-6 py-4 shadow-xs">
      {/* Top Bar: Brand, Division Selector, and Action Triggers */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <img
                src="/images/brand/logo.png"
                alt="TechM4India Logo"
                width="36"
                height="36"
                className="rounded"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black tracking-wider uppercase text-[#1f2946]">
                    TECHM4<span className="text-[#c62d37]">INDIA</span>
                  </span>
                  <span className="badge-tag badge-brand-red">Finance ERP</span>
                  <span className="badge-tag badge-muted">FY 2026-27</span>
                </div>
                <p className="text-xs text-[#5a6376] mt-0.5">
                  TechM4India Innovations Pvt. Ltd. · GSTIN: 36AAACS1234F1Z8 · Hyderabad, Telangana
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Right side: Division Selector & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Division Selector */}
          <div className="flex items-center gap-1.5 bg-[#f7f6f2] border border-[#e3ded5] px-3 py-1.5 rounded-lg">
            <Layers className="w-3.5 h-3.5 text-[#5a6376]" />
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value as DivisionCode)}
              className="bg-transparent text-xs font-semibold text-[#1f2946] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Divisions (Consolidated)</option>
              <option value="TECHM4_SCHOOLS">TechM4Schools</option>
              <option value="TECHM4_ENGINEERING">TechM4Engineering</option>
              <option value="TECHM4_SOLUTIONS">TechM4Solutions</option>
              <option value="TECHM4_SPACE">TechM4Space Technology</option>
              <option value="HORIZON_INSTITUTES">Horizon Startup School</option>
              <option value="GENERAL_OVERHEAD">Corporate Overhead</option>
            </select>
          </div>

          {/* Quick Action Buttons */}
          <button
            onClick={onOpenNewInvoice}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#c62d37] hover:bg-[#a8222e] text-white text-xs font-semibold shadow-xs transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            + Invoice
          </button>

          <button
            onClick={onOpenNewJournal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#f7f6f2] border border-[#e3ded5] text-[#1f2946] text-xs font-semibold transition"
          >
            <Scale className="w-3.5 h-3.5 text-blue-600" />
            + Journal Voucher
          </button>

          <button
            onClick={onOpenNewExpense}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#f7f6f2] border border-[#e3ded5] text-[#1f2946] text-xs font-semibold transition"
          >
            <Receipt className="w-3.5 h-3.5 text-amber-600" />
            + Expense Bill
          </button>

          <button
            onClick={onExportTally}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#f7f6f2] border border-[#e3ded5] text-[#1f2946] text-xs font-semibold transition"
            title="Download Tally Prime XML Export"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            Tally XML
          </button>
        </div>
      </div>

      {/* Statutory Compliance Indicator Pill Bar */}
      <div className="mt-3.5 pt-3 border-t border-[#f0ece3] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-[#5a6376]">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>Filing Period: <strong className="text-[#1f2946]">October 2026</strong></span>
          </div>

          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full text-emerald-800 font-semibold text-[11px]">
            <Clock className="w-3 h-3 text-emerald-600" />
            GSTR-1 Due: 11 Nov 2026 (18 days)
          </div>

          <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full text-blue-800 font-semibold text-[11px]">
            <Clock className="w-3 h-3 text-blue-600" />
            GSTR-3B Due: 20 Nov 2026 (27 days)
          </div>

          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full text-amber-800 font-semibold text-[11px]">
            <Clock className="w-3 h-3 text-amber-600" />
            TDS Form 26Q Due: 31 Oct 2026 (7 days)
          </div>
        </div>

        <div className="text-[#5a6376] text-[11px]">
          Double-Entry Balanced: <span className="text-emerald-700 font-mono font-bold">Δ 0.00</span> · Rule 88A Offsets Active
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#1f2946] text-white shadow-xs font-bold'
                  : 'text-[#5a6376] hover:text-[#1f2946] hover:bg-[#f1efe9]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#5a6376]'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
