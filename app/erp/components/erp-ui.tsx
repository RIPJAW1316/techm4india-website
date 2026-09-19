import { type ReactNode } from "react";
import { AlertCircle, ArrowUpRight, Inbox, LoaderCircle, Search, Sparkles } from "lucide-react";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-50 px-2.5 py-0.5 font-mono-ui text-[10px] font-semibold uppercase tracking-[.16em] text-teal-800">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-600 erp-pulse-dot" />
          {eyebrow}
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[28px]">{title}</h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p>
      </div>
      {action && <div className="flex items-center gap-2.5 shrink-0">{action}</div>}
    </div>
  );
}

export function Panel({
  children,
  className = "",
  title,
  action,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
}) {
  return (
    <section className={`rounded-xl border border-slate-200/80 bg-white shadow-xs transition-shadow hover:shadow-sm ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-sm font-semibold tracking-tight text-slate-900">{title}</h3>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder = "Search records",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-slate-400 focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-600/15 sm:max-w-[320px] transition-all">
      <Search className="h-4 w-4 shrink-0 text-slate-400" />
      <input
        data-testid="input-search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="rounded p-0.5 text-slate-400 hover:text-slate-600"
          aria-label="Clear search"
        >
          <span className="text-xs">✕</span>
        </button>
      )}
    </div>
  );
}

export function StatusBadge({
  value,
  tone,
}: {
  value: string;
  tone?: "green" | "amber" | "blue" | "red" | "slate";
}) {
  const normalized = value.toLowerCase();
  const resolved =
    tone ??
    (normalized.includes("active") ||
    normalized.includes("on track") ||
    normalized.includes("qualified") ||
    normalized.includes("completed") ||
    normalized.includes("done") ||
    normalized.includes("paid") ||
    normalized.includes("live") ||
    normalized.includes("healthy") ||
    normalized.includes("strategic") ||
    normalized.includes("excellent")
      ? "green"
      : normalized.includes("risk") ||
        normalized.includes("review") ||
        normalized.includes("proposal") ||
        normalized.includes("progress") ||
        normalized.includes("pending") ||
        normalized.includes("watch") ||
        normalized.includes("medium")
      ? "amber"
      : normalized.includes("blocked") ||
        normalized.includes("high") ||
        normalized.includes("urgent") ||
        normalized.includes("overdue")
      ? "red"
      : "blue");

  const colors = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200/90",
    amber: "bg-amber-50 text-amber-700 border-amber-200/90",
    blue: "bg-sky-50 text-sky-700 border-sky-200/90",
    red: "bg-rose-50 text-rose-700 border-rose-200/90",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono-ui text-[10px] font-semibold uppercase tracking-wider ${colors[resolved]}`}
      data-testid={`status-${value.toLowerCase().replaceAll(" ", "-")}`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {value}
    </span>
  );
}

export function Avatar({ initials, className = "" }: { initials: string; className?: string }) {
  return (
    <span
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-card bg-primary/10 font-mono-ui text-[10px] font-semibold text-primary ${className}`}
      data-testid={`avatar-${initials}`}
    >
      {initials}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Inbox className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({
  onRetry,
  message = "We could not load this workspace view.",
}: {
  onRetry: () => void;
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertCircle className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-semibold">Something interrupted the feed</h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{message}</p>
      <button
        type="button"
        data-testid="button-retry"
        onClick={onRetry}
        className="mt-5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold hover:border-primary hover:text-primary"
      >
        Try again <ArrowUpRight className="ml-1 inline h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function LoadingRows({ count = 5, cols = 4 }: { count?: number; cols?: number }) {
  return (
    <div className="space-y-3 p-5" aria-label="Loading">
      <LoaderCircle className="mx-auto mb-3 h-4 w-4 animate-spin text-primary" />
      {Array.from({ length: count }).map((_, row) => (
        <div key={row} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {Array.from({ length: cols }).map((__, col) => (
            <div key={col} className="skeleton h-8 rounded-md" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ToastMessage({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex max-w-[calc(100vw-40px)] items-center gap-3 rounded-lg border border-primary/25 bg-foreground px-4 py-3 text-sm text-background shadow-xl">
      <Sparkles className="h-4 w-4 text-accent" />
      <span>{message}</span>
      <button
        type="button"
        data-testid="button-dismiss-toast"
        onClick={onDismiss}
        className="ml-2 text-background/55 hover:text-background"
      >
        Dismiss
      </button>
    </div>
  );
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: value >= 100000 ? 0 : 2,
  }).format(value);
}

export function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
