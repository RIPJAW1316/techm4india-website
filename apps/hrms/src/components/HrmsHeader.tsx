import React from 'react';
import {
  Calendar,
  Clock,
  DollarSign,
  ExternalLink,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Receipt,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
} from 'lucide-react';
import { HrmsTab } from '../types';

interface HrmsHeaderProps {
  activeTab: HrmsTab;
  setActiveTab: (tab: HrmsTab) => void;
  isClockedIn: boolean;
  onToggleClock: () => void;
  onOpenApplyLeave: () => void;
  onOpenSubmitClaim: () => void;
  onOpenAddEmployee: () => void;
  onSignOut: () => void;
  userEmail?: string;
  userName?: string;
}

const MAIN_PORTAL_URL =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5173'
    : 'https://techm4india.com';

export const HrmsHeader: React.FC<HrmsHeaderProps> = ({
  activeTab,
  setActiveTab,
  isClockedIn,
  onToggleClock,
  onOpenApplyLeave,
  onOpenSubmitClaim,
  onOpenAddEmployee,
  onSignOut,
  userEmail = 'hrms.lead@techm4india.com',
  userName = 'Aarav Patel',
}) => {
  const tabs = [
    { id: 'overview' as HrmsTab, label: 'Executive Overview', icon: LayoutDashboard },
    { id: 'employees' as HrmsTab, label: 'Directory & Profiles', icon: Users },
    { id: 'attendance' as HrmsTab, label: 'Time & Attendance', icon: Clock },
    { id: 'leave' as HrmsTab, label: 'e-Leave Tracking', icon: Calendar },
    { id: 'payroll' as HrmsTab, label: 'Payroll & Payslips', icon: DollarSign },
    { id: 'claims' as HrmsTab, label: 'Expense Claims', icon: Receipt },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="border-b border-[#e3ded5] bg-white/95 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-3.5 shadow-xs">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Top Row: Brand & Quick Action Triggers */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a
              href={`${MAIN_PORTAL_URL}/dashboard`}
              className="flex items-center gap-2.5 group no-underline text-[#1f2946]"
            >
              <div className="w-10 h-10 rounded-xl bg-[#1f2946] text-white flex items-center justify-center font-black tracking-wider text-sm shadow-md group-hover:scale-105 transition-transform overflow-hidden relative border border-white/20 shrink-0">
                <img
                  src="/images/brand/logo.png"
                  alt="TechM4 Logo"
                  width="40"
                  height="40"
                  className="w-full h-full object-cover relative z-10"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-xs font-black tracking-wider text-white">
                  TM4
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black tracking-wider uppercase text-[#1f2946]">
                    TECHM4<span className="text-[#c62d37]">INDIA</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#fff1f2] text-[#c62d37] border border-[#fecdd3]">
                    HRMS 2.0
                  </span>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#f1efe9] text-[#5a6376] border border-[#d1cbbf]">
                    Port :3002
                  </span>
                  <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]">
                    FY 2026-27
                  </span>
                </div>
                <p className="text-xs text-[#5a6376] mt-0.5 font-medium">
                  Human Capital &amp; Workforce Operations · Hyderabad HQ
                </p>
              </div>
            </a>
          </div>

          {/* Right Action Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Duty Clock Toggle */}
            <button
              type="button"
              onClick={onToggleClock}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-xs ${
                isClockedIn
                  ? 'bg-[#ecfdf5] hover:bg-[#d1fae5] text-[#047857] border-[#a7f3d0]'
                  : 'bg-white hover:bg-[#f7f6f2] text-[#1f2946] border-[#d1cbbf]'
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isClockedIn ? 'bg-[#059669] animate-pulse' : 'bg-[#f59e0b]'
                }`}
              />
              <Clock className="w-3.5 h-3.5" />
              <span>{isClockedIn ? 'Duty: Clocked In' : 'Clock In Today'}</span>
            </button>

            {/* + Apply Leave */}
            <button
              type="button"
              onClick={onOpenApplyLeave}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1f2946] hover:bg-[#151c31] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span>+ Apply Leave</span>
            </button>

            {/* + Submit Claim */}
            <button
              type="button"
              onClick={onOpenSubmitClaim}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#f7f6f2] border border-[#d1cbbf] text-[#1f2946] text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Receipt className="w-3.5 h-3.5 text-[#2563eb]" />
              <span>+ Claim</span>
            </button>

            {/* + Add Employee */}
            <button
              type="button"
              onClick={onOpenAddEmployee}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#f7f6f2] border border-[#d1cbbf] text-[#1f2946] text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#059669]" />
              <span>+ New Hire</span>
            </button>

            {/* Back to Central Portal */}
            <a
              href={`${MAIN_PORTAL_URL}/dashboard`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f1efe9] hover:bg-[#e8e4da] border border-[#d1cbbf] text-[#1f2946] text-xs font-bold transition-all shadow-xs no-underline"
              title="Return to Central ERP Dashboard"
            >
              <Home className="w-3.5 h-3.5 text-[#5a6376]" />
              <span className="hidden sm:inline">Dashboard</span>
              <ExternalLink className="w-3 h-3 text-[#5a6376]" />
            </a>

            {/* User Profile Pill & Sign Out */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#e3ded5]">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c62d37] to-[#1f2946] text-white flex items-center justify-center text-xs font-extrabold shadow-xs">
                {getInitials(userName)}
              </div>
              <button
                type="button"
                onClick={onSignOut}
                className="p-1.5 rounded-lg text-[#5a6376] hover:text-[#c62d37] hover:bg-[#fff1f2] transition cursor-pointer"
                title="Sign Out / Switch Account"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Middle Bar: Statutory Compliance Strip */}
        <div className="pt-2 border-t border-[#f0ece3] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-[#5a6376]">
              <Clock className="w-3.5 h-3.5 text-[#059669]" />
              <span>
                Biometric Terminal:{' '}
                <strong className="text-[#1f2946]">Hyd-Gate-01 (Online)</strong>
              </span>
            </div>
            <span className="text-[#d1cbbf]">•</span>
            <div className="flex items-center gap-1.5 text-[#5a6376]">
              <Calendar className="w-3.5 h-3.5 text-[#2563eb]" />
              <span>Next Pay Run: 31 Oct 2026</span>
            </div>
            <span className="text-[#d1cbbf]">•</span>
            <div className="flex items-center gap-1.5 text-[#5a6376]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#7c3aed]" />
              <span>OIDC SSO: Verified</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]">
              Statutory Engine: PF / ESI / PT / TDS
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#fff1f2] text-[#c62d37] border border-[#fecdd3]">
              Hr.my Parity: 100%
            </span>
          </div>
        </div>

        {/* Bottom Bar: Tab Navigation Bar */}
        <nav className="flex items-center gap-1.5 border-t border-[#e3ded5] pt-2 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#1f2946] text-white shadow-xs'
                    : 'text-[#5a6376] hover:text-[#1f2946] hover:bg-[#f7f6f2]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#5a6376]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
