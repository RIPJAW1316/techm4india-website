"use client";

import { useState, type FormEvent } from "react";
import { ArrowUpRight, Plus, SlidersHorizontal } from "lucide-react";
import { ErpShell } from "../components/erp-shell";
import {
  Avatar,
  EmptyState,
  formatCurrency,
  PageHeader,
  Panel,
  SearchField,
  StatusBadge,
  ToastMessage,
} from "../components/erp-ui";
import { useLeadsData } from "@/lib/erp/replit-store";

const stages = ["New", "Qualified", "Proposal", "Negotiation", "Won"];
const emptyForm = { name: "", organization: "", source: "Referral", value: "", owner: "" };

function LeadDialog({
  onClose,
  onSuccess,
  onAdd,
}: {
  onClose: () => void;
  onSuccess: (message: string) => void;
  onAdd: (data: { name: string; organization: string; source: string; stage: string; value: number; owner: string }) => void;
}) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const update = (key: keyof typeof emptyForm, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.name || !form.organization || !form.value || !form.owner) {
      setError("Name, organization, value, and owner are required.");
      return;
    }
    setError("");
    onAdd({ ...form, value: Number(form.value), stage: "New" });
    onSuccess(`${form.organization} added to the pipeline.`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/35 p-0 sm:items-center sm:p-5"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-2xl border border-card-border bg-card shadow-2xl sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-border px-5 py-5">
          <div>
            <div className="mb-1 font-mono-ui text-[10px] uppercase tracking-[.16em] text-primary">
              CRM / New opportunity
            </div>
            <h3 className="text-lg font-semibold">Add a lead</h3>
          </div>
          <button
            type="button"
            data-testid="button-close-lead-dialog"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-sm font-semibold"
          >
            Close
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["name", "Contact name"],
              ["organization", "Organization"],
              ["value", "Opportunity value (₹)"],
              ["owner", "Owner"],
            ].map(([key, label]) => (
              <label key={key} className="block">
                <span className="mb-1.5 block text-xs font-semibold">{label}</span>
                <input
                  data-testid={`input-lead-${key}`}
                  type={key === "value" ? "number" : "text"}
                  min={key === "value" ? "0" : undefined}
                  value={form[key as keyof typeof emptyForm]}
                  onChange={(event) => update(key as keyof typeof emptyForm, event.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>
            ))}
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs font-semibold">Source</span>
              <select
                data-testid="select-lead-source"
                value={form.source}
                onChange={(event) => update("source", event.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary"
              >
                <option>Referral</option>
                <option>Website</option>
                <option>Event</option>
                <option>Partner</option>
                <option>Outbound</option>
                <option>Institution referral</option>
              </select>
            </label>
          </div>
          {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              data-testid="button-cancel-lead"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="button-submit-lead"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Add lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Leads() {
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toast, setToast] = useState("");

  const { leads, addLead } = useLeadsData({
    search: search || undefined,
    stage: stage || undefined,
  });

  return (
    <ErpShell>
      <div className="page-enter">
        <PageHeader
          eyebrow="Growth operations"
          title="CRM pipeline"
          description="Keep every institutional opportunity moving, with context visible at a glance."
          action={
            <button
              type="button"
              data-testid="button-add-lead"
              onClick={() => setDialogOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Add lead
            </button>
          }
        />
        <Panel>
          <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row">
            <SearchField value={search} onChange={setSearch} placeholder="Search people or organizations" />
            <div className="flex h-10 items-center gap-2 rounded-lg border border-input bg-card px-3 text-sm text-muted-foreground sm:w-48">
              <SlidersHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />
              <select
                data-testid="select-stage-filter"
                value={stage}
                onChange={(event) => setStage(event.target.value)}
                className="w-full bg-transparent text-sm text-foreground outline-none cursor-pointer"
              >
                <option value="">All stages</option>
                {stages.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
            <div className="hidden items-center px-2 font-mono-ui text-[10px] uppercase tracking-wider text-muted-foreground sm:flex">
              {leads.length} opportunities
            </div>
          </div>
          {leads.length === 0 ? (
            <EmptyState
              title="Pipeline is clear"
              description="No opportunities match this filter. Add a lead to start a new conversation."
              action={
                <button
                  type="button"
                  data-testid="button-empty-add-lead"
                  onClick={() => setDialogOpen(true)}
                  className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
                >
                  Add lead
                </button>
              }
            />
          ) : (
            <div className="scrollbar-thin overflow-x-auto">
              <table className="w-full min-w-[820px] text-left">
                <thead className="bg-background/60 font-mono-ui text-[10px] uppercase tracking-[.13em] text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-medium">Opportunity</th>
                    <th className="px-4 py-3 font-medium">Stage</th>
                    <th className="px-4 py-3 font-medium">Value</th>
                    <th className="px-4 py-3 font-medium">Owner</th>
                    <th className="px-4 py-3 font-medium">Source</th>
                    <th className="px-5 py-3 text-right font-medium">Last contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/65">
                  {leads.map((lead) => (
                    <tr key={lead.id} data-testid={`row-lead-${lead.id}`} className="hover:bg-background/70">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar initials={lead.initials} />
                          <div>
                            <div className="text-sm font-semibold text-foreground">{lead.organization}</div>
                            <div className="mt-0.5 text-xs text-muted-foreground">{lead.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge value={lead.stage} />
                      </td>
                      <td className="px-4 py-4 font-mono-ui text-xs font-semibold">{formatCurrency(lead.value)}</td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">{lead.owner}</td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">{lead.source}</td>
                      <td className="px-5 py-4 text-right text-xs text-muted-foreground">
                        {lead.lastContact}
                        <ArrowUpRight className="ml-1 inline h-3.5 w-3.5 text-primary" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
        {dialogOpen && (
          <LeadDialog
            onClose={() => setDialogOpen(false)}
            onSuccess={setToast}
            onAdd={addLead}
          />
        )}
        {toast && <ToastMessage message={toast} onDismiss={() => setToast("")} />}
      </div>
    </ErpShell>
  );
}
