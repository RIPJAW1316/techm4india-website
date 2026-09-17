"use client";

import { useState } from "react";
import { Check, Circle, Flag, SlidersHorizontal } from "lucide-react";
import { ErpShell } from "../components/erp-shell";
import {
  Avatar,
  EmptyState,
  formatDate,
  PageHeader,
  Panel,
  StatusBadge,
  ToastMessage,
} from "../components/erp-ui";
import { useTasksData } from "@/lib/erp/replit-store";

const statuses = ["Todo", "In progress", "Review", "Completed"];

export default function Tasks() {
  const [status, setStatus] = useState("");
  const [toast, setToast] = useState("");

  const { tasks, allTasks, updateTaskStatus } = useTasksData({
    status: status || undefined,
  });

  const handleUpdate = (id: number, nextStatus: string) => {
    updateTaskStatus(id, nextStatus);
    setToast("Task status updated.");
  };

  const openCount = allTasks.filter((task) => task.status !== "Completed").length;

  return (
    <ErpShell>
      <div className="page-enter">
        <PageHeader
          eyebrow="Delivery operations"
          title="Work queue"
          description="Move the important work forward. Status changes sync across the operating view."
          action={
            <div className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 sm:flex">
              <span className="h-2 w-2 rounded-full bg-accent" />
              <span className="font-mono-ui text-[11px] uppercase tracking-wider text-muted-foreground">
                {openCount} open tasks
              </span>
            </div>
          }
        />
        <Panel>
          <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
            <div className="flex h-10 items-center gap-2 rounded-lg border border-input bg-card px-3 text-sm text-muted-foreground sm:w-52">
              <SlidersHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />
              <select
                data-testid="select-task-status-filter"
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
            <div className="font-mono-ui text-[10px] uppercase tracking-wider text-muted-foreground">
              {tasks.length} items in view
            </div>
          </div>
          {tasks.length === 0 ? (
            <EmptyState title="Queue is clear" description="There are no tasks in this status view. Nice work." />
          ) : (
            <div className="scrollbar-thin overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-background/60 font-mono-ui text-[10px] uppercase tracking-[.13em] text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-medium">Task</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Priority</th>
                    <th className="px-4 py-3 font-medium">Assignee</th>
                    <th className="px-4 py-3 font-medium">Due</th>
                    <th className="px-5 py-3 text-right font-medium">Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/65">
                  {tasks.map((task) => (
                    <tr key={task.id} data-testid={`row-task-${task.id}`} className="hover:bg-background/70">
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 ${task.status === "Completed" ? "text-primary" : "text-muted-foreground"}`}>
                            {task.status === "Completed" ? <Check className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                          </div>
                          <div>
                            <div
                              className={`text-sm font-semibold ${
                                task.status === "Completed" ? "text-muted-foreground line-through" : "text-foreground"
                              }`}
                            >
                              {task.title}
                            </div>
                            <div className="mt-0.5 text-xs text-muted-foreground">{task.project}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge value={task.status} />
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium ${
                            task.priority.toLowerCase() === "high" ? "text-destructive" : "text-muted-foreground"
                          }`}
                        >
                          <Flag className="h-3.5 w-3.5" />
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Avatar initials={task.initials} className="h-7 w-7" />
                          {task.assignee}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs text-muted-foreground">{formatDate(task.dueDate)}</td>
                      <td className="px-5 py-4 text-right">
                        <select
                          data-testid={`select-task-status-${task.id}`}
                          value={task.status}
                          onChange={(event) => handleUpdate(task.id, event.target.value)}
                          className="rounded-md border border-input bg-card px-2 py-1.5 text-xs font-medium outline-none focus:border-primary cursor-pointer"
                        >
                          {statuses.map((item) => (
                            <option key={item}>{item}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
        {toast && <ToastMessage message={toast} onDismiss={() => setToast("")} />}
      </div>
    </ErpShell>
  );
}
