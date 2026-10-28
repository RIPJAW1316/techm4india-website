'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  Bot,
  Briefcase,
  Building2,
  Calendar,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Cpu,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  FolderGit2,
  HelpCircle,
  Home,
  Layers,
  Megaphone,
  PanelLeftClose,
  PanelLeftOpen,
  PhoneCall,
  PieChart,
  Plus,
  Receipt,
  Search,
  Share2,
  ShieldAlert,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import { CrmViewTab } from '../types';

interface CrmRailAndSidebarProps {
  activeTab: CrmViewTab;
  setActiveTab: (tab: CrmViewTab) => void;
  isCollapsed: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
  leadCount: number;
  dealCount: number;
  accountCount: number;
  taskCount: number;
  meetingCount?: number;
  callLogCount?: number;
  invoiceCount?: number;
}

export const CrmRailAndSidebar: React.FC<CrmRailAndSidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  leadCount,
  dealCount,
  accountCount,
  taskCount,
  meetingCount = 0,
  callLogCount = 0,
  invoiceCount = 0,
}) => {
  const [salesExpanded, setSalesExpanded] = useState(true);
  const [activitiesExpanded, setActivitiesExpanded] = useState(true);
  const [inventoryExpanded, setInventoryExpanded] = useState(true);
  const [supportExpanded, setSupportExpanded] = useState(false);
  const [teamspaceSearch, setTeamspaceSearch] = useState('');

  return (
    <aside className="flex shrink-0 z-30 select-none">
      {/* 1. Global Slim Left Rail (Zoho Style)
          ONLY visible when the extended sidebar option is disabled (isCollapsed is true).
          When sidebar is extended, this blue rail moves left off-screen and is hidden. */}
      {isCollapsed && (
        <div className="w-14 bg-[#1f2946] border-r border-[#12192d] flex flex-col items-center py-4 justify-between min-h-[calc(100vh-53px)] transition-all duration-300">
          <div className="flex flex-col items-center gap-3">
            {/* Expand Sidebar Toggle on Rail */}
            {setIsCollapsed && (
              <button
                type="button"
                onClick={() => setIsCollapsed(false)}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer relative group mb-1"
                title="Expand sidebar"
              >
                <PanelLeftOpen className="w-5 h-5 text-blue-400" />
                <div className="absolute left-14 ml-2 px-2 py-1 bg-[#0e1424] text-white text-[10px] rounded shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
                  Expand Navigation
                </div>
              </button>
            )}

            <button
              onClick={() => setActiveTab('home')}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer relative group ${
                activeTab === 'home'
                  ? 'bg-[#c62d37] text-white shadow-md'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title="Home Dashboard"
            >
              <Home className="w-5 h-5" />
              <div className="absolute left-14 ml-2 px-2 py-1 bg-[#0e1424] text-white text-[10px] rounded shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
                Home Dashboard
              </div>
            </button>

            <button
              onClick={() => setActiveTab('leads')}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer relative group ${
                activeTab === 'leads'
                  ? 'bg-[#c62d37] text-white shadow-md'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title="Leads"
            >
              <Target className="w-5 h-5" />
              <div className="absolute left-14 ml-2 px-2 py-1 bg-[#0e1424] text-white text-[10px] rounded shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
                Leads ({leadCount})
              </div>
            </button>

            <button
              onClick={() => setActiveTab('deals')}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer relative group ${
                activeTab === 'deals'
                  ? 'bg-[#c62d37] text-white shadow-md'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title="Deals Pipeline"
            >
              <Briefcase className="w-5 h-5" />
              <div className="absolute left-14 ml-2 px-2 py-1 bg-[#0e1424] text-white text-[10px] rounded shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
                Deals ({dealCount})
              </div>
            </button>

            <button
              onClick={() => setActiveTab('accounts')}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer relative group ${
                activeTab === 'accounts'
                  ? 'bg-[#c62d37] text-white shadow-md'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title="Institutions"
            >
              <Building2 className="w-5 h-5" />
              <div className="absolute left-14 ml-2 px-2 py-1 bg-[#0e1424] text-white text-[10px] rounded shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
                Institutions ({accountCount})
              </div>
            </button>

            <button
              onClick={() => setActiveTab('activities')}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer relative group ${
                activeTab === 'activities'
                  ? 'bg-[#c62d37] text-white shadow-md'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title="Tasks"
            >
              <CheckSquare className="w-5 h-5" />
              <div className="absolute left-14 ml-2 px-2 py-1 bg-[#0e1424] text-white text-[10px] rounded shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
                Tasks ({taskCount})
              </div>
            </button>

            <button
              onClick={() => setActiveTab('meetings')}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer relative group ${
                activeTab === 'meetings'
                  ? 'bg-[#c62d37] text-white shadow-md'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title="Meetings & Demos"
            >
              <Calendar className="w-5 h-5" />
              <div className="absolute left-14 ml-2 px-2 py-1 bg-[#0e1424] text-white text-[10px] rounded shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
                Meetings &amp; Demos ({meetingCount})
              </div>
            </button>

            <button
              onClick={() => setActiveTab('call_logs')}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer relative group ${
                activeTab === 'call_logs'
                  ? 'bg-[#c62d37] text-white shadow-md'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title="Call Logs"
            >
              <PhoneCall className="w-5 h-5" />
              <div className="absolute left-14 ml-2 px-2 py-1 bg-[#0e1424] text-white text-[10px] rounded shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
                Call Logs ({callLogCount})
              </div>
            </button>

            <button
              onClick={() => setActiveTab('quotes')}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer relative group ${
                activeTab === 'quotes'
                  ? 'bg-[#c62d37] text-white shadow-md'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title="Quotes & GST"
            >
              <FileCheck2 className="w-5 h-5" />
              <div className="absolute left-14 ml-2 px-2 py-1 bg-[#0e1424] text-white text-[10px] rounded shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
                Quotations &amp; GST
              </div>
            </button>

            <button
              onClick={() => setActiveTab('invoices')}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer relative group ${
                activeTab === 'invoices'
                  ? 'bg-[#c62d37] text-white shadow-md'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title="Finance Invoices"
            >
              <Receipt className="w-5 h-5" />
              <div className="absolute left-14 ml-2 px-2 py-1 bg-[#0e1424] text-white text-[10px] rounded shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
                Finance ERP Invoices ({invoiceCount})
              </div>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer relative group ${
                activeTab === 'reports'
                  ? 'bg-[#c62d37] text-white shadow-md'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title="Sales Reports"
            >
              <FileSpreadsheet className="w-5 h-5" />
              <div className="absolute left-14 ml-2 px-2 py-1 bg-[#0e1424] text-white text-[10px] rounded shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
                Reports &amp; BI
              </div>
            </button>
          </div>

          {/* Bottom Rail Motifs */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="CRM Engine Online" />
            <span className="text-[10px] font-mono font-bold text-white/50">V2</span>
          </div>
        </div>
      )}

      {/* 2. Extended Teamspace Sidebar (Zoho Style)
          ONLY visible when sidebar is extended (!isCollapsed).
          When extended, this is the sole sidebar on the left. */}
      {!isCollapsed && (
        <div className="w-64 bg-white border-r border-[#e3ded5] flex flex-col py-3 px-2 text-xs transition-all duration-300 overflow-y-auto min-h-[calc(100vh-53px)] shadow-xs">
          {/* Teamspace Header with Collapse Toggle */}
          <div className="px-2 pb-2.5 border-b border-[#f1efe9]">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#1f2946] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#c62d37]" />
                CRM Teamspace
              </span>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-semibold text-[#5a6376] bg-[#f7f6f2] px-1.5 py-0.5 rounded border border-[#e3ded5]">
                  TechM4
                </span>
                {setIsCollapsed && (
                  <button
                    type="button"
                    onClick={() => setIsCollapsed(true)}
                    className="p-1 text-[#5a6376] hover:text-[#1f2946] hover:bg-[#f1efe9] rounded transition cursor-pointer"
                    title="Collapse to slim rail"
                  >
                    <PanelLeftClose className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Filter Search */}
            <div className="mt-2 relative">
              <Search className="w-3.5 h-3.5 text-[#5a6376] absolute left-2.5 top-2 pointer-events-none" />
              <input
                type="text"
                value={teamspaceSearch}
                onChange={(e) => setTeamspaceSearch(e.target.value)}
                placeholder="Search modules..."
                className="w-full pl-8 pr-2 py-1 bg-[#f7f6f2] focus:bg-white border border-[#e3ded5] focus:border-[#1f2946] rounded-md text-[11px] text-[#1f2946] placeholder-[#5a6376] focus:outline-none transition"
              />
            </div>
          </div>

          {/* Module List Groups */}
          <div className="space-y-4 pt-3 flex-1">
            {/* Sales Section */}
            <div>
              <button
                type="button"
                onClick={() => setSalesExpanded(!salesExpanded)}
                className="w-full flex items-center justify-between px-2 py-1 font-bold text-[#5a6376] hover:text-[#1f2946] uppercase text-[10px] tracking-wider cursor-pointer"
              >
                <span>Sales &amp; Pipeline</span>
                {salesExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              {salesExpanded && (
                <div className="mt-1 space-y-0.5">
                  <button
                    onClick={() => setActiveTab('home')}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                      activeTab === 'home' ? 'bg-[#1f2946] text-white' : 'text-[#1f2946] hover:bg-[#f7f6f2]'
                    }`}
                  >
                    <Home className="w-4 h-4 text-slate-500" />
                    <span>Home Dashboard</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('leads')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                      activeTab === 'leads' ? 'bg-[#1f2946] text-white' : 'text-[#1f2946] hover:bg-[#f7f6f2]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-[#c62d37]" />
                      <span>Leads</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      activeTab === 'leads' ? 'bg-white/20 text-white' : 'bg-[#f1efe9] text-[#5a6376]'
                    }`}>
                      {leadCount}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('contacts')}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                      activeTab === 'contacts' ? 'bg-[#1f2946] text-white' : 'text-[#1f2946] hover:bg-[#f7f6f2]'
                    }`}
                  >
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>Contacts (Stakeholders)</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('accounts')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                      activeTab === 'accounts' ? 'bg-[#1f2946] text-white' : 'text-[#1f2946] hover:bg-[#f7f6f2]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-purple-600" />
                      <span>Accounts (Institutions)</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      activeTab === 'accounts' ? 'bg-white/20 text-white' : 'bg-[#f1efe9] text-[#5a6376]'
                    }`}>
                      {accountCount}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('deals')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                      activeTab === 'deals' ? 'bg-[#1f2946] text-white' : 'text-[#1f2946] hover:bg-[#f7f6f2]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-emerald-600" />
                      <span>Deals &amp; Pipeline</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      activeTab === 'deals' ? 'bg-white/20 text-white' : 'bg-[#f1efe9] text-[#5a6376]'
                    }`}>
                      {dealCount}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('campaigns')}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                      activeTab === 'campaigns' ? 'bg-[#1f2946] text-white' : 'text-[#1f2946] hover:bg-[#f7f6f2]'
                    }`}
                  >
                    <Megaphone className="w-4 h-4 text-amber-600" />
                    <span>Campaigns (Outreach)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Activities Section */}
            <div>
              <button
                type="button"
                onClick={() => setActivitiesExpanded(!activitiesExpanded)}
                className="w-full flex items-center justify-between px-2 py-1 font-bold text-[#5a6376] hover:text-[#1f2946] uppercase text-[10px] tracking-wider cursor-pointer"
              >
                <span>Activities &amp; Engagement</span>
                {activitiesExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              {activitiesExpanded && (
                <div className="mt-1 space-y-0.5">
                  <button
                    onClick={() => setActiveTab('activities')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                      activeTab === 'activities' ? 'bg-[#1f2946] text-white' : 'text-[#1f2946] hover:bg-[#f7f6f2]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-rose-600" />
                      <span>Tasks</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      activeTab === 'activities' ? 'bg-white/20 text-white' : 'bg-[#f1efe9] text-[#5a6376]'
                    }`}>
                      {taskCount}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('meetings')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                      activeTab === 'meetings' ? 'bg-[#1f2946] text-white' : 'text-[#1f2946] hover:bg-[#f7f6f2]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span>Meetings &amp; Demos</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      activeTab === 'meetings' ? 'bg-white/20 text-white' : 'bg-[#f1efe9] text-[#5a6376]'
                    }`}>
                      {meetingCount}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('call_logs')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                      activeTab === 'call_logs' ? 'bg-[#1f2946] text-white' : 'text-[#1f2946] hover:bg-[#f7f6f2]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <PhoneCall className="w-4 h-4 text-emerald-600" />
                      <span>Call Logs</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      activeTab === 'call_logs' ? 'bg-white/20 text-white' : 'bg-[#f1efe9] text-[#5a6376]'
                    }`}>
                      {callLogCount}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Inventory & Commercial Section */}
            <div>
              <button
                type="button"
                onClick={() => setInventoryExpanded(!inventoryExpanded)}
                className="w-full flex items-center justify-between px-2 py-1 font-bold text-[#5a6376] hover:text-[#1f2946] uppercase text-[10px] tracking-wider cursor-pointer"
              >
                <span>Billing &amp; Commercials</span>
                {inventoryExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              {inventoryExpanded && (
                <div className="mt-1 space-y-0.5">
                  <button
                    onClick={() => setActiveTab('quotes')}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                      activeTab === 'quotes' ? 'bg-[#1f2946] text-white' : 'text-[#1f2946] hover:bg-[#f7f6f2]'
                    }`}
                  >
                    <FileCheck2 className="w-4 h-4 text-emerald-600" />
                    <span>Quotations &amp; GST</span>
                  </button>

                  {/* Integrated Finance Invoices Window (No External Redirect) */}
                  <button
                    onClick={() => setActiveTab('invoices')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                      activeTab === 'invoices' ? 'bg-[#1f2946] text-white' : 'text-[#1f2946] hover:bg-[#f7f6f2]'
                    }`}
                    title="Integrated Finance ERP Invoices & Receivables"
                  >
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-blue-600" />
                      <span>Finance Invoices</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      activeTab === 'invoices' ? 'bg-white/20 text-white' : 'bg-[#f1efe9] text-[#5a6376]'
                    }`}>
                      {invoiceCount}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Reports Section */}
            <div>
              <button
                onClick={() => setActiveTab('reports')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  activeTab === 'reports' ? 'bg-[#1f2946] text-white' : 'text-[#1f2946] hover:bg-[#f7f6f2]'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-purple-600" />
                <span>Reports &amp; Analytics</span>
              </button>
            </div>

            {/* Support Section */}
            <div>
              <button
                type="button"
                onClick={() => setSupportExpanded(!supportExpanded)}
                className="w-full flex items-center justify-between px-2 py-1 font-bold text-[#5a6376] hover:text-[#1f2946] uppercase text-[10px] tracking-wider cursor-pointer"
              >
                <span>Support &amp; KB</span>
                {supportExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              {supportExpanded && (
                <div className="mt-1 space-y-0.5">
                  <button
                    onClick={() => setActiveTab('home')}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg font-semibold text-[#1f2946] hover:bg-[#f7f6f2] transition cursor-pointer"
                  >
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>Cases &amp; Grievances</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('home')}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg font-semibold text-[#1f2946] hover:bg-[#f7f6f2] transition cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4 text-purple-600" />
                    <span>Solutions &amp; FAQs</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Footer inside sidebar */}
          <div className="pt-3 border-t border-[#f1efe9] text-[10px] text-[#5a6376] flex items-center justify-between">
            <span>TechM4 CRM v2.0</span>
            <span className="text-[#047857] font-semibold">● Online</span>
          </div>
        </div>
      )}
    </aside>
  );
};
