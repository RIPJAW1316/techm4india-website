"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { loginRequest } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { resolveDashboardPath } from "@/lib/erp/divisions";

export type RolePersona = {
  role: string;
  name: string;
  email: string;
  scope: string;
  primaryAccess: string;
  category: "leadership" | "finance_ops" | "sales_growth" | "specialized";
};

export const ROLE_PERSONAS: RolePersona[] = [
  {
    role: "SUPER_ADMIN",
    name: "Kavita Sharma",
    email: "admin@techm4india.com",
    scope: "System-wide",
    primaryAccess: "All modules, system config, user management, audit logs, billing",
    category: "leadership",
  },
  {
    role: "FOUNDER / CEO",
    name: "Arjun Rao",
    email: "founder@techm4india.com",
    scope: "Executive",
    primaryAccess: "Executive dashboard, all KPIs, strategic reports, approvals",
    category: "leadership",
  },
  {
    role: "DIRECTOR",
    name: "Dr. Vikram Malhotra",
    email: "director@techm4india.com",
    scope: "Division",
    primaryAccess: "Division dashboards, CRM, finance summaries, HR visibility",
    category: "leadership",
  },
  {
    role: "DIVISION_HEAD",
    name: "Priya Nair",
    email: "divisionhead@techm4india.com",
    scope: "Division",
    primaryAccess: "Division employees, programs, projects, CRM, reports",
    category: "leadership",
  },
  {
    role: "HR_MANAGER",
    name: "Ananya Deshmukh",
    email: "hrmanager@techm4india.com",
    scope: "Company-wide",
    primaryAccess: "All employee records, payroll, recruitment, appraisals, exit",
    category: "finance_ops",
  },
  {
    role: "HR_EXECUTIVE",
    name: "Rohan Gupta",
    email: "hrexecutive@techm4india.com",
    scope: "Operational",
    primaryAccess: "Attendance, leave, onboarding, basic employee records",
    category: "finance_ops",
  },
  {
    role: "FINANCE_MANAGER",
    name: "Rajesh Kulkarni",
    email: "financemanager@techm4india.com",
    scope: "Finance",
    primaryAccess: "Full finance — invoices, payroll, GST, expenses, P&L",
    category: "finance_ops",
  },
  {
    role: "FINANCE_EXECUTIVE",
    name: "Sneha Patil",
    email: "financeexecutive@techm4india.com",
    scope: "Operational",
    primaryAccess: "Invoices, receipts, expense entry, basic reports",
    category: "finance_ops",
  },
  {
    role: "SALES_MANAGER",
    name: "Amitabh Sen",
    email: "salesmanager@techm4india.com",
    scope: "CRM",
    primaryAccess: "Full CRM, all leads, team pipeline, targets, commission",
    category: "sales_growth",
  },
  {
    role: "SALES_EXECUTIVE",
    name: "Kavya Reddy",
    email: "salesexecutive@techm4india.com",
    scope: "CRM",
    primaryAccess: "Assigned leads, follow-ups, institution contacts",
    category: "sales_growth",
  },
  {
    role: "MARKETING_MANAGER",
    name: "Deepak Verma",
    email: "marketingmanager@techm4india.com",
    scope: "Marketing",
    primaryAccess: "Campaigns, email/WhatsApp blasts, SEO, CMS, analytics",
    category: "sales_growth",
  },
  {
    role: "PROJECT_MANAGER",
    name: "Neha Sundaram",
    email: "projectmanager@techm4india.com",
    scope: "Projects",
    primaryAccess: "Full project management — tasks, team, milestones, budgets",
    category: "sales_growth",
  },
  {
    role: "FACULTY / TRAINER",
    name: "Prof. Suresh Iyer",
    email: "faculty@techm4india.com",
    scope: "LMS",
    primaryAccess: "Course management, student tracking, assessments, grading",
    category: "specialized",
  },
  {
    role: "STUDENT",
    name: "Aarav Patel",
    email: "student@techm4india.com",
    scope: "Portal",
    primaryAccess: "Own enrolled courses, assignments, certificates, fees",
    category: "specialized",
  },
  {
    role: "INSTITUTION_ADMIN",
    name: "Dr. Sunita Kapoor",
    email: "institutionadmin@techm4india.com",
    scope: "Institution",
    primaryAccess: "Institution profile, enrolled programs, documents, invoices",
    category: "specialized",
  },
  {
    role: "CONTENT_MANAGER",
    name: "Tanvi Joshi",
    email: "contentmanager@techm4india.com",
    scope: "CMS",
    primaryAccess: "Website content, blogs, events, publishing",
    category: "specialized",
  },
  {
    role: "IT_ADMIN",
    name: "Karthik Raman",
    email: "itadmin@techm4india.com",
    scope: "System",
    primaryAccess: "Infrastructure, integrations, API keys, backups",
    category: "specialized",
  },
  {
    role: "VENDOR",
    name: "Harish Mehta",
    email: "vendor@techm4india.com",
    scope: "Limited",
    primaryAccess: "Own invoices, delivery status, purchase orders",
    category: "specialized",
  },
  {
    role: "EMPLOYEE",
    name: "Aryan TechM4India",
    email: "employee@techm4india.com",
    scope: "Personal",
    primaryAccess: "Own profile, tasks, payslips, leave, documents",
    category: "specialized",
  },
  {
    role: "VIEWER",
    name: "Aditi Rao",
    email: "viewer@techm4india.com",
    scope: "Read-Only",
    primaryAccess: "Permitted read-only access to assigned modules",
    category: "specialized",
  },
];

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@techm4india.com");
  const [password, setPassword] = useState("TechM4India!2026");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [activePersonaEmail, setActivePersonaEmail] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "leadership" | "finance_ops" | "sales_growth" | "specialized">("all");

  async function performLogin(loginEmail: string, loginPass: string) {
    setError(null);
    setBusy(true);
    setActivePersonaEmail(loginEmail);
    try {
      const auth = await loginRequest(loginEmail, loginPass);
      setPassword("");
      router.replace(resolveDashboardPath(auth));
    } catch (reason) {
      setError(
        reason instanceof ApiError && reason.status === 401
          ? `The email or password for ${loginEmail} was not recognised. All demo accounts use password: TechM4India!2026`
          : "We could not reach the live ERP API right now. Please try again or launch Preview Mode.",
      );
    } finally {
      setBusy(false);
      setActivePersonaEmail(null);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await performLogin(email, password);
  }

  const filteredPersonas = activeTab === "all"
    ? ROLE_PERSONAS
    : ROLE_PERSONAS.filter((p) => p.category === activeTab);

  return (
    <div className="space-y-6">
      <form className="erp-login-form" onSubmit={submit} noValidate>
        <div className="erp-field">
          <label htmlFor="company-email">Company email</label>
          <input
            id="company-email"
            name="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@techm4india.com"
          />
        </div>
        <div className="erp-field">
          <label htmlFor="company-password">Password</label>
          <input
            id="company-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        {error && (
          <div className="erp-form-error" role="alert" style={{ marginBottom: "16px" }}>
            <p>{error}</p>
            <button
              type="button"
              className="erp-text-button"
              style={{ marginTop: "6px", display: "inline-block", color: "var(--tm-navy)" }}
              onClick={() => router.push("/erp/dashboard")}
            >
              Enter Command Center in Preview Mode ↗
            </button>
          </div>
        )}
        <button className="erp-button erp-button-primary" type="submit" disabled={busy}>
          {busy && !activePersonaEmail ? "Signing in…" : "Sign in to ERP"}
          <span aria-hidden="true">↗</span>
        </button>

        <div style={{ marginTop: "12px", textAlign: "center" }}>
          <button
            type="button"
            onClick={() => router.push("/erp/dashboard")}
            className="erp-button"
            style={{
              width: "100%",
              background: "#f0fdf4",
              color: "#166534",
              border: "1px solid #bbf7d0",
              padding: "9px 12px",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "13px",
            }}
          >
            🚀 Open Command Center in Preview Mode ↗
          </button>
        </div>
      </form>

      {/* Role Testing Matrix */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs shadow-xs">
        <div className="mb-2.5 flex items-center justify-between">
          <div>
            <span className="font-mono-ui text-[10px] font-bold uppercase tracking-[.18em] text-teal-700">
              Client Role Testing Matrix
            </span>
            <h4 className="text-sm font-bold tracking-tight text-slate-900">
              Test All 20 Enterprise Roles (1-Click Login)
            </h4>
          </div>
          <span className="rounded-full bg-teal-100/70 px-2 py-0.5 font-mono-ui text-[10px] font-semibold text-teal-800">
            Pass: TechM4India!2026
          </span>
        </div>

        <p className="mb-3 text-[11px] text-slate-500">
          Click any role below to automatically authenticate as that persona and inspect their scoped access permissions:
        </p>

        {/* Filter Tabs */}
        <div className="mb-3 flex flex-wrap gap-1 border-b border-slate-200 pb-2">
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
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`rounded-md px-2.5 py-1 font-mono-ui text-[11px] font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Persona Cards Grid */}
        <div className="max-h-[380px] space-y-2 overflow-y-auto pr-1 scrollbar-thin">
          {filteredPersonas.map((persona) => {
            const isCurrentBusy = busy && activePersonaEmail === persona.email;
            return (
              <div
                key={persona.email}
                className="group flex flex-col justify-between gap-2 rounded-lg border border-slate-200/90 bg-white p-2.5 transition-all hover:border-teal-400 hover:shadow-xs sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-mono-ui font-bold text-slate-900 text-[11px]">
                      {persona.role}
                    </span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.2 font-mono-ui text-[9px] font-semibold text-slate-600 uppercase">
                      {persona.scope}
                    </span>
                  </div>
                  <div className="mt-0.5 truncate text-[11px] font-medium text-slate-700">
                    <span className="font-semibold">{persona.name}</span> · <code className="text-slate-500">{persona.email}</code>
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-500 line-clamp-1">
                    {persona.primaryAccess}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setEmail(persona.email);
                    setPassword("TechM4India!2026");
                    void performLogin(persona.email, "TechM4India!2026");
                  }}
                  className="shrink-0 rounded-md border border-teal-600/30 bg-teal-50 px-2.5 py-1.5 font-mono-ui text-[11px] font-semibold text-teal-800 transition-colors hover:bg-teal-600 hover:text-white disabled:opacity-50"
                >
                  {isCurrentBusy ? "Signing in…" : "Test Role ↗"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <p className="erp-security-note" style={{ margin: 0, textAlign: "center" }}>
        TechM4India ERP · Multi-Role RBAC · Powered by PostgreSQL 16 &amp; NestJS
      </p>
    </div>
  );
}
