"use client";

import {
  Activity as ActivityIcon,
  ArrowDownRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  IndianRupee,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { ErpShell } from "../components/erp-shell";
import { formatCurrency, PageHeader, Panel, StatusBadge } from "../components/erp-ui";
import { useDashboardData } from "@/lib/erp/replit-store";
import type { Activity, DashboardSummary } from "@/lib/erp/replit-data";

function MetricCard({
  label,
  value,
  change,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  change: number;
  icon: typeof IndianRupee;
  accent: string;
}) {
  const positive = change >= 0;
  return (
    <div className="group rounded-xl border border-card-border bg-card p-5 shadow-[0_2px_12px_hsl(var(--foreground)/.03)] transition-transform hover:-translate-y-0.5">
      <div className="mb-5 flex items-start justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${accent}`}>
          <Icon className="h-[17px] w-[17px]" />
        </div>
        <span
          className={`flex items-center gap-0.5 font-mono-ui text-[11px] font-semibold ${
            positive ? "text-emerald-700" : "text-destructive"
          }`}
        >
          {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          {Math.abs(change)}%
        </span>
      </div>
      <div className="font-mono-ui text-[11px] uppercase tracking-[.12em] text-muted-foreground">{label}</div>
      <div className="mt-1 text-[25px] font-bold tracking-[-.04em] text-foreground">{value}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">versus previous period</div>
    </div>
  );
}

function RevenueChart({ summary }: { summary: DashboardSummary }) {
  const max = Math.max(...summary.revenueByMonth.map((item) => item.value), 1);
  return (
    <Panel
      title="Revenue pulse"
      action={<span className="font-mono-ui text-[10px] uppercase tracking-wider text-muted-foreground">Last 6 months</span>}
      className="min-w-0"
    >
      <div className="p-5">
        <div className="flex h-[190px] items-end gap-2 sm:gap-4">
          {summary.revenueByMonth.map((item, index) => (
            <div key={item.label} className="group flex h-full flex-1 flex-col justify-end gap-2">
              <div className="relative flex flex-1 items-end justify-center">
                <div className="absolute bottom-[calc(100%+8px)] hidden rounded bg-foreground px-2 py-1 font-mono-ui text-[10px] text-background group-hover:block z-10 shadow-lg">
                  {formatCurrency(item.value)}
                </div>
                <div
                  className="w-full max-w-[42px] rounded-t-md bg-primary/80 transition-all group-hover:bg-primary"
                  style={{ height: `${Math.max(8, (item.value / max) * 100)}%`, animationDelay: `${index * 60}ms` }}
                />
              </div>
              <span className="text-center font-mono-ui text-[10px] text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-primary" />
          Revenue recognized across active programs
        </div>
      </div>
    </Panel>
  );
}

function PipelineChart({ summary }: { summary: DashboardSummary }) {
  const max = Math.max(...summary.pipelineByStage.map((item) => item.value), 1);
  return (
    <Panel
      title="Pipeline by stage"
      action={
        <Link href="/erp/leads" data-testid="link-view-pipeline" className="text-xs font-semibold text-primary hover:underline">
          Open CRM
        </Link>
      }
    >
      <div className="space-y-4 p-5">
        {summary.pipelineByStage.map((item, index) => (
          <div key={item.label}>
            <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
              <span className="font-medium text-foreground">{item.label}</span>
              <span className="font-mono-ui text-[10px] text-muted-foreground">
                {item.count} leads · {formatCurrency(item.value)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${
                  index === 0 ? "bg-primary" : index === 1 ? "bg-chart-3" : index === 2 ? "bg-accent" : "bg-chart-4"
                }`}
                style={{ width: `${Math.max(7, (item.value / max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function ActivityFeed({ activities }: { activities: Activity[] }) {
  return (
    <Panel
      title="Operational activity"
      action={<span className="font-mono-ui text-[10px] uppercase tracking-wider text-muted-foreground">Live feed</span>}
    >
      <div className="divide-y divide-border/70">
        {activities.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No recent activity.</div>
        ) : (
          activities.slice(0, 6).map((activity) => (
            <div key={activity.id} className="flex gap-3 px-5 py-4">
              <div
                className="mt-1 h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: activity.accent || "hsl(var(--primary))" }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{activity.title}</p>
                  <span className="font-mono-ui text-[10px] text-muted-foreground">{activity.timestamp}</span>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{activity.description}</p>
                <p className="mt-2 text-[10px] font-medium uppercase tracking-wider text-primary">
                  {activity.actor} · {activity.type}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Panel>
  );
}

export default function Dashboard() {
  const { summary, activities } = useDashboardData();

  return (
    <ErpShell>
      <div className="page-enter">
        <PageHeader
          eyebrow="Executive view / 09:42 IST"
          title="Good morning, Arjun."
          description="The operating picture is healthy. Here is what needs your attention today."
          action={
            <div className="hidden rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-right sm:block">
              <div className="font-mono-ui text-[10px] uppercase tracking-wider text-primary">Thursday, 06 Feb 2025</div>
              <div className="mt-0.5 text-xs font-medium text-foreground">Week 06 · FY25</div>
            </div>
          }
        />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 page-enter-delay-1">
          <MetricCard
            label="Revenue"
            value={formatCurrency(summary.revenue)}
            change={summary.revenueChange}
            icon={IndianRupee}
            accent="bg-primary/10 text-primary"
          />
          <MetricCard
            label="Active learners"
            value={summary.activeLearners.toLocaleString("en-IN")}
            change={summary.learnerChange}
            icon={UsersRound}
            accent="bg-chart-3/10 text-chart-3"
          />
          <MetricCard
            label="Partner institutions"
            value={summary.partnerInstitutions.toLocaleString("en-IN")}
            change={summary.institutionChange}
            icon={Building2}
            accent="bg-accent/15 text-amber-700"
          />
          <MetricCard
            label="Pipeline value"
            value={formatCurrency(summary.pipelineValue)}
            change={summary.pipelineChange}
            icon={BriefcaseBusiness}
            accent="bg-chart-4/10 text-chart-4"
          />
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_1fr] page-enter-delay-2">
          <RevenueChart summary={summary} />
          <PipelineChart summary={summary} />
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_1fr] page-enter-delay-3">
          <ActivityFeed activities={activities} />
          <Panel
            title="Delivery signal"
            action={
              <Link href="/erp/tasks" data-testid="link-view-work-queue" className="text-xs font-semibold text-primary hover:underline">
                View queue
              </Link>
            }
          >
            <div className="p-5">
              <div className="mb-5 flex items-end justify-between">
                <div>
                  <div className="font-mono-ui text-[10px] uppercase tracking-wider text-muted-foreground">Open positions</div>
                  <div className="mt-1 text-3xl font-bold tracking-[-.04em]">{summary.openPositions}</div>
                </div>
                <StatusBadge value="On track" />
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-primary to-chart-4" />
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
                <span>Delivery capacity</span>
                <span className="font-mono-ui">78%</span>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border bg-background/60 p-3">
                  <ActivityIcon className="mb-3 h-4 w-4 text-primary" />
                  <div className="font-mono-ui text-[10px] uppercase tracking-wider text-muted-foreground">Live programs</div>
                  <div className="mt-1 text-lg font-semibold">{summary.partnerInstitutions + 4}</div>
                </div>
                <div className="rounded-lg border border-border bg-background/60 p-3">
                  <IndianRupee className="mb-3 h-4 w-4 text-accent" />
                  <div className="font-mono-ui text-[10px] uppercase tracking-wider text-muted-foreground">Forecast lift</div>
                  <div className="mt-1 text-lg font-semibold">+{summary.revenueChange}%</div>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </ErpShell>
  );
}
