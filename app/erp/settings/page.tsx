"use client";

import { useState } from "react";
import { Bell, Check, Database, KeyRound, MonitorCog, Server, ShieldCheck, UserRound } from "lucide-react";
import { ErpShell } from "../components/erp-shell";
import { PageHeader, Panel, ToastMessage } from "../components/erp-ui";

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [digest, setDigest] = useState(false);
  const [toast, setToast] = useState("");

  const save = () => setToast("Workspace preferences saved successfully.");

  return (
    <ErpShell>
      <div className="page-enter">
        <PageHeader
          eyebrow="System Configuration"
          title="Workspace Settings"
          description="Enterprise system parameters, cloud connectivity, notification rules, and role-based security configurations."
        />
        <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
          <div className="space-y-6">
            <Panel title="Workspace Identity">
              <div className="space-y-5 p-6">
                <div className="flex items-center gap-4 rounded-xl border border-slate-200/80 bg-slate-50/60 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white shadow-xs">
                    T4
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">TechM4India Innovations</div>
                    <div className="mt-0.5 text-xs text-slate-500 font-mono-ui">Enterprise Aerospace &amp; Engineering Education · India</div>
                  </div>
                  <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 font-mono-ui text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 erp-pulse-dot" />
                    Verified
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="block text-xs font-semibold text-slate-700">Organization / Workspace Name</span>
                  <input
                    data-testid="input-workspace-name"
                    defaultValue="TechM4India Innovations"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 shadow-xs outline-none transition-all focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10"
                  />
                </div>

                <div className="space-y-1.5">
                  <span className="block text-xs font-semibold text-slate-700">Production Tenant Domain</span>
                  <div className="flex h-10 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600 shadow-xs">
                    <span className="text-slate-800 font-mono text-xs font-semibold">app.techm4india.in/</span>
                    <span className="font-mono text-xs text-teal-700 font-bold">innovations</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    data-testid="button-save-workspace"
                    onClick={save}
                    className="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </Panel>

            {/* Cloud Infrastructure Panel */}
            <Panel title="Cloud Infrastructure &amp; Persistence">
              <div className="space-y-4 p-6">
                <div className="flex items-start gap-3.5 rounded-xl border border-teal-200/80 bg-teal-50/40 p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white shadow-xs">
                    <Server className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">Render Cloud API Service</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 erp-pulse-dot" />
                        Healthy
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600 font-mono-ui">
                      https://techm4india-erp-api.onrender.com/api/v1
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-xs">
                    <Database className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">Managed PostgreSQL 16</span>
                      <span className="text-[10px] font-semibold font-mono-ui text-slate-500">Singapore (ap-southeast-1)</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      SSL/TLS 1.3 enforced · Multi-tenant separation · Automated daily backups
                    </p>
                  </div>
                </div>
              </div>
            </Panel>
          </div>

          <div className="space-y-6">
            <Panel title="Executive Account">
              <div className="divide-y divide-slate-100">
                <div className="flex items-center gap-3.5 p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 border border-teal-200/60 text-teal-700 shadow-xs">
                    <UserRound className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">Arjun Rao</div>
                    <div className="text-xs text-slate-500 font-medium">Founder &amp; Chief Executive Officer</div>
                  </div>
                </div>
                <button
                  type="button"
                  data-testid="button-manage-security"
                  onClick={() => setToast("Security controls are managed by your workspace administrator.")}
                  className="flex w-full items-center gap-3 p-5 text-left hover:bg-slate-50/80 transition-colors"
                >
                  <KeyRound className="h-4 w-4 text-teal-600" />
                  <span className="flex-1 text-sm font-semibold text-slate-800">Authentication &amp; MFA Settings</span>
                  <span className="text-xs text-slate-400 font-bold">›</span>
                </button>
              </div>
            </Panel>

            <Panel title="Notification &amp; Digest Rules">
              <div className="divide-y divide-slate-100">
                <label className="flex cursor-pointer items-center justify-between gap-4 p-5 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600 border border-teal-100">
                      <Bell className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Operational Notifications</div>
                      <div className="mt-0.5 text-xs text-slate-500">Real-time alerts for task and deal milestone changes</div>
                    </div>
                  </div>
                  <input
                    data-testid="toggle-notifications"
                    type="checkbox"
                    checked={notifications}
                    onChange={(event) => setNotifications(event.target.checked)}
                    className="h-4 w-4 shrink-0 rounded border-slate-300 accent-teal-600 cursor-pointer"
                  />
                </label>
                <label className="flex cursor-pointer items-center justify-between gap-4 p-5 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600 border border-teal-100">
                      <MonitorCog className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Executive Weekly Briefing</div>
                      <div className="mt-0.5 text-xs text-slate-500">Automated Monday revenue and delivery brief</div>
                    </div>
                  </div>
                  <input
                    data-testid="toggle-digest"
                    type="checkbox"
                    checked={digest}
                    onChange={(event) => setDigest(event.target.checked)}
                    className="h-4 w-4 shrink-0 rounded border-slate-300 accent-teal-600 cursor-pointer"
                  />
                </label>
              </div>
            </Panel>

            <div className="flex items-start gap-3.5 rounded-xl border border-teal-200/80 bg-teal-50/40 p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
              <div>
                <div className="text-xs font-bold text-slate-900">SOC2 &amp; DPDP Compliant Architecture</div>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  All enterprise transactional data is isolated per tenant and encrypted at rest using AES-256 with role-governed access.
                </p>
              </div>
              <Check className="ml-auto h-4 w-4 shrink-0 text-teal-600" />
            </div>
          </div>
        </div>
        {toast && <ToastMessage message={toast} onDismiss={() => setToast("")} />}
      </div>
    </ErpShell>
  );
}
