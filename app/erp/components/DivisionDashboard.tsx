"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api/client";
import type { ApiResponse, EmployeeProfile, Notification, Project, Task, TaskSummary } from "@/lib/api/types";
import { DIVISION_CONFIG, type DivisionSlug } from "@/lib/erp/divisions";
import { useErpAuth } from "./AuthProvider";
import { ErpLoading, ProtectedErp } from "./ProtectedErp";

const statusLabels: Record<Task["status"], string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  BLOCKED: "Blocked",
  REVIEW: "Review",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const priorityLabels: Record<Task["priority"], string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

const statusFilters = [
  { key: "ALL", label: "All" },
  { key: "TODO", label: "To do" },
  { key: "IN_PROGRESS", label: "In progress" },
  { key: "REVIEW", label: "Review" },
  { key: "COMPLETED", label: "Completed" },
] as const;

function formatDate(value: string | null) {
  if (!value) return "No deadline";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}

function relativeDate(value: string) {
  const days = Math.round((Date.now() - new Date(value).getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return formatDate(value);
}

function ErrorNotice({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="erp-error" role="alert"><p>{message}</p><button className="erp-text-button" type="button" onClick={onRetry}>Try again ↗</button></div>;
}

function DashboardContent({ divisionSlug }: { divisionSlug: DivisionSlug }) {
  const config = DIVISION_CONFIG[divisionSlug];
  const router = useRouter();
  const { context, logout, refreshSession } = useErpAuth();
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [summary, setSummary] = useState<TaskSummary | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<(typeof statusFilters)[number]["key"]>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingTask, setUpdatingTask] = useState<string | null>(null);
  const [updatingNotification, setUpdatingNotification] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const loadWork = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileResponse, summaryResponse, tasksResponse, projectsResponse, notificationsResponse] = await Promise.all([
        apiFetch<ApiResponse<EmployeeProfile>>("/employees/me"),
        apiFetch<ApiResponse<TaskSummary>>("/tasks/my/summary"),
        apiFetch<ApiResponse<Task[]>>("/tasks/my?limit=100"),
        apiFetch<ApiResponse<Project[]>>("/projects/my?limit=100"),
        apiFetch<ApiResponse<Notification[]>>("/notifications?limit=50"),
      ]);
      setProfile(profileResponse.data);
      setSummary(summaryResponse.data);
      setTasks(tasksResponse.data);
      setProjects(projectsResponse.data);
      setNotifications(notificationsResponse.data);
    } catch (reason) {
      if (reason instanceof ApiError && reason.status === 401) {
        setError("Your session has expired. Taking you back to sign in.");
        await refreshSession();
      } else if (reason instanceof ApiError && reason.status === 403) {
        setError("You do not have permission to open this ERP workspace.");
      } else if (reason instanceof ApiError && reason.status === 404) {
        setError("Your employee workspace has not been configured yet.");
      } else if (reason instanceof ApiError && reason.status >= 500) {
        setError("The ERP service is temporarily unavailable. Please try again.");
      } else {
        setError("The ERP could not load this workspace. Check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [refreshSession]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadWork(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadWork]);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        window.requestAnimationFrame(() => menuButtonRef.current?.focus());
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  const filteredTasks = useMemo(() => filter === "ALL" ? tasks : tasks.filter((task) => task.status === filter), [filter, tasks]);
  const employee = profile ?? context?.employee;
  const unreadCount = notifications.filter((notification) => !notification.readAt).length;
  const employeeDivisionMatchesRoute = employee?.division?.slug === divisionSlug;
  const workspaceName = employeeDivisionMatchesRoute ? employee?.division?.name ?? config.displayName : config.displayName;
  const departmentName = employeeDivisionMatchesRoute ? employee?.department?.name ?? "Department not assigned" : "Organization-wide access";

  function closeMobileMenu(restoreFocus = false) {
    setMenuOpen(false);
    if (restoreFocus) window.requestAnimationFrame(() => menuButtonRef.current?.focus());
  }

  async function updateTaskStatus(taskId: string, status: Task["status"]) {
    setUpdatingTask(taskId);
    setNotice(null);
    try {
      await apiFetch<ApiResponse<Task>>(`/tasks/${taskId}`, { method: "PATCH", body: JSON.stringify({ status }) });
      await loadWork();
      setNotice("Task status updated.");
    } catch (reason) {
      setError(reason instanceof ApiError && reason.status === 403 ? "You are not permitted to update this task." : "Task status could not be updated.");
    } finally {
      setUpdatingTask(null);
    }
  }

  async function markRead(notificationId: string) {
    setUpdatingNotification(notificationId);
    try {
      const response = await apiFetch<ApiResponse<Notification>>(`/notifications/${notificationId}/read`, { method: "PATCH" });
      setNotifications((items) => items.map((item) => item.id === notificationId ? { ...item, readAt: response.data.readAt } : item));
    } catch {
      setError("That notification could not be updated.");
    } finally {
      setUpdatingNotification(null);
    }
  }

  async function signOut() {
    await logout();
    router.replace("/login");
  }

  if (loading && !profile) return <ErpLoading label={`Loading your ${config.shortName.toLowerCase()} workspace`} />;

  return (
    <div className="erp-app-shell" data-division={divisionSlug}>
      <aside className={`erp-sidebar ${menuOpen ? "is-mobile-open" : ""}`} aria-label={`${config.workspaceLabel} navigation`}>
        <div className="erp-sidebar-head">
          <a className="erp-sidebar-brand" href="#workspace-top" onClick={() => closeMobileMenu()}><span className="erp-mini-mark" aria-hidden="true"><i /><i /><i /><i /></span><span>TECHM4<span>INDIA</span></span></a>
          <button ref={menuButtonRef} className="erp-mobile-menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="erp-workspace-menu" onClick={() => setMenuOpen(true)}>Menu</button>
        </div>
        <div className="erp-sidebar-panel" id="erp-workspace-menu">
          <button ref={closeButtonRef} className="erp-mobile-menu-close" type="button" onClick={() => closeMobileMenu(true)} aria-label="Close workspace menu">Close <span aria-hidden="true">×</span></button>
          <div className="erp-sidebar-division"><span>Division workspace</span><strong>{config.shortName}</strong><small>{departmentName}</small></div>
          <nav className="erp-sidebar-nav">
            <a className="is-active" href="#workspace-top" onClick={() => closeMobileMenu()}>Dashboard</a>
            <a href="#my-tasks" onClick={() => closeMobileMenu()}>My tasks</a>
            <a href="#my-projects" onClick={() => closeMobileMenu()}>Projects</a>
            <a href="#notifications" onClick={() => closeMobileMenu()}>Notifications{unreadCount > 0 && <b>{unreadCount}</b>}</a>
            <a href="#my-profile" onClick={() => closeMobileMenu()}>Profile</a>
          </nav>
          <button className="erp-sidebar-logout" type="button" onClick={() => void signOut()}>Log out <span aria-hidden="true">↗</span></button>
        </div>
      </aside>
      {menuOpen && <button className="erp-mobile-menu-backdrop" type="button" aria-label="Close workspace menu" onClick={() => closeMobileMenu(true)} />}

      <main className="erp-main" id="workspace-top">
        <header className="erp-topbar"><div><span className="erp-topbar-label">{config.workspaceLabel}</span><span className="erp-topbar-path">TechM4India / {departmentName}</span></div><div className="erp-user-chip"><span>{employee ? `${employee.firstName[0]}${employee.lastName[0]}` : "TM"}</span><div><strong>{employee ? `${employee.firstName} ${employee.lastName}` : "Employee"}</strong><small>{employee?.designation ?? "Employee"}</small></div></div></header>
        <div className="erp-content">
          <section className="erp-welcome" aria-labelledby="dashboard-title"><div><p className="erp-kicker">Your work, in view</p><h1 id="dashboard-title">Good afternoon, <em>{employee?.firstName ?? "there"}</em></h1><p>{workspaceName} · {departmentName}</p></div><div className="erp-welcome-code" aria-label="Employee code"><span>Employee code</span><strong>{profile?.employeeCode ?? employee?.employeeCode ?? "—"}</strong></div></section>

          {error && <ErrorNotice message={error} onRetry={() => void loadWork()} />}
          {notice && <p className="erp-success" role="status">{notice}</p>}

          <section className="erp-kpi-grid" aria-label="Work summary">
            <article><span>Total tasks</span><strong>{summary?.total ?? "—"}</strong><small>Assigned to you</small></article>
            <article><span>In progress</span><strong>{summary?.inProgress ?? "—"}</strong><small>Moving forward</small></article>
            <article><span>Due today</span><strong>{summary?.dueToday ?? "—"}</strong><small>Needs attention</small></article>
            <article><span>Completed</span><strong>{summary?.completed ?? "—"}</strong><small>Closed work</small></article>
          </section>

          <section className="erp-section" id="my-tasks" aria-labelledby="tasks-title"><div className="erp-section-heading"><div><p className="erp-kicker">Assigned work</p><h2 id="tasks-title">My tasks</h2></div><span className="erp-section-count">{tasks.length} total</span></div><div className="erp-filter-row" role="tablist" aria-label="Filter tasks">{statusFilters.map((item) => <button key={item.key} className={filter === item.key ? "is-selected" : ""} type="button" role="tab" aria-selected={filter === item.key} onClick={() => setFilter(item.key)}>{item.label}</button>)}</div><div className="erp-task-list">{filteredTasks.length === 0 ? <div className="erp-empty"><strong>No tasks assigned yet.</strong><span>Your next piece of work will appear here.</span></div> : filteredTasks.map((task) => <article className="erp-task-row" key={task.id}><div className="erp-task-marker" data-status={task.status} aria-hidden="true" /><div className="erp-task-main"><div className="erp-task-title-line"><h3>{task.title}</h3><span className={`erp-priority priority-${task.priority.toLowerCase()}`}>{priorityLabels[task.priority]}</span></div><p>{task.project.code} · {task.project.name}</p><span className="erp-task-due">{task.dueDate ? `Due ${formatDate(task.dueDate)}` : "No deadline set"}</span></div><div className="erp-task-control"><label htmlFor={`task-status-${task.id}`}>Status</label><select id={`task-status-${task.id}`} value={task.status} disabled={updatingTask === task.id} onChange={(event) => void updateTaskStatus(task.id, event.target.value as Task["status"])}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div></article>)}</div></section>

          <div className="erp-two-column">
            <section className="erp-section erp-projects-section" id="my-projects" aria-labelledby="projects-title"><div className="erp-section-heading"><div><p className="erp-kicker">Where you contribute</p><h2 id="projects-title">My projects</h2></div><span className="erp-section-count">{projects.length} active</span></div>{projects.length === 0 ? <div className="erp-empty"><strong>You&apos;re not currently assigned to a project.</strong><span>Project work will appear here when you join a team.</span></div> : <div className="erp-project-list">{projects.map((project) => <article className="erp-project-card" key={project.id}><div className="erp-project-top"><span>{project.code}</span><span className={`erp-project-status status-${project.status.toLowerCase()}`}>{project.status.replaceAll("_", " ")}</span></div><h3>{project.name}</h3><p>{project.division.name}</p><div className="erp-progress-line"><span style={{ width: `${project.progress}%` }} /></div><div className="erp-project-meta"><span>{project.progress}% progress</span><span>{project.dueDate ? `Due ${formatDate(project.dueDate)}` : "No deadline"}</span></div></article>)}</div>}</section>

            <section className="erp-section" id="notifications" aria-labelledby="notifications-title"><div className="erp-section-heading"><div><p className="erp-kicker">Keep in step</p><h2 id="notifications-title">Notifications</h2></div>{unreadCount > 0 && <span className="erp-unread-pill">{unreadCount} unread</span>}</div>{notifications.length === 0 ? <div className="erp-empty"><strong>You&apos;re all caught up.</strong><span>New assignments and updates will land here.</span></div> : <div className="erp-notification-list">{notifications.map((notification) => <article className={`erp-notification ${notification.readAt ? "is-read" : ""}`} key={notification.id}><span className="erp-notification-dot" aria-hidden="true" /><div><h3>{notification.title}</h3><p>{notification.body}</p><time dateTime={notification.createdAt}>{relativeDate(notification.createdAt)}</time></div>{!notification.readAt && <button className="erp-text-button" type="button" disabled={updatingNotification === notification.id} onClick={() => void markRead(notification.id)}>{updatingNotification === notification.id ? "Updating…" : "Mark read"}</button>}</article>)}</div>}</section>
          </div>

          <section className="erp-profile-strip" id="my-profile" aria-labelledby="profile-title"><div><p className="erp-kicker">Your identity</p><h2 id="profile-title">Profile summary</h2></div><dl><div><dt>Name</dt><dd>{employee ? `${employee.firstName} ${employee.lastName}` : "—"}</dd></div><div><dt>Company email</dt><dd>{profile?.email ?? context?.user.email ?? "—"}</dd></div><div><dt>Designation</dt><dd>{profile?.designation ?? employee?.designation ?? "—"}</dd></div><div><dt>Department</dt><dd>{employee?.department?.name ?? "—"}</dd></div><div><dt>Joining date</dt><dd>{profile?.joiningDate ? formatDate(profile.joiningDate) : "—"}</dd></div></dl></section>
        </div>
      </main>
    </div>
  );
}

export function DivisionDashboard({ divisionSlug }: { divisionSlug: DivisionSlug }) {
  return <ProtectedErp requiredDivision={divisionSlug}><DashboardContent divisionSlug={divisionSlug} /></ProtectedErp>;
}
