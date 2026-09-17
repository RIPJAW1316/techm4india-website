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
  UsersRound,
  X,
} from "lucide-react";

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

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

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
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5 scrollbar-thin">
        <div className="mb-2 px-3 font-mono-ui text-[10px] uppercase tracking-[.18em] text-sidebar-foreground/35">
          Workspace
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
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
          onClick={() => window.alert("TechM4India Command Center: Use the sidebar navigation to move between daily operating views and registers.")}
          className="bottom-nav-action flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium text-slate-300 hover:bg-white/[0.08] hover:!text-white transition-colors"
        >
          <CircleHelp className="h-[17px] w-[17px] text-slate-400" strokeWidth={1.8} />
          <span className="text-slate-200">Help &amp; shortcuts</span>
        </button>
      </div>
    </>
  );
}

export function ErpShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const current =
    navItems.find((item) => item.href !== "/erp/dashboard" && pathname.startsWith(item.href)) ??
    (pathname === "/erp/settings"
      ? { label: "Workspace settings" }
      : navItems[0]);
  const title = pathname === "/erp/settings" ? "Workspace settings" : current.label;

  return (
    <div className="min-h-[100dvh] bg-background text-foreground font-sans flex flex-col">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col bg-sidebar text-sidebar-foreground md:flex border-r border-sidebar-border">
        <NavContent />
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
        <div className="fixed inset-0 z-40 bg-foreground/35 md:hidden" onClick={() => setMobileOpen(false)}>
          <aside
            className="flex h-full w-[282px] flex-col bg-sidebar text-sidebar-foreground shadow-2xl"
            onClick={(event) => event.stopPropagation()}
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
            <NavContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="md:pl-[248px] flex-1 flex flex-col min-h-screen bg-background">
        <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-border/80 bg-background/90 px-4 backdrop-blur-md sm:px-7">
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
              <div className="flex items-center gap-1.5 font-mono-ui text-[10px] uppercase tracking-[.18em] text-muted-foreground">
                <span className="truncate">TechM4India Innovations</span>
                <span>/</span>
                <span className="truncate text-primary">{title}</span>
              </div>
              <h1 className="truncate text-base font-bold tracking-tight sm:text-lg">{title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Live workspace
            </div>
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Do you want to sign out of TechM4India Command Center?")) {
                  router.push("/login");
                }
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent-foreground border border-accent/30 hover:opacity-90"
              data-testid="avatar-current-user"
              aria-label="Sign out"
              title="Arjun Rao (Executive Administrator) - Click to sign out"
            >
              AR
            </button>
          </div>
        </header>
        <main className="mx-auto max-w-[1600px] w-full flex-1 px-4 py-6 sm:px-7 lg:px-9">{children}</main>
      </div>
    </div>
  );
}
