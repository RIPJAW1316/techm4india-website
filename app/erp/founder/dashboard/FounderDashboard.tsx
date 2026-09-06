"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";

import { apiFetchV2, ApiError } from "@/lib/api/client";
import type {
  ApiResponse,
  ExecutiveEmployee,
  ExecutiveProject,
  ExecutiveSummary,
  ExecutiveTask,
  ExecutiveWorkDetail,
} from "@/lib/api/types";
import { useErpAuth } from "../../components/AuthProvider";
import { ErpLoading, ProtectedErp } from "../../components/ProtectedErp";

const statusLabels: Record<ExecutiveTask["status"], string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  BLOCKED: "Blocked",
  REVIEW: "Review",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};
const priorityLabels: Record<ExecutiveTask["priority"], string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

type TaskForm = {
  employeeId: string;
  projectId: string;
  title: string;
  description: string;
  priority: ExecutiveTask["priority"];
  dueDate: string;
};
type EditForm = {
  title: string;
  description: string;
  assigneeEmployeeId: string;
  priority: ExecutiveTask["priority"];
  status: ExecutiveTask["status"];
  dueDate: string;
};
type Modal =
  | { kind: "assign"; employeeId: string }
  | { kind: "edit"; task: ExecutiveTask }
  | { kind: "cancel"; task: ExecutiveTask }
  | null;

function formatDate(value: string | null) {
  if (!value) return "No deadline";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function ErrorNotice({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="erp-error" role="alert">
      <p>{message}</p>
      <button className="erp-text-button" type="button" onClick={onRetry}>
        Try again ↗
      </button>
    </div>
  );
}

function TaskRow({
  task,
  onEdit,
  onCancel,
}: {
  task: ExecutiveTask;
  onEdit: () => void;
  onCancel: () => void;
}) {
  return (
    <article className="founder-task-row">
      <div>
        <div className="founder-task-title">
          <strong>{task.title}</strong>
          <span
            className={`erp-priority priority-${task.priority.toLowerCase()}`}
          >
            {priorityLabels[task.priority]}
          </span>
        </div>
        <p>
          {task.project.code} · {task.project.name}
        </p>
        <span>
          {statusLabels[task.status]} ·{" "}
          {task.dueDate ? `Due ${formatDate(task.dueDate)}` : "No deadline"}
          {task.completedAt
            ? ` · Completed ${formatDate(task.completedAt)}`
            : ""}
        </span>
      </div>
      <div className="founder-task-actions">
        <button className="erp-text-button" type="button" onClick={onEdit}>
          Edit
        </button>
        {task.status !== "CANCELLED" && (
          <button
            className="erp-text-button founder-danger-button"
            type="button"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </article>
  );
}

function FounderDashboardContent() {
  const { context, logout } = useErpAuth();
  const router = useRouter();
  const [summary, setSummary] = useState<ExecutiveSummary | null>(null);
  const [employees, setEmployees] = useState<ExecutiveEmployee[]>([]);
  const [projects, setProjects] = useState<ExecutiveProject[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null,
  );
  const [detail, setDetail] = useState<ExecutiveWorkDetail | null>(null);
  const [search, setSearch] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("ALL");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [busy, setBusy] = useState(false);
  const [taskForm, setTaskForm] = useState<TaskForm>({
    employeeId: "",
    projectId: "",
    title: "",
    description: "",
    priority: "MEDIUM",
    dueDate: "",
  });
  const [editForm, setEditForm] = useState<EditForm>({
    title: "",
    description: "",
    assigneeEmployeeId: "",
    priority: "MEDIUM",
    status: "TODO",
    dueDate: "",
  });

  const loadDetail = useCallback(async (employeeId: string | null) => {
    if (!employeeId) {
      setDetail(null);
      return;
    }
    setDetailLoading(true);
    try {
      const response = await apiFetchV2<ApiResponse<ExecutiveWorkDetail>>(
        `/executive/employees/${employeeId}/work`,
      );
      setDetail(response.data);
    } catch (reason) {
      setError(
        reason instanceof ApiError && reason.status === 403
          ? "Founder access to this work detail was denied."
          : "Employee work detail could not be loaded.",
      );
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const loadAll = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      setError(null);
      try {
        const [summaryResponse, employeesResponse, projectsResponse] =
          await Promise.all([
            apiFetchV2<ApiResponse<ExecutiveSummary>>(
              "/executive/workforce/summary",
            ),
            apiFetchV2<ApiResponse<ExecutiveEmployee[]>>(
              "/executive/employees?limit=100",
            ),
            apiFetchV2<ApiResponse<ExecutiveProject[]>>("/executive/projects"),
          ]);
        setSummary(summaryResponse.data);
        setEmployees(employeesResponse.data);
        setProjects(projectsResponse.data);
        if (selectedEmployeeId) await loadDetail(selectedEmployeeId);
      } catch (reason) {
        if (reason instanceof ApiError && reason.status === 401) {
          setError("Your session has expired. Taking you back to sign in.");
        } else if (reason instanceof ApiError && reason.status === 403) {
          setError("This workspace requires Founder / CEO authorization.");
        } else {
          setError(
            "The executive control centre could not load. Check the ERP connection and try again.",
          );
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [loadDetail, selectedEmployeeId],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAll();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadAll]);
  useEffect(() => {
    const interval = window.setInterval(() => {
      void loadAll(true);
    }, 12_000);
    return () => window.clearInterval(interval);
  }, [loadAll]);

  const divisions = useMemo(
    () =>
      Array.from(
        new Map(
          employees.map((employee) => [
            employee.division.id,
            employee.division,
          ]),
        ).values(),
      ),
    [employees],
  );
  const departments = useMemo(
    () =>
      Array.from(
        new Map(
          employees
            .filter(
              (employee) =>
                divisionFilter === "ALL" ||
                employee.division.id === divisionFilter,
            )
            .flatMap((employee) =>
              employee.department ? [employee.department] : [],
            )
            .map((department) => [department.id, department]),
        ).values(),
      ),
    [employees, divisionFilter],
  );
  const visibleEmployees = useMemo(
    () =>
      employees.filter((employee) => {
        const haystack =
          `${employee.name} ${employee.employeeCode} ${employee.designation ?? ""}`.toLowerCase();
        return (
          (!search.trim() || haystack.includes(search.trim().toLowerCase())) &&
          (divisionFilter === "ALL" ||
            employee.division.id === divisionFilter) &&
          (departmentFilter === "ALL" ||
            employee.department?.id === departmentFilter)
        );
      }),
    [employees, search, divisionFilter, departmentFilter],
  );

  function openAssign(employeeId = "") {
    setTaskForm({
      employeeId,
      projectId: projects[0]?.id ?? "",
      title: "",
      description: "",
      priority: "MEDIUM",
      dueDate: "",
    });
    setModal({ kind: "assign", employeeId });
  }

  function openEdit(task: ExecutiveTask) {
    setEditForm({
      title: task.title,
      description: task.description ?? "",
      assigneeEmployeeId: task.assignee?.id ?? "",
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
    });
    setModal({ kind: "edit", task });
  }

  async function refreshAfterMutation(message: string) {
    setModal(null);
    setNotice(message);
    await loadAll(true);
  }

  async function submitAssign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!taskForm.employeeId || !taskForm.projectId || !taskForm.title.trim())
      return;
    setBusy(true);
    setError(null);
    try {
      await apiFetchV2(`/executive/employees/${taskForm.employeeId}/tasks`, {
        method: "POST",
        body: JSON.stringify({
          projectId: taskForm.projectId,
          title: taskForm.title.trim(),
          description: taskForm.description.trim() || undefined,
          priority: taskForm.priority,
          dueDate: taskForm.dueDate
            ? new Date(`${taskForm.dueDate}T00:00:00.000Z`).toISOString()
            : undefined,
        }),
      });
      setSelectedEmployeeId(taskForm.employeeId);
      await refreshAfterMutation(
        "Task assigned. The employee has been notified.",
      );
      await loadDetail(taskForm.employeeId);
    } catch (reason) {
      setError(
        reason instanceof ApiError
          ? reason.message
          : "The task could not be assigned.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function submitEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!modal || modal.kind !== "edit") return;
    setBusy(true);
    setError(null);
    try {
      await apiFetchV2(`/executive/tasks/${modal.task.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: editForm.title.trim(),
          description: editForm.description.trim() || undefined,
          assigneeEmployeeId: editForm.assigneeEmployeeId || undefined,
          priority: editForm.priority,
          status: editForm.status,
          dueDate: editForm.dueDate
            ? new Date(`${editForm.dueDate}T00:00:00.000Z`).toISOString()
            : undefined,
        }),
      });
      await refreshAfterMutation("Task updated. Workforce data is refreshing.");
    } catch (reason) {
      setError(
        reason instanceof ApiError
          ? reason.message
          : "The task could not be updated.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function cancelTask() {
    if (!modal || modal.kind !== "cancel") return;
    setBusy(true);
    setError(null);
    try {
      await apiFetchV2(`/executive/tasks/${modal.task.id}/cancel`, {
        method: "POST",
      });
      await refreshAfterMutation(
        "Task cancelled. Its history has been preserved.",
      );
    } catch (reason) {
      setError(
        reason instanceof ApiError
          ? reason.message
          : "The task could not be cancelled.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await logout();
    router.replace("/login");
  }

  if (loading && !summary)
    return <ErpLoading label="Loading Founder Control Centre" />;
  const founderName = context?.employee?.firstName ?? "Founder";
  const employeeForTask = employees.find(
    (employee) => employee.id === taskForm.employeeId,
  );

  return (
    <div className="erp-app-shell founder-shell">
      <aside
        className="erp-sidebar founder-sidebar"
        aria-label="Founder workspace navigation"
      >
        <div className="erp-sidebar-head">
          <a className="erp-sidebar-brand" href="#founder-top">
            <span className="erp-mini-mark" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
            <span>
              TECHM4<span>INDIA</span>
            </span>
          </a>
        </div>
        <div className="erp-sidebar-panel">
          <div className="erp-sidebar-division">
            <span>Executive workspace</span>
            <strong>Founder / CEO</strong>
            <small>Organization-wide view</small>
          </div>
          <nav className="erp-sidebar-nav">
            <a className="is-active" href="#founder-top">
              Control centre
            </a>
            <a href="#workforce">Workforce</a>
            <a href="#work-detail">Work detail</a>
            <a href="/erp/founder/employees">Employees ↗</a>
            <a href="/erp/founder/organization">Organization ↗</a>
            <a href="/erp/founder/attendance">Attendance ↗</a>
            <a href="/erp/founder/leave">Leave ↗</a>
            <a href="/erp/founder/crm">CRM ↗</a>
            <a href="/erp/founder/institutions">Institutions ↗</a>
          </nav>
          <button
            className="erp-sidebar-logout"
            type="button"
            onClick={() => void signOut()}
          >
            Log out <span aria-hidden="true">↗</span>
          </button>
        </div>
      </aside>
      <main className="erp-main" id="founder-top">
        <header className="erp-topbar">
          <div>
            <span className="erp-topbar-label">Founder Control Centre</span>
            <span className="erp-topbar-path">
              TechM4India Innovations Pvt. Ltd. / Operations
            </span>
          </div>
          <div className="erp-user-chip">
            <span>
              {context?.employee
                ? `${context.employee.firstName[0]}${context.employee.lastName[0]}`
                : "FC"}
            </span>
            <div>
              <strong>
                {context?.employee
                  ? `${context.employee.firstName} ${context.employee.lastName}`
                  : founderName}
              </strong>
              <small>Founder / CEO</small>
            </div>
          </div>
        </header>
        <div className="erp-content founder-content">
          <section className="founder-welcome">
            <div>
              <p className="erp-kicker">Operations, in view</p>
              <h1>
                Founder Control <em>Centre</em>
              </h1>
              <p>
                One operating picture across people, divisions and the work
                moving TechM4India forward.
              </p>
            </div>
            <button
              className="erp-button erp-button-primary founder-assign-top"
              type="button"
              onClick={() => openAssign()}
            >
              Assign task <span aria-hidden="true">↗</span>
            </button>
          </section>
          {error && (
            <ErrorNotice message={error} onRetry={() => void loadAll()} />
          )}
          {notice && (
            <p className="erp-success" role="status">
              {notice}
            </p>
          )}
          <section
            className="erp-kpi-grid founder-kpi-grid"
            aria-label="Executive summary"
          >
            <article>
              <span>Employees</span>
              <strong>{summary?.employeesActive ?? "—"}</strong>
              <small>{summary?.employeesTotal ?? 0} total records</small>
            </article>
            <article>
              <span>Active tasks</span>
              <strong>{summary?.activeTasks ?? "—"}</strong>
              <small>Across all divisions</small>
            </article>
            <article>
              <span>Completed</span>
              <strong>{summary?.completedTasks ?? "—"}</strong>
              <small>Recorded work</small>
            </article>
            <article>
              <span>Overdue</span>
              <strong>{summary?.overdueTasks ?? "—"}</strong>
              <small>Needs attention</small>
            </article>
          </section>
          <section
            className="founder-workforce-section"
            id="workforce"
            aria-labelledby="workforce-title"
          >
            <div className="erp-section-heading">
              <div>
                <p className="erp-kicker">People and progress</p>
                <h2 id="workforce-title">Workforce overview</h2>
              </div>
              <span className="erp-section-count">
                Updated every 12 seconds
              </span>
            </div>
            <div className="founder-filters">
              <label>
                <span>Search</span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Name, code or designation"
                />
              </label>
              <label>
                <span>Division</span>
                <select
                  value={divisionFilter}
                  onChange={(event) => {
                    setDivisionFilter(event.target.value);
                    setDepartmentFilter("ALL");
                  }}
                >
                  <option value="ALL">All divisions</option>
                  {divisions.map((division) => (
                    <option key={division.id} value={division.id}>
                      {division.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Department</span>
                <select
                  value={departmentFilter}
                  onChange={(event) => setDepartmentFilter(event.target.value)}
                >
                  <option value="ALL">All departments</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="founder-workforce-table-wrap">
              <table className="founder-workforce-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Division</th>
                    <th>Department</th>
                    <th>Designation / status</th>
                    <th>Active</th>
                    <th>Completed</th>
                    <th>Overdue</th>
                    <th>
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={8}>
                        <div className="erp-empty">
                          <strong>No employees match these filters.</strong>
                          <span>Try a different search or division.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    visibleEmployees.map((employee) => (
                      <tr key={employee.id}>
                        <td data-label="Employee">
                          <strong>{employee.name}</strong>
                          <small>{employee.employeeCode}</small>
                        </td>
                        <td data-label="Division">{employee.division.name}</td>
                        <td data-label="Department">
                          {employee.department?.name ?? "Not assigned"}
                        </td>
                        <td data-label="Designation / status">
                          <span>{employee.designation ?? "Not set"}</span>
                          <small className="founder-status">
                            {employee.status.replaceAll("_", " ")}
                          </small>
                        </td>
                        <td data-label="Active">
                          <strong>{employee.workSummary.active}</strong>
                        </td>
                        <td data-label="Completed">
                          <strong>{employee.workSummary.completed}</strong>
                        </td>
                        <td data-label="Overdue">
                          <strong
                            className={
                              employee.workSummary.overdue > 0
                                ? "founder-overdue"
                                : ""
                            }
                          >
                            {employee.workSummary.overdue}
                          </strong>
                        </td>
                        <td data-label="Actions">
                          <div className="founder-row-actions">
                            <button
                              className="erp-text-button"
                              type="button"
                              onClick={() => {
                                setSelectedEmployeeId(employee.id);
                                void loadDetail(employee.id);
                              }}
                            >
                              View work
                            </button>
                            <button
                              className="erp-text-button"
                              type="button"
                              onClick={() => openAssign(employee.id)}
                            >
                              Assign
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
          {selectedEmployeeId && (
            <section
              className="founder-detail-section"
              id="work-detail"
              aria-labelledby="work-detail-title"
            >
              <div className="erp-section-heading">
                <div>
                  <p className="erp-kicker">Employee work detail</p>
                  <h2 id="work-detail-title">
                    {detail?.employee.name ?? "Loading work"}
                  </h2>
                </div>
                <button
                  className="erp-text-button"
                  type="button"
                  onClick={() => {
                    setSelectedEmployeeId(null);
                    setDetail(null);
                  }}
                >
                  Close detail ×
                </button>
              </div>
              {detailLoading || !detail ? (
                <ErpLoading label="Loading employee work" />
              ) : (
                <>
                  <div className="founder-identity-strip">
                    <div>
                      <span>Employee code</span>
                      <strong>{detail.employee.employeeCode}</strong>
                    </div>
                    <div>
                      <span>Division</span>
                      <strong>{detail.employee.division.name}</strong>
                    </div>
                    <div>
                      <span>Department</span>
                      <strong>
                        {detail.employee.department?.name ?? "Not assigned"}
                      </strong>
                    </div>
                    <div>
                      <span>Designation</span>
                      <strong>
                        {detail.employee.designation ?? "Not set"}
                      </strong>
                    </div>
                  </div>
                  <div className="founder-detail-kpis">
                    <span>
                      <strong>{detail.taskSummary.active}</strong> active
                    </span>
                    <span>
                      <strong>{detail.taskSummary.completed}</strong> completed
                    </span>
                    <span>
                      <strong>{detail.taskSummary.overdue}</strong> overdue
                    </span>
                    <span>
                      <strong>{detail.projects.length}</strong> projects
                    </span>
                  </div>
                  <div className="founder-detail-columns">
                    <div>
                      <h3>Active tasks</h3>
                      {detail.activeTasks.length === 0 ? (
                        <div className="erp-empty">
                          <strong>No active tasks.</strong>
                          <span>Assign work from the control centre.</span>
                        </div>
                      ) : (
                        detail.activeTasks.map((task) => (
                          <TaskRow
                            key={task.id}
                            task={task}
                            onEdit={() => openEdit(task)}
                            onCancel={() => setModal({ kind: "cancel", task })}
                          />
                        ))
                      )}
                    </div>
                    <div>
                      <h3>Completed work</h3>
                      {detail.completedTasks.length === 0 ? (
                        <div className="erp-empty">
                          <strong>No completed work recorded.</strong>
                          <span>Completed tasks will appear here.</span>
                        </div>
                      ) : (
                        detail.completedTasks.map((task) => (
                          <TaskRow
                            key={task.id}
                            task={task}
                            onEdit={() => openEdit(task)}
                            onCancel={() => setModal({ kind: "cancel", task })}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </section>
          )}
        </div>
      </main>
      {modal?.kind === "assign" && (
        <div className="founder-dialog-backdrop" role="presentation">
          <section
            className="founder-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="assign-dialog-title"
          >
            <div className="founder-dialog-head">
              <div>
                <p className="erp-kicker">New work</p>
                <h2 id="assign-dialog-title">Assign a task</h2>
              </div>
              <button
                className="erp-text-button"
                type="button"
                onClick={() => setModal(null)}
                aria-label="Close assign task dialog"
              >
                Close ×
              </button>
            </div>
            <form
              onSubmit={(event) => void submitAssign(event)}
              className="founder-form"
            >
              <label>
                <span>Employee</span>
                <select
                  required
                  value={taskForm.employeeId}
                  onChange={(event) =>
                    setTaskForm((value) => ({
                      ...value,
                      employeeId: event.target.value,
                    }))
                  }
                >
                  <option value="">Choose employee</option>
                  {employees
                    .filter((employee) => employee.status === "ACTIVE")
                    .map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name} · {employee.division.name}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                <span>Project</span>
                <select
                  required
                  value={taskForm.projectId}
                  onChange={(event) =>
                    setTaskForm((value) => ({
                      ...value,
                      projectId: event.target.value,
                    }))
                  }
                >
                  <option value="">Choose project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.code} · {project.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Title</span>
                <input
                  required
                  maxLength={200}
                  value={taskForm.title}
                  onChange={(event) =>
                    setTaskForm((value) => ({
                      ...value,
                      title: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                <span>Description</span>
                <textarea
                  maxLength={5000}
                  rows={3}
                  value={taskForm.description}
                  onChange={(event) =>
                    setTaskForm((value) => ({
                      ...value,
                      description: event.target.value,
                    }))
                  }
                />
              </label>
              <div className="founder-form-grid">
                <label>
                  <span>Priority</span>
                  <select
                    value={taskForm.priority}
                    onChange={(event) =>
                      setTaskForm((value) => ({
                        ...value,
                        priority: event.target.value as TaskForm["priority"],
                      }))
                    }
                  >
                    {Object.entries(priorityLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Due date</span>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(event) =>
                      setTaskForm((value) => ({
                        ...value,
                        dueDate: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>
              {employeeForTask && (
                <p className="founder-form-note">
                  This task will be assigned to {employeeForTask.name} and a
                  notification will be created.
                </p>
              )}
              <div className="founder-dialog-actions">
                <button
                  className="erp-text-button"
                  type="button"
                  onClick={() => setModal(null)}
                >
                  Cancel
                </button>
                <button
                  className="erp-button erp-button-primary"
                  type="submit"
                  disabled={busy || projects.length === 0}
                >
                  {busy ? "Assigning…" : "Assign task ↗"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
      {modal?.kind === "edit" && (
        <div className="founder-dialog-backdrop" role="presentation">
          <section
            className="founder-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-dialog-title"
          >
            <div className="founder-dialog-head">
              <div>
                <p className="erp-kicker">Task controls</p>
                <h2 id="edit-dialog-title">Edit task</h2>
              </div>
              <button
                className="erp-text-button"
                type="button"
                onClick={() => setModal(null)}
                aria-label="Close edit task dialog"
              >
                Close ×
              </button>
            </div>
            <form
              onSubmit={(event) => void submitEdit(event)}
              className="founder-form"
            >
              <label>
                <span>Title</span>
                <input
                  required
                  maxLength={200}
                  value={editForm.title}
                  onChange={(event) =>
                    setEditForm((value) => ({
                      ...value,
                      title: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                <span>Description</span>
                <textarea
                  maxLength={5000}
                  rows={3}
                  value={editForm.description}
                  onChange={(event) =>
                    setEditForm((value) => ({
                      ...value,
                      description: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                <span>Reassign to</span>
                <select
                  value={editForm.assigneeEmployeeId}
                  onChange={(event) =>
                    setEditForm((value) => ({
                      ...value,
                      assigneeEmployeeId: event.target.value,
                    }))
                  }
                >
                  <option value="">Unassigned</option>
                  {employees
                    .filter((employee) => employee.status === "ACTIVE")
                    .map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name} · {employee.division.name}
                      </option>
                    ))}
                </select>
              </label>
              <div className="founder-form-grid">
                <label>
                  <span>Priority</span>
                  <select
                    value={editForm.priority}
                    onChange={(event) =>
                      setEditForm((value) => ({
                        ...value,
                        priority: event.target.value as EditForm["priority"],
                      }))
                    }
                  >
                    {Object.entries(priorityLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Status</span>
                  <select
                    value={editForm.status}
                    onChange={(event) =>
                      setEditForm((value) => ({
                        ...value,
                        status: event.target.value as EditForm["status"],
                      }))
                    }
                  >
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                <span>Due date</span>
                <input
                  type="date"
                  value={editForm.dueDate}
                  onChange={(event) =>
                    setEditForm((value) => ({
                      ...value,
                      dueDate: event.target.value,
                    }))
                  }
                />
              </label>
              <div className="founder-dialog-actions">
                <button
                  className="erp-text-button"
                  type="button"
                  onClick={() => setModal(null)}
                >
                  Cancel
                </button>
                <button
                  className="erp-button erp-button-primary"
                  type="submit"
                  disabled={busy}
                >
                  {busy ? "Saving…" : "Save changes ↗"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
      {modal?.kind === "cancel" && (
        <div className="founder-dialog-backdrop" role="presentation">
          <section
            className="founder-dialog founder-confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-dialog-title"
          >
            <div className="founder-dialog-head">
              <div>
                <p className="erp-kicker">Preserve history</p>
                <h2 id="cancel-dialog-title">Cancel this task?</h2>
              </div>
              <button
                className="erp-text-button"
                type="button"
                onClick={() => setModal(null)}
                aria-label="Close cancel task dialog"
              >
                Close ×
              </button>
            </div>
            <p className="founder-confirm-copy">
              “{modal.task.title}” will remain in the project history and move
              to Cancelled. It will not be hard-deleted.
            </p>
            <div className="founder-dialog-actions">
              <button
                className="erp-text-button"
                type="button"
                onClick={() => setModal(null)}
              >
                Keep task
              </button>
              <button
                className="erp-button erp-button-primary founder-danger-fill"
                type="button"
                disabled={busy}
                onClick={() => void cancelTask()}
              >
                {busy ? "Cancelling…" : "Cancel task"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export function FounderDashboard() {
  return (
    <ProtectedErp requiredExecutive>
      <FounderDashboardContent />
    </ProtectedErp>
  );
}
