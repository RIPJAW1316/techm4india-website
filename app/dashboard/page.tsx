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
  getApplicationUrl,
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
        setErrorMessage("Failed to refresh applications catalog.");
      }
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleLaunchHrms() {
    setSelectedApp(null);
    const token = getAccessToken();
    const isLocal =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
    const hrmsOrigin = isLocal
      ? "http://localhost:3002"
      : process.env.NEXT_PUBLIC_HRMS_URL || "https://hrms.techm4india.com";

    // Direct SSO handoff to HRMS callback
    const callbackUrl = `${hrmsOrigin}/auth/callback?sso_token=${encodeURIComponent(token || "")}`;
    window.location.href = callbackUrl;
  }

  async function handleLaunchCrm() {
    setSelectedApp(null);
    const token = getAccessToken();
    const isLocal =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
    const crmOrigin = isLocal
      ? "http://localhost:3003"
      : process.env.NEXT_PUBLIC_CRM_URL || "https://crm.techm4india.com";

    // Direct SSO handoff to CRM callback
    const callbackUrl = `${crmOrigin}/auth/callback?sso_token=${encodeURIComponent(token || "")}`;
    window.location.href = callbackUrl;
  }

  async function handleLaunchFinance() {
    setSelectedApp(null);
    const token = getAccessToken();
    const isLocal =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
    const financeOrigin = isLocal
      ? "http://localhost:3001"
      : process.env.NEXT_PUBLIC_FINANCE_URL || "https://finance.techm4india.com";

    // Direct SSO handoff to Finance callback
    const callbackUrl = `${financeOrigin}/auth/callback?sso_token=${encodeURIComponent(token || "")}`;
    window.location.href = callbackUrl;
  }

  async function handleLogout() {
    await logout();
    window.location.href = "/login";
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
        iconBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
        category: "Human Capital Management",
        summary:
          "Manage company workforce, employee profiles, attendance, departmental hierarchy, and leaves under central identity.",
      };
    }
    if (code.includes("CRM")) {
      return {
        icon: Target,
        iconBg: "bg-amber-50 text-amber-700 border-amber-200",
        badgeBg: "bg-amber-50 text-amber-800 border-amber-200",
        category: "CRM & Institution Partnerships",
        summary:
          "Enterprise sales pipeline, institution relationship management, 1-click lead conversion, deals Kanban, and MoU tracking.",
      };
    }
    if (code.includes("FINANCE")) {
      return {
        icon: DollarSign,
        iconBg: "bg-blue-50 text-blue-700 border-blue-200",
        badgeBg: "bg-blue-50 text-blue-800 border-blue-200",
        category: "Financial Operations & ERP",
        summary:
          "Enterprise ledger, fiscal accounting, invoicing, vendor purchase orders, and multi-department budget reconciliation.",
      };
    }
    if (code.includes("ADMIN")) {
      return {
        icon: ShieldCheck,
        iconBg: "bg-rose-50 text-rose-700 border-rose-200",
        badgeBg: "bg-rose-50 text-rose-800 border-rose-200",
        category: "Governance & Master Control",
        summary:
          "System user directory, role-permission matrix administration, audit log streams, and enterprise authorization policies.",
      };
    }
    return {
      icon: Layers,
      iconBg: "bg-purple-50 text-purple-700 border-purple-200",
      badgeBg: "bg-purple-50 text-purple-800 border-purple-200",
      category: "Enterprise Module",
      summary: "Authorized corporate platform module integrated with TechM4India identity.",
    };
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#f7f6f2] text-[#1f2946] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-[#e3ded5] border-t-[#c62d37] rounded-full animate-spin" />
          <p className="text-sm font-semibold text-[#5a6376]">
            Loading TechM4India Central Dashboard...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f6f2] text-[#20283b] flex flex-col justify-between">
      {/* Top Enterprise Navigation Bar */}
      <header className="border-b border-[#e3ded5] bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-3 group text-[#1f2946] decoration-none"
            >
              <img
                src="/images/brand/logo.png"
                alt="TechM4India Logo"
                width="40"
                height="40"
                className="transition-transform group-hover:scale-105 rounded"
              />
              <div>
                <span className="text-lg font-black tracking-wider uppercase text-[#1f2946]">
                  TECHM4<span className="text-[#c62d37]">INDIA</span>
                </span>
                <span className="hidden sm:inline-block ml-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#fff1f2] text-[#c62d37] border border-[#fecdd3]">
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
              className="p-2 rounded-lg bg-white hover:bg-[#f7f6f2] text-[#5a6376] hover:text-[#1f2946] border border-[#d1cbbf] transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#fff1f2] hover:bg-[#ffe4e6] text-[#c62d37] border border-[#fecdd3] text-xs font-bold transition-all cursor-pointer shadow-2xs"
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
            className="p-4 rounded-xl bg-[#fef2f2] border border-[#fecdd3] text-[#be123c] text-sm flex items-start justify-between gap-3 shadow-xs"
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-[#be123c] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Unable to refresh dashboard data</p>
                <p className="text-xs text-[#be123c]/90 mt-0.5">{errorMessage}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-[#be123c] hover:text-[#9f1239] p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* User Identity Welcome Banner */}
        {profile && (
          <section className="bg-white border border-[#e3ded5] rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#c62d37] to-[#1f2946] flex items-center justify-center text-white font-extrabold text-xl shadow-md shrink-0">
                  {getInitials(profile.firstName, profile.lastName)}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1f2946] tracking-tight">
                      {getGreeting()}, {profile.firstName} {profile.lastName}
                    </h1>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]">
                      <CheckCircle2 className="w-3 h-3" />
                      Active
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#5a6376] mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>{profile.email}</span>
                    <span>•</span>
                    <span className="font-medium text-[#1f2946]">
                      Org: {profile.organizationCode || "TECHM4INDIA"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Roles & Permissions Badges */}
              <div className="flex flex-wrap md:flex-col md:items-end gap-2 shrink-0">
                <div className="text-[11px] font-bold text-[#5a6376] uppercase tracking-wider">
                  Assigned Roles
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {profile.roles.map((role) => (
                    <span
                      key={role}
                      className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-[#f1efe9] text-[#1f2946] border border-[#d1cbbf]"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Platform Metrics Bar */}
            <div className="mt-6 pt-6 border-t border-[#e3ded5] grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-[11px] text-[#5a6376] font-bold uppercase tracking-wider">
                  Authorized Apps
                </p>
                <p className="text-2xl font-black text-[#1f2946] mt-0.5">{applications.length}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#5a6376] font-bold uppercase tracking-wider">
                  Permission Grants
                </p>
                <p className="text-2xl font-black text-[#1f2946] mt-0.5">
                  {profile.permissions.length}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#5a6376] font-bold uppercase tracking-wider">
                  Session Policy
                </p>
                <p className="text-xs font-bold text-[#047857] mt-1.5 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  Tab-Scoped
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#5a6376] font-bold uppercase tracking-wider">
                  SSO Readiness
                </p>
                <p className="text-xs font-bold text-[#b45309] mt-1.5 flex items-center gap-1">
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
              <h2 className="text-xl font-bold text-[#1f2946] tracking-tight">
                Authorized Enterprise Applications
              </h2>
              <p className="text-xs text-[#5a6376] mt-0.5">
                Dynamic application directory filtered by your verified permissions.
              </p>
            </div>
            <span className="text-xs font-medium text-[#5a6376]">
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
                    className="bg-white border border-[#e3ded5] hover:border-[#cbd5e1] rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group shadow-xs"
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
                          <h3 className="text-lg font-bold text-[#1f2946] group-hover:text-[#c62d37] transition-colors">
                            {app.name}
                          </h3>
                        </div>
                        <span className="text-[11px] font-mono font-semibold text-[#5a6376] tracking-wider">
                          CODE: {app.code}
                        </span>
                      </div>

                      <p className="text-xs text-[#5a6376] mt-3 leading-relaxed">
                        {app.description || visuals.summary}
                      </p>
                    </div>

                    {/* Launch Trigger */}
                    <div className="mt-6 pt-4 border-t border-[#e3ded5] flex items-center justify-between">
                      <div className="text-[11px] text-[#5a6376] flex items-center gap-1.5 truncate max-w-[170px]">
                        <span className="w-2 h-2 rounded-full bg-[#15803d] shrink-0" />
                        <span className="truncate">{getApplicationUrl(app.code)}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedApp(app)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#c62d37] hover:bg-[#a8222e] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
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
            <div className="p-10 rounded-2xl bg-white border border-dashed border-[#d1cbbf] text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-full bg-[#fffbeb] text-[#b45309] border border-[#fde68a] flex items-center justify-center mx-auto">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="text-base font-bold text-[#1f2946]">
                  No Enterprise Applications Assigned
                </h3>
                <p className="text-xs text-[#5a6376] leading-relaxed">
                  Your identity account is active, but you do not have permission grants for
                  specific applications (such as HRMS or Finance ERP).
                </p>
              </div>
              <div className="pt-2">
                <p className="text-xs text-[#5a6376]">
                  Please contact a TechM4India Platform Administrator to provision application
                  access for your profile.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Enterprise Integration Architecture Note */}
        <section className="bg-white border border-[#e3ded5] rounded-xl p-5 text-xs text-[#5a6376] space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-[#1f2946] font-bold">
            <Info className="w-4 h-4 text-blue-600" />
            <span>Architecture &amp; Security Assurance</span>
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
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div className="bg-white border border-[#e3ded5] rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#fff1f2] border border-[#fecdd3] text-[#c62d37] flex items-center justify-center shrink-0">
                  <ExternalLink className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1f2946]">Launch {selectedApp.name}</h3>
                  <p className="text-xs text-[#5a6376]">Application Code: {selectedApp.code}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="text-[#5a6376] hover:text-[#1f2946] p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Destination URL */}
            <div className="p-3 rounded-lg bg-[#fcfbf9] border border-[#e3ded5]">
              <span className="block text-[10px] font-bold text-[#5a6376] uppercase tracking-wider mb-1">
                Verified Destination Endpoint
              </span>
              <span className="font-mono text-xs text-[#15803d] font-semibold break-all select-all">
                {getApplicationUrl(selectedApp.code)}
              </span>
            </div>

            {/* SSO Integration Status Banner */}
            <div className="p-3.5 rounded-lg bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46] text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#047857]">
                <ShieldCheck className="w-4 h-4" />
                <span>Single Sign-On (SSO) Active</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Central identity session is active. Launching will automatically authenticate your profile in{" "}
                <strong>{selectedApp.name}</strong> without requiring re-entry of credentials.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2 border-t border-[#e3ded5]">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-white border border-[#d1cbbf] text-[#5a6376] hover:bg-[#f1efe9] text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
              {selectedApp.code.includes("HRMS") ? (
                <button
                  type="button"
                  onClick={handleLaunchHrms}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#c62d37] hover:bg-[#a8222e] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <span>Open HRMS Application</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              ) : selectedApp.code.includes("CRM") ? (
                <button
                  type="button"
                  onClick={handleLaunchCrm}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#c62d37] hover:bg-[#a8222e] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <span>Open CRM & Sales</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              ) : selectedApp.code.includes("FINANCE") ? (
                <button
                  type="button"
                  onClick={handleLaunchFinance}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#c62d37] hover:bg-[#a8222e] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <span>Open Finance ERP</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              ) : (
                <a
                  href={getApplicationUrl(selectedApp.code)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setSelectedApp(null)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#c62d37] hover:bg-[#a8222e] text-white text-xs font-bold transition-all shadow-xs"
                >
                  <span>Proceed to Application</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-[#e3ded5] bg-white py-5 px-4 sm:px-6 lg:px-8 text-center text-xs text-[#5a6376]">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <span>&copy; {new Date().getFullYear()} TechM4India Innovations Pvt. Ltd.</span>
          <span>•</span>
          <Link href="/" className="text-[#5a6376] hover:text-[#1f2946] underline">
            Public Website
          </Link>
          <span>•</span>
          <span className="text-[#5a6376]">Central Auth &amp; RBAC Active</span>
        </div>
      </footer>
    </main>
  );
}
