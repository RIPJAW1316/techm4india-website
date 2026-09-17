"use client";

import { useMemo, useState, type FormEvent } from "react";
import { ClipboardList, FilePlus2, Filter, IndianRupee, Search, X } from "lucide-react";
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
      setError("Complete the required operating fields before saving.");
      return;
    }
    setError("");
    onSave({ ...form, amount: Number(form.amount), progress: Number(form.progress) });
    onSuccess(`${form.name} added to ${config.title.toLowerCase()}.`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/35 p-0 sm:items-center sm:p-5"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-t-2xl border border-card-border bg-card shadow-2xl sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-border px-5 py-5">
          <div>
            <div className="mb-1 font-mono-ui text-[10px] uppercase tracking-[.16em] text-primary">
              {config.title} / New record
            </div>
            <h3 className="text-lg font-semibold">Create {config.singular}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{config.helper}</p>
          </div>
          <button
            type="button"
            data-testid="button-close-module-dialog"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["kind", "Record type", "text"],
              ["name", "Name", "text"],
              ["reference", "Reference", "text"],
              ["owner", "Owner", "text"],
              ["dueDate", "Due date", "date"],
            ].map(([key, label, type]) => (
              <label key={key} className="block">
                <span className="mb-1.5 block text-xs font-semibold">
                  {label}
                  <span className="text-primary"> *</span>
                </span>
                <input
                  data-testid={`input-module-${key}`}
                  required
                  type={type}
                  value={String(form[key as keyof ModuleRecordInput])}
                  onChange={(event) => update(key as keyof ModuleRecordInput, event.target.value as never)}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>
            ))}
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold">Status</span>
              <select
                data-testid="select-module-status"
                value={form.status}
                onChange={(event) => update("status", event.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary"
              >
                {["Active", "Pending", "In review", "Completed", "At risk", "Archived"].map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold">Amount</span>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-3 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  data-testid="input-module-amount"
                  type="number"
                  min="0"
                  value={form.amount}
                  onChange={(event) => update("amount", Number(event.target.value))}
                  className="h-10 w-full rounded-lg border border-input bg-background pl-8 pr-3 text-sm outline-none focus:border-primary"
                />
              </div>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold">
                Progress <span className="font-normal text-muted-foreground">(0–100)</span>
              </span>
              <input
                data-testid="input-module-progress"
                type="number"
                min="0"
                max="100"
                value={form.progress}
                onChange={(event) => update("progress", Number(event.target.value))}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary"
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold">
              Description <span className="text-primary">*</span>
            </span>
            <textarea
              data-testid="input-module-description"
              rows={3}
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              placeholder="Add the operating context for this record."
            />
          </label>
          {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              data-testid="button-cancel-module"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="button-submit-module"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Create record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RecordRow({ record }: { record: ModuleRecord }) {
  return (
    <tr data-testid={`row-module-record-${record.id}`} className="group hover:bg-background/70">
      <td className="px-5 py-4">
        <div className="flex items-start gap-3">
          <Avatar initials={record.initials || record.name.slice(0, 2).toUpperCase()} className="mt-0.5 h-8 w-8" />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-foreground">{record.name}</div>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{record.kind}</span>
              <span className="text-border">/</span>
              <span className="font-mono-ui">{record.reference}</span>
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <StatusBadge value={record.status} />
      </td>
      <td className="px-4 py-4">
        <div className="flex min-w-[130px] items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.min(100, Math.max(0, record.progress || 0))}%` }}
            />
          </div>
          <span className="font-mono-ui text-[10px] text-muted-foreground">{record.progress || 0}%</span>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="h-6 w-6 rounded-full bg-accent/20 text-center font-mono-ui text-[9px] font-semibold leading-6 text-accent-foreground">
            {record.owner.slice(0, 2).toUpperCase()}
          </span>
          <span className="max-w-[150px] truncate">{record.owner}</span>
        </div>
      </td>
      <td className="px-4 py-4 text-xs text-muted-foreground">{formatDate(record.dueDate)}</td>
      <td className="px-5 py-4 text-right font-mono-ui text-xs font-medium text-foreground">
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
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              <FilePlus2 className="h-4 w-4" />
              New {config.singular}
            </button>
          }
        />
        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-card-border bg-card p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono-ui text-[10px] uppercase tracking-wider text-muted-foreground">
                Records in view
              </span>
              <ClipboardList className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-bold tracking-tight">{visibleRecords.length}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {records.length === visibleRecords.length ? "Full operating register" : `${records.length - visibleRecords.length} hidden by filters`}
            </div>
          </div>
          <div className="rounded-xl border border-card-border bg-card p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono-ui text-[10px] uppercase tracking-wider text-muted-foreground">
                Active signals
              </span>
              <span className="h-2 w-2 rounded-full bg-primary" />
            </div>
            <div className="text-2xl font-bold tracking-tight">
              {records.filter((record) => record.status.toLowerCase().includes("active") || record.status.toLowerCase().includes("progress") || record.status.toLowerCase().includes("live")).length}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Requires ongoing coordination</div>
          </div>
          <div className="rounded-xl border border-card-border bg-card p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono-ui text-[10px] uppercase tracking-wider text-muted-foreground">
                Value tracked
              </span>
              <IndianRupee className="h-4 w-4 text-accent" />
            </div>
            <div className="text-2xl font-bold tracking-tight">
              {formatCurrency(records.reduce((sum, record) => sum + (record.amount || 0), 0))}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Across registered items</div>
          </div>
        </div>
        <Panel>
          <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
            <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-input bg-card px-3 text-muted-foreground focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 sm:max-w-[350px]">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                data-testid="input-module-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={`Search ${config.title.toLowerCase()}`}
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
              />
            </div>
            <div className="flex h-10 items-center gap-2 rounded-lg border border-input bg-card px-3 text-sm text-muted-foreground sm:w-52">
              <Filter className="h-4 w-4 shrink-0 text-muted-foreground" />
              <select
                data-testid="select-module-status-filter"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="w-full bg-transparent text-sm text-foreground outline-none cursor-pointer"
              >
                <option value="">All statuses</option>
                {statuses.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
            <div className="font-mono-ui text-[10px] uppercase tracking-wider text-muted-foreground sm:ml-auto">
              {visibleRecords.length} matching items
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
                    className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
                  >
                    Create first record
                  </button>
                ) : undefined
              }
            />
          ) : (
            <div className="scrollbar-thin overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead className="bg-background/60 font-mono-ui text-[10px] uppercase tracking-[.13em] text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-medium">Record</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Progress</th>
                    <th className="px-4 py-3 font-medium">Owner</th>
                    <th className="px-4 py-3 font-medium">Due</th>
                    <th className="px-5 py-3 text-right font-medium">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/65">
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
