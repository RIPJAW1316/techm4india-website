"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";

import { ApiError, apiFetchV2 } from "@/lib/api/client";
import type {
  ApiResponse,
  CompanyBranch,
  CompanyDepartment,
  CompanyDivision,
  HrEmployeeDetail,
  HrEmployeeSummary,
} from "@/lib/api/types";
import { ErpShell } from "../../components/ErpShell";
import { ErpLoading, ProtectedErp } from "../../components/ProtectedErp";

type FormState = {
  officialEmail: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
  divisionId: string;
  departmentId: string;
  branchId: string;
  managerEmployeeId: string;
  designation: string;
  employmentType: string;
  joiningDate: string;
  phone: string;
  personalEmail: string;
};
type Modal = { kind: "create" } | { kind: "edit"; employee: HrEmployeeSummary } | null;
const emptyForm: FormState = {
  officialEmail: "",
  firstName: "",
  lastName: "",
  employeeCode: "",
  divisionId: "",
  departmentId: "",
  branchId: "",
  managerEmployeeId: "",
  designation: "",
  employmentType: "FULL_TIME",
  joiningDate: "",
  phone: "",
  personalEmail: "",
};
const types = [
  { value: "FULL_TIME", label: "Full time" },
  { value: "PART_TIME", label: "Part time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERN", label: "Intern" },
];
const statuses = ["ACTIVE", "ON_LEAVE", "SUSPENDED", "INACTIVE", "EXITED"];

function formatDate(value: string | null | undefined) {
  return value
    ? new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(value))
    : "Not set";
}
function label(value: string | null | undefined) {
  return value ? value.replaceAll("_", " ") : "Not set";
}
function Notice({
  error,
  message,
  onRetry,
}: {
  error: string | null;
  message: string | null;
  onRetry: () => void;
}) {
  if (error)
    return (
      <div className="erp-error" role="alert">
        <p>{error}</p>
        <button className="erp-text-button" type="button" onClick={onRetry}>
          Try again ↗
        </button>
      </div>
    );
  return message ? (
    <p className="erp-success" role="status">
      {message}
    </p>
  ) : null;
}

function FounderEmployeesContent() {
  const [employees, setEmployees] = useState<HrEmployeeSummary[]>([]);
  const [divisions, setDivisions] = useState<CompanyDivision[]>([]);
  const [departments, setDepartments] = useState<CompanyDepartment[]>([]);
  const [branches, setBranches] = useState<CompanyBranch[]>([]);
  const [detail, setDetail] = useState<HrEmployeeDetail | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [managerFilter, setManagerFilter] = useState("");
  const [designationFilter, setDesignationFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modal, setModal] = useState<Modal>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limit: "100",
        page: "1",
        ...(search ? { search } : {}),
        ...(divisionFilter ? { divisionId: divisionFilter } : {}),
        ...(departmentFilter ? { departmentId: departmentFilter } : {}),
        ...(branchFilter ? { branchId: branchFilter } : {}),
        ...(managerFilter ? { managerId: managerFilter } : {}),
        ...(designationFilter ? { designation: designationFilter } : {}),
        ...(roleFilter ? { role: roleFilter } : {}),
        ...(typeFilter ? { employmentType: typeFilter } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      });
      const [employeeResponse, divisionResponse, departmentResponse, branchResponse] =
        await Promise.all([
          apiFetchV2<ApiResponse<HrEmployeeSummary[]>>(`/hr/employees?${params.toString()}`),
          apiFetchV2<ApiResponse<CompanyDivision[]>>("/company/divisions"),
          apiFetchV2<ApiResponse<CompanyDepartment[]>>("/company/departments"),
          apiFetchV2<ApiResponse<CompanyBranch[]>>("/company/branches?limit=100"),
        ]);
      setEmployees(employeeResponse.data);
      setDivisions(divisionResponse.data);
      setDepartments(departmentResponse.data);
      setBranches(branchResponse.data);
    } catch (reason) {
      setError(
        reason instanceof ApiError && reason.status === 403
          ? "HR employee-management access is required."
          : "The employee directory could not load.",
      );
    } finally {
      setLoading(false);
    }
  }, [
    branchFilter,
    departmentFilter,
    designationFilter,
    divisionFilter,
    managerFilter,
    roleFilter,
    search,
    statusFilter,
    typeFilter,
  ]);

  const loadDetail = useCallback(async (id: string) => {
    setSelectedId(id);
    setDetailLoading(true);
    setError(null);
    try {
      const response = await apiFetchV2<ApiResponse<HrEmployeeDetail>>(`/hr/employees/${id}`);
      setDetail(response.data);
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Employee record could not load.");
    } finally {
      setDetailLoading(false);
    }
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const departmentsFor = useMemo(
    () =>
      departments.filter(
        (department) => !form.divisionId || department.divisionId === form.divisionId,
      ),
    [departments, form.divisionId],
  );
  function openCreate() {
    setForm({ ...emptyForm });
    setModal({ kind: "create" });
  }
  function openEdit(employee: HrEmployeeSummary) {
    setForm({
      officialEmail: employee.officialEmail,
      firstName: employee.firstName,
      lastName: employee.lastName,
      employeeCode: employee.employeeCode,
      divisionId: employee.division?.id ?? "",
      departmentId: employee.department?.id ?? "",
      branchId: employee.branch?.id ?? "",
      managerEmployeeId: employee.manager?.id ?? "",
      designation: employee.designation ?? "",
      employmentType: employee.employmentType,
      joiningDate: employee.joiningDate?.slice(0, 10) ?? "",
      phone: employee.phone ?? "",
      personalEmail: employee.personalEmail ?? "",
    });
    setModal({ kind: "edit", employee });
  }
  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === "divisionId" ? { departmentId: "" } : {}),
    }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const body = Object.fromEntries(Object.entries(form).filter(([, value]) => value !== ""));
    try {
      const path = modal?.kind === "edit" ? `/hr/employees/${modal.employee.id}` : "/hr/employees";
      await apiFetchV2(path, {
        method: modal?.kind === "edit" ? "PATCH" : "POST",
        body: JSON.stringify(body),
      });
      setModal(null);
      setMessage(modal?.kind === "edit" ? "Employee record updated." : "Employee record created.");
      await load();
      if (modal?.kind === "edit") await loadDetail(modal.employee.id);
    } catch (reason) {
      setError(
        reason instanceof ApiError ? reason.message : "The employee record could not be saved.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function addSkill(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!detail) return;
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") || "").trim();
    if (!name) return;
    setBusy(true);
    try {
      await apiFetchV2(`/hr/employees/${detail.id}/skills`, {
        method: "POST",
        body: JSON.stringify({
          name,
          level: String(formData.get("level") || ""),
        }),
      });
      setMessage("Skill added.");
      await loadDetail(detail.id);
      event.currentTarget.reset();
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Skill could not be added.");
    } finally {
      setBusy(false);
    }
  }

  if (loading && employees.length === 0) return <ErpLoading label="Loading employee master" />;
  return (
    <>
      <ErpShell active="employees" />
      <main className="erp-main" id="employees-top">
        <div className="erp-content founder-content founder-hr-content">
          <section className="founder-welcome">
            <div>
              <p className="erp-kicker">Employee master</p>
              <h1>
                People, <em>clearly recorded.</em>
              </h1>
              <p>
                A safe operational directory for the people, structure and employment changes that
                keep TechM4India moving.
              </p>
            </div>
            <button
              className="erp-button erp-button-primary founder-assign-top"
              type="button"
              onClick={openCreate}
            >
              Add employee ↗
            </button>
          </section>
          <Notice error={error} message={message} onRetry={() => void load()} />
          <section className="founder-hr-filters" aria-label="Employee filters">
            <label>
              <span>Search</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name, code, designation or email"
              />
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
                <option value="">All departments</option>
                {departments
                  .filter(
                    (department) => !divisionFilter || department.divisionId === divisionFilter,
                  )
                  .map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              <span>Designation</span>
              <input
                value={designationFilter}
                onChange={(event) => setDesignationFilter(event.target.value)}
                placeholder="e.g. Project Manager"
              />
            </label>
            <label>
              <span>Manager</span>
              <select
                value={managerFilter}
                onChange={(event) => setManagerFilter(event.target.value)}
              >
                <option value="">All managers</option>
                {employees
                  .filter((employee) => employee.employmentStatus !== "EXITED")
                  .map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              <span>Role</span>
              <input
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                placeholder="Internal role name"
              />
            </label>
            <label>
              <span>Branch</span>
              <select
                value={branchFilter}
                onChange={(event) => setBranchFilter(event.target.value)}
              >
                <option value="">All branches</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Employment</span>
              <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                <option value="">All types</option>
                {types.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Status</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="">All statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {label(status)}
                  </option>
                ))}
              </select>
            </label>
          </section>
          <section className="founder-hr-directory">
            <div className="erp-section-heading">
              <div>
                <p className="erp-kicker">Directory</p>
                <h2>
                  {employees.length} employee{employees.length === 1 ? "" : "s"}
                </h2>
              </div>
              <span className="erp-section-count">Operational records only</span>
            </div>
            <div className="founder-hr-table-wrap">
              <table className="founder-hr-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Division</th>
                    <th>Department</th>
                    <th>Branch</th>
                    <th>Role</th>
                    <th>Type / status</th>
                    <th>Joined</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan={8}>
                        <div className="erp-empty">
                          <strong>No employee records match.</strong>
                          <span>Try a different filter or add an operational employee record.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    employees.map((employee) => (
                      <tr key={employee.id}>
                        <td data-label="Employee">
                          <strong>
                            {employee.firstName} {employee.lastName}
                          </strong>
                          <small>
                            {employee.employeeCode}
                            <br />
                            {employee.officialEmail}
                          </small>
                        </td>
                        <td data-label="Division">{employee.division?.name ?? "Not assigned"}</td>
                        <td data-label="Department">
                          {employee.department?.name ?? "Not assigned"}
                        </td>
                        <td data-label="Branch">{employee.branch?.name ?? "Not assigned"}</td>
                        <td data-label="Role">
                          <span>{employee.designation ?? "Not set"}</span>
                          <small>
                            {employee.manager
                              ? `Reports to ${employee.manager.name}`
                              : "No manager"}
                          </small>
                        </td>
                        <td data-label="Type / status">
                          <span>{label(employee.employmentType)}</span>
                          <small
                            className={
                              employee.employmentStatus === "ACTIVE"
                                ? "founder-status"
                                : "founder-overdue"
                            }
                          >
                            {label(employee.employmentStatus)}
                          </small>
                        </td>
                        <td data-label="Joined">{formatDate(employee.joiningDate)}</td>
                        <td data-label="Actions">
                          <div className="founder-row-actions">
                            <button
                              className="erp-text-button"
                              type="button"
                              onClick={() => void loadDetail(employee.id)}
                            >
                              View
                            </button>
                            <button
                              className="erp-text-button"
                              type="button"
                              onClick={() => openEdit(employee)}
                            >
                              Edit
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
          {(selectedId || detailLoading) && (
            <section className="founder-hr-detail" aria-labelledby="employee-detail-title">
              <div className="erp-section-heading">
                <div>
                  <p className="erp-kicker">Employee record</p>
                  <h2 id="employee-detail-title">
                    {detail ? `${detail.firstName} ${detail.lastName}` : "Loading record"}
                  </h2>
                </div>
                <button
                  className="erp-text-button"
                  type="button"
                  onClick={() => {
                    setSelectedId(null);
                    setDetail(null);
                  }}
                >
                  Close detail ×
                </button>
              </div>
              {detailLoading || !detail ? (
                <ErpLoading label="Loading employee record" />
              ) : (
                <>
                  <div className="founder-hr-identity">
                    <div>
                      <span>Employee code</span>
                      <strong>{detail.employeeCode}</strong>
                    </div>
                    <div>
                      <span>Division</span>
                      <strong>{detail.division?.name ?? "Not assigned"}</strong>
                    </div>
                    <div>
                      <span>Department</span>
                      <strong>{detail.department?.name ?? "Not assigned"}</strong>
                    </div>
                    <div>
                      <span>Manager</span>
                      <strong>{detail.manager?.name ?? "No manager"}</strong>
                    </div>
                    <div>
                      <span>Status</span>
                      <strong>{label(detail.employmentStatus)}</strong>
                    </div>
                  </div>
                  <div className="founder-hr-detail-grid">
                    <article>
                      <p className="erp-kicker">Overview</p>
                      <h3>{detail.designation ?? "Designation not set"}</h3>
                      <p>{detail.officialEmail}</p>
                      <p>
                        {detail.phone || "No phone recorded"} ·{" "}
                        {detail.personalEmail || "No personal email"}
                      </p>
                    </article>
                    <article>
                      <p className="erp-kicker">Employment</p>
                      <p>
                        <strong>{label(detail.employmentType)}</strong> · joined{" "}
                        {formatDate(detail.joiningDate)}
                      </p>
                      <p>Confirmation: {formatDate(detail.confirmationDate)}</p>
                      <p>Probation end: {formatDate(detail.probationEndDate)}</p>
                      <p>
                        {detail.directReportCount} direct report
                        {detail.directReportCount === 1 ? "" : "s"}
                      </p>
                    </article>
                    <article>
                      <p className="erp-kicker">Teams</p>
                      {detail.teams.length ? (
                        detail.teams.map((team) => (
                          <span className="founder-hr-chip" key={team.id}>
                            {team.name} · {team.role}
                          </span>
                        ))
                      ) : (
                        <p>No active teams recorded.</p>
                      )}
                    </article>
                  </div>
                  <div className="founder-hr-detail-columns">
                    <article>
                      <div className="erp-section-heading">
                        <div>
                          <p className="erp-kicker">Skills</p>
                          <h3>Capabilities</h3>
                        </div>
                      </div>
                      {detail.skills.length ? (
                        detail.skills.map((skill) => (
                          <div className="founder-hr-line" key={skill.id}>
                            <strong>{skill.name}</strong>
                            <span>
                              {skill.level ?? "Level not set"}
                              {skill.yearsExperience ? ` · ${skill.yearsExperience} years` : ""}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="founder-hr-muted">No skills recorded yet.</p>
                      )}
                      <form
                        className="founder-hr-inline-form"
                        onSubmit={(event) => void addSkill(event)}
                      >
                        <input name="name" required placeholder="Add a skill" />
                        <input name="level" placeholder="Level" />
                        <button className="erp-text-button" type="submit" disabled={busy}>
                          Add ↗
                        </button>
                      </form>
                    </article>
                    <article>
                      <p className="erp-kicker">History</p>
                      <h3>Employment changes</h3>
                      {detail.employmentHistory.length ? (
                        detail.employmentHistory.map((item) => (
                          <div className="founder-hr-history" key={item.id}>
                            <strong>{label(item.eventType)}</strong>
                            <span>
                              {formatDate(item.effectiveDate)} · {item.summary}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="founder-hr-muted">No employment history recorded.</p>
                      )}
                    </article>
                    <article>
                      <p className="erp-kicker">Contact and privacy</p>
                      <h3>{detail.addresses.length ? "Addresses" : "No addresses recorded"}</h3>
                      {detail.addresses.map((address) => (
                        <p key={address.id}>
                          {address.type}: {address.addressLine1}, {address.city}, {address.state}{" "}
                          {address.postalCode}
                        </p>
                      ))}
                      <h3>
                        {detail.emergencyContacts.length
                          ? "Emergency contacts"
                          : "No emergency contacts recorded"}
                      </h3>
                      {detail.emergencyContacts.map((contact) => (
                        <p key={contact.id}>
                          {contact.name} · {contact.relationship} · {contact.phone}
                        </p>
                      ))}
                    </article>
                  </div>
                </>
              )}
            </section>
          )}
        </div>
      </main>
      {modal && (
        <div className="founder-dialog-backdrop" role="presentation">
          <section
            className="founder-dialog founder-hr-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="employee-form-title"
          >
            <div className="founder-dialog-head">
              <div>
                <p className="erp-kicker">Safe HR fields</p>
                <h2 id="employee-form-title">
                  {modal.kind === "create" ? "Add employee" : "Edit employee"}
                </h2>
              </div>
              <button className="erp-text-button" type="button" onClick={() => setModal(null)}>
                Close ×
              </button>
            </div>
            <form className="founder-form" onSubmit={(event) => void submit(event)}>
              <div className="founder-form-grid">
                <label>
                  <span>First name</span>
                  <input
                    required
                    value={form.firstName}
                    onChange={(event) => updateForm("firstName", event.target.value)}
                  />
                </label>
                <label>
                  <span>Last name</span>
                  <input
                    required
                    value={form.lastName}
                    onChange={(event) => updateForm("lastName", event.target.value)}
                  />
                </label>
                <label>
                  <span>Employee code</span>
                  <input
                    required
                    value={form.employeeCode}
                    onChange={(event) => updateForm("employeeCode", event.target.value)}
                  />
                </label>
                <label>
                  <span>Official email</span>
                  <input
                    type="email"
                    required={modal.kind === "create"}
                    value={form.officialEmail}
                    onChange={(event) => updateForm("officialEmail", event.target.value)}
                  />
                </label>
                <label>
                  <span>Division</span>
                  <select
                    required
                    value={form.divisionId}
                    onChange={(event) => updateForm("divisionId", event.target.value)}
                  >
                    <option value="">Choose division</option>
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
                    required
                    value={form.departmentId}
                    onChange={(event) => updateForm("departmentId", event.target.value)}
                  >
                    <option value="">Choose department</option>
                    {departmentsFor.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Branch</span>
                  <select
                    value={form.branchId}
                    onChange={(event) => updateForm("branchId", event.target.value)}
                  >
                    <option value="">No branch</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Designation</span>
                  <input
                    value={form.designation}
                    onChange={(event) => updateForm("designation", event.target.value)}
                  />
                </label>
                <label>
                  <span>Employment type</span>
                  <select
                    value={form.employmentType}
                    onChange={(event) => updateForm("employmentType", event.target.value)}
                  >
                    {types.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Joining date</span>
                  <input
                    type="date"
                    value={form.joiningDate}
                    onChange={(event) => updateForm("joiningDate", event.target.value)}
                  />
                </label>
                <label>
                  <span>Phone</span>
                  <input
                    value={form.phone}
                    onChange={(event) => updateForm("phone", event.target.value)}
                  />
                </label>
                <label>
                  <span>Personal email</span>
                  <input
                    type="email"
                    value={form.personalEmail}
                    onChange={(event) => updateForm("personalEmail", event.target.value)}
                  />
                </label>
              </div>
              <p className="founder-form-note">
                Credentials are never generated or displayed here. New records receive an invited
                account for a future provisioning flow.
              </p>
              <div className="founder-dialog-actions">
                <button className="erp-text-button" type="button" onClick={() => setModal(null)}>
                  Cancel
                </button>
                <button className="erp-button erp-button-primary" disabled={busy} type="submit">
                  {busy ? "Saving…" : "Save employee ↗"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}

export function FounderEmployees() {
  return (
    <ProtectedErp requiredHr>
      <FounderEmployeesContent />
    </ProtectedErp>
  );
}
