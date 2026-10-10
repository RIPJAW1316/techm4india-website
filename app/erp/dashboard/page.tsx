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
import { AttentionBanner, formatCurrency, PageHeader, Panel, StatusBadge } from "../components/erp-ui";
import { useErpAuth } from "../components/AuthProvider";
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
    <div className="group rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md hover:-translate-y-0.5">
      <div className="mb-4 flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border shadow-xs ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono-ui text-[11px] font-semibold ${
            positive
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
              : "bg-rose-50 text-rose-700 border border-rose-200/80"
          }`}
        >
          {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          {Math.abs(change)}%
        </span>
      </div>
      <div className="font-mono-ui text-[11px] font-semibold uppercase tracking-[.12em] text-slate-500">{label}</div>
      <div className="mt-1.5 font-mono-ui text-[26px] font-bold tracking-tight text-slate-900">{value}</div>
      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
        <span>vs. previous quarter</span>
      </div>
    </div>
  );
}

function RevenueChart({ summary }: { summary: DashboardSummary }) {
  const max = Math.max(...summary.revenueByMonth.map((item) => item.value), 1);
  return (
    <Panel
      title="Revenue Trajectory"
      action={<span className="font-mono-ui text-[10px] font-semibold uppercase tracking-wider text-slate-400">Past 6 Months</span>}
      className="min-w-0"
    >
      <div className="p-6">
        <div className="flex h-[200px] items-end gap-3 sm:gap-5">
          {summary.revenueByMonth.map((item, index) => (
            <div key={item.label} className="group flex h-full flex-1 flex-col justify-end gap-2">
              <div className="relative flex flex-1 items-end justify-center">
                <div className="absolute bottom-[calc(100%+8px)] hidden rounded-md bg-slate-900 px-2.5 py-1 font-mono-ui text-[11px] font-semibold text-white group-hover:block z-10 shadow-lg">
                  {formatCurrency(item.value)}
                </div>
                <div
                  className="w-full max-w-[44px] rounded-t-lg bg-gradient-to-t from-teal-600 to-teal-500 opacity-85 transition-all group-hover:opacity-100 shadow-xs"
                  style={{ height: `${Math.max(10, (item.value / max) * 100)}%`, animationDelay: `${index * 60}ms` }}
                />
              </div>
              <span className="text-center font-mono-ui text-[11px] font-medium text-slate-500">{item.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-teal-600 erp-pulse-dot" />
            <span>Consolidated program invoicing across institutional contracts</span>
          </div>
          <span className="font-mono-ui font-semibold text-slate-700">FY25 Certified</span>
        </div>
      </div>
    </Panel>
  );
}

function PipelineChart({ summary }: { summary: DashboardSummary }) {
  const max = Math.max(...summary.pipelineByStage.map((item) => item.value), 1);
  return (
    <Panel
      title="Pipeline by Stage"
      action={
        <Link href="/erp/leads" data-testid="link-view-pipeline" className="text-xs font-semibold text-teal-700 hover:text-teal-800 hover:underline">
          Open CRM Pipeline ↗
        </Link>
      }
    >
      <div className="space-y-4.5 p-6">
        {summary.pipelineByStage.map((item, index) => (
          <div key={item.label}>
            <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-slate-800">{item.label}</span>
              <span className="font-mono-ui text-[11px] text-slate-500">
                <strong className="text-slate-900">{item.count}</strong> leads · {formatCurrency(item.value)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all ${
                  index === 0 ? "bg-teal-600" : index === 1 ? "bg-sky-600" : index === 2 ? "bg-amber-500" : "bg-emerald-600"
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
      title="Live Operations Feed"
      action={<span className="font-mono-ui text-[10px] font-semibold uppercase tracking-wider text-slate-400">Real-Time Audit</span>}
    >
      <div className="divide-y divide-slate-100">
        {activities.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">No recent activity.</div>
        ) : (
          activities.slice(0, 6).map((activity) => (
            <div key={activity.id} className="flex gap-3.5 px-6 py-4 hover:bg-slate-50/70 transition-colors">
              <div
                className="mt-1.5 h-2 w-2 shrink-0 rounded-full erp-pulse-dot"
                style={{ backgroundColor: activity.accent || "#0d9488" }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">{activity.title}</p>
                  <span className="font-mono-ui text-[10px] text-slate-400">{activity.timestamp}</span>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{activity.description}</p>
                <div className="mt-2 flex items-center gap-2 font-mono-ui text-[10px] font-semibold uppercase tracking-wider text-teal-700">
                  <span>{activity.actor}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500">{activity.type}</span>
                </div>
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
  const { context } = useErpAuth();

  const employeeName = context?.employee
    ? context.employee.firstName
    : context?.user?.email
    ? context.user.email.split("@")[0].replace(".", " ")
    : "Operator";

  return (
    <ErpShell>
      <div className="page-enter">
        <PageHeader
          eyebrow="Executive View / IST Operational Mode"
          title={`Good day, ${employeeName}.`}
          description="Consolidated company overview, division KPIs, and live pipeline status."
          action={
            <div className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-right sm:block shadow-xs">
              <div className="font-mono-ui text-[10px] font-semibold uppercase tracking-wider text-teal-700">Live Workspace</div>
              <div className="mt-0.5 text-xs font-semibold text-slate-800">FY25-26 Operations</div>
            </div>
          }
        />

        <AttentionBanner
          items={[
            { label: "Open Requisitions", count: summary.openPositions },
            { label: "Active Deals", count: summary.pipelineByStage.reduce((acc, curr) => acc + curr.count, 0) },
            { label: "Partner Institutions", count: summary.partnerInstitutions },
          ]}
        />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 page-enter-delay-1">
          <MetricCard
            label="Revenue"
            value={formatCurrency(summary.revenue)}
            change={summary.revenueChange}
            icon={IndianRupee}
            accent="bg-teal-50 text-teal-700 border-teal-100"
          />
          <MetricCard
            label="Active learners"
            value={summary.activeLearners.toLocaleString("en-IN")}
            change={summary.learnerChange}
            icon={UsersRound}
            accent="bg-sky-50 text-sky-700 border-sky-100"
          />
          <MetricCard
            label="Partner institutions"
            value={summary.partnerInstitutions.toLocaleString("en-IN")}
            change={summary.institutionChange}
            icon={Building2}
            accent="bg-amber-50 text-amber-700 border-amber-100"
          />
          <MetricCard
            label="Pipeline value"
            value={formatCurrency(summary.pipelineValue)}
            change={summary.pipelineChange}
            icon={BriefcaseBusiness}
            accent="bg-emerald-50 text-emerald-700 border-emerald-100"
          />
        </div>
        <div className="mt-6 grid gap-5 lg:grid-cols-[1.35fr_1fr] page-enter-delay-2">
          <RevenueChart summary={summary} />
          <PipelineChart summary={summary} />
        </div>
        <div className="mt-6 grid gap-5 lg:grid-cols-[1.35fr_1fr] page-enter-delay-3">
          <ActivityFeed activities={activities} />
          <Panel
            title="Delivery Signals &amp; Capacity"
            action={
              <Link href="/erp/tasks" data-testid="link-view-work-queue" className="text-xs font-semibold text-teal-700 hover:text-teal-800 hover:underline">
                View Task Queue ↗
              </Link>
            }
          >
            <div className="p-6">
              <div className="mb-5 flex items-end justify-between">
                <div>
                  <div className="font-mono-ui text-[10px] font-semibold uppercase tracking-wider text-slate-500">Open Requisitions</div>
                  <div className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{summary.openPositions}</div>
                </div>
                <StatusBadge value="On track" />
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-teal-600 to-emerald-500" />
              </div>
              <div className="mt-2 flex justify-between text-[11px] font-medium text-slate-500">
                <span>Active delivery bandwidth</span>
                <span className="font-mono-ui font-bold text-slate-900">78%</span>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3.5">
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 shadow-xs">
                  <ActivityIcon className="mb-2.5 h-4 w-4 text-teal-600" />
                  <div className="font-mono-ui text-[10px] font-semibold uppercase tracking-wider text-slate-500">Live Programs</div>
                  <div className="mt-1 text-lg font-bold text-slate-900">{summary.partnerInstitutions + 4}</div>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 shadow-xs">
                  <IndianRupee className="mb-2.5 h-4 w-4 text-amber-600" />
                  <div className="font-mono-ui text-[10px] font-semibold uppercase tracking-wider text-slate-500">Quarterly Lift</div>
                  <div className="mt-1 text-lg font-bold text-slate-900">+{summary.revenueChange}%</div>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </ErpShell>
  );
}
