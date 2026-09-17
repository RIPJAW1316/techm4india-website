"use client";

import { useState } from "react";
import { Bell, Check, KeyRound, MonitorCog, ShieldCheck, UserRound } from "lucide-react";
import { ErpShell } from "../components/erp-shell";
import { PageHeader, Panel, ToastMessage } from "../components/erp-ui";

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [digest, setDigest] = useState(false);
  const [toast, setToast] = useState("");

  const save = () => setToast("Workspace preferences saved locally.");

  return (
    <ErpShell>
      <div className="page-enter">
        <PageHeader
          eyebrow="Workspace controls"
          title="Settings"
          description="Keep the workspace tuned to how TechM4India operates. Changes here affect your account view."
        />
        <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
          <Panel title="Workspace profile">
            <div className="space-y-5 p-5">
              <div className="flex items-center gap-4 rounded-xl border border-border bg-background/60 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
                  T4
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">TechM4India Innovations</div>
                  <div className="mt-1 text-xs text-muted-foreground">Engineering education · India</div>
                </div>
                <span className="ml-auto rounded-full bg-primary/10 px-2 py-1 font-mono-ui text-[10px] uppercase tracking-wider text-primary">
                  Active
                </span>
              </div>
              <div className="space-y-1.5">
                <span className="block text-xs font-semibold text-foreground">Workspace name</span>
                <input
                  data-testid="input-workspace-name"
                  defaultValue="TechM4India Innovations"
                  className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus:border-primary"
                />
              </div>
              <div className="space-y-1.5">
                <span className="block text-xs font-semibold text-foreground">Workspace URL</span>
                <div className="flex h-10 items-center rounded-lg border border-input bg-card px-3 text-sm text-muted-foreground">
                  <span className="mr-1 text-foreground font-mono text-xs">app.techm4india.in/</span>
                  <span className="font-mono text-xs text-muted-foreground">innovations</span>
                </div>
              </div>
              <button
                type="button"
                data-testid="button-save-workspace"
                onClick={save}
                className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Save changes
              </button>
            </div>
          </Panel>
          <div className="space-y-5">
            <Panel title="Your account">
              <div className="divide-y divide-border/70">
                <div className="flex items-center gap-3 p-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-amber-700">
                    <UserRound className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">Arjun Rao</div>
                    <div className="text-xs text-muted-foreground">Executive administrator</div>
                  </div>
                </div>
                <button
                  type="button"
                  data-testid="button-manage-security"
                  onClick={() => setToast("Security controls are managed by your workspace administrator.")}
                  className="flex w-full items-center gap-3 p-5 text-left hover:bg-background/70 transition-colors"
                >
                  <KeyRound className="h-4 w-4 text-primary" />
                  <span className="flex-1 text-sm font-medium">Manage sign-in &amp; security</span>
                  <span className="text-xs text-muted-foreground">›</span>
                </button>
              </div>
            </Panel>
            <Panel title="Preferences">
              <div className="divide-y divide-border/70">
                <label className="flex cursor-pointer items-center justify-between gap-4 p-5 hover:bg-background/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Bell className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">Operational notifications</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">Alerts for task and pipeline changes</div>
                    </div>
                  </div>
                  <input
                    data-testid="toggle-notifications"
                    type="checkbox"
                    checked={notifications}
                    onChange={(event) => setNotifications(event.target.checked)}
                    className="h-4 w-4 shrink-0 rounded border-input accent-[hsl(var(--primary))] cursor-pointer"
                  />
                </label>
                <label className="flex cursor-pointer items-center justify-between gap-4 p-5 hover:bg-background/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <MonitorCog className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">Weekly executive digest</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">A Monday pulse for leadership</div>
                    </div>
                  </div>
                  <input
                    data-testid="toggle-digest"
                    type="checkbox"
                    checked={digest}
                    onChange={(event) => setDigest(event.target.checked)}
                    className="h-4 w-4 shrink-0 rounded border-input accent-[hsl(var(--primary))] cursor-pointer"
                  />
                </label>
              </div>
            </Panel>
            <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <div className="text-xs font-semibold text-foreground">Workspace protected</div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Your operating data is scoped to TechM4India Innovations and access is role-controlled.
                </p>
              </div>
              <Check className="ml-auto h-4 w-4 shrink-0 text-primary" />
            </div>
          </div>
        </div>
        {toast && <ToastMessage message={toast} onDismiss={() => setToast("")} />}
      </div>
    </ErpShell>
  );
}
