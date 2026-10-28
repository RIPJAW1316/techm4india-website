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
  leadCount: number;
  dealCount: number;
  accountCount: number;
  taskCount: number;
}

export const CrmRailAndSidebar: React.FC<CrmRailAndSidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  leadCount,
  dealCount,
  accountCount,
  taskCount,
}) => {
  const [salesExpanded, setSalesExpanded] = useState(true);
  const [activitiesExpanded, setActivitiesExpanded] = useState(true);
  const [inventoryExpanded, setInventoryExpanded] = useState(true);
  const [supportExpanded, setSupportExpanded] = useState(false);
  const [teamspaceSearch, setTeamspaceSearch] = useState('');

  return (
    <aside className="flex shrink-0 z-30 select-none">
      {/* 1. Global Slim Left Rail (Zoho Style) */}
      <div className="w-14 bg-[#1f2946] border-r border-[#12192d] flex flex-col items-center py-4 justify-between min-h-[calc(100vh-53px)]">
        <div className="flex flex-col items-center gap-5">
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
            <span className="sr-only">Home</span>
            <div className="absolute left-14 ml-2 px-2 py-1 bg-[#0e1424] text-white text-[10px] rounded shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
              Aryan Reddy&apos;s Home
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

          <button
            onClick={() => setActiveTab('reports')}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer relative group"
            title="Sales Analytics"
          >
            <PieChart className="w-5 h-5" />
            <div className="absolute left-14 ml-2 px-2 py-1 bg-[#0e1424] text-white text-[10px] rounded shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
              Analytics
            </div>
          </button>

          <button
            onClick={() => setActiveTab('home')}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer relative group"
            title="TechM4 AI Agents"
          >
            <Bot className="w-5 h-5" />
            <div className="absolute left-14 ml-2 px-2 py-1 bg-[#0e1424] text-white text-[10px] rounded shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
              AI Sales Agents
            </div>
          </button>

          <button
            onClick={() => setActiveTab('home')}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer relative group"
            title="Model Context Protocol (MCP)"
          >
            <Cpu className="w-5 h-5" />
            <div className="absolute left-14 ml-2 px-2 py-1 bg-[#0e1424] text-white text-[10px] rounded shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50">
              MCP Tools
            </div>
          </button>
        </div>

        {/* Bottom Rail Motifs */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="CRM Engine Online" />
          <span className="text-[10px] font-mono font-bold text-white/50">V2</span>
        </div>
      </div>

      {/* 2. Collapsible Teamspace Sidebar (Zoho Style) */}
      {!isCollapsed && (
        <div className="w-60 bg-white border-r border-[#e3ded5] flex flex-col py-3 px-2 text-xs transition-all overflow-y-auto min-h-[calc(100vh-53px)]">
          {/* Teamspace Header */}
          <div className="px-2 pb-2.5 border-b border-[#f1efe9]">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#1f2946] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#c62d37]" />
                CRM Teamspace
              </span>
              <span className="text-[10px] font-semibold text-[#5a6376] bg-[#f7f6f2] px-1.5 py-0.5 rounded border border-[#e3ded5]">
                TechM4
              </span>
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
                <span>Sales</span>
                {salesExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              {salesExpanded && (
                <div className="mt-1 space-y-0.5">
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
                    <span>Contacts</span>
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
                    <span>Campaigns (WhatsApp/Email)</span>
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
                <span>Activities</span>
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
                    onClick={() => setActiveTab('activities')}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg font-semibold text-[#1f2946] hover:bg-[#f7f6f2] transition cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>Meetings &amp; Demos</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('activities')}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg font-semibold text-[#1f2946] hover:bg-[#f7f6f2] transition cursor-pointer"
                  >
                    <PhoneCall className="w-4 h-4 text-emerald-600" />
                    <span>Call Logs</span>
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
                <span>Inventory &amp; Quotes</span>
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

                  <a
                    href="http://localhost:3001"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-semibold text-[#1f2946] hover:bg-[#f7f6f2] transition"
                    title="Open Finance ERP for full invoice tracking"
                  >
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-blue-600" />
                      <span>Finance ERP Invoices</span>
                    </div>
                    <span className="text-[9px] bg-[#f1f5f9] text-[#475569] px-1 rounded font-mono">
                      :3001
                    </span>
                  </a>
                </div>
              )}
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
