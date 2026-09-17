"use client";

import { BriefcaseBusiness, CalendarDays } from "lucide-react";
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

  return (
    <ErpShell>
      <div className="page-enter">
        <PageHeader
          eyebrow="Delivery control"
          title="Projects"
          description="A clear line of sight from client promise to delivery reality."
          action={
            <div className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 sm:flex">
              <BriefcaseBusiness className="h-4 w-4 text-primary" />
              <span className="font-mono-ui text-[11px] uppercase tracking-wider text-muted-foreground">
                {projects.length} active
              </span>
            </div>
          }
        />
        <Panel>
          {projects.length === 0 ? (
            <EmptyState
              title="No active projects"
              description="Delivery work will appear here when a project is brought into the workspace."
            />
          ) : (
            <div className="scrollbar-thin overflow-x-auto">
              <table className="w-full min-w-[840px] text-left">
                <thead className="bg-background/60 font-mono-ui text-[10px] uppercase tracking-[.13em] text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-medium">Project</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Progress</th>
                    <th className="px-4 py-3 font-medium">Team</th>
                    <th className="px-4 py-3 font-medium">Due</th>
                    <th className="px-5 py-3 text-right font-medium">Budget</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/65">
                  {projects.map((project) => (
                    <tr key={project.id} data-testid={`row-project-${project.id}`} className="hover:bg-background/70">
                      <td className="px-5 py-4">
                        <div className="text-sm font-semibold text-foreground">{project.name}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">{project.client}</div>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge value={project.status} />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex min-w-[145px] items-center gap-3">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="font-mono-ui text-[11px] text-muted-foreground">{project.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex -space-x-2">
                          {project.team.slice(0, 4).map((member) => (
                            <Avatar key={member} initials={member} className="h-7 w-7 border-2 border-card text-[9px]" />
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs text-muted-foreground">
                        <CalendarDays className="mr-1 inline h-3.5 w-3.5" />
                        {formatDate(project.dueDate)}
                      </td>
                      <td className="px-5 py-4 text-right font-mono-ui text-xs font-semibold text-foreground">
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
