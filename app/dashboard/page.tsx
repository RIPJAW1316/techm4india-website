"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  ExternalLink,
  Info,
  Layers,
  Lock,
  LogOut,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import {
  ApplicationAccessInfo,
  UserProfile,
  clearSession,
  getAccessToken,
  getAuthorizedApplications,
  getMe,
  logout,
} from "@/lib/auth-client";

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [applications, setApplications] = useState<ApplicationAccessInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // SSO launch modal state
  const [selectedApp, setSelectedApp] = useState<ApplicationAccessInfo | null>(null);

  useEffect(() => {
    let ignore = false;

    async function initialize() {
      const token = getAccessToken();
      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        const [userProfile, userApps] = await Promise.all([
          getMe(),
          getAuthorizedApplications(),
        ]);
        if (!ignore) {
          setProfile(userProfile);
          setApplications(userApps);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (!ignore) {
          if (err instanceof Error) {
            if (err.message.includes("Session expired") || err.message.includes("No active session")) {
              clearSession();
              window.location.href = "/login";
              return;
            }
            setErrorMessage(err.message);
          } else {
            setErrorMessage("Failed to load dashboard data. Please try again.");
          }
          setIsLoading(false);
        }
      }
    }

    initialize();
    return () => {
      ignore = true;
    };
  }, []);

  async function handleRefresh() {
    setIsRefreshing(true);
    setErrorMessage(null);
    try {
      const [userProfile, userApps] = await Promise.all([
        getMe(),
        getAuthorizedApplications(),
      ]);
      setProfile(userProfile);
      setApplications(userApps);
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.includes("Session expired") || err.message.includes("No active session")) {
          clearSession();
          window.location.href = "/login";
          return;
        }
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to load dashboard data. Please try again.");
      }
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleLogout() {
    try {
      await logout();
    } finally {
      window.location.href = "/login";
    }
  }

  function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }

  function getInitials(first = "", last = ""): string {
    return ((first[0] || "") + (last[0] || "")).toUpperCase() || "TM";
  }

  function getAppVisuals(appCode: string) {
    const code = appCode.toUpperCase();
    if (code.includes("HRMS")) {
      return {
        icon: Users,
        iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        badgeBg: "bg-emerald-950/60 text-emerald-300 border-emerald-500/30",
        category: "Human Capital Management",
        summary:
          "Manage company workforce, employee profiles, attendance, departmental hierarchy, and leaves under central identity.",
      };
    }
    if (code.includes("FINANCE")) {
      return {
        icon: DollarSign,
        iconBg: "bg-sky-500/10 text-sky-400 border-sky-500/30",
        badgeBg: "bg-sky-950/60 text-sky-300 border-sky-500/30",
        category: "Financial Operations & ERP",
        summary:
          "Enterprise ledger, fiscal accounting, invoicing, vendor purchase orders, and multi-department budget reconciliation.",
      };
    }
    if (code.includes("ADMIN")) {
      return {
        icon: ShieldCheck,
        iconBg: "bg-red-500/10 text-red-400 border-red-500/30",
        badgeBg: "bg-red-950/60 text-red-300 border-red-500/30",
        category: "Governance & Master Control",
        summary:
          "System user directory, role-permission matrix administration, audit log streams, and enterprise authorization policies.",
      };
    }
    return {
      icon: Layers,
      iconBg: "bg-purple-500/10 text-purple-400 border-purple-500/30",
      badgeBg: "bg-purple-950/60 text-purple-300 border-purple-500/30",
      category: "Enterprise Module",
      summary: "Authorized corporate platform module integrated with TechM4India identity.",
    };
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#12192d] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-white/20 border-t-[#d73531] rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-300">
            Loading TechM4India Central Dashboard...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#12192d] text-slate-100 flex flex-col justify-between">
      {/* Top Enterprise Navigation Bar */}
      <header className="border-b border-white/10 bg-[#172036]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-3 group text-white decoration-none"
            >
              <img
                src="/images/brand/logo.png"
                alt="TechM4India Logo"
                width="40"
                height="40"
                className="transition-transform group-hover:scale-105"
              />
              <div>
                <span className="text-lg font-black tracking-wider uppercase">
                  TECHM4<span className="text-[#d73531]">INDIA</span>
                </span>
                <span className="hidden sm:inline-block ml-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
                  Central ERP Dashboard
                </span>
              </div>
            </Link>
          </div>

          {/* User actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh applications and identity"
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-200 hover:text-white border border-red-800/50 text-xs font-semibold transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-8">
        {/* Error Notification */}
        {errorMessage && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-sm flex items-start justify-between gap-3 shadow-lg"
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Unable to refresh dashboard data</p>
                <p className="text-xs text-red-300 mt-0.5">{errorMessage}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-red-400 hover:text-red-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* User Identity Welcome Banner */}
        {profile && (
          <section className="bg-gradient-to-r from-[#1c2640] to-[#182035] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#d73531] to-[#252e4a] flex items-center justify-center text-white font-extrabold text-xl shadow-lg shrink-0">
                  {getInitials(profile.firstName, profile.lastName)}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      {getGreeting()}, {profile.firstName} {profile.lastName}
                    </h1>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      Active
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>{profile.email}</span>
                    <span>•</span>
                    <span className="font-medium text-slate-300">
                      Org: {profile.organizationCode || "TECHM4INDIA"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Roles & Permissions Badges */}
              <div className="flex flex-wrap md:flex-col md:items-end gap-2 shrink-0">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Assigned Roles
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {profile.roles.map((role) => (
                    <span
                      key={role}
                      className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-white/10 text-slate-200 border border-white/10"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Platform Metrics Bar */}
            <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  Authorized Apps
                </p>
                <p className="text-2xl font-black text-white mt-0.5">{applications.length}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  Permission Grants
                </p>
                <p className="text-2xl font-black text-white mt-0.5">
                  {profile.permissions.length}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  Session Policy
                </p>
                <p className="text-xs font-bold text-emerald-400 mt-1.5 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  Tab-Scoped
                </p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  SSO Readiness
                </p>
                <p className="text-xs font-bold text-amber-400 mt-1.5 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  OIDC / PKCE Prep
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Dynamic Applications Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Authorized Enterprise Applications
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Dynamic application directory filtered by your verified permissions.
              </p>
            </div>
            <span className="text-xs font-medium text-slate-400">
              Showing {applications.length} authorized service{applications.length === 1 ? "" : "s"}
            </span>
          </div>

          {applications.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {applications.map((app) => {
                const visuals = getAppVisuals(app.code);
                const VisualIcon = visuals.icon;

                return (
                  <div
                    key={app.code}
                    className="bg-[#1b233a] border border-white/10 hover:border-slate-500 rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-2xl hover:-translate-y-1 group"
                  >
                    <div>
                      {/* Top Header of Card */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center border ${visuals.iconBg}`}
                        >
                          <VisualIcon className="w-6 h-6" />
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${visuals.badgeBg}`}
                        >
                          {visuals.category}
                        </span>
                      </div>

                      {/* App Name and Code */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">
                            {app.name}
                          </h3>
                        </div>
                        <span className="text-[11px] font-mono font-semibold text-slate-400 tracking-wider">
                          CODE: {app.code}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                        {app.description || visuals.summary}
                      </p>
                    </div>

                    {/* Launch Trigger */}
                    <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between">
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 truncate max-w-[170px]">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                        <span className="truncate">{app.baseUrl}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedApp(app)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#252e4a] hover:bg-[#d73531] text-white text-xs font-bold transition-all shadow-md group-hover:shadow-red-950/50 cursor-pointer"
                      >
                        <span>Launch</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State for user without authorized applications */
            <div className="p-10 rounded-2xl bg-[#172036] border border-dashed border-slate-700 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="text-base font-bold text-white">
                  No Enterprise Applications Assigned
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your identity account is active, but you do not have permission grants for
                  specific applications (such as HRMS or Finance ERP).
                </p>
              </div>
              <div className="pt-2">
                <p className="text-xs text-slate-500">
                  Please contact a TechM4India Platform Administrator to provision application
                  access for your profile.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Enterprise Integration Architecture Note */}
        <section className="bg-[#172036]/60 border border-white/5 rounded-xl p-5 text-xs text-slate-400 space-y-2">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <Info className="w-4 h-4 text-blue-400" />
            <span>Architecture & Security Assurance</span>
          </div>
          <p className="leading-relaxed">
            The TechM4India Central Dashboard enforces strict role-based access control.
            Application visibility is governed entirely by the central backend API (<code>GET /api/v1/users/me/applications</code>)
            and is not hardcoded on the client. HRMS and Finance ERP applications authenticate against the same single source of truth.
          </p>
        </section>
      </div>

      {/* SSO Launch Modal Dialog */}
      {selectedApp && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
        >
          <div className="bg-[#1c2438] border border-white/15 rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                  <ExternalLink className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Launch {selectedApp.name}</h3>
                  <p className="text-xs text-slate-400">Application Code: {selectedApp.code}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Destination URL */}
            <div className="p-3 rounded-lg bg-[#12192d] border border-slate-700/80">
              <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Verified Destination Endpoint
              </span>
              <span className="font-mono text-xs text-emerald-400 break-all select-all">
                {selectedApp.baseUrl}
              </span>
            </div>

            {/* SSO Integration Status Banner */}
            <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <Shield className="w-4 h-4" />
                <span>SSO Protocol: Integration Pending</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-200/90">
                Cross-application Single Sign-On (SSO) callback handlers in HRMS and Finance ERP are
                prepared for <strong>Phase 4 (OpenID Connect with PKCE)</strong>.
              </p>
              <p className="text-[11px] leading-relaxed text-amber-200/90">
                In adherence to strict enterprise security standards, <strong>no session tokens or passwords
                are transmitted in URL query parameters</strong>. You may proceed directly to the
                application destination below.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Close
              </button>
              <a
                href={selectedApp.code.includes("HRMS") ? "/hrms" : selectedApp.baseUrl}
                target={selectedApp.code.includes("HRMS") ? "_self" : "_blank"}
                rel="noopener noreferrer"
                onClick={() => setSelectedApp(null)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#d73531] hover:bg-[#b82a27] text-white text-xs font-bold transition-all shadow-lg"
              >
                <span>{selectedApp.code.includes("HRMS") ? "Open HRMS Application" : "Proceed to Application"}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#172036] py-5 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <span>&copy; {new Date().getFullYear()} TechM4India Innovations Pvt. Ltd.</span>
          <span>•</span>
          <Link href="/" className="text-slate-400 hover:text-slate-200 underline">
            Public Website
          </Link>
          <span>•</span>
          <span className="text-slate-400">Central Auth & RBAC Active</span>
        </div>
      </footer>
    </main>
  );
}
