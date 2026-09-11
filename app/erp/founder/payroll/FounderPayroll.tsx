"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
import { FormEvent, useCallback, useEffect, useState } from "react";
import { apiFetch, apiFetchV2, ApiError } from "@/lib/api/client";
import { ErpLoading, ProtectedErp } from "@/app/erp/components/ProtectedErp";
import { FounderModuleNavigation } from "@/app/erp/components/FounderModuleNavigation";

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
      setError(
        reason instanceof ApiError
          ? reason.message
          : "Payroll workspace could not load.",
      );
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
          defaultValue: form.defaultValue
            ? Number(form.defaultValue)
            : undefined,
          percentageValue: form.percentageValue
            ? Number(form.percentageValue)
            : undefined,
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
      setError(
        reason instanceof ApiError
          ? reason.message
          : "Component could not be saved.",
      );
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
      setError(reason instanceof ApiError ? reason.message : "Salary structure could not be saved.");
    } finally { setBusy(false); }
  }
  async function assignCompensation(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await apiFetchV2(`/payroll/employees/${compensationForm.employeeId}/compensation`, {
        method: "POST",
        body: JSON.stringify({ salaryStructureId: compensationForm.salaryStructureId, effectiveFrom: compensationForm.effectiveFrom, annualCtc: compensationForm.annualCtc ? Number(compensationForm.annualCtc) : undefined, monthlyGrossTarget: compensationForm.monthlyGrossTarget ? Number(compensationForm.monthlyGrossTarget) : undefined }),
      });
      setCompensationForm({ employeeId: "", salaryStructureId: "", effectiveFrom: "", annualCtc: "", monthlyGrossTarget: "" });
      await load();
    } catch (reason) { setError(reason instanceof ApiError ? reason.message : "Compensation assignment could not be saved."); } finally { setBusy(false); }
  }
  async function createPeriod(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await apiFetchV2("/payroll/periods", { method: "POST", body: JSON.stringify({ year: Number(periodForm.year), month: Number(periodForm.month), startDate: periodForm.startDate, endDate: periodForm.endDate }) });
      setPeriodForm((current) => ({ ...current, startDate: "", endDate: "" }));
      await load();
    } catch (reason) { setError(reason instanceof ApiError ? reason.message : "Payroll period could not be saved."); } finally { setBusy(false); }
  }
  async function runAction(runId: string, action: "calculate" | "submit-review" | "finalize") {
    const label = action === "finalize" ? "Finalize this payroll run? Finalized payslips are immutable." : "";
    if (label && !window.confirm(label)) return;
    setBusy(true);
    try { await apiFetchV2(`/payroll/runs/${runId}/${action}`, { method: "POST" }); await load(); }
    catch (reason) { setError(reason instanceof ApiError ? reason.message : "Payroll action failed."); }
    finally { setBusy(false); }
  }
  async function startRun(payrollPeriodId: string) {
    setBusy(true);
    try { await apiFetchV2("/payroll/runs", { method: "POST", body: JSON.stringify({ payrollPeriodId }) }); await load(); }
    catch (reason) { setError(reason instanceof ApiError ? reason.message : "Payroll run could not start."); }
    finally { setBusy(false); }
  }
  async function reviewRun(runId: string) {
    setBusy(true);
    try {
      const response = await apiFetchV2<{ data: AnyRecord }>(`/payroll/runs/${runId}`);
      setSelectedRun(response.data);
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Payroll results could not load.");
    } finally { setBusy(false); }
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
            <p>
              Prepare, review, and finalize payroll with immutable historical
              snapshots.
            </p>
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
          Statutory payroll components and rates are organization-configured and
          should be reviewed by an authorized payroll/finance professional.
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
            <span className="erp-section-count">
              {components.length} configured
            </span>
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
                  onChange={(e) =>
                    setForm({ ...form, calculationType: e.target.value })
                  }
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
                  onChange={(e) =>
                    setForm({ ...form, defaultValue: e.target.value })
                  }
                />
              </label>
              <label>
                <span>Configured percentage</span>
                <input
                  type="number"
                  step="0.0001"
                  value={form.percentageValue}
                  onChange={(e) =>
                    setForm({ ...form, percentageValue: e.target.value })
                  }
                />
              </label>
              <label className="founder-checkbox">
                <input
                  type="checkbox"
                  checked={form.isStatutory}
                  onChange={(e) =>
                    setForm({ ...form, isStatutory: e.target.checked })
                  }
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
                    {item.isStatutory
                      ? "Configured statutory value"
                      : "Organization value"}
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
                <input required value={structureForm.name} onChange={(e) => setStructureForm({ ...structureForm, name: e.target.value })} placeholder="Engineering standard" />
              </label>
              <fieldset className="founder-checkbox">
                <legend>Included components</legend>
                {components.map((component) => (
                  <label key={component.id}>
                    <input type="checkbox" checked={structureForm.componentIds.includes(component.id)} onChange={(e) => setStructureForm({ ...structureForm, componentIds: e.target.checked ? [...structureForm.componentIds, component.id] : structureForm.componentIds.filter((id) => id !== component.id) })} />
                    <span>{component.code} · {component.name}</span>
                  </label>
                ))}
              </fieldset>
            </div>
            <button className="erp-button erp-button-primary" disabled={busy || !components.length}>Create salary structure ↗</button>
          </form>
          <form className="founder-form" onSubmit={assignCompensation}>
            <div className="founder-form-grid">
              <label><span>Employee</span><select required value={compensationForm.employeeId} onChange={(e) => setCompensationForm({ ...compensationForm, employeeId: e.target.value })}><option value="">Select employee</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.employeeCode} · {employee.firstName} {employee.lastName}</option>)}</select></label>
              <label><span>Salary structure</span><select required value={compensationForm.salaryStructureId} onChange={(e) => setCompensationForm({ ...compensationForm, salaryStructureId: e.target.value })}><option value="">Select structure</option>{structures.filter((structure) => structure.isActive).map((structure) => <option key={structure.id} value={structure.id}>{structure.name}</option>)}</select></label>
              <label><span>Effective from</span><input required type="date" value={compensationForm.effectiveFrom} onChange={(e) => setCompensationForm({ ...compensationForm, effectiveFrom: e.target.value })} /></label>
              <label><span>Annual CTC (optional)</span><input type="number" min="0" step="0.01" value={compensationForm.annualCtc} onChange={(e) => setCompensationForm({ ...compensationForm, annualCtc: e.target.value })} /></label>
              <label><span>Monthly gross target (optional)</span><input type="number" min="0" step="0.01" value={compensationForm.monthlyGrossTarget} onChange={(e) => setCompensationForm({ ...compensationForm, monthlyGrossTarget: e.target.value })} /></label>
            </div>
            <button className="erp-button erp-button-primary" disabled={busy || !employees.length || !structures.length}>Assign compensation ↗</button>
          </form>
          <form className="founder-form" onSubmit={createPeriod}>
            <div className="founder-form-grid">
              <label><span>Year</span><input required type="number" min="2000" max="2200" value={periodForm.year} onChange={(e) => setPeriodForm({ ...periodForm, year: e.target.value })} /></label>
              <label><span>Month</span><input required type="number" min="1" max="12" value={periodForm.month} onChange={(e) => setPeriodForm({ ...periodForm, month: e.target.value })} /></label>
              <label><span>Period starts</span><input required type="date" value={periodForm.startDate} onChange={(e) => setPeriodForm({ ...periodForm, startDate: e.target.value })} /></label>
              <label><span>Period ends</span><input required type="date" value={periodForm.endDate} onChange={(e) => setPeriodForm({ ...periodForm, endDate: e.target.value })} /></label>
            </div>
            <button className="erp-button erp-button-primary" disabled={busy}>Create payroll period ↗</button>
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
                  <button className="erp-text-button" disabled={busy} onClick={() => void reviewRun(run.id)}>Review results ↗</button>
                  {run.status === "DRAFT" || run.status === "PROCESSING" ? <button className="erp-text-button" disabled={busy} onClick={() => void runAction(run.id, "calculate")}>Calculate ↗</button> : null}
                  {run.status === "PROCESSING" ? <button className="erp-text-button" disabled={busy} onClick={() => void runAction(run.id, "submit-review")}>Submit review ↗</button> : null}
                  {run.status === "REVIEW" ? <button className="erp-text-button" disabled={busy} onClick={() => void runAction(run.id, "finalize")}>Finalize ↗</button> : null}
                </div>
              </article>
            ))}
            {periods.filter((period) => !period.run && !["FINALIZED", "CLOSED"].includes(period.status)).map((period) => (
              <article className="erp-notification" key={period.id}>
                <div><h3>{period.year}/{String(period.month).padStart(2, "0")}</h3><p>{period.status} · {period.startDate?.slice(0, 10)} to {period.endDate?.slice(0, 10)}</p></div>
                <button className="erp-text-button" disabled={busy} onClick={() => void startRun(period.id)}>Start run ↗</button>
              </article>
            ))}
            {!structures.length && !runs.length && (
              <div className="erp-empty">
                <strong>No structures or runs yet.</strong>
                <span>
                  Create configured components first, then prepare a payroll
                  period.
                </span>
              </div>
            )}
          </div>
          {selectedRun && (
            <div className="erp-notification-list" aria-live="polite">
              <div className="erp-section-heading">
                <div><p className="erp-kicker">Run review</p><h2>{selectedRun.period?.year}/{String(selectedRun.period?.month).padStart(2, "0")} results</h2></div>
                <button className="erp-text-button" onClick={() => setSelectedRun(null)}>Close ×</button>
              </div>
              {(selectedRun.results ?? []).map((result: AnyRecord) => (
                <article className="erp-notification" key={result.id}>
                  <div><h3>{result.employee?.firstName} {result.employee?.lastName}</h3><p>{result.employee?.employeeCode} · {result.status}</p></div>
                  <div><span>Gross ₹{result.grossEarnings}</span><span>Deductions ₹{result.totalDeductions}</span><strong>Net ₹{result.netPay}</strong></div>
                </article>
              ))}
              {!(selectedRun.results ?? []).length && <div className="erp-empty"><strong>No calculated results yet.</strong><span>Calculate this run before submitting it for review.</span></div>}
            </div>
          )}
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
