'use client';

import React, { useState } from 'react';
import {
  Bell,
  Calendar,
  CheckSquare,
  ChevronDown,
  ExternalLink,
  Layers,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  User,
  X,
} from 'lucide-react';
import { CrmViewTab } from '../types';

interface CrmHeaderProps {
  activeTab: CrmViewTab;
  setActiveTab: (tab: CrmViewTab) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (v: boolean) => void;
  currentView: string;
  setCurrentView: (v: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenCreateLead: () => void;
  onOpenCreateDeal: () => void;
  onOpenCreateTask: () => void;
  onRefresh: () => void;
}

const MAIN_PORTAL_URL =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5173'
    : 'https://techm4india.com';

export const CrmHeader: React.FC<CrmHeaderProps> = ({
  activeTab,
  setActiveTab,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  currentView,
  setCurrentView,
  searchQuery,
  setSearchQuery,
  onOpenCreateLead,
  onOpenCreateDeal,
  onOpenCreateTask,
  onRefresh,
}) => {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-[#e3ded5] sticky top-0 z-40 px-3 sm:px-4 py-2.5 shadow-2xs">
      <div className="flex items-center justify-between gap-3">
        {/* Left Side: Brand, Sidebar Toggle, Page Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 text-[#5a6376] hover:text-[#1f2946] hover:bg-[#f1efe9] rounded-lg transition cursor-pointer"
            title={isSidebarCollapsed ? 'Expand navigation sidebar' : 'Collapse navigation sidebar'}
          >
            {isSidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1f2946] text-white flex items-center justify-center font-black text-xs shadow-xs">
              TM4
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-wider uppercase text-[#1f2946]">
                  TECHM4<span className="text-[#c62d37]">INDIA</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#fff1f2] text-[#c62d37] border border-[#fecdd3]">
                  CRM 2.0
                </span>
                <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#f1f5f9] text-[#475569] border border-[#cbd5e1]">
                  Port :3003
                </span>
              </div>
            </div>
          </div>

          <div className="h-5 w-px bg-[#e3ded5] mx-1 hidden sm:block" />

          {/* Active View Title */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm font-bold text-[#1f2946] capitalize">
              {activeTab === 'home'
                ? currentView
                : activeTab === 'leads'
                ? 'Leads Management'
                : activeTab === 'accounts'
                ? 'Institutions (Accounts)'
                : activeTab === 'contacts'
                ? 'Stakeholder Directory'
                : activeTab === 'deals'
                ? 'Deals & Revenue Pipeline'
                : activeTab === 'activities'
                ? 'Activities & Follow-ups'
                : activeTab === 'quotes'
                ? 'Quotations & Finance Bridge'
                : activeTab === 'campaigns'
                ? 'Marketing Campaigns'
                : 'Sales Reports & Analytics'}
            </span>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-md mx-2 relative hidden md:block">
          <Search className="w-4 h-4 text-[#5a6376] absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search records (Leads, Institutions, Deals, Contacts)..."
            className="w-full pl-9 pr-12 py-1.5 bg-[#f7f6f2] hover:bg-[#f1efe9] focus:bg-white border border-[#e3ded5] focus:border-[#1f2946] rounded-xl text-xs text-[#1f2946] placeholder-[#5a6376] focus:outline-none transition shadow-2xs"
          />
          <kbd className="absolute right-3 top-2 px-1.5 py-0.5 text-[9px] font-mono bg-white border border-[#cbd5e1] rounded text-[#5a6376]">
            ⌘K
          </kbd>
        </div>

        {/* Right Side: Quick Add, Notifications, View Selector, User */}
        <div className="flex items-center gap-2">
          {/* Quick Add Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#c62d37] hover:bg-[#a8222e] text-white text-xs font-bold transition shadow-xs cursor-pointer"
              title="Create new record"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add</span>
            </button>

            {isQuickAddOpen && (
              <div
                className="absolute right-0 mt-1.5 w-48 bg-white border border-[#e3ded5] rounded-xl shadow-xl py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setIsQuickAddOpen(false)}
              >
                <div className="px-3 py-1.5 text-[10px] font-bold text-[#5a6376] uppercase tracking-wider border-b border-[#f1efe9]">
                  Quick Actions
                </div>
                <button
                  onClick={onOpenCreateLead}
                  className="w-full text-left px-3 py-2 text-[#1f2946] hover:bg-[#f7f6f2] font-semibold flex items-center justify-between cursor-pointer"
                >
                  <span>+ New Lead</span>
                  <span className="text-[10px] text-[#5a6376]">B2B / B2C</span>
                </button>
                <button
                  onClick={onOpenCreateDeal}
                  className="w-full text-left px-3 py-2 text-[#1f2946] hover:bg-[#f7f6f2] font-semibold flex items-center justify-between cursor-pointer"
                >
                  <span>+ New Deal</span>
                  <span className="text-[10px] text-[#5a6376]">Pipeline</span>
                </button>
                <button
                  onClick={onOpenCreateTask}
                  className="w-full text-left px-3 py-2 text-[#1f2946] hover:bg-[#f7f6f2] font-semibold flex items-center justify-between cursor-pointer"
                >
                  <span>+ New Task</span>
                  <span className="text-[10px] text-[#5a6376]">Follow-up</span>
                </button>
              </div>
            )}
          </div>

          {/* Refresh Action */}
          <button
            type="button"
            onClick={onRefresh}
            className="p-1.5 text-[#5a6376] hover:text-[#1f2946] hover:bg-[#f1efe9] rounded-lg transition cursor-pointer"
            title="Refresh CRM dataset"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* View Switcher Menu */}
          <div className="relative hidden lg:block">
            <button
              type="button"
              onClick={() => setIsViewMenuOpen(!isViewMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#f7f6f2] hover:bg-[#f1efe9] border border-[#e3ded5] rounded-lg text-xs font-semibold text-[#1f2946] transition cursor-pointer"
            >
              <span>{currentView}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#5a6376]" />
            </button>

            {isViewMenuOpen && (
              <div
                className="absolute right-0 mt-1.5 w-52 bg-white border border-[#e3ded5] rounded-xl shadow-xl py-1 z-50 text-xs"
                onClick={() => setIsViewMenuOpen(false)}
              >
                <button
                  onClick={() => {
                    setCurrentView("Aryan Reddy's Home");
                    setActiveTab('home');
                  }}
                  className={`w-full text-left px-3 py-2 font-semibold flex items-center justify-between cursor-pointer ${
                    currentView === "Aryan Reddy's Home" ? 'bg-[#f7f6f2] text-[#c62d37]' : 'text-[#1f2946] hover:bg-[#f1efe9]'
                  }`}
                >
                  <span>Aryan Reddy&apos;s Home</span>
                  <Sparkles className="w-3.5 h-3.5 text-[#d97706]" />
                </button>
                <button
                  onClick={() => {
                    setCurrentView('Executive Sales Pipeline');
                    setActiveTab('deals');
                  }}
                  className="w-full text-left px-3 py-2 text-[#1f2946] hover:bg-[#f1efe9] font-semibold cursor-pointer"
                >
                  Executive Sales Pipeline
                </button>
                <button
                  onClick={() => {
                    setCurrentView('Institution Accounts View');
                    setActiveTab('accounts');
                  }}
                  className="w-full text-left px-3 py-2 text-[#1f2946] hover:bg-[#f1efe9] font-semibold cursor-pointer"
                >
                  Institution Accounts View
                </button>
              </div>
            )}
          </div>

          {/* Central Dashboard Return */}
          <a
            href={`${MAIN_PORTAL_URL}/dashboard`}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1f2946] hover:bg-[#2d395e] text-white text-xs font-semibold shadow-xs transition"
            title="Return to Central Governance Portal"
          >
            <span className="hidden sm:inline">Dashboard</span>
            <ExternalLink className="w-3 h-3 text-white/70" />
          </a>

          {/* Aryan Reddy User Avatar */}
          <div className="w-7 h-7 rounded-full bg-[#1f2946] text-white flex items-center justify-center font-bold text-[11px] shadow-xs">
            AR
          </div>
        </div>
      </div>
    </header>
  );
};
