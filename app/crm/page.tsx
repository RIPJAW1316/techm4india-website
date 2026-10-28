'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  Layers,
  PhoneCall,
  Plus,
  RefreshCw,
  Sparkles,
  Target,
  UserCheck,
  Users,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

const CRM_APP_URL =
  process.env.NEXT_PUBLIC_CRM_URL ||
  (typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3003'
    : 'https://crm.techm4india.com');

export default function CrmMainPortalPage() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const cur = authClient.getSession();
    setSession(cur);
  }, []);

  const getLaunchUrl = () => {
    const token = session?.accessToken || 'sso_token_aryan_reddy_ceo';
    return `${CRM_APP_URL}?sso_token=${encodeURIComponent(token)}`;
  };

  return (
    <div className="min-h-screen bg-[#f7f6f2] text-[#1f2946] flex flex-col">
      {/* Top Banner */}
      <header className="bg-white border-b border-[#e3ded5] px-6 py-4 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1f2946] text-white flex items-center justify-center font-black text-xs shadow-xs">
              TM4
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black tracking-wider text-sm text-[#1f2946]">
                  TECHM4<span className="text-[#c62d37]">INDIA</span>
                </span>
                <span className="badge-tag badge-crimson text-[10px]">CRM 2.0</span>
                <span className="badge-tag badge-blue text-[10px]">Port :3003</span>
              </div>
              <p className="text-[11px] text-[#5a6376]">
                Zoho CRM-Inspired Institutional Partnership &amp; Deal Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-[#5a6376] hover:text-[#1f2946] px-3 py-1.5 rounded-lg border border-[#e3ded5] hover:bg-[#f7f6f2] transition"
            >
              Central Dashboard
            </Link>
            <a
              href={getLaunchUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#c62d37] hover:bg-[#a8222b] text-white rounded-lg text-xs font-bold shadow-xs transition"
            >
              <span>Open Standalone CRM (:3003)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full space-y-6">
        {/* Hero Card */}
        <div className="bg-white rounded-2xl border border-[#e3ded5] p-6 sm:p-8 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fff1f2] border border-[#fecdd3] text-[#c62d37] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full Zoho Architecture Fidelity for 8 TechM4 Verticals</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1f2946] tracking-tight">
              Enterprise CRM &amp; Institutional Sales Suite
            </h1>
            <p className="text-sm text-[#5a6376] leading-relaxed">
              Equipped with 1-Click Lead Conversion to Accounts &amp; Deals, 6-Stage Visual Kanban
              pipeline, NAAC A++ / AISHE institution tracking, daily task schedules, itemized quotes,
              and direct invoicing bridge to TechM4 Finance ERP.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={getLaunchUrl()}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#1f2946] hover:bg-[#c62d37] text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                <span>Launch Aryan Reddy&apos;s CRM Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="http://localhost:3001"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2.5 bg-[#f7f6f2] hover:bg-[#e3ded5] text-[#1f2946] rounded-xl text-xs font-semibold border border-[#e3ded5] transition"
              >
                <span>Finance ERP Bridge (:3001)</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#5a6376]" />
              </a>
            </div>
          </div>

          <div className="w-full md:w-80 bg-[#fcfbf9] rounded-xl border border-[#e3ded5] p-5 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#5a6376]">
              Real-Time Sales Metrics
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#5a6376]">Open Deals Pipeline:</span>
                <span className="font-bold text-[#1f2946]">₹1,46,00,000</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#5a6376]">Untouched Deals:</span>
                <span className="font-bold text-amber-700">6 Accounts</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#5a6376]">Scheduled Calls Today:</span>
                <span className="font-bold text-emerald-700">4 Meetings</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#5a6376]">Active College MoUs:</span>
                <span className="font-bold text-blue-700">18 Campuses</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-[#e3ded5] shadow-2xs space-y-2.5">
            <div className="w-10 h-10 rounded-lg bg-[#fff1f2] text-[#c62d37] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#1f2946]">1-Click Lead Conversion</h3>
            <p className="text-xs text-[#5a6376]">
              Transforms unqualified campus leads into an Institution Account, Primary Stakeholder
              Contact, and commercial Deal opportunity in a single atomic action.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#e3ded5] shadow-2xs space-y-2.5">
            <div className="w-10 h-10 rounded-lg bg-[#f0f9ff] text-blue-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#1f2946]">6-Stage Visual Kanban</h3>
            <p className="text-xs text-[#5a6376]">
              Qualification, Needs Analysis, Proposal / Quotation, Negotiation, Closed Won, and Closed
              Lost with dynamic win-probability forecasting.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#e3ded5] shadow-2xs space-y-2.5">
            <div className="w-10 h-10 rounded-lg bg-[#f5f3ff] text-purple-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#1f2946]">Finance ERP Bridge (:3001)</h3>
            <p className="text-xs text-[#5a6376]">
              Direct quotation generator with GST 18% calculation and 1-click push to TechM4 Finance
              ERP for instant Accounts Receivable invoice creation.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
