"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Award,
  Bell,
  Briefcase,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  FileText,
  HelpCircle,
  Home,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  PieChart,
  Receipt,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  User,
  Users,
  X,
} from "lucide-react";
import { clearSession, getAccessToken, getMe, logout } from "@/lib/auth-client";
import { getTodayAttendance } from "@/lib/hrms-client";

interface NavItem {
  href: string;
  label: string;
  icon: any;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/hrms", label: "Overview", icon: LayoutDashboard },
  { href: "/hrms/employees", label: "Employee Directory", icon: Users },
  { href: "/hrms/attendance", label: "Time & Attendance", icon: Clock },
  { href: "/hrms/leave", label: "e-Leave Management", icon: Calendar },
  { href: "/hrms/payroll", label: "Payroll & Payslips", icon: DollarSign },
  { href: "/hrms/claims", label: "Expense Claims", icon: Receipt },
  { href: "/hrms/documents", label: "Document Workflow", icon: FileText },
  { href: "/hrms/incidents", label: "Incidents & Safety", icon: AlertTriangle },
  { href: "/hrms/announcements", label: "Notice Board & Forum", icon: MessageSquare },
  { href: "/hrms/reports", label: "Reports & Analytics", icon: PieChart },
  { href: "/hrms/settings", label: "HR Settings", icon: Settings },
];

export default function HrmsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);

  useEffect(() => {
    let ignore = false;
    async function initSession() {
      const token = getAccessToken();
      if (!token) {
        window.location.href = "/login";
        return;
      }
      try {
        const [me, att] = await Promise.all([
          getMe().catch(() => null),
          getTodayAttendance().catch(() => null),
        ]);
        if (!ignore) {
          setUserProfile(me);
          setTodayAttendance(att);
        }
      } catch {
        // Fallback for offline or mock state
      }
    }
    initSession();
    return () => {
      ignore = true;
    };
  }, []);

  async function handleSignOut() {
    try {
      await logout();
    } finally {
      window.location.href = "/login";
    }
  }

  function getInitials(name = "Employee") {
    return name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <div className="erp-route min-h-screen bg-[#eef2f6] text-[#1d2539] flex flex-col antialiased">
      <div className="flex-1 flex overflow-hidden">
        {/* Mobile menu backdrop */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 bg-[#12192d] text-slate-100 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-800 shadow-xl lg:shadow-none ${
            collapsed ? "w-20" : "w-64"
          } ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        >
          {/* Sidebar Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 bg-[#0e1424]">
            <Link href="/hrms" className="flex items-center gap-2.5 overflow-hidden group">
              <img
                src="/images/brand/logo.png"
                alt="TechM4India"
                width="34"
                height="34"
                className="shrink-0 transition-transform group-hover:scale-105"
              />
              {!collapsed && (
                <div className="truncate">
                  <div className="text-sm font-black tracking-wider uppercase text-white">
                    TECHM4<span className="text-[#d73531]">HRMS</span>
                  </div>
                  <div className="text-[9px] font-semibold tracking-widest uppercase text-slate-400">
                    Human Capital ERP
                  </div>
                </div>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Division Badge */}
          {!collapsed && (
            <div className="px-4 py-2.5 bg-slate-800/30 border-b border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Enterprise Portal</span>
              </span>
              <span className="font-mono text-[10px] text-red-400 uppercase">Hr.my Parity</span>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1 scrollbar-thin">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/hrms"
                  ? pathname === "/hrms"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[#d73531] text-white shadow-md shadow-red-900/30"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/70"
                  } ${collapsed ? "justify-center px-2" : ""}`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {!collapsed && item.badge && (
                    <span className="ml-auto px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-red-500/20 text-red-300">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Attendance Quick Indicator */}
          {!collapsed && (
            <div className="p-3 mx-3 my-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Today&#39;s Clock
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    todayAttendance?.clockInTime ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                  }`}
                />
              </div>
              <p className="text-white font-medium text-xs">
                {todayAttendance?.clockInTime ? "Clocked In" : "Not Clocked In"}
              </p>
              <Link
                href="/hrms/attendance"
                className="text-[10px] text-red-400 hover:text-red-300 font-semibold block"
              >
                Go to Attendance &rarr;
              </Link>
            </div>
          )}

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-slate-800 bg-[#0e1424] space-y-2">
            <Link
              href="/dashboard"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors ${
                collapsed ? "justify-center px-1" : ""
              }`}
              title={collapsed ? "Central Portal" : undefined}
            >
              <Home className="w-4 h-4 text-slate-400 shrink-0" />
              {!collapsed && <span>Central Dashboard</span>}
            </Link>

            <button
              type="button"
              onClick={handleSignOut}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-300 hover:text-white hover:bg-red-950/60 transition-colors ${
                collapsed ? "justify-center px-1" : ""
              }`}
              title={collapsed ? "Sign Out" : undefined}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!collapsed && <span>Sign Out</span>}
            </button>
          </div>
        </aside>

        {/* Main Content Shell */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Bar */}
          <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#d73531]">
                  TechM4India HRMS
                </span>
                <h1 className="text-sm sm:text-base font-bold text-slate-800 truncate">
                  Human Resource Management System
                </h1>
              </div>
            </div>

            {/* Top Bar Right Actions */}
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/hrms/attendance"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition-colors"
              >
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Quick Clock</span>
              </Link>

              <Link
                href="/hrms/leave"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#252e4a] hover:bg-[#d73531] text-white text-xs font-bold transition-all shadow-xs"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Apply Leave</span>
              </Link>

              {/* User profile dropdown pill */}
              <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
                <div className="w-9 h-9 rounded-full bg-[#252e4a] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  {getInitials(
                    userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : "TM"
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-800 leading-tight">
                    {userProfile
                      ? `${userProfile.firstName} ${userProfile.lastName}`
                      : "Staff Employee"}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    {userProfile?.roles?.[0] || "HRMS"}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Workspace View */}
          <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex-1 space-y-6">
            {children}
          </main>

          {/* Footer */}
          <footer className="py-4 px-6 bg-white border-t border-slate-200 text-center text-xs text-slate-500">
            <div className="flex flex-wrap items-center justify-between gap-2 max-w-7xl mx-auto">
              <span>
                &copy; {new Date().getFullYear()} TechM4India Innovations Pvt. Ltd. HRMS Module.
              </span>
              <div className="flex items-center gap-4 text-[11px] text-slate-400">
                <span>Hr.my Reference Workflow</span>
                <span>•</span>
                <span>Indian Statutory Compliant</span>
                <span>•</span>
                <Link href="/dashboard" className="text-slate-600 hover:text-slate-900 underline">
                  Back to Portal
                </Link>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
