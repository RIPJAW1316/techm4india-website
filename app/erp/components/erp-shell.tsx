"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BriefcaseBusiness,
  Building2,
  CheckSquare2,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  ContactRound,
  FileText,
  HandCoins,
  Headset,
  LayoutDashboard,
  LibraryBig,
  Menu,
  Network,
  PackageOpen,
  ReceiptIndianRupee,
  Settings2,
  ShieldCheck,
  UsersRound,
  X,
  Zap,
} from "lucide-react";
import { useErpAuth } from "./AuthProvider";
import { ROLE_PERSONAS, type RolePersona } from "@/lib/erp/roles";

export const navItems = [
  { href: "/erp/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/erp/employees", label: "People", icon: UsersRound },
  { href: "/erp/leads", label: "CRM pipeline", icon: ContactRound },
  { href: "/erp/institutions", label: "Institutions", icon: Building2 },
  { href: "/erp/projects", label: "Projects", icon: BriefcaseBusiness },
  { href: "/erp/tasks", label: "Work queue", icon: CheckSquare2 },
  { href: "/erp/hr", label: "HR operations", icon: HandCoins },
  { href: "/erp/learning", label: "Learning", icon: LibraryBig },
  { href: "/erp/finance", label: "Finance", icon: ReceiptIndianRupee },
  { href: "/erp/assets", label: "Assets & procurement", icon: PackageOpen },
  { href: "/erp/cms", label: "Content publishing", icon: FileText },
  { href: "/erp/support", label: "Helpdesk", icon: Headset },
  { href: "/erp/vendors", label: "Vendors & partners", icon: Network },
  { href: "/erp/compliance", label: "Compliance", icon: ClipboardCheck },
];

const ROLE_ALLOWED_PATHS: Record<string, string[]> = {
  SUPER_ADMIN: ["*"],
  FOUNDER_CEO: ["*"],
  DIRECTOR: ["*"],
  DIVISION_HEAD: ["/erp/dashboard", "/erp/employees", "/erp/projects", "/erp/tasks", "/erp/learning", "/erp/leads"],
  HR_MANAGER: ["/erp/dashboard", "/erp/employees", "/erp/hr", "/erp/compliance"],
  HR_EXECUTIVE: ["/erp/dashboard", "/erp/employees", "/erp/hr"],
  FINANCE_MANAGER: ["/erp/dashboard", "/erp/finance", "/erp/vendors", "/erp/compliance"],
  FINANCE_EXECUTIVE: ["/erp/dashboard", "/erp/finance"],
  SALES_MANAGER: ["/erp/dashboard", "/erp/leads", "/erp/institutions"],
  SALES_EXECUTIVE: ["/erp/dashboard", "/erp/leads", "/erp/institutions"],
  MARKETING_MANAGER: ["/erp/dashboard", "/erp/cms", "/erp/leads"],
  PROJECT_MANAGER: ["/erp/dashboard", "/erp/projects", "/erp/tasks"],
  FACULTY_TRAINER: ["/erp/dashboard", "/erp/learning", "/erp/institutions"],
  STUDENT: ["/erp/dashboard", "/erp/learning"],
  INSTITUTION_ADMIN: ["/erp/dashboard", "/erp/institutions", "/erp/learning", "/erp/finance"],
  CONTENT_MANAGER: ["/erp/dashboard", "/erp/cms"],
  IT_ADMIN: ["/erp/dashboard", "/erp/support", "/erp/compliance", "/erp/settings"],
  VENDOR: ["/erp/dashboard", "/erp/vendors", "/erp/finance"],
  EMPLOYEE: ["/erp/dashboard", "/erp/tasks", "/erp/employees"],
  VIEWER: ["/erp/dashboard", "/erp/employees", "/erp/projects"],
};

function NavContent({
  onNavigate,
  activeRole,
  activePersona,
  onOpenSwitcher,
}: {
  onNavigate?: () => void;
  activeRole: string;
  activePersona: RolePersona | undefined;
  onOpenSwitcher: () => void;
}) {
  const pathname = usePathname();
  const allowed = ROLE_ALLOWED_PATHS[activeRole] || ["*"];
  const isFullAccess = allowed.includes("*");

  const visibleNavItems = isFullAccess
    ? navItems
    : navItems.filter((item) => allowed.includes(item.href));

  return (
    <>
      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground shadow-lg shadow-teal-950/25">
          T4
        </div>
        <div>
          <div className="text-sm font-bold tracking-tight text-sidebar-foreground">TechM4India</div>
          <div className="font-mono-ui text-[10px] uppercase tracking-[.18em] text-sidebar-foreground/45">
            Command center
          </div>
        </div>
      </div>

      {/* Active Persona Banner in Sidebar */}
      <div className="border-b border-sidebar-border bg-white/[0.03] px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="font-mono-ui text-[10px] uppercase tracking-[.16em] text-teal-400">
            Active Role
          </span>
          <button
            type="button"
            onClick={onOpenSwitcher}
            className="flex items-center gap-1 text-[11px] font-semibold text-teal-300 hover:text-white transition-colors"
          >
            <Zap className="h-3 w-3" />
            Switch
          </button>
        </div>
        <div className="mt-1 truncate text-xs font-bold text-slate-100">
          {activeRole.replace("_", " ")}
        </div>
        <div className="truncate text-[11px] text-slate-400">
          {activePersona ? activePersona.name : "System Operator"}
        </div>
        {!isFullAccess && (
          <div className="mt-1.5 inline-block rounded bg-teal-950/60 px-1.5 py-0.5 font-mono-ui text-[9px] font-semibold text-teal-300 border border-teal-700/40">
            Scoped: {visibleNavItems.length} modules visible
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
        <div className="mb-2 px-3 font-mono-ui text-[10px] uppercase tracking-[.18em] text-sidebar-foreground/35">
          Workspace Navigation
        </div>
        <nav className="space-y-1">
          {visibleNavItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href === "/erp/dashboard" && pathname === "/erp") ||
              (item.href !== "/erp/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                data-testid={`link-nav-${item.label.toLowerCase().replaceAll(" ", "-")}`}
                data-active={active ? "true" : undefined}
                className={`nav-item-link group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors ${
                  active
                    ? "bg-sidebar-accent !text-white shadow-sm font-semibold"
                    : "text-slate-300 hover:bg-white/[0.08] hover:!text-white"
                }`}
              >
                <Icon
                  className={`h-[17px] w-[17px] shrink-0 ${
                    active ? "!text-teal-400" : "text-slate-400 group-hover:!text-teal-400"
                  }`}
                  strokeWidth={1.8}
                />
                <span className="flex-1 truncate text-slate-200 group-hover:text-white">{item.label}</span>
                {active && <ChevronRight className="h-3.5 w-3.5 shrink-0 !text-teal-400" />}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto space-y-1 border-t border-sidebar-border px-3 py-4">
        <Link
          href="/erp/settings"
          onClick={onNavigate}
          data-testid="link-nav-settings"
          data-active={pathname === "/erp/settings" ? "true" : undefined}
          className={`bottom-nav-action flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors ${
            pathname === "/erp/settings"
              ? "bg-sidebar-accent !text-white font-semibold"
              : "text-slate-300 hover:bg-white/[0.08] hover:!text-white"
          }`}
        >
          <Settings2 className="h-[17px] w-[17px] text-slate-400" strokeWidth={1.8} />
          <span className="text-slate-200">Settings</span>
        </Link>
        <button
          type="button"
          data-testid="button-help"
          onClick={() => window.alert("TechM4India Command Center: Multi-Role RBAC is active. Use 'Switch Persona' to sign in to another account with its password.")}
          className="bottom-nav-action flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium text-slate-300 hover:bg-white/[0.08] hover:!text-white transition-colors"
        >
          <CircleHelp className="h-[17px] w-[17px] text-slate-400" strokeWidth={1.8} />
          <span className="text-slate-200">Help &amp; shortcuts</span>
        </button>
      </div>
    </>
  );
}

function PersonaSwitcherModal({
  onClose,
  onSwitch,
  currentEmail,
  isSwitching,
}: {
  onClose: () => void;
  onSwitch: (email: string, password: string) => Promise<void>;
  currentEmail: string | undefined;
  isSwitching: boolean;
}) {
  const [filter, setFilter] = useState<"all" | "leadership" | "finance_ops" | "sales_growth" | "specialized">("all");
  const [password, setPassword] = useState("");

  const filtered = filter === "all"
    ? ROLE_PERSONAS
    : ROLE_PERSONAS.filter((p) => p.category === filter);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity erp-modal-backdrop"
    >
      <button type="button" className="absolute inset-0 cursor-default" onClick={onClose} aria-label="Close role switcher" />
      <div
        className="relative z-10 w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl erp-modal-box overflow-hidden"
      >
        <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 border border-teal-200/60 text-teal-700 shadow-xs">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <span className="font-mono-ui text-[10px] font-semibold uppercase tracking-[.18em] text-teal-700">
                Company Accounts · 20 Enterprise Roles
              </span>
              <h3 className="text-lg font-bold tracking-tight text-slate-900">
                Sign in to another role
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="mb-4 text-xs text-slate-500">
            Enter the password for the account you want to use, then select its role.
          </p>

          <label className="mb-4 block text-xs font-semibold text-slate-700" htmlFor="switch-account-password">
            Account password
            <input
              id="switch-account-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
            />
          </label>

          <div className="mb-4 flex flex-wrap gap-1 border-b border-slate-200 pb-2">
            {[
              { id: "all", label: "All 20 Roles" },
              { id: "leadership", label: "Leadership (4)" },
              { id: "finance_ops", label: "HR & Finance (4)" },
              { id: "sales_growth", label: "Sales & Projects (4)" },
              { id: "specialized", label: "Portals & System (8)" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id as typeof filter)}
                className={`rounded-md px-2.5 py-1 font-mono-ui text-[11px] font-medium transition-colors ${
                  filter === tab.id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="max-h-[380px] space-y-2 overflow-y-auto pr-1 scrollbar-thin">
            {filtered.map((persona) => {
              const isCurrent = currentEmail === persona.email;
              return (
                <div
                  key={persona.email}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border p-3 transition-all ${
                    isCurrent
                      ? "border-teal-500 bg-teal-50/50 shadow-xs"
                      : "border-slate-200 bg-white hover:border-teal-300"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-ui text-xs font-bold text-slate-900">
                        {persona.role}
                      </span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono-ui text-[10px] font-semibold text-slate-600 uppercase">
                        {persona.scope}
                      </span>
                      {isCurrent && (
                        <span className="rounded-full bg-teal-600 px-2 py-0.2 font-mono-ui text-[10px] font-bold text-white">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-xs font-semibold text-slate-800">
                      {persona.name} · <span className="font-mono-ui font-normal text-slate-500">{persona.email}</span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {persona.primaryAccess}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isCurrent || isSwitching || !password}
                    onClick={() => onSwitch(persona.email, password)}
                    className={`shrink-0 rounded-lg px-3 py-1.5 font-mono-ui text-xs font-semibold transition-colors ${
                      isCurrent
                        ? "cursor-default opacity-50 bg-slate-100 text-slate-400"
                        : "bg-teal-600 text-white hover:bg-teal-700 shadow-xs"
                    }`}
                  >
                    {isSwitching ? "Signing in…" : isCurrent ? "Active" : "Sign in ↗"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ErpShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { context, login, logout } = useErpAuth();

  const userEmail = context?.user?.email;
  const userRoles = context?.user?.roles || ["SUPER_ADMIN"];
  const activeRole = userRoles[0] || "SUPER_ADMIN";

  const activePersona =
    ROLE_PERSONAS.find((p) => p.email.toLowerCase() === userEmail?.toLowerCase()) ||
    ROLE_PERSONAS.find((p) => p.role.toUpperCase() === activeRole.toUpperCase()) ||
    ROLE_PERSONAS[0];

  const current =
    navItems.find((item) => item.href !== "/erp/dashboard" && pathname.startsWith(item.href)) ??
    (pathname === "/erp/settings"
      ? { label: "Workspace settings" }
      : navItems[0]);
  const title = pathname === "/erp/settings" ? "Workspace settings" : current.label;

  const initials = activePersona
    ? activePersona.name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "T4";

  async function handleSwitchPersona(email: string, password: string) {
    setSwitching(true);
    try {
      await login(email, password);
      setSwitcherOpen(false);
    } catch {
      window.alert(`Could not sign in as ${email}. Check that account's password and try again.`);
    } finally {
      setSwitching(false);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-background text-foreground font-sans flex flex-col">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col bg-sidebar text-sidebar-foreground md:flex border-r border-sidebar-border">
        <NavContent
          activeRole={activeRole}
          activePersona={activePersona}
          onOpenSwitcher={() => setSwitcherOpen(true)}
        />
        <div className="px-5 pb-5">
          <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/55 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono-ui text-[10px] uppercase tracking-[.16em] text-sidebar-foreground/45">
                System status
              </span>
              <span className="h-2 w-2 rounded-full bg-sidebar-primary shadow-[0_0_0_4px_hsl(var(--sidebar-primary)/.12)]" />
            </div>
            <p className="text-xs font-medium text-sidebar-foreground/80">All systems operational</p>
            <p className="mt-1 text-[11px] text-sidebar-foreground/42">Synced a few seconds ago</p>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/35 md:hidden">
          <button type="button" className="absolute inset-0 cursor-default" onClick={() => setMobileOpen(false)} aria-label="Close mobile navigation" />
          <aside
            className="relative z-10 flex h-full w-[282px] flex-col bg-sidebar text-sidebar-foreground shadow-2xl"
          >
            <div className="flex justify-end px-4 pt-4">
              <button
                type="button"
                data-testid="button-close-mobile-menu"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavContent
              onNavigate={() => setMobileOpen(false)}
              activeRole={activeRole}
              activePersona={activePersona}
              onOpenSwitcher={() => setSwitcherOpen(true)}
            />
          </aside>
        </div>
      )}

      {switcherOpen && (
        <PersonaSwitcherModal
          onClose={() => setSwitcherOpen(false)}
          onSwitch={handleSwitchPersona}
          currentEmail={userEmail}
          isSwitching={switching}
        />
      )}

      <div className="md:pl-[248px] flex-1 flex flex-col min-h-screen bg-background">
        <header className="sticky top-0 z-20 flex h-[64px] items-center justify-between border-b border-border/80 bg-card/85 px-4 backdrop-blur-md sm:px-7">
          <div className="flex items-center gap-3">
            <button
              type="button"
              data-testid="button-open-mobile-menu"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg border border-border bg-card p-2 text-muted-foreground md:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                <span className="hover:text-foreground transition-colors cursor-default">TechM4India</span>
                <span className="text-muted-foreground/40">/</span>
                <span className="text-foreground font-semibold flex items-center gap-1.5 truncate">
                  {title}
                </span>
              </div>
              <h1 className="truncate text-base font-bold tracking-tight text-foreground sm:text-lg">{title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Active Role Scope Badge */}
            <div className="hidden items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 font-mono-ui text-[11px] font-semibold text-teal-700 lg:flex shadow-xs">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
              <span>{activePersona.role}</span>
              <span className="text-teal-400">•</span>
              <span className="text-teal-600">{activePersona.scope}</span>
            </div>

            {/* Switch Persona Quick Action */}
            <button
              type="button"
              onClick={() => setSwitcherOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-teal-600/30 bg-teal-50 px-2.5 py-1.5 font-mono-ui text-xs font-semibold text-teal-800 hover:bg-teal-600 hover:text-white transition-colors shadow-xs"
              title="Sign in to another company account"
            >
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              <span>Switch Persona</span>
            </button>

            {/* Cloud DB Indicator */}
            <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-700 xl:flex shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Railway ERP API</span>
            </div>

            {/* Current User Avatar with Sign out */}
            <button
              type="button"
              onClick={async () => {
                if (window.confirm("Do you want to sign out of TechM4India Command Center?")) {
                  try {
                    await logout();
                    router.push("/login");
                  } catch {
                    window.alert("Could not sign out. Please try again.");
                  }
                }
              }}
              className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2.5 hover:bg-muted/70 transition-colors border border-border/60 bg-card"
              data-testid="avatar-current-user"
              aria-label="Sign out"
              title={`${activePersona.name} (${activePersona.role}) - Click to sign out`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white shadow-xs ring-2 ring-primary/30">
                {initials}
              </div>
              <div className="hidden text-left sm:block">
                <div className="text-xs font-semibold text-foreground leading-tight truncate max-w-[130px]">
                  {activePersona.name}
                </div>
                <div className="text-[10px] font-medium text-primary leading-tight truncate max-w-[130px]">
                  {activePersona.role}
                </div>
              </div>
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] w-full flex-1 px-4 py-6 sm:px-7 lg:px-9">{children}</main>
      </div>
    </div>
  );
}
