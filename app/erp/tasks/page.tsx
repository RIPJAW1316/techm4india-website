"use client";

import { useState } from "react";
import { Calendar, CheckCircle2, Circle, Flag, ListTodo, SlidersHorizontal } from "lucide-react";
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
          eyebrow="Delivery & Operations"
          title="Work Queue"
          description="Operational backlog and milestone execution across engineering, curriculum, and deployment tracks."
          action={
            <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-xs sm:flex">
              <span className="h-2 w-2 rounded-full bg-teal-600 erp-pulse-dot" />
              <span className="font-mono-ui text-[11px] font-semibold uppercase tracking-wider text-slate-700">
                {openCount} tasks in progress
              </span>
            </div>
          }
        />
        <Panel>
          <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/40 p-4 sm:flex-row sm:items-center">
            <div className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-500 sm:w-56 shadow-xs focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-600/10 transition-all">
              <SlidersHorizontal className="h-4 w-4 shrink-0 text-slate-400" />
              <select
                data-testid="select-task-status-filter"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="w-full bg-transparent text-sm text-slate-800 outline-none cursor-pointer"
              >
                <option value="">All statuses</option>
                {statuses.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
            <div className="ml-auto flex items-center gap-1.5 font-mono-ui text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <ListTodo className="h-3.5 w-3.5 text-slate-400" />
              {tasks.length} items in view
            </div>
          </div>
          {tasks.length === 0 ? (
            <EmptyState title="Queue is clear" description="There are no tasks in this status view. Excellent progress." />
          ) : (
            <div className="scrollbar-thin overflow-x-auto">
              <table className="erp-table-modern w-full min-w-[850px] text-left">
                <thead>
                  <tr>
                    <th className="px-5 py-3">Task &amp; Context</th>
                    <th className="px-4 py-3">Current Status</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Assignee</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-5 py-3 text-right">Quick Transition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tasks.map((task) => {
                    const isDone = task.status === "Completed";
                    const isHigh = task.priority.toLowerCase() === "high";
                    const isMedium = task.priority.toLowerCase() === "medium";

                    return (
                      <tr key={task.id} data-testid={`row-task-${task.id}`} className="group">
                        <td className="px-5 py-3.5">
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 ${isDone ? "text-teal-600" : "text-slate-300"}`}>
                              {isDone ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : (
                                <Circle className="h-4 w-4" />
                              )}
                            </div>
                            <div>
                              <div
                                className={`text-sm font-bold transition-colors ${
                                  isDone ? "text-slate-400 line-through" : "text-slate-900 group-hover:text-teal-700"
                                }`}
                              >
                                {task.title}
                              </div>
                              <div className="mt-0.5 text-xs text-slate-500 font-mono-ui">{task.project}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge value={task.status} />
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold ${
                              isHigh
                                ? "border-rose-200 bg-rose-50 text-rose-700"
                                : isMedium
                                ? "border-amber-200 bg-amber-50 text-amber-700"
                                : "border-slate-200 bg-slate-50 text-slate-600"
                            }`}
                          >
                            <Flag className="h-3 w-3" />
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                            <Avatar initials={task.initials} className="h-7 w-7 rounded-lg shadow-xs" />
                            {task.assignee}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-500 font-mono-ui">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-slate-400" />
                            {formatDate(task.dueDate)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <select
                            data-testid={`select-task-status-${task.id}`}
                            value={task.status}
                            onChange={(event) => handleUpdate(task.id, event.target.value)}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 shadow-xs outline-none transition-all focus:border-teal-600 focus:ring-1 focus:ring-teal-600/20 cursor-pointer"
                          >
                            {statuses.map((item) => (
                              <option key={item}>{item}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
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
