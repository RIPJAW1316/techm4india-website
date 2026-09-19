"use client";

import { useState, type FormEvent } from "react";
import { ArrowUpRight, Building2, CircleDollarSign, Plus, SlidersHorizontal, User, UserCheck, X } from "lucide-react";
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
      setError("Contact name, organization, value, and owner are required.");
      return;
    }
    setError("");
    onAdd({ ...form, value: Number(form.value), stage: "New" });
    onSuccess(`${form.organization} added to the CRM pipeline.`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity erp-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-slate-200/80 bg-white shadow-2xl erp-modal-box overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 border border-teal-200/60 text-teal-600 shadow-xs">
              <CircleDollarSign className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono-ui text-[10px] font-semibold uppercase tracking-[.18em] text-teal-700">
                  CRM · New Opportunity
                </span>
              </div>
              <h3 className="text-lg font-bold tracking-tight text-slate-900">Add Lead Opportunity</h3>
            </div>
          </div>
          <button
            type="button"
            data-testid="button-close-lead-dialog"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={submit}>
          <div className="space-y-4 p-6">
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
                {error}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Organization */}
              <div className="sm:col-span-2">
                <label className="block">
                  <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    Organization / Client Name <span className="text-rose-500">*</span>
                  </span>
                  <input
                    data-testid="input-lead-organization"
                    type="text"
                    value={form.organization}
                    onChange={(event) => update("organization", event.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10"
                    placeholder="e.g. National Institute of Technology"
                  />
                </label>
              </div>

              {/* Contact Person */}
              <div>
                <label className="block">
                  <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    Key Contact Name <span className="text-rose-500">*</span>
                  </span>
                  <input
                    data-testid="input-lead-name"
                    type="text"
                    value={form.name}
                    onChange={(event) => update("name", event.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10"
                    placeholder="e.g. Dr. Rajesh Kumar"
                  />
                </label>
              </div>

              {/* Deal Owner */}
              <div>
                <label className="block">
                  <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                    Account Executive / Owner <span className="text-rose-500">*</span>
                  </span>
                  <input
                    data-testid="input-lead-owner"
                    type="text"
                    value={form.owner}
                    onChange={(event) => update("owner", event.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10"
                    placeholder="e.g. Arjun Rao"
                  />
                </label>
              </div>

              {/* Opportunity Value */}
              <div>
                <label className="block">
                  <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <span className="font-bold text-teal-600">₹</span>
                    Opportunity Value (INR) <span className="text-rose-500">*</span>
                  </span>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-2.5 text-sm font-semibold text-slate-400">
                      ₹
                    </span>
                    <input
                      data-testid="input-lead-value"
                      type="number"
                      min="0"
                      value={form.value}
                      onChange={(event) => update("value", event.target.value)}
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10"
                      placeholder="500000"
                    />
                  </div>
                </label>
              </div>

              {/* Lead Source */}
              <div>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-700">Lead Acquisition Source</span>
                  <select
                    data-testid="select-lead-source"
                    value={form.source}
                    onChange={(event) => update("source", event.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition-all focus:border-teal-600 cursor-pointer"
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
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
            <button
              type="button"
              data-testid="button-cancel-lead"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="button-submit-lead"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 transition-colors focus:ring-2 focus:ring-teal-600/20"
            >
              <Plus className="h-4 w-4" />
              Add Opportunity
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

  const totalValue = leads.reduce((acc, curr) => acc + (curr.value || 0), 0);

  return (
    <ErpShell>
      <div className="page-enter">
        <PageHeader
          eyebrow="Growth & Sales"
          title="CRM Pipeline"
          description="Track high-value institutional opportunities, deal progression, and stakeholder relationships."
          action={
            <button
              type="button"
              data-testid="button-add-lead"
              onClick={() => setDialogOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add lead
            </button>
          }
        />

        {/* Pipeline Value Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="font-mono-ui text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Active Pipeline Value
            </div>
            <div className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              {formatCurrency(totalValue)}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="font-mono-ui text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Total Opportunities
            </div>
            <div className="mt-1 text-2xl font-bold tracking-tight text-teal-700">
              {leads.length} Deals
            </div>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="font-mono-ui text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Average Deal Size
            </div>
            <div className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              {leads.length > 0 ? formatCurrency(Math.round(totalValue / leads.length)) : "₹0"}
            </div>
          </div>
        </div>

        <Panel>
          <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/40 p-4 sm:flex-row sm:items-center">
            <SearchField value={search} onChange={setSearch} placeholder="Search contacts, institutions, or owners" />
            <div className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-500 sm:w-52 shadow-xs focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-600/10 transition-all">
              <SlidersHorizontal className="h-4 w-4 shrink-0 text-slate-400" />
              <select
                data-testid="select-stage-filter"
                value={stage}
                onChange={(event) => setStage(event.target.value)}
                className="w-full bg-transparent text-sm text-slate-800 outline-none cursor-pointer"
              >
                <option value="">All stages</option>
                {stages.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
            <div className="ml-auto hidden items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 font-mono-ui text-[11px] font-semibold uppercase tracking-wider text-slate-600 shadow-xs sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
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
                  className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-500"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add lead
                </button>
              }
            />
          ) : (
            <div className="scrollbar-thin overflow-x-auto">
              <table className="erp-table-modern w-full min-w-[820px] text-left">
                <thead>
                  <tr>
                    <th className="px-5 py-3">Opportunity &amp; Institution</th>
                    <th className="px-4 py-3">Stage</th>
                    <th className="px-4 py-3">Deal Value</th>
                    <th className="px-4 py-3">Account Owner</th>
                    <th className="px-4 py-3">Acquisition Source</th>
                    <th className="px-5 py-3 text-right">Last Touch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.map((lead) => (
                    <tr key={lead.id} data-testid={`row-lead-${lead.id}`} className="group">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar initials={lead.initials} className="h-9 w-9 rounded-xl shadow-xs" />
                          <div>
                            <div className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                              {lead.organization}
                            </div>
                            <div className="text-xs text-slate-500">{lead.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge value={lead.stage} />
                      </td>
                      <td className="px-4 py-3.5 font-mono-ui text-xs font-bold text-slate-900">
                        {formatCurrency(lead.value)}
                      </td>
                      <td className="px-4 py-3.5 text-sm font-medium text-slate-700">{lead.owner}</td>
                      <td className="px-4 py-3.5 text-sm">
                        <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-600">
                          {lead.source}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right text-xs text-slate-500 font-mono-ui">
                        {lead.lastContact}
                        <ArrowUpRight className="ml-1 inline h-3.5 w-3.5 text-teal-600" />
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
