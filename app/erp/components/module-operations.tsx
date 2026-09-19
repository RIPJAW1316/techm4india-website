"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  Calendar,
  Check,
  ClipboardList,
  FileCheck,
  FilePlus2,
  FileText,
  Filter,
  Hash,
  IndianRupee,
  Search,
  Tag,
  User,
  X,
} from "lucide-react";
import { useModuleRecordsData } from "@/lib/erp/replit-store";
import type { ModuleRecord, ModuleRecordInput } from "@/lib/erp/replit-data";
import { ErpShell } from "./erp-shell";
import {
  Avatar,
  EmptyState,
  formatCurrency,
  formatDate,
  PageHeader,
  Panel,
  StatusBadge,
  ToastMessage,
} from "./erp-ui";

export type ModuleViewConfig = {
  module: string;
  eyebrow: string;
  title: string;
  description: string;
  singular: string;
  helper: string;
  accent: string;
};

const initialForm: ModuleRecordInput = {
  kind: "",
  name: "",
  reference: "",
  status: "Active",
  owner: "",
  amount: 0,
  progress: 0,
  dueDate: "",
  description: "",
};

function CreateModuleRecord({
  config,
  onClose,
  onSuccess,
  onSave,
}: {
  config: ModuleViewConfig;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onSave: (data: ModuleRecordInput) => void;
}) {
  const [form, setForm] = useState<ModuleRecordInput>(initialForm);
  const [error, setError] = useState("");

  const update = <K extends keyof ModuleRecordInput>(key: K, value: ModuleRecordInput[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.kind || !form.name || !form.reference || !form.owner || !form.dueDate || !form.description) {
      setError("Please complete all required fields (* marked) before submitting.");
      return;
    }
    setError("");
    onSave({ ...form, amount: Number(form.amount), progress: Number(form.progress) });
    onSuccess(`${form.name} successfully registered in ${config.title.toLowerCase()}.`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden erp-modal-box my-6"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-slate-50/70">
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 border border-teal-100 shadow-xs">
              <FilePlus2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-mono-ui text-[10px] uppercase tracking-[.16em] text-teal-700 font-semibold">
                <span>{config.title}</span>
                <span>/</span>
                <span>Operating Entry</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">Create New {config.singular}</h3>
            </div>
          </div>
          <button
            type="button"
            data-testid="button-close-module-dialog"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={submit} className="p-6 space-y-5">
          {/* Section 1: Identification */}
          <div>
            <div className="mb-3 font-mono-ui text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              1. General Details
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Record Type <span className="text-teal-600">*</span>
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    data-testid="input-module-kind"
                    required
                    value={form.kind}
                    onChange={(event) => update("kind", event.target.value)}
                    placeholder="e.g. Contract, Curriculum, Batch"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Reference ID <span className="text-teal-600">*</span>
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    data-testid="input-module-reference"
                    required
                    value={form.reference}
                    onChange={(event) => update("reference", event.target.value)}
                    placeholder="e.g. REF-2026-001"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm font-mono-ui text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Record Title / Name <span className="text-teal-600">*</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    data-testid="input-module-name"
                    required
                    value={form.name}
                    onChange={(event) => update("name", event.target.value)}
                    placeholder={`Descriptive title for this ${config.singular.toLowerCase()}`}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Ownership & Timeline */}
          <div>
            <div className="mb-3 font-mono-ui text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              2. Assignment &amp; Milestones
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Assignee / Owner <span className="text-teal-600">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    data-testid="input-module-owner"
                    required
                    value={form.owner}
                    onChange={(event) => update("owner", event.target.value)}
                    placeholder="e.g. Arjun Rao"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Target Due Date <span className="text-teal-600">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    data-testid="input-module-dueDate"
                    required
                    type="date"
                    value={form.dueDate}
                    onChange={(event) => update("dueDate", event.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Status & Metrics */}
          <div>
            <div className="mb-3 font-mono-ui text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              3. Operational Status &amp; Financials
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">Status</label>
                <select
                  data-testid="select-module-status"
                  value={form.status}
                  onChange={(event) => update("status", event.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-teal-600 cursor-pointer"
                >
                  {["Active", "Pending", "In review", "Completed", "At risk", "Archived"].map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>Tracked Value</span>
                  <span className="text-[10px] text-slate-400">INR</span>
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  <input
                    data-testid="input-module-amount"
                    type="number"
                    min="0"
                    value={form.amount}
                    onChange={(event) => update("amount", Number(event.target.value))}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-sm text-slate-900 outline-none focus:border-teal-600 font-mono-ui"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>Progress</span>
                  <span className="font-mono-ui text-[10px] text-teal-700 font-semibold">{form.progress}%</span>
                </label>
                <input
                  data-testid="input-module-progress"
                  type="number"
                  min="0"
                  max="100"
                  value={form.progress}
                  onChange={(event) => update("progress", Number(event.target.value))}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-teal-600 font-mono-ui"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Description */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Description &amp; Operational Context <span className="text-teal-600">*</span>
            </label>
            <textarea
              data-testid="input-module-description"
              rows={3}
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              className="w-full resize-none rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
              placeholder="Add key deliverables, milestones, or scope requirements."
            />
          </div>

          {error && <p className="rounded-lg bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-xs font-semibold text-rose-700">{error}</p>}

          {/* Modal Footer */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-[11px] text-slate-400">Company records audited in real time</span>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                data-testid="button-cancel-module"
                onClick={onClose}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                data-testid="button-submit-module"
                className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 transition-colors shadow-xs"
              >
                <FileCheck className="h-4 w-4" />
                Create Record
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function RecordRow({ record }: { record: ModuleRecord }) {
  return (
    <tr data-testid={`row-module-record-${record.id}`} className="group hover:bg-slate-50/80 transition-colors">
      <td className="px-5 py-4">
        <div className="flex items-start gap-3">
          <Avatar initials={record.initials || record.name.slice(0, 2).toUpperCase()} className="mt-0.5 h-8 w-8" />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-900">{record.name}</div>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
              <span className="font-medium text-slate-600">{record.kind}</span>
              <span className="text-slate-300">/</span>
              <span className="font-mono-ui text-slate-500">{record.reference}</span>
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <StatusBadge value={record.status} />
      </td>
      <td className="px-4 py-4">
        <div className="flex min-w-[130px] items-center gap-2.5">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-teal-600 transition-all"
              style={{ width: `${Math.min(100, Math.max(0, record.progress || 0))}%` }}
            />
          </div>
          <span className="font-mono-ui text-[11px] font-semibold text-slate-600">{record.progress || 0}%</span>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <span className="h-6 w-6 rounded-full bg-slate-100 border border-slate-200 text-center font-mono-ui text-[9px] font-bold leading-6 text-slate-700">
            {record.owner.slice(0, 2).toUpperCase()}
          </span>
          <span className="max-w-[150px] truncate font-medium">{record.owner}</span>
        </div>
      </td>
      <td className="px-4 py-4 text-xs font-medium text-slate-500">{formatDate(record.dueDate)}</td>
      <td className="px-5 py-4 text-right font-mono-ui text-xs font-bold text-slate-900">
        {record.amount ? formatCurrency(record.amount) : "—"}
      </td>
    </tr>
  );
}

export function ModuleOperations({ config }: { config: ModuleViewConfig }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toast, setToast] = useState("");

  const { records, addRecord } = useModuleRecordsData(config.module);

  const statuses = useMemo(() => Array.from(new Set(records.map((record) => record.status).filter(Boolean))), [records]);

  const visibleRecords = useMemo(
    () =>
      records.filter((record) => {
        const haystack = `${record.name} ${record.kind} ${record.reference} ${record.owner} ${record.description}`.toLowerCase();
        return haystack.includes(search.toLowerCase()) && (!status || record.status === status);
      }),
    [records, search, status]
  );

  return (
    <ErpShell>
      <div className="page-enter">
        <PageHeader
          eyebrow={config.eyebrow}
          title={config.title}
          description={config.description}
          action={
            <button
              type="button"
              data-testid="button-new-module-record"
              onClick={() => setDialogOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-teal-700 transition-colors"
            >
              <FilePlus2 className="h-4 w-4" />
              New {config.singular}
            </button>
          }
        />
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono-ui text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Operating Register
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600 border border-teal-100">
                <ClipboardList className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight text-slate-900">{visibleRecords.length}</div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
              {records.length === visibleRecords.length ? "All active items loaded" : `${records.length - visibleRecords.length} hidden by filters`}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono-ui text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Active Signals
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                <span className="h-2 w-2 rounded-full bg-emerald-500 erp-pulse-dot" />
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight text-slate-900">
              {records.filter((record) => record.status.toLowerCase().includes("active") || record.status.toLowerCase().includes("progress") || record.status.toLowerCase().includes("live")).length}
            </div>
            <div className="mt-1 text-xs font-medium text-emerald-700">Requires ongoing coordination</div>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono-ui text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Value Tracked
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
                <IndianRupee className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight text-slate-900">
              {formatCurrency(records.reduce((sum, record) => sum + (record.amount || 0), 0))}
            </div>
            <div className="mt-1 text-xs text-slate-500">Across registered operating items</div>
          </div>
        </div>
        <Panel>
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center bg-slate-50/30">
            <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-slate-400 focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-600/15 sm:max-w-[350px] transition-all">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                data-testid="input-module-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={`Search ${config.title.toLowerCase()}…`}
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="rounded p-0.5 text-slate-400 hover:text-slate-600"
                  aria-label="Clear search"
                >
                  <span className="text-xs">✕</span>
                </button>
              )}
            </div>
            <div className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 sm:w-56 focus-within:border-teal-600">
              <Filter className="h-4 w-4 shrink-0 text-slate-400" />
              <select
                data-testid="select-module-status-filter"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="w-full bg-transparent text-sm text-slate-900 outline-none cursor-pointer"
              >
                <option value="">All statuses</option>
                {statuses.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
            <div className="font-mono-ui text-[11px] font-medium text-slate-500 sm:ml-auto">
              Showing <span className="font-bold text-slate-900">{visibleRecords.length}</span> of {records.length} items
            </div>
          </div>
          {visibleRecords.length === 0 ? (
            <EmptyState
              title={records.length === 0 ? `No ${config.title.toLowerCase()} yet` : "No records match"}
              description={
                records.length === 0
                  ? `Create the first ${config.singular.toLowerCase()} to start tracking this operating area.`
                  : "Adjust the search or status filter to widen the view."
              }
              action={
                records.length === 0 ? (
                  <button
                    type="button"
                    data-testid="button-empty-new-module-record"
                    onClick={() => setDialogOpen(true)}
                    className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 shadow-xs"
                  >
                    Create first record
                  </button>
                ) : undefined
              }
            />
          ) : (
            <div className="scrollbar-thin overflow-x-auto">
              <table className="erp-table-modern text-left">
                <thead>
                  <tr>
                    <th>Record</th>
                    <th>Status</th>
                    <th>Progress</th>
                    <th>Owner</th>
                    <th>Due Date</th>
                    <th className="text-right">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRecords.map((record) => (
                    <RecordRow key={record.id} record={record} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
      {dialogOpen && (
        <CreateModuleRecord
          config={config}
          onClose={() => setDialogOpen(false)}
          onSuccess={setToast}
          onSave={addRecord}
        />
      )}
      {toast && <ToastMessage message={toast} onDismiss={() => setToast("")} />}
    </ErpShell>
  );
}
