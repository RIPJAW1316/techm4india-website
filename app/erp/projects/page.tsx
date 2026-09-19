"use client";

import { BriefcaseBusiness, CalendarDays, CheckCircle2, Clock } from "lucide-react";
import { ErpShell } from "../components/erp-shell";
import {
  Avatar,
  EmptyState,
  formatCurrency,
  formatDate,
  PageHeader,
  Panel,
  StatusBadge,
} from "../components/erp-ui";
import { useProjectsData } from "@/lib/erp/replit-store";

export default function Projects() {
  const { projects } = useProjectsData();

  const totalBudget = projects.reduce((acc, p) => acc + (p.budget || 0), 0);
  const avgProgress = projects.length > 0
    ? Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / projects.length)
    : 0;

  return (
    <ErpShell>
      <div className="page-enter">
        <PageHeader
          eyebrow="Delivery &amp; Execution"
          title="Projects Portfolio"
          description="Operational visibility across client commitments, active engineering deliverables, and milestone progress."
          action={
            <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-xs sm:flex">
              <BriefcaseBusiness className="h-4 w-4 text-teal-600" />
              <span className="font-mono-ui text-[11px] font-semibold uppercase tracking-wider text-slate-700">
                {projects.length} active projects
              </span>
            </div>
          }
        />

        {/* Portfolio Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="font-mono-ui text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Total Contracted Budget
            </div>
            <div className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              {formatCurrency(totalBudget)}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="font-mono-ui text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Portfolio Average Progress
            </div>
            <div className="mt-1 text-2xl font-bold tracking-tight text-teal-700">
              {avgProgress}% Completed
            </div>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="font-mono-ui text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Delivery Health
            </div>
            <div className="mt-1 text-2xl font-bold tracking-tight text-emerald-600">
              On Schedule
            </div>
          </div>
        </div>

        <Panel>
          {projects.length === 0 ? (
            <EmptyState
              title="No active projects"
              description="Delivery work will appear here when a project is brought into the workspace."
            />
          ) : (
            <div className="scrollbar-thin overflow-x-auto">
              <table className="erp-table-modern w-full min-w-[840px] text-left">
                <thead>
                  <tr>
                    <th className="px-5 py-3">Project &amp; Client</th>
                    <th className="px-4 py-3">Execution Status</th>
                    <th className="px-4 py-3">Milestone Progress</th>
                    <th className="px-4 py-3">Core Team</th>
                    <th className="px-4 py-3">Target Date</th>
                    <th className="px-5 py-3 text-right">Committed Budget</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {projects.map((project) => (
                    <tr key={project.id} data-testid={`row-project-${project.id}`} className="group">
                      <td className="px-5 py-3.5">
                        <div className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                          {project.name}
                        </div>
                        <div className="mt-0.5 text-xs text-slate-500">{project.client}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge value={project.status} />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex min-w-[150px] items-center gap-3">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-teal-600 to-teal-500 transition-all"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="font-mono-ui text-xs font-semibold text-slate-700">
                            {project.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex -space-x-1.5">
                          {project.team.slice(0, 4).map((member) => (
                            <Avatar
                              key={member}
                              initials={member}
                              className="h-7 w-7 border-2 border-white text-[9px] shadow-xs"
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-500 font-mono-ui">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                          {formatDate(project.dueDate)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono-ui text-xs font-bold text-slate-900">
                        {formatCurrency(project.budget)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </ErpShell>
  );
}
