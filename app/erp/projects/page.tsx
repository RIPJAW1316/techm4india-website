"use client";

import { useState } from "react";
import { BriefcaseBusiness, CalendarDays } from "lucide-react";
import { ErpShell } from "../components/erp-shell";
import {
  Avatar,
  EmptyState,
  formatCurrency,
  formatDate,
  PageHeader,
  Panel,
  SlideOverDrawer,
  StatusBadge,
  ToastMessage,
} from "../components/erp-ui";
import { useProjectsData } from "@/lib/erp/replit-store";
import type { Project } from "@/lib/erp/replit-data";

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [toast, setToast] = useState("");
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
                    <tr
                      key={project.id}
                      data-testid={`row-project-${project.id}`}
                      onClick={() => setSelectedProject(project)}
                      className="group erp-table-clickable cursor-pointer hover:bg-teal-50/40 transition-colors"
                    >
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

        <SlideOverDrawer
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          title={selectedProject?.name ?? "Project Inspector"}
          subtitle={`Client: ${selectedProject?.client ?? ""} · Due: ${selectedProject?.dueDate ? formatDate(selectedProject.dueDate) : ""}`}
          footer={
            <div className="flex items-center justify-between">
              <span className="font-mono-ui text-xs text-slate-500">PRJ-00{selectedProject?.id}</span>
              <button
                type="button"
                onClick={() => {
                  setToast(`Project deliverable ${selectedProject?.name} synchronized.`);
                  setSelectedProject(null);
                }}
                className="rounded-lg bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-teal-700 shadow-xs transition-colors"
              >
                Done
              </button>
            </div>
          }
        >
          {selectedProject && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-white font-bold text-sm shadow-xs">
                  {selectedProject.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedProject.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{selectedProject.client}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <StatusBadge value={selectedProject.status} />
                    <span className="rounded bg-slate-200/70 px-2 py-0.5 font-mono-ui text-[10px] font-semibold text-slate-700">
                      {selectedProject.progress}% delivered
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress & Health Bar */}
              <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono-ui text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Execution Velocity &amp; Completion
                  </span>
                  <span className="font-mono-ui text-sm font-bold text-teal-800">
                    {selectedProject.progress}%
                  </span>
                </div>
                <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-600 to-teal-500 transition-all"
                    style={{ width: `${selectedProject.progress}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>Sprint cycle on schedule</span>
                  <span className="font-mono-ui">Target: {formatDate(selectedProject.dueDate)}</span>
                </div>
              </div>

              {/* Budget & Team Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
                  <span className="font-mono-ui text-[10px] font-semibold uppercase tracking-wider text-slate-400">Committed Budget</span>
                  <div className="mt-1 font-mono-ui text-base font-bold text-slate-900">
                    {formatCurrency(selectedProject.budget)}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
                  <span className="font-mono-ui text-[10px] font-semibold uppercase tracking-wider text-slate-400">Target Milestone</span>
                  <div className="mt-1 font-mono-ui text-sm font-semibold text-slate-900">
                    {formatDate(selectedProject.dueDate)}
                  </div>
                </div>
              </div>

              {/* Core Team Allocation */}
              <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono-ui mb-3">
                  Allocated Engineering Resources ({selectedProject.team.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.team.map((member) => (
                    <div
                      key={member}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-1 text-xs text-slate-800"
                    >
                      <Avatar initials={member} className="h-5 w-5 text-[9px]" />
                      <span className="font-medium font-mono-ui">{member}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestone Actions */}
              <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono-ui mb-3">
                  Project Governance
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setToast(`Milestone report generated for ${selectedProject.name}.`);
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
                  >
                    Milestone Report
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setToast(`SLA sign-off requested from ${selectedProject.client}.`);
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-100/70 transition-colors shadow-xs"
                  >
                    Request Sign-Off
                  </button>
                </div>
              </div>
            </div>
          )}
        </SlideOverDrawer>
        {toast && <ToastMessage message={toast} onDismiss={() => setToast("")} />}
      </div>
    </ErpShell>
  );
}
