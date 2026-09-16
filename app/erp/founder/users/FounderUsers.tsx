"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError, apiFetchV2 } from "@/lib/api/client";
import { ErpShell } from "../../components/ErpShell";
import { ErpLoading, ProtectedErp } from "../../components/ProtectedErp";

type Named = { id: string; name: string };
type Role = {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  capabilityState: "IMPLEMENTED" | "RESERVED_FUTURE";
  assignedUserCount: number;
  permissions: Array<{ id: string; key: string; description: string | null }>;
};
type Permission = {
  id: string;
  key: string;
  category: string;
  description: string | null;
  roles: Array<{ id: string; name: string }>;
};
type UserRow = {
  id: string;
  email: string;
  status: string;
  lastLoginAt: string | null;
  roles: Array<{
    id: string;
    name: string;
    displayName: string;
    assignedAt: string;
  }>;
  employee: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    name: string;
    designation: string | null;
    employmentStatus: string;
    employmentType: string;
    joiningDate: string | null;
    division: Named | null;
    department: Named | null;
    branch: (Named & { code: string }) | null;
    manager: (Named & { employeeCode: string }) | null;
  } | null;
};
type WorkTask = {
  id: string;
  title: string;
  priority: string;
  status: string;
  dueDate: string | null;
  completedAt: string | null;
  project: { id: string; code: string; name: string; status: string };
};
type UserDetail = UserRow & {
  createdAt: string;
  updatedAt: string;
  activeSessions: number;
  employee: NonNullable<UserRow["employee"]> & {
    phone: string | null;
    directReports: Array<Named & { employeeCode: string; designation: string | null }>;
    teams: Array<Named & { code: string; role: string }>;
    employmentHistory: Array<{
      id: string;
      eventType: string;
      effectiveDate: string;
      summary: string;
    }>;
  };
  work: {
    summary: {
      active: number;
      completed: number;
      overdue: number;
      cancelled: number;
      projects: number;
    };
    activeTasks: WorkTask[];
    completedTasks: WorkTask[];
    cancelledTasks: WorkTask[];
    projects: Array<{
      id: string;
      code: string;
      name: string;
      status: string;
      priority: string;
      dueDate: string | null;
    }>;
  };
  attendance: {
    today: {
      status: string;
      checkInAt: string | null;
      checkOutAt: string | null;
    } | null;
    recent: Array<{ id: string; businessDate: string; status: string }>;
  };
  leave: {
    pending: number;
    recent: Array<{
      id: string;
      startDate: string;
      endDate: string;
      dayCount: number;
      status: string;
      leaveType: Named;
    }>;
  };
};
type View = "users" | "roles" | "permissions";
type ApiList<T> = {
  success: true;
  data: T[];
  meta?: { total: number; page: number; totalPages: number };
};

const employmentStatuses = [
  "ACTIVE",
  "ON_LEAVE",
  "SUSPENDED",
  "INACTIVE",
  "EXITED",
  "RESIGNED",
  "TERMINATED",
];
const accountStatuses = ["INVITED", "ACTIVE", "LOCKED", "DISABLED"];
const human = (value: string | null | undefined) =>
  value ? value.replaceAll("_", " ") : "Not set";
const date = (value: string | null | undefined) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(value))
    : "Not set";
const errorText = (reason: unknown, fallback: string) =>
  reason instanceof ApiError ? reason.message : fallback;

function TaskRows({ title, tasks, empty }: { title: string; tasks: WorkTask[]; empty: string }) {
  return (
    <article className="admin-work-panel">
      <div className="erp-section-heading">
        <div>
          <p className="erp-kicker">Task history</p>
          <h3>{title}</h3>
        </div>
        <span className="erp-section-count">{tasks.length}</span>
      </div>
      {tasks.length ? (
        tasks.map((task) => (
          <div className="admin-task-line" key={task.id}>
            <div>
              <strong>{task.title}</strong>
              <span>
                {task.project.code} · {task.project.name}
              </span>
            </div>
            <div>
              <span className={`erp-priority priority-${task.priority.toLowerCase()}`}>
                {human(task.priority)}
              </span>
              <small>
                {human(task.status)} ·{" "}
                {task.completedAt
                  ? `Completed ${date(task.completedAt)}`
                  : task.dueDate
                    ? `Due ${date(task.dueDate)}`
                    : "No deadline"}
              </small>
            </div>
          </div>
        ))
      ) : (
        <p className="founder-hr-muted">{empty}</p>
      )}
    </article>
  );
}

function FounderUsersContent() {
  const [view, setView] = useState<View>("users");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [divisions, setDivisions] = useState<Named[]>([]);
  const [departments, setDepartments] = useState<Array<Named & { divisionId: string }>>([]);
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [employmentFilter, setEmploymentFilter] = useState("");
  const [accountFilter, setAccountFilter] = useState("");
  const [roleToAssign, setRoleToAssign] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: "1",
        limit: "100",
        ...(search ? { search } : {}),
        ...(roleFilter ? { role: roleFilter } : {}),
        ...(divisionFilter ? { division: divisionFilter } : {}),
        ...(departmentFilter ? { department: departmentFilter } : {}),
        ...(employmentFilter ? { employmentStatus: employmentFilter } : {}),
        ...(accountFilter ? { accountStatus: accountFilter } : {}),
      });
      const [userResponse, roleResponse, permissionResponse, divisionResponse, departmentResponse] =
        await Promise.all([
          apiFetchV2<ApiList<UserRow>>(`/admin/users?${params.toString()}`),
          apiFetchV2<ApiList<Role>>("/admin/roles"),
          apiFetchV2<ApiList<Permission>>("/admin/permissions"),
          apiFetchV2<ApiList<Named>>("/company/divisions"),
          apiFetchV2<ApiList<Named & { divisionId: string }>>("/company/departments"),
        ]);
      setUsers(userResponse.data);
      setRoles(roleResponse.data);
      setPermissions(permissionResponse.data);
      setDivisions(divisionResponse.data);
      setDepartments(departmentResponse.data);
      setError(null);
    } catch (reason) {
      setError(errorText(reason, "The Users & Roles workspace could not load."));
    } finally {
      setLoading(false);
    }
  }, [accountFilter, departmentFilter, divisionFilter, employmentFilter, roleFilter, search]);

  const openDetail = useCallback(async (id: string) => {
    setDetailLoading(true);
    try {
      const response = await apiFetchV2<{ success: true; data: UserDetail }>(`/admin/users/${id}`);
      setDetail(response.data);
      setRoleToAssign("");
      setError(null);
    } catch (reason) {
      setError(errorText(reason, "The user record could not load."));
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  const assignableRoles = useMemo(
    () => roles.filter((role) => !detail?.roles.some((assigned) => assigned.id === role.id)),
    [detail, roles],
  );

  async function assignRole() {
    if (!detail || !roleToAssign) return;
    setBusy(true);
    try {
      await apiFetchV2(`/admin/users/${detail.id}/roles`, {
        method: "POST",
        body: JSON.stringify({ roleId: roleToAssign }),
      });
      setNotice("Role assigned and recorded in the audit log.");
      await Promise.all([openDetail(detail.id), load()]);
    } catch (reason) {
      setError(errorText(reason, "Role assignment failed."));
    } finally {
      setBusy(false);
    }
  }

  async function removeRole(role: UserRow["roles"][number]) {
    if (
      !detail ||
      !window.confirm(
        `Remove ${role.displayName} from ${detail.employee.name}? This does not delete the user.`,
      )
    )
      return;
    setBusy(true);
    try {
      await apiFetchV2(`/admin/users/${detail.id}/roles/${role.id}`, {
        method: "DELETE",
      });
      setNotice("Role removed. User and employment history were preserved.");
      await Promise.all([openDetail(detail.id), load()]);
    } catch (reason) {
      setError(errorText(reason, "Role removal failed."));
    } finally {
      setBusy(false);
    }
  }

  async function changeAccount(action: "activate" | "deactivate") {
    if (
      !detail ||
      !window.confirm(
        `${action === "activate" ? "Activate" : "Deactivate"} ${detail.email}? Employment status will not be changed.`,
      )
    )
      return;
    setBusy(true);
    try {
      await apiFetchV2(`/admin/users/${detail.id}/${action}`, {
        method: "POST",
      });
      setNotice(
        action === "activate"
          ? "Account activated."
          : "Account deactivated and active sessions revoked.",
      );
      await Promise.all([openDetail(detail.id), load()]);
    } catch (reason) {
      setError(errorText(reason, `Account ${action} failed.`));
    } finally {
      setBusy(false);
    }
  }

  if (loading && users.length === 0 && roles.length === 0)
    return <ErpLoading label="Loading Users & Roles" />;

  return (
    <>
      <ErpShell active="users" />
      <main className="erp-main" id="users-top">
        <div className="erp-content founder-content admin-users-content">
          <section className="founder-welcome">
            <div>
              <p className="erp-kicker">Administrative identity</p>
              <h1>
                Users &amp; <em>roles</em>
              </h1>
              <p>
                Inspect employee-linked accounts, manage official roles, and understand the
                permissions currently implemented across TechM4India.
              </p>
            </div>
          </section>
          {error && (
            <div className="erp-error" role="alert">
              <p>{error}</p>
              <button className="erp-text-button" type="button" onClick={() => void load()}>
                Try again ↗
              </button>
            </div>
          )}
          {notice && (
            <p className="erp-success" role="status">
              {notice}
            </p>
          )}
          <div className="admin-view-tabs" role="tablist" aria-label="Users and roles views">
            <button
              className={view === "users" ? "is-active" : ""}
              role="tab"
              type="button"
              onClick={() => setView("users")}
            >
              Users
            </button>
            <button
              className={view === "roles" ? "is-active" : ""}
              role="tab"
              type="button"
              onClick={() => setView("roles")}
            >
              Official Roles
            </button>
            <button
              className={view === "permissions" ? "is-active" : ""}
              role="tab"
              type="button"
              onClick={() => setView("permissions")}
            >
              Permission Matrix
            </button>
          </div>

          {view === "users" && (
            <>
              <section className="founder-hr-filters admin-user-filters" aria-label="User filters">
                <label>
                  <span>Search</span>
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Name, employee code or email"
                  />
                </label>
                <label>
                  <span>Role</span>
                  <select
                    value={roleFilter}
                    onChange={(event) => setRoleFilter(event.target.value)}
                  >
                    <option value="">All roles</option>
                    {roles.map((role) => (
                      <option value={role.name} key={role.id}>
                        {role.displayName}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Division</span>
                  <select
                    value={divisionFilter}
                    onChange={(event) => {
                      setDivisionFilter(event.target.value);
                      setDepartmentFilter("");
                    }}
                  >
                    <option value="">All divisions</option>
                    {divisions.map((division) => (
                      <option value={division.id} key={division.id}>
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
                    <option value="">All departments</option>
                    {departments
                      .filter(
                        (department) => !divisionFilter || department.divisionId === divisionFilter,
                      )
                      .map((department) => (
                        <option value={department.id} key={department.id}>
                          {department.name}
                        </option>
                      ))}
                  </select>
                </label>
                <label>
                  <span>Employment</span>
                  <select
                    value={employmentFilter}
                    onChange={(event) => setEmploymentFilter(event.target.value)}
                  >
                    <option value="">All statuses</option>
                    {employmentStatuses.map((status) => (
                      <option value={status} key={status}>
                        {human(status)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Account</span>
                  <select
                    value={accountFilter}
                    onChange={(event) => setAccountFilter(event.target.value)}
                  >
                    <option value="">All accounts</option>
                    {accountStatuses.map((status) => (
                      <option value={status} key={status}>
                        {human(status)}
                      </option>
                    ))}
                  </select>
                </label>
              </section>
              <section>
                <div className="erp-section-heading">
                  <div>
                    <p className="erp-kicker">User directory</p>
                    <h2>
                      {users.length} linked account
                      {users.length === 1 ? "" : "s"}
                    </h2>
                  </div>
                  <span className="erp-section-count">Safe fields only</span>
                </div>
                <div className="founder-hr-table-wrap">
                  <table className="founder-hr-table admin-user-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Organization</th>
                        <th>Designation</th>
                        <th>Roles</th>
                        <th>Employment</th>
                        <th>Account</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {users.length ? (
                        users.map((user) => (
                          <tr key={user.id}>
                            <td data-label="Employee">
                              <strong>{user.employee?.name ?? "Unlinked account"}</strong>
                              <small>
                                {user.employee?.employeeCode ?? "No employee code"}
                                <br />
                                {user.email}
                              </small>
                            </td>
                            <td data-label="Organization">
                              <span>{user.employee?.division?.name ?? "Not assigned"}</span>
                              <small>{user.employee?.department?.name ?? "No department"}</small>
                            </td>
                            <td data-label="Designation">
                              {user.employee?.designation ?? "Not set"}
                            </td>
                            <td data-label="Roles">
                              <div className="admin-role-chips">
                                {user.roles.map((role) => (
                                  <span key={role.id}>{role.displayName}</span>
                                ))}
                              </div>
                            </td>
                            <td data-label="Employment">
                              <span className="founder-status">
                                {human(user.employee?.employmentStatus)}
                              </span>
                            </td>
                            <td data-label="Account">
                              <span
                                className={
                                  user.status === "ACTIVE" ? "founder-status" : "founder-overdue"
                                }
                              >
                                {human(user.status)}
                              </span>
                            </td>
                            <td data-label="Actions">
                              <button
                                className="erp-text-button"
                                type="button"
                                onClick={() => void openDetail(user.id)}
                              >
                                View details ↗
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7}>
                            <div className="erp-empty">
                              <strong>No matching users.</strong>
                              <span>Change a filter to widen the organization-safe result.</span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
              {(detail || detailLoading) && (
                <section className="admin-user-detail" aria-labelledby="admin-user-detail-title">
                  {detailLoading || !detail ? (
                    <ErpLoading label="Loading consolidated employee access" />
                  ) : (
                    <>
                      <div className="erp-section-heading">
                        <div>
                          <p className="erp-kicker">Consolidated employee access</p>
                          <h2 id="admin-user-detail-title">{detail.employee.name}</h2>
                          <span>
                            {detail.employee.employeeCode} · {detail.email}
                          </span>
                        </div>
                        <button
                          className="erp-text-button"
                          type="button"
                          onClick={() => setDetail(null)}
                        >
                          Close detail ×
                        </button>
                      </div>
                      <div className="admin-summary-grid">
                        <article>
                          <span>Active tasks</span>
                          <strong>{detail.work.summary.active}</strong>
                        </article>
                        <article>
                          <span>Completed</span>
                          <strong>{detail.work.summary.completed}</strong>
                        </article>
                        <article>
                          <span>Overdue</span>
                          <strong>{detail.work.summary.overdue}</strong>
                        </article>
                        <article>
                          <span>Projects</span>
                          <strong>{detail.work.summary.projects}</strong>
                        </article>
                        <article>
                          <span>Attendance today</span>
                          <strong>
                            {human(detail.attendance.today?.status ?? "NOT_RECORDED")}
                          </strong>
                        </article>
                        <article>
                          <span>Pending leave</span>
                          <strong>{detail.leave.pending}</strong>
                        </article>
                      </div>
                      <div className="admin-detail-grid">
                        <article>
                          <p className="erp-kicker">Identity & organization</p>
                          <h3>{detail.employee.designation ?? "Designation not set"}</h3>
                          <p>
                            {human(detail.employee.employmentType)} · joined{" "}
                            {date(detail.employee.joiningDate)}
                          </p>
                          <p>{detail.employee.phone ?? "No phone recorded"}</p>
                          <dl>
                            <dt>Division</dt>
                            <dd>{detail.employee.division?.name ?? "Not assigned"}</dd>
                            <dt>Department</dt>
                            <dd>{detail.employee.department?.name ?? "Not assigned"}</dd>
                            <dt>Branch</dt>
                            <dd>{detail.employee.branch?.name ?? "Not assigned"}</dd>
                            <dt>Manager</dt>
                            <dd>{detail.employee.manager?.name ?? "Not assigned"}</dd>
                            <dt>Direct reports</dt>
                            <dd>{detail.employee.directReports.length}</dd>
                            <dt>Teams</dt>
                            <dd>
                              {detail.employee.teams.map((team) => team.name).join(", ") || "None"}
                            </dd>
                          </dl>
                        </article>
                        <article>
                          <p className="erp-kicker">Account</p>
                          <h3>{human(detail.status)}</h3>
                          <p>
                            {detail.activeSessions} active session
                            {detail.activeSessions === 1 ? "" : "s"} · last login{" "}
                            {date(detail.lastLoginAt)}
                          </p>
                          <div className="admin-role-chips">
                            {detail.roles.map((role) => (
                              <span key={role.id}>
                                {role.displayName}
                                <button
                                  aria-label={`Remove ${role.displayName}`}
                                  disabled={busy}
                                  type="button"
                                  onClick={() => void removeRole(role)}
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="admin-role-assign">
                            <select
                              aria-label="Role to assign"
                              value={roleToAssign}
                              onChange={(event) => setRoleToAssign(event.target.value)}
                            >
                              <option value="">Choose official role</option>
                              {assignableRoles.map((role) => (
                                <option value={role.id} key={role.id}>
                                  {role.displayName}
                                </option>
                              ))}
                            </select>
                            <button
                              className="erp-text-button"
                              disabled={!roleToAssign || busy}
                              type="button"
                              onClick={() => void assignRole()}
                            >
                              Assign role ↗
                            </button>
                          </div>
                          <button
                            className={
                              detail.status === "ACTIVE"
                                ? "erp-button admin-danger-button"
                                : "erp-button erp-button-primary"
                            }
                            disabled={busy}
                            type="button"
                            onClick={() =>
                              void changeAccount(
                                detail.status === "ACTIVE" ? "deactivate" : "activate",
                              )
                            }
                          >
                            {detail.status === "ACTIVE" ? "Deactivate account" : "Activate account"}
                          </button>
                          <p className="founder-form-note">
                            Account state is independent from employment status. Deactivation
                            revokes sessions but preserves employee history.
                          </p>
                        </article>
                      </div>
                      <div className="admin-work-heading">
                        <div>
                          <p className="erp-kicker">Employee work</p>
                          <h3>Tasks and project history</h3>
                        </div>
                        <a
                          className="erp-button erp-button-primary"
                          href={`/erp/founder/dashboard?employee=${detail.employee.id}#work-detail`}
                        >
                          Open task control ↗
                        </a>
                      </div>
                      <div className="admin-task-grid">
                        <TaskRows
                          title="Active & overdue"
                          tasks={detail.work.activeTasks}
                          empty="No active tasks."
                        />
                        <TaskRows
                          title="Completed"
                          tasks={detail.work.completedTasks}
                          empty="No completed task history."
                        />
                        <TaskRows
                          title="Cancelled"
                          tasks={detail.work.cancelledTasks}
                          empty="No cancelled task history."
                        />
                      </div>
                      <div className="admin-detail-grid">
                        <article>
                          <p className="erp-kicker">Projects</p>
                          <h3>Assigned work</h3>
                          {detail.work.projects.length ? (
                            detail.work.projects.map((project) => (
                              <div className="founder-hr-line" key={project.id}>
                                <strong>
                                  {project.code} · {project.name}
                                </strong>
                                <span>
                                  {human(project.status)} · {human(project.priority)}
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className="founder-hr-muted">No project associations.</p>
                          )}
                        </article>
                        <article>
                          <p className="erp-kicker">Attendance</p>
                          <h3>Recent context</h3>
                          {detail.attendance.recent.length ? (
                            detail.attendance.recent.map((record) => (
                              <div className="founder-hr-line" key={record.id}>
                                <strong>{date(record.businessDate)}</strong>
                                <span>{human(record.status)}</span>
                              </div>
                            ))
                          ) : (
                            <p className="founder-hr-muted">No attendance records.</p>
                          )}
                        </article>
                        <article>
                          <p className="erp-kicker">Leave</p>
                          <h3>Recent requests</h3>
                          {detail.leave.recent.length ? (
                            detail.leave.recent.map((request) => (
                              <div className="founder-hr-line" key={request.id}>
                                <strong>{request.leaveType.name}</strong>
                                <span>
                                  {human(request.status)} · {date(request.startDate)}–
                                  {date(request.endDate)}
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className="founder-hr-muted">No leave requests.</p>
                          )}
                        </article>
                        <article>
                          <p className="erp-kicker">Employment history</p>
                          <h3>Recorded changes</h3>
                          {detail.employee.employmentHistory.length ? (
                            detail.employee.employmentHistory.map((item) => (
                              <div className="founder-hr-history" key={item.id}>
                                <strong>{human(item.eventType)}</strong>
                                <span>
                                  {date(item.effectiveDate)} · {item.summary}
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className="founder-hr-muted">No employment history.</p>
                          )}
                        </article>
                      </div>
                    </>
                  )}
                </section>
              )}
            </>
          )}

          {view === "roles" && (
            <section>
              <div className="erp-section-heading">
                <div>
                  <p className="erp-kicker">Official catalogue</p>
                  <h2>Twenty accountable roles</h2>
                </div>
                <span className="erp-section-count">Implemented ≠ future scope</span>
              </div>
              <div className="admin-role-grid">
                {roles.map((role) => (
                  <article key={role.id}>
                    <div>
                      <span
                        className={
                          role.capabilityState === "IMPLEMENTED"
                            ? "founder-status"
                            : "admin-reserved"
                        }
                      >
                        {role.capabilityState === "IMPLEMENTED"
                          ? "Implemented foundation"
                          : "Reserved / upcoming"}
                      </span>
                      <strong>{role.displayName}</strong>
                      <code>{role.name}</code>
                      <p>{role.description}</p>
                    </div>
                    <div>
                      <span>
                        {role.assignedUserCount} assigned user
                        {role.assignedUserCount === 1 ? "" : "s"}
                      </span>
                      <small>
                        {role.permissions.length
                          ? `${role.permissions.length} currently implemented permission${role.permissions.length === 1 ? "" : "s"}`
                          : "No implemented permissions yet"}
                      </small>
                      <div className="admin-permission-list">
                        {role.permissions.map((permission) => (
                          <span key={permission.id}>{permission.key}</span>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {view === "permissions" && (
            <section>
              <div className="erp-section-heading">
                <div>
                  <p className="erp-kicker">Read-only security view</p>
                  <h2>Permission matrix</h2>
                </div>
                <span className="erp-section-count">Role assignment only</span>
              </div>
              <p className="admin-matrix-note">
                This matrix reports what the backend currently grants. Reserved role names do not
                imply that their future business modules exist.
              </p>
              <div className="founder-hr-table-wrap">
                <table className="founder-hr-table admin-permission-table">
                  <thead>
                    <tr>
                      <th>Module</th>
                      <th>Permission</th>
                      <th>Roles currently granted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permissions.map((permission) => (
                      <tr key={permission.id}>
                        <td data-label="Module">{human(permission.category)}</td>
                        <td data-label="Permission">
                          <code>{permission.key}</code>
                          {permission.description && <small>{permission.description}</small>}
                        </td>
                        <td data-label="Roles">
                          <div className="admin-role-chips">
                            {permission.roles.length ? (
                              permission.roles.map((role) => (
                                <span key={role.id}>{human(role.name)}</span>
                              ))
                            ) : (
                              <span>Unassigned</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}

export function FounderUsers() {
  return (
    <ProtectedErp requiredAdmin>
      <FounderUsersContent />
    </ProtectedErp>
  );
}
