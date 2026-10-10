"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch, apiFetchV2, ApiError } from "@/lib/api/client";
import { ErpLoading, ProtectedErp } from "@/app/erp/components/ProtectedErp";
import { FounderModuleNavigation } from "@/app/erp/components/FounderModuleNavigation";
import { computePayrollResult } from "@/lib/erp/payroll.rules";

type AnyRecord = Record<string, any>;
function FounderPayrollContent() {
  const [dashboard, setDashboard] = useState<AnyRecord | null>(null);
  const [components, setComponents] = useState<AnyRecord[]>([]);
  const [structures, setStructures] = useState<AnyRecord[]>([]);
  const [periods, setPeriods] = useState<AnyRecord[]>([]);
  const [runs, setRuns] = useState<AnyRecord[]>([]);
  const [selectedRun, setSelectedRun] = useState<AnyRecord | null>(null);
  const [employees, setEmployees] = useState<AnyRecord[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: "",
    name: "",
    type: "EARNING",
    calculationType: "FIXED",
    defaultValue: "",
    percentageValue: "",
    isStatutory: false,
  });
  const [structureForm, setStructureForm] = useState({
    name: "",
    componentIds: [] as string[],
  });
  const [compensationForm, setCompensationForm] = useState({
    employeeId: "",
    salaryStructureId: "",
    effectiveFrom: "",
    annualCtc: "",
    monthlyGrossTarget: "",
  });
  const [periodForm, setPeriodForm] = useState({
    year: String(new Date().getFullYear()),
    month: String(new Date().getMonth() + 1),
    startDate: "",
    endDate: "",
  });
  const [simBasic, setSimBasic] = useState("35000");
  const [simHra, setSimHra] = useState("14000");
  const [simSpecial, setSimSpecial] = useState("11000");
  const [simLop, setSimLop] = useState("0");
  const [simWorkingDays, setSimWorkingDays] = useState("30");
  const [simPriorTds, setSimPriorTds] = useState("0");
  const [simMonthsRemaining, setSimMonthsRemaining] = useState("12");

  const simResult = useMemo(() => {
    return computePayrollResult({
      basic: Number(simBasic) || 0,
      hra: Number(simHra) || 0,
      specialAllowance: Number(simSpecial) || 0,
      lopDays: Number(simLop) || 0,
      workingDays: Number(simWorkingDays) || 30,
      priorTdsPaidInFY: Number(simPriorTds) || 0,
      monthsRemainingInFY: Number(simMonthsRemaining) || 12,
      stateCode: "TG",
    });
  }, [simBasic, simHra, simSpecial, simLop, simWorkingDays, simPriorTds, simMonthsRemaining]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [d, c, s, p, r, staff] = await Promise.all([
        apiFetchV2<{ data: AnyRecord }>("/payroll/dashboard"),
        apiFetchV2<{ data: AnyRecord[] }>("/payroll/components"),
        apiFetchV2<{ data: AnyRecord[] }>("/payroll/salary-structures"),
        apiFetchV2<{ data: AnyRecord[] }>("/payroll/periods"),
        apiFetchV2<{ data: AnyRecord[] }>("/payroll/runs"),
        apiFetch<{ data: AnyRecord[] }>("/employees?limit=100"),
      ]);
      setDashboard(d.data);
      setComponents(c.data);
      setStructures(s.data);
      setPeriods(p.data);
      setRuns(r.data);
      setEmployees(staff.data);
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Payroll workspace could not load.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  async function createComponent(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await apiFetchV2("/payroll/components", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          defaultValue: form.defaultValue ? Number(form.defaultValue) : undefined,
          percentageValue: form.percentageValue ? Number(form.percentageValue) : undefined,
        }),
      });
      setForm({
        code: "",
        name: "",
        type: "EARNING",
        calculationType: "FIXED",
        defaultValue: "",
        percentageValue: "",
        isStatutory: false,
      });
      await load();
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Component could not be saved.");
    } finally {
      setBusy(false);
    }
  }
  async function createStructure(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await apiFetchV2("/payroll/salary-structures", {
        method: "POST",
        body: JSON.stringify({
          name: structureForm.name,
          components: structureForm.componentIds.map((payrollComponentId) => ({
            payrollComponentId,
          })),
        }),
      });
      setStructureForm({ name: "", componentIds: [] });
      await load();
    } catch (reason) {
      setError(
        reason instanceof ApiError ? reason.message : "Salary structure could not be saved.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function assignCompensation(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await apiFetchV2(`/payroll/employees/${compensationForm.employeeId}/compensation`, {
        method: "POST",
        body: JSON.stringify({
          salaryStructureId: compensationForm.salaryStructureId,
          effectiveFrom: compensationForm.effectiveFrom,
          annualCtc: compensationForm.annualCtc ? Number(compensationForm.annualCtc) : undefined,
          monthlyGrossTarget: compensationForm.monthlyGrossTarget
            ? Number(compensationForm.monthlyGrossTarget)
            : undefined,
        }),
      });
      setCompensationForm({
        employeeId: "",
        salaryStructureId: "",
        effectiveFrom: "",
        annualCtc: "",
        monthlyGrossTarget: "",
      });
      await load();
    } catch (reason) {
      setError(
        reason instanceof ApiError ? reason.message : "Compensation assignment could not be saved.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function createPeriod(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await apiFetchV2("/payroll/periods", {
        method: "POST",
        body: JSON.stringify({
          year: Number(periodForm.year),
          month: Number(periodForm.month),
          startDate: periodForm.startDate,
          endDate: periodForm.endDate,
        }),
      });
      setPeriodForm((current) => ({ ...current, startDate: "", endDate: "" }));
      await load();
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Payroll period could not be saved.");
    } finally {
      setBusy(false);
    }
  }
  async function runAction(runId: string, action: "calculate" | "submit-review" | "finalize") {
    const label =
      action === "finalize" ? "Finalize this payroll run? Finalized payslips are immutable." : "";
    if (label && !window.confirm(label)) return;
    setBusy(true);
    try {
      await apiFetchV2(`/payroll/runs/${runId}/${action}`, { method: "POST" });
      await load();
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Payroll action failed.");
    } finally {
      setBusy(false);
    }
  }
  async function startRun(payrollPeriodId: string) {
    setBusy(true);
    try {
      await apiFetchV2("/payroll/runs", {
        method: "POST",
        body: JSON.stringify({ payrollPeriodId }),
      });
      await load();
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Payroll run could not start.");
    } finally {
      setBusy(false);
    }
  }
  async function reviewRun(runId: string) {
    setBusy(true);
    try {
      const response = await apiFetchV2<{ data: AnyRecord }>(`/payroll/runs/${runId}`);
      setSelectedRun(response.data);
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Payroll results could not load.");
    } finally {
      setBusy(false);
    }
  }
  if (loading) return <ErpLoading label="Loading payroll workspace" />;
  return (
    <main className="erp-main">
      <div className="erp-content">
        <FounderModuleNavigation active="payroll" />
        <section className="erp-welcome">
          <div>
            <p className="erp-kicker">Finance operations · configured values</p>
            <h1>
              Payroll <em>control</em>
            </h1>
            <p>Prepare, review, and finalize payroll with immutable historical snapshots.</p>
          </div>
          <div className="erp-welcome-code">
            <span>Periods</span>
            <strong>{periods.length}</strong>
          </div>
        </section>
        {error && (
          <div className="erp-error" role="alert">
            <p>{error}</p>
            <button className="erp-text-button" onClick={() => void load()}>
              Try again ↗
            </button>
          </div>
        )}
        <p className="erp-form-note">
          Statutory payroll components and rates are organization-configured and should be reviewed
          by an authorized payroll/finance professional.
        </p>
        <section className="erp-kpi-grid">
          <article>
            <span>Current period</span>
            <strong>
              {dashboard?.currentPeriod
                ? `${dashboard.currentPeriod.year}/${String(dashboard.currentPeriod.month).padStart(2, "0")}`
                : "—"}
            </strong>
            <small>{dashboard?.currentPeriod?.status ?? "No period yet"}</small>
          </article>
          <article>
            <span>Employees</span>
            <strong>{dashboard?.summary?.employees ?? 0}</strong>
            <small>Calculated results</small>
          </article>
          <article>
            <span>Gross payroll</span>
            <strong>₹{dashboard?.summary?.gross ?? "0.00"}</strong>
            <small>Configured snapshot</small>
          </article>
          <article>
            <span>Net payroll</span>
            <strong>₹{dashboard?.summary?.net ?? "0.00"}</strong>
            <small>After deductions</small>
          </article>
        </section>
        <section className="erp-section">
          <div className="erp-section-heading">
            <div>
              <p className="erp-kicker">Configuration</p>
              <h2>Payroll components</h2>
            </div>
            <span className="erp-section-count">{components.length} configured</span>
          </div>
          <form className="founder-form" onSubmit={createComponent}>
            <div className="founder-form-grid">
              <label>
                <span>Code</span>
                <input
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="BASIC"
                />
              </label>
              <label>
                <span>Name</span>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Basic salary"
                />
              </label>
              <label>
                <span>Type</span>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option>EARNING</option>
                  <option>DEDUCTION</option>
                  <option>EMPLOYER_CONTRIBUTION</option>
                </select>
              </label>
              <label>
                <span>Calculation</span>
                <select
                  value={form.calculationType}
                  onChange={(e) => setForm({ ...form, calculationType: e.target.value })}
                >
                  <option>FIXED</option>
                  <option>PERCENTAGE</option>
                  <option>MANUAL</option>
                </select>
              </label>
              <label>
                <span>Configured amount</span>
                <input
                  type="number"
                  step="0.01"
                  value={form.defaultValue}
                  onChange={(e) => setForm({ ...form, defaultValue: e.target.value })}
                />
              </label>
              <label>
                <span>Configured percentage</span>
                <input
                  type="number"
                  step="0.0001"
                  value={form.percentageValue}
                  onChange={(e) => setForm({ ...form, percentageValue: e.target.value })}
                />
              </label>
              <label className="founder-checkbox">
                <input
                  type="checkbox"
                  checked={form.isStatutory}
                  onChange={(e) => setForm({ ...form, isStatutory: e.target.checked })}
                />
                <span>Statutory label (configured only)</span>
              </label>
            </div>
            <button className="erp-button erp-button-primary" disabled={busy}>
              Add component ↗
            </button>
          </form>
          <div className="erp-notification-list">
            {components.map((item) => (
              <article className="erp-notification" key={item.id}>
                <div>
                  <h3>
                    {item.code} · {item.name}
                  </h3>
                  <p>
                    {item.type.replaceAll("_", " ")} · {item.calculationType} ·{" "}
                    {item.isStatutory ? "Configured statutory value" : "Organization value"}
                  </p>
                </div>
                <span>{item.defaultValue ?? item.percentageValue ?? "—"}</span>
              </article>
            ))}
          </div>
        </section>
        <section className="erp-section">
          <div className="erp-section-heading">
            <div>
              <p className="erp-kicker">Operations</p>
              <h2>Salary structures &amp; payroll runs</h2>
            </div>
          </div>
          <form className="founder-form" onSubmit={createStructure}>
            <div className="founder-form-grid">
              <label>
                <span>Structure name</span>
                <input
                  required
                  value={structureForm.name}
                  onChange={(e) => setStructureForm({ ...structureForm, name: e.target.value })}
                  placeholder="Engineering standard"
                />
              </label>
              <fieldset className="founder-checkbox">
                <legend>Included components</legend>
                {components.map((component) => (
                  <label key={component.id}>
                    <input
                      type="checkbox"
                      checked={structureForm.componentIds.includes(component.id)}
                      onChange={(e) =>
                        setStructureForm({
                          ...structureForm,
                          componentIds: e.target.checked
                            ? [...structureForm.componentIds, component.id]
                            : structureForm.componentIds.filter((id) => id !== component.id),
                        })
                      }
                    />
                    <span>
                      {component.code} · {component.name}
                    </span>
                  </label>
                ))}
              </fieldset>
            </div>
            <button className="erp-button erp-button-primary" disabled={busy || !components.length}>
              Create salary structure ↗
            </button>
          </form>
          <form className="founder-form" onSubmit={assignCompensation}>
            <div className="founder-form-grid">
              <label>
                <span>Employee</span>
                <select
                  required
                  value={compensationForm.employeeId}
                  onChange={(e) =>
                    setCompensationForm({ ...compensationForm, employeeId: e.target.value })
                  }
                >
                  <option value="">Select employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.employeeCode} · {employee.firstName} {employee.lastName}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Salary structure</span>
                <select
                  required
                  value={compensationForm.salaryStructureId}
                  onChange={(e) =>
                    setCompensationForm({ ...compensationForm, salaryStructureId: e.target.value })
                  }
                >
                  <option value="">Select structure</option>
                  {structures
                    .filter((structure) => structure.isActive)
                    .map((structure) => (
                      <option key={structure.id} value={structure.id}>
                        {structure.name}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                <span>Effective from</span>
                <input
                  required
                  type="date"
                  value={compensationForm.effectiveFrom}
                  onChange={(e) =>
                    setCompensationForm({ ...compensationForm, effectiveFrom: e.target.value })
                  }
                />
              </label>
              <label>
                <span>Annual CTC (optional)</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={compensationForm.annualCtc}
                  onChange={(e) =>
                    setCompensationForm({ ...compensationForm, annualCtc: e.target.value })
                  }
                />
              </label>
              <label>
                <span>Monthly gross target (optional)</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={compensationForm.monthlyGrossTarget}
                  onChange={(e) =>
                    setCompensationForm({ ...compensationForm, monthlyGrossTarget: e.target.value })
                  }
                />
              </label>
            </div>
            <button
              className="erp-button erp-button-primary"
              disabled={busy || !employees.length || !structures.length}
            >
              Assign compensation ↗
            </button>
          </form>
          <form className="founder-form" onSubmit={createPeriod}>
            <div className="founder-form-grid">
              <label>
                <span>Year</span>
                <input
                  required
                  type="number"
                  min="2000"
                  max="2200"
                  value={periodForm.year}
                  onChange={(e) => setPeriodForm({ ...periodForm, year: e.target.value })}
                />
              </label>
              <label>
                <span>Month</span>
                <input
                  required
                  type="number"
                  min="1"
                  max="12"
                  value={periodForm.month}
                  onChange={(e) => setPeriodForm({ ...periodForm, month: e.target.value })}
                />
              </label>
              <label>
                <span>Period starts</span>
                <input
                  required
                  type="date"
                  value={periodForm.startDate}
                  onChange={(e) => setPeriodForm({ ...periodForm, startDate: e.target.value })}
                />
              </label>
              <label>
                <span>Period ends</span>
                <input
                  required
                  type="date"
                  value={periodForm.endDate}
                  onChange={(e) => setPeriodForm({ ...periodForm, endDate: e.target.value })}
                />
              </label>
            </div>
            <button className="erp-button erp-button-primary" disabled={busy}>
              Create payroll period ↗
            </button>
          </form>
          <div className="erp-notification-list">
            {structures.map((s) => (
              <article className="erp-notification" key={s.id}>
                <div>
                  <h3>{s.name}</h3>
                  <p>{s.components?.length ?? 0} configured components</p>
                </div>
                <span>{s.isActive ? "Active" : "Inactive"}</span>
              </article>
            ))}
            {runs.map((run) => (
              <article className="erp-notification" key={run.id}>
                <div>
                  <h3>
                    Run · {run.period?.year}/{run.period?.month}
                  </h3>
                  <p>
                    {run.status} · {run._count?.results ?? 0} results
                  </p>
                </div>
                <div>
                  <span>{run.period?.status}</span>
                  <button
                    className="erp-text-button"
                    disabled={busy}
                    onClick={() => void reviewRun(run.id)}
                  >
                    Review results ↗
                  </button>
                  {run.status === "DRAFT" || run.status === "PROCESSING" ? (
                    <button
                      className="erp-text-button"
                      disabled={busy}
                      onClick={() => void runAction(run.id, "calculate")}
                    >
                      Calculate ↗
                    </button>
                  ) : null}
                  {run.status === "PROCESSING" ? (
                    <button
                      className="erp-text-button"
                      disabled={busy}
                      onClick={() => void runAction(run.id, "submit-review")}
                    >
                      Submit review ↗
                    </button>
                  ) : null}
                  {run.status === "REVIEW" ? (
                    <button
                      className="erp-text-button"
                      disabled={busy}
                      onClick={() => void runAction(run.id, "finalize")}
                    >
                      Finalize ↗
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
            {periods
              .filter((period) => !period.run && !["FINALIZED", "CLOSED"].includes(period.status))
              .map((period) => (
                <article className="erp-notification" key={period.id}>
                  <div>
                    <h3>
                      {period.year}/{String(period.month).padStart(2, "0")}
                    </h3>
                    <p>
                      {period.status} · {period.startDate?.slice(0, 10)} to{" "}
                      {period.endDate?.slice(0, 10)}
                    </p>
                  </div>
                  <button
                    className="erp-text-button"
                    disabled={busy}
                    onClick={() => void startRun(period.id)}
                  >
                    Start run ↗
                  </button>
                </article>
              ))}
            {!structures.length && !runs.length && (
              <div className="erp-empty">
                <strong>No structures or runs yet.</strong>
                <span>Create configured components first, then prepare a payroll period.</span>
              </div>
            )}
          </div>
          {selectedRun && (
            <div className="erp-notification-list" aria-live="polite">
              <div className="erp-section-heading">
                <div>
                  <p className="erp-kicker">Run review</p>
                  <h2>
                    {selectedRun.period?.year}/{String(selectedRun.period?.month).padStart(2, "0")}{" "}
                    results
                  </h2>
                </div>
                <button className="erp-text-button" onClick={() => setSelectedRun(null)}>
                  Close ×
                </button>
              </div>
              {(selectedRun.results ?? []).map((result: AnyRecord) => (
                <article className="erp-notification" key={result.id}>
                  <div>
                    <h3>
                      {result.employee?.firstName} {result.employee?.lastName}
                    </h3>
                    <p>
                      {result.employee?.employeeCode} · {result.status}
                    </p>
                  </div>
                  <div>
                    <span>Gross ₹{result.grossEarnings}</span>
                    <span>Deductions ₹{result.totalDeductions}</span>
                    <strong>Net ₹{result.netPay}</strong>
                  </div>
                </article>
              ))}
              {!(selectedRun.results ?? []).length && (
                <div className="erp-empty">
                  <strong>No calculated results yet.</strong>
                  <span>Calculate this run before submitting it for review.</span>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="erp-section" aria-label="Statutory compliance engine">
          <div className="erp-section-heading">
            <div>
              <p className="erp-kicker">Indian Statutory Compliance Engine · FY 2026-27</p>
              <h2>Payroll Statutory Inspector &amp; Proration Calculator</h2>
              <p>
                Real-time statutory engine verifying EPF/EPS ceiling splits (₹15,000 ceiling, ₹1,250 EPS cap),
                ESI semi-annual rules, Telangana Professional Tax slabs, and Section 192 TDS New Tax Regime.
              </p>
            </div>
            <span className="erp-section-count">Live Statutory Engine</span>
          </div>

          <div className="erp-form-grid" style={{ marginBottom: "1.5rem" }}>
            <label>
              <span>Basic salary (monthly)</span>
              <input
                type="number"
                min="0"
                step="500"
                value={simBasic}
                onChange={(e) => setSimBasic(e.target.value)}
              />
            </label>
            <label>
              <span>HRA (monthly)</span>
              <input
                type="number"
                min="0"
                step="500"
                value={simHra}
                onChange={(e) => setSimHra(e.target.value)}
              />
            </label>
            <label>
              <span>Special allowance (monthly)</span>
              <input
                type="number"
                min="0"
                step="500"
                value={simSpecial}
                onChange={(e) => setSimSpecial(e.target.value)}
              />
            </label>
            <label>
              <span>Loss of pay (LOP) days</span>
              <input
                type="number"
                min="0"
                max="31"
                value={simLop}
                onChange={(e) => setSimLop(e.target.value)}
              />
            </label>
            <label>
              <span>Calendar days in month</span>
              <input
                type="number"
                min="28"
                max="31"
                value={simWorkingDays}
                onChange={(e) => setSimWorkingDays(e.target.value)}
              />
            </label>
            <label>
              <span>Prior TDS paid in FY</span>
              <input
                type="number"
                min="0"
                step="500"
                value={simPriorTds}
                onChange={(e) => setSimPriorTds(e.target.value)}
              />
            </label>
            <label>
              <span>Remaining months in FY</span>
              <input
                type="number"
                min="1"
                max="12"
                value={simMonthsRemaining}
                onChange={(e) => setSimMonthsRemaining(e.target.value)}
              />
            </label>
          </div>

          <div className="erp-table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Statutory Head</th>
                  <th>Calculation Rule / Statutory Basis</th>
                  <th className="is-numeric">Employee Share (Deduction)</th>
                  <th className="is-numeric">Employer Share (CTC Cost)</th>
                  <th className="is-numeric">Total Remittance</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Prorated Earnings</strong>
                    <small>LOP Factor: {(simResult.prorationFactor * 100).toFixed(1)}% ({simResult.payableDays}/{simResult.workingDays} days)</small>
                  </td>
                  <td>Basic: ₹{simResult.basic.toLocaleString("en-IN")} + HRA: ₹{simResult.hra.toLocaleString("en-IN")} + Allowances: ₹{simResult.specialAllowance.toLocaleString("en-IN")}</td>
                  <td className="is-numeric">—</td>
                  <td className="is-numeric">—</td>
                  <td className="is-numeric"><strong>₹{simResult.grossEarnings.toLocaleString("en-IN")}</strong></td>
                </tr>
                <tr>
                  <td>
                    <strong>Employees Provident Fund (EPF &amp; EPS)</strong>
                    <small>EPFO Act 1952 · ₹15,000 wage ceiling</small>
                  </td>
                  <td>
                    Employee 12% (₹{simResult.epf.employeePf.toLocaleString("en-IN")}) | EPS 8.33% capped at ₹{simResult.epf.eps.toLocaleString("en-IN")} + EPF balance ₹{simResult.epf.employerEpf.toLocaleString("en-IN")}
                  </td>
                  <td className="is-numeric">₹{simResult.epf.employeePf.toLocaleString("en-IN")}</td>
                  <td className="is-numeric">₹{(simResult.epf.employerEpf + simResult.epf.eps).toLocaleString("en-IN")}</td>
                  <td className="is-numeric">₹{(simResult.epf.employeePf + simResult.epf.employerEpf + simResult.epf.eps).toLocaleString("en-IN")}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Employees State Insurance (ESIC)</strong>
                    <small>ESIC Act 1948 · ₹21,000 gross ceiling</small>
                  </td>
                  <td>{simResult.esi.isCovered ? "0.75% employee + 3.25% employer" : "Exempt (Gross > ₹21,000 threshold)"}</td>
                  <td className="is-numeric">₹{simResult.esi.employeeEsi.toLocaleString("en-IN")}</td>
                  <td className="is-numeric">₹{simResult.esi.employerEsi.toLocaleString("en-IN")}</td>
                  <td className="is-numeric">₹{(simResult.esi.employeeEsi + simResult.esi.employerEsi).toLocaleString("en-IN")}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Telangana Professional Tax (PT)</strong>
                    <small>Telangana PT Act 1987 Slabs</small>
                  </td>
                  <td>Gross &gt; ₹20k: ₹200/mo | ₹15k-₹20k: ₹150/mo | &le; ₹15k: Nil</td>
                  <td className="is-numeric">₹{simResult.professionalTax.toLocaleString("en-IN")}</td>
                  <td className="is-numeric">—</td>
                  <td className="is-numeric">₹{simResult.professionalTax.toLocaleString("en-IN")}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Income Tax TDS (Section 192)</strong>
                    <small>New Tax Regime FY 2026-27 (Standard Deduction ₹75k)</small>
                  </td>
                  <td>
                    Taxable: ₹{simResult.tds.taxableIncome.toLocaleString("en-IN")} | Rebate u/s 87A: ₹{simResult.tds.rebate87A.toLocaleString("en-IN")} | Cess: ₹{simResult.tds.cess.toLocaleString("en-IN")}
                  </td>
                  <td className="is-numeric">₹{simResult.tds.monthlyTds.toLocaleString("en-IN")}</td>
                  <td className="is-numeric">—</td>
                  <td className="is-numeric">₹{simResult.tds.monthlyTds.toLocaleString("en-IN")}</td>
                </tr>
                <tr style={{ background: "rgba(0, 0, 0, 0.03)", fontWeight: "bold" }}>
                  <td>
                    <strong>Net Payout &amp; Total CTC Cost</strong>
                    <small>Total Deductions: ₹{simResult.totalDeductions.toLocaleString("en-IN")}</small>
                  </td>
                  <td>Take-home: ₹{simResult.netPay.toLocaleString("en-IN")} | Employer Contribution: ₹{simResult.totalEmployerContribution.toLocaleString("en-IN")}</td>
                  <td className="is-numeric" style={{ color: "#d97706" }}>₹{simResult.totalDeductions.toLocaleString("en-IN")}</td>
                  <td className="is-numeric" style={{ color: "#2563eb" }}>₹{simResult.totalEmployerContribution.toLocaleString("en-IN")}</td>
                  <td className="is-numeric" style={{ color: "#16a34a" }}>₹{simResult.netPay.toLocaleString("en-IN")} (Net Pay)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
export function FounderPayroll() {
  return (
    <ProtectedErp requiredPayroll>
      <FounderPayrollContent />
    </ProtectedErp>
  );
}
