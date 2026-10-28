'use client';

import React from 'react';
import {
  Award,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  DollarSign,
  Download,
  FileSpreadsheet,
  Layers,
  PieChart,
  Printer,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import { DealItem, LeadItem } from '../types';

interface CrmReportsViewProps {
  leads: LeadItem[];
  deals: DealItem[];
}

export const CrmReportsView: React.FC<CrmReportsViewProps> = ({ leads, deals }) => {
  const formatInr = (val: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);

  // Funnel calculations
  const totalLeads = leads.length;
  const qualifiedLeads = leads.filter(
    (l) => l.status === 'QUALIFIED' || l.status === 'WON' || l.isConverted
  ).length;
  const totalDeals = deals.length;
  const proposalDeals = deals.filter(
    (d) =>
      d.stage === 'PROPOSAL_QUOTATION' ||
      d.stage === 'NEGOTIATION_REVIEW' ||
      d.stage === 'CLOSED_WON'
  ).length;
  const wonDeals = deals.filter((d) => d.stage === 'CLOSED_WON').length;
  const wonRevenue = deals
    .filter((d) => d.stage === 'CLOSED_WON')
    .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  // Sector breakdown
  const sectorRevenue: Record<string, number> = {
    'TechM4 Engineering (Colleges)': 6400000,
    'TechM4 Schools (K-12 Robotics)': 3750000,
    'TechM4 Space & Defense Labs': 3500000,
    'TechM4 Corporate CSR': 4500000,
    'Horizon Institutes & Diaspora': 2200000,
  };

  const totalSectorRev = Object.values(sectorRevenue).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4 p-4 sm:p-6 max-w-[1600px] mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#e3ded5] shadow-2xs">
        <div>
          <h1 className="text-lg font-bold text-[#1f2946] flex items-center gap-2">
            <span>Sales Reports &amp; Institutional Analytics</span>
            <span className="badge-tag badge-emerald text-[10px]">FY 2026-27</span>
          </h1>
          <p className="text-xs text-[#5a6376] mt-0.5">
            Conversion velocity, division pipeline allocation, and forecast analytics across 8 verticals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f7f6f2] hover:bg-[#e3ded5] text-[#1f2946] rounded-lg text-xs font-semibold border border-[#e3ded5] transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-[#e3ded5] shadow-2xs">
          <div className="text-xs text-[#5a6376] font-medium">Won Revenue (YTD)</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{formatInr(wonRevenue)}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">{wonDeals} Closed Deals</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e3ded5] shadow-2xs">
          <div className="text-xs text-[#5a6376] font-medium">Funnel Conversion Rate</div>
          <div className="text-2xl font-black text-[#1f2946] mt-1">
            {totalLeads > 0 ? Math.round((wonDeals / totalLeads) * 100) : 0}%
          </div>
          <div className="text-[11px] text-[#5a6376] mt-0.5">Lead to Closed Won</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e3ded5] shadow-2xs">
          <div className="text-xs text-[#5a6376] font-medium">Avg Deal Size</div>
          <div className="text-2xl font-black text-blue-700 mt-1">
            {totalDeals > 0 ? formatInr(wonRevenue / (wonDeals || 1)) : '₹0'}
          </div>
          <div className="text-[11px] text-[#5a6376] mt-0.5">Per Institution MoU</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e3ded5] shadow-2xs">
          <div className="text-xs text-[#5a6376] font-medium">Sales Cycle Velocity</div>
          <div className="text-2xl font-black text-[#1f2946] mt-1">26 Days</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Faster than target (35d)</div>
        </div>
      </div>

      {/* Funnel and Sector Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 1. Institutional Conversion Funnel */}
        <div className="bg-white p-5 rounded-xl border border-[#e3ded5] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#1f2946]">Institutional Sales Funnel</h3>
              <p className="text-[11px] text-[#5a6376]">From raw campus outreach to signed MoUs</p>
            </div>
            <BarChart3 className="w-5 h-5 text-[#c62d37]" />
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold text-[#1f2946] mb-1">
                <span>1. Inbound Leads Captured</span>
                <span>{totalLeads}</span>
              </div>
              <div className="w-full bg-[#f1efe9] h-3 rounded-full overflow-hidden">
                <div className="bg-[#1f2946] h-full rounded-full w-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-[#1f2946] mb-1">
                <span>2. Qualified Prospects</span>
                <span>{qualifiedLeads} ({Math.round((qualifiedLeads / (totalLeads || 1)) * 100)}%)</span>
              </div>
              <div className="w-full bg-[#f1efe9] h-3 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full"
                  style={{ width: `${(qualifiedLeads / (totalLeads || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-[#1f2946] mb-1">
                <span>3. Formal Proposals &amp; Quotes Sent</span>
                <span>{proposalDeals} ({Math.round((proposalDeals / (totalLeads || 1)) * 100)}%)</span>
              </div>
              <div className="w-full bg-[#f1efe9] h-3 rounded-full overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full"
                  style={{ width: `${(proposalDeals / (totalLeads || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-[#1f2946] mb-1">
                <span>4. Closed Won / MoUs Executed</span>
                <span>{wonDeals} ({Math.round((wonDeals / (totalLeads || 1)) * 100)}%)</span>
              </div>
              <div className="w-full bg-[#f1efe9] h-3 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full"
                  style={{ width: `${(wonDeals / (totalLeads || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Revenue Distribution by Division */}
        <div className="bg-white p-5 rounded-xl border border-[#e3ded5] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#1f2946]">Division Revenue Pipeline</h3>
              <p className="text-[11px] text-[#5a6376]">Contribution per TechM4 business vertical</p>
            </div>
            <PieChart className="w-5 h-5 text-blue-600" />
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(sectorRevenue).map(([sec, amt]) => {
              const pct = Math.round((amt / totalSectorRev) * 100);
              return (
                <div key={sec}>
                  <div className="flex justify-between text-xs font-semibold text-[#1f2946] mb-1">
                    <span>{sec}</span>
                    <span className="font-mono">{formatInr(amt)} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-[#f1efe9] h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#c62d37] h-full rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Reps Leaderboard */}
      <div className="bg-white p-5 rounded-xl border border-[#e3ded5] shadow-2xs space-y-3">
        <h3 className="font-bold text-sm text-[#1f2946] flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          <span>Institutional Partnership Leads — Leaderboard</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 bg-[#fcfbf9] rounded-xl border border-[#e3ded5]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#1f2946] text-white font-bold text-xs flex items-center justify-center">
                AR
              </div>
              <div>
                <div className="font-bold text-xs text-[#1f2946]">Aryan Reddy</div>
                <div className="text-[10px] text-[#5a6376]">Founder &amp; CEO</div>
              </div>
            </div>
            <div className="mt-3 flex justify-between text-xs">
              <span className="text-[#5a6376]">Deals Closed:</span>
              <span className="font-bold text-emerald-700">₹94,00,000</span>
            </div>
          </div>

          <div className="p-3 bg-[#fcfbf9] rounded-xl border border-[#e3ded5]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#c62d37] text-white font-bold text-xs flex items-center justify-center">
                SR
              </div>
              <div>
                <div className="font-bold text-xs text-[#1f2946]">Dr. Sneha Roy</div>
                <div className="text-[10px] text-[#5a6376]">Academic Partnerships Head</div>
              </div>
            </div>
            <div className="mt-3 flex justify-between text-xs">
              <span className="text-[#5a6376]">Deals Closed:</span>
              <span className="font-bold text-emerald-700">₹68,50,000</span>
            </div>
          </div>

          <div className="p-3 bg-[#fcfbf9] rounded-xl border border-[#e3ded5]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                VM
              </div>
              <div>
                <div className="font-bold text-xs text-[#1f2946]">Vikram Malhotra</div>
                <div className="text-[10px] text-[#5a6376]">Defense &amp; PSU Lead</div>
              </div>
            </div>
            <div className="mt-3 flex justify-between text-xs">
              <span className="text-[#5a6376]">Deals Closed:</span>
              <span className="font-bold text-emerald-700">₹42,00,000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
