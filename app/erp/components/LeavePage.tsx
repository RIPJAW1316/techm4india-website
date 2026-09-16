"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { apiFetchV2, ApiError } from "@/lib/api/client";
import type {
  ApiResponse,
  Holiday,
  LeaveApplication,
  LeaveBalance,
  LeaveType,
} from "@/lib/api/types";
import { ErpLoading, ProtectedErp } from "./ProtectedErp";
import type { DivisionSlug } from "@/lib/erp/divisions";

type TypeForm = {
  id?: string;
  code: string;
  name: string;
  annualAllowance: string;
  balanceTracked: boolean;
  isActive: boolean;
};
type HolidayForm = {
  id?: string;
  name: string;
  date: string;
  type: string;
  divisionId: string;
  branchId: string;
};
const emptyType: TypeForm = {
  code: "",
  name: "",
  annualAllowance: "",
  balanceTracked: false,
  isActive: true,
};
const emptyHoliday: HolidayForm = {
  name: "",
  date: "",
  type: "COMPANY",
  divisionId: "",
  branchId: "",
};

function LeaveContent({ management = false }: { management?: boolean }) {
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [apps, setApps] = useState<LeaveApplication[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [divisions, setDivisions] = useState<{ id: string; name: string }[]>([]);
  const [branches, setBranches] = useState<{ id: string; name: string; code?: string }[]>([]);
  const [form, setForm] = useState({ leaveTypeId: "", startDate: "", endDate: "", reason: "" });
  const [typeForm, setTypeForm] = useState<TypeForm>(emptyType);
  const [holidayForm, setHolidayForm] = useState<HolidayForm>(emptyHoliday);
  const [adjustment, setAdjustment] = useState({ balanceId: "", amount: "", reason: "" });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tr, br, ar, hr] = await Promise.all([
        apiFetchV2<ApiResponse<LeaveType[]>>("/leave/types"),
        apiFetchV2<ApiResponse<LeaveBalance[]>>(
          management ? "/leave/balances" : "/leave/me/balances",
        ),
        apiFetchV2<{ data: LeaveApplication[] }>(
          management ? "/leave/applications?limit=100" : "/leave/me/applications?limit=100",
        ),
        apiFetchV2<{ data: Holiday[] }>("/holidays?limit=100"),
      ]);
      setTypes(tr.data);
      setBalances(br.data);
      setApps(ar.data);
      setHolidays(hr.data);
      if (management) {
        const [dr, rr] = await Promise.all([
          apiFetchV2<ApiResponse<{ id: string; name: string }[]>>("/company/divisions?limit=100"),
          apiFetchV2<{ data: { id: string; name: string; code?: string }[] }>(
            "/company/branches?limit=100",
          ),
        ]);
        setDivisions(dr.data);
        setBranches(rr.data);
      }
      setForm((v) => (v.leaveTypeId || !tr.data[0] ? v : { ...v, leaveTypeId: tr.data[0].id }));
      setAdjustment((v) => (v.balanceId || !br.data[0] ? v : { ...v, balanceId: br.data[0].id }));
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Leave workspace could not load.");
    } finally {
      setLoading(false);
    }
  }, [management]);
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  async function request(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await apiFetchV2("/leave/me/applications", { method: "POST", body: JSON.stringify(form) });
      setForm((v) => ({ ...v, startDate: "", endDate: "", reason: "" }));
      await load();
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Leave request failed.");
    } finally {
      setBusy(false);
    }
  }
  async function review(id: string, status: "approve" | "reject") {
    setBusy(true);
    try {
      await apiFetchV2(`/leave/applications/${id}/${status}`, {
        method: "POST",
        body: JSON.stringify(status === "reject" ? { comment: "Reviewed by operations" } : {}),
      });
      await load();
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Review failed.");
    } finally {
      setBusy(false);
    }
  }
  async function cancel(id: string) {
    setBusy(true);
    try {
      await apiFetchV2(`/leave/me/applications/${id}/cancel`, { method: "POST" });
      await load();
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Cancellation failed.");
    } finally {
      setBusy(false);
    }
  }
  async function saveType(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const body = {
        code: typeForm.code,
        name: typeForm.name,
        annualAllowance: typeForm.annualAllowance ? Number(typeForm.annualAllowance) : undefined,
        balanceTracked: typeForm.balanceTracked,
        isActive: typeForm.isActive,
      };
      await apiFetchV2(typeForm.id ? `/leave/types/${typeForm.id}` : "/leave/types", {
        method: typeForm.id ? "PATCH" : "POST",
        body: JSON.stringify(body),
      });
      setTypeForm(emptyType);
      await load();
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Leave type could not be saved.");
    } finally {
      setBusy(false);
    }
  }
  async function saveHoliday(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const body = {
        name: holidayForm.name,
        date: holidayForm.date,
        type: holidayForm.type,
        divisionId: holidayForm.divisionId || undefined,
        branchId: holidayForm.branchId || undefined,
      };
      await apiFetchV2(holidayForm.id ? `/holidays/${holidayForm.id}` : "/holidays", {
        method: holidayForm.id ? "PATCH" : "POST",
        body: JSON.stringify(body),
      });
      setHolidayForm(emptyHoliday);
      await load();
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Holiday could not be saved.");
    } finally {
      setBusy(false);
    }
  }
  async function adjust(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await apiFetchV2(`/leave/balances/${adjustment.balanceId}/adjust`, {
        method: "POST",
        body: JSON.stringify({ amount: Number(adjustment.amount), reason: adjustment.reason }),
      });
      setAdjustment((v) => ({ ...v, amount: "", reason: "" }));
      await load();
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Balance could not be adjusted.");
    } finally {
      setBusy(false);
    }
  }
  if (loading) return <ErpLoading label="Loading leave workspace" />;
  return (
    <main className="erp-main">
      <div className="erp-content">
        <section className="erp-welcome">
          <div>
            <p className="erp-kicker">People operations</p>
            <h1>{management ? "Leave control" : "My leave"}</h1>
            <p>
              {management
                ? "Review requests and maintain transparent leave policy."
                : "Plan time away with a transparent, auditable workflow."}
            </p>
          </div>
          <div className="erp-welcome-code">
            <span>Leave types</span>
            <strong>{types.length}</strong>
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
        <section className="erp-kpi-grid">
          {balances.slice(0, 4).map((b) => (
            <article key={b.id}>
              <span>{b.leaveType.name}</span>
              <strong>
                {Math.max(0, b.openingBalance + b.accrued + b.adjusted + b.carriedForward - b.used)}
              </strong>
              <small>Available days</small>
            </article>
          ))}
          {!balances.length && (
            <article>
              <span>Balances</span>
              <strong>—</strong>
              <small>Set by HR when policy is configured</small>
            </article>
          )}
        </section>
        {management && (
          <>
            <section className="erp-section">
              <div className="erp-section-heading">
                <div>
                  <p className="erp-kicker">Controlled policy</p>
                  <h2>Leave type management</h2>
                </div>
              </div>
              <form className="founder-form" onSubmit={(e) => void saveType(e)}>
                <div className="founder-form-grid">
                  <label>
                    <span>Code</span>
                    <input
                      required
                      value={typeForm.code}
                      onChange={(e) => setTypeForm({ ...typeForm, code: e.target.value })}
                    />
                  </label>
                  <label>
                    <span>Name</span>
                    <input
                      required
                      value={typeForm.name}
                      onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
                    />
                  </label>
                  <label>
                    <span>Annual allowance</span>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={typeForm.annualAllowance}
                      onChange={(e) =>
                        setTypeForm({ ...typeForm, annualAllowance: e.target.value })
                      }
                    />
                  </label>
                  <label className="founder-checkbox">
                    <input
                      type="checkbox"
                      checked={typeForm.balanceTracked}
                      onChange={(e) =>
                        setTypeForm({ ...typeForm, balanceTracked: e.target.checked })
                      }
                    />
                    <span>Track against a balance</span>
                  </label>
                  <label className="founder-checkbox">
                    <input
                      type="checkbox"
                      checked={typeForm.isActive}
                      onChange={(e) => setTypeForm({ ...typeForm, isActive: e.target.checked })}
                    />
                    <span>Active for applications</span>
                  </label>
                </div>
                <button className="erp-button erp-button-primary" disabled={busy}>
                  {typeForm.id ? "Save leave type ↗" : "Create leave type ↗"}
                </button>
                {typeForm.id && (
                  <button
                    type="button"
                    className="erp-text-button"
                    onClick={() => setTypeForm(emptyType)}
                  >
                    Cancel edit
                  </button>
                )}
              </form>
              <div className="erp-notification-list">
                {types.map((type) => (
                  <article className="erp-notification" key={type.id}>
                    <div>
                      <h3>
                        {type.code} · {type.name}
                      </h3>
                      <p>
                        {type.balanceTracked ? "Balance-controlled" : "Untracked"} ·{" "}
                        {type.isActive ? "Active" : "Inactive"}
                      </p>
                    </div>
                    <button
                      className="erp-text-button"
                      onClick={() =>
                        setTypeForm({
                          id: type.id,
                          code: type.code,
                          name: type.name,
                          annualAllowance: type.annualAllowance?.toString() ?? "",
                          balanceTracked: Boolean(type.balanceTracked),
                          isActive: type.isActive,
                        })
                      }
                    >
                      Edit
                    </button>
                    <button
                      className="erp-text-button"
                      onClick={() =>
                        void apiFetchV2(`/leave/types/${type.id}`, {
                          method: "PATCH",
                          body: JSON.stringify({ isActive: !type.isActive }),
                        })
                          .then(load)
                          .catch((reason) =>
                            setError(
                              reason instanceof ApiError ? reason.message : "Status update failed.",
                            ),
                          )
                      }
                    >
                      {type.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </article>
                ))}
              </div>
            </section>
            <section className="erp-section">
              <div className="erp-section-heading">
                <div>
                  <p className="erp-kicker">Adjustments</p>
                  <h2>Leave balances</h2>
                </div>
              </div>
              <form className="founder-form" onSubmit={(e) => void adjust(e)}>
                <div className="founder-form-grid">
                  <label>
                    <span>Employee balance</span>
                    <select
                      required
                      value={adjustment.balanceId}
                      onChange={(e) => setAdjustment({ ...adjustment, balanceId: e.target.value })}
                    >
                      <option value="">Choose balance</option>
                      {balances.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.employee ? `${b.employee.firstName} ${b.employee.lastName} · ` : ""}
                          {b.leaveType.name} · {b.year}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Adjustment amount</span>
                    <input
                      required
                      type="number"
                      step="0.5"
                      value={adjustment.amount}
                      onChange={(e) => setAdjustment({ ...adjustment, amount: e.target.value })}
                    />
                  </label>
                  <label>
                    <span>Reason</span>
                    <input
                      required
                      value={adjustment.reason}
                      onChange={(e) => setAdjustment({ ...adjustment, reason: e.target.value })}
                    />
                  </label>
                </div>
                <button
                  className="erp-button erp-button-primary"
                  disabled={busy || !adjustment.balanceId}
                >
                  Save adjustment ↗
                </button>
              </form>
            </section>
            <section className="erp-section">
              <div className="erp-section-heading">
                <div>
                  <p className="erp-kicker">Calendar</p>
                  <h2>Holiday management</h2>
                </div>
              </div>
              <form className="founder-form" onSubmit={(e) => void saveHoliday(e)}>
                <div className="founder-form-grid">
                  <label>
                    <span>Name</span>
                    <input
                      required
                      value={holidayForm.name}
                      onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
                    />
                  </label>
                  <label>
                    <span>Date</span>
                    <input
                      required
                      type="date"
                      value={holidayForm.date}
                      onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })}
                    />
                  </label>
                  <label>
                    <span>Type</span>
                    <select
                      value={holidayForm.type}
                      onChange={(e) => setHolidayForm({ ...holidayForm, type: e.target.value })}
                    >
                      <option value="COMPANY">Company</option>
                      <option value="NATIONAL">National</option>
                      <option value="OPTIONAL">Optional</option>
                      <option value="REGIONAL">Regional</option>
                    </select>
                  </label>
                  <label>
                    <span>Division scope</span>
                    <select
                      value={holidayForm.divisionId}
                      onChange={(e) =>
                        setHolidayForm({ ...holidayForm, divisionId: e.target.value })
                      }
                    >
                      <option value="">All divisions</option>
                      {divisions.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Branch scope</span>
                    <select
                      value={holidayForm.branchId}
                      onChange={(e) => setHolidayForm({ ...holidayForm, branchId: e.target.value })}
                    >
                      <option value="">All branches</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                          {b.code ? ` · ${b.code}` : ""}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <button className="erp-button erp-button-primary" disabled={busy}>
                  {holidayForm.id ? "Save holiday ↗" : "Create holiday ↗"}
                </button>
                {holidayForm.id && (
                  <button
                    type="button"
                    className="erp-text-button"
                    onClick={() => setHolidayForm(emptyHoliday)}
                  >
                    Cancel edit
                  </button>
                )}
              </form>
              <div className="erp-notification-list">
                {holidays.map((h) => (
                  <article className="erp-notification" key={h.id}>
                    <div>
                      <h3>{h.name}</h3>
                      <p>
                        {h.type}
                        {h.divisionId ? " · Division scoped" : " · Organization wide"}
                        {h.branchId ? " · Branch scoped" : ""}
                      </p>
                    </div>
                    <time>
                      {new Date(h.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </time>
                    <button
                      className="erp-text-button"
                      onClick={() =>
                        setHolidayForm({
                          id: h.id,
                          name: h.name,
                          date: h.date.slice(0, 10),
                          type: h.type,
                          divisionId: h.divisionId ?? "",
                          branchId: h.branchId ?? "",
                        })
                      }
                    >
                      Edit
                    </button>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
        {!management && (
          <section className="erp-section">
            <div className="erp-section-heading">
              <div>
                <p className="erp-kicker">Request time away</p>
                <h2>Apply for leave</h2>
              </div>
            </div>
            <form className="founder-form" onSubmit={(e) => void request(e)}>
              <div className="founder-form-grid">
                <label>
                  <span>Leave type</span>
                  <select
                    required
                    value={form.leaveTypeId}
                    onChange={(e) => setForm({ ...form, leaveTypeId: e.target.value })}
                  >
                    <option value="">Choose type</option>
                    {types.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Reason</span>
                  <input
                    required
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  />
                </label>
                <label>
                  <span>From</span>
                  <input
                    required
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  />
                </label>
                <label>
                  <span>To</span>
                  <input
                    required
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  />
                </label>
              </div>
              <button className="erp-button erp-button-primary" disabled={busy}>
                Submit request ↗
              </button>
            </form>
          </section>
        )}
        <section className="erp-section">
          <div className="erp-section-heading">
            <div>
              <p className="erp-kicker">Requests</p>
              <h2>{management ? "Team leave" : "My requests"}</h2>
            </div>
            <span className="erp-section-count">{apps.length}</span>
          </div>
          <div className="erp-notification-list">
            {apps.length ? (
              apps.map((a) => (
                <article className="erp-notification" key={a.id}>
                  <div>
                    <h3>
                      {a.leaveType.name} · {a.dayCount} day{a.dayCount === 1 ? "" : "s"}
                    </h3>
                    <p>
                      {a.employee ? `${a.employee.firstName} ${a.employee.lastName} · ` : ""}
                      {new Date(a.startDate).toLocaleDateString("en-IN")} –{" "}
                      {new Date(a.endDate).toLocaleDateString("en-IN")} · {a.status}
                    </p>
                  </div>
                  {management && a.status === "PENDING" ? (
                    <div className="founder-dialog-actions">
                      <button
                        className="erp-text-button"
                        disabled={busy}
                        onClick={() => void review(a.id, "reject")}
                      >
                        Reject
                      </button>
                      <button
                        className="erp-button erp-button-primary"
                        disabled={busy}
                        onClick={() => void review(a.id, "approve")}
                      >
                        Approve
                      </button>
                    </div>
                  ) : !management && a.status === "PENDING" ? (
                    <button
                      className="erp-text-button"
                      disabled={busy}
                      onClick={() => void cancel(a.id)}
                    >
                      Cancel
                    </button>
                  ) : (
                    <span>{a.reason}</span>
                  )}
                </article>
              ))
            ) : (
              <div className="erp-empty">
                <strong>No leave applications.</strong>
                <span>Requests will appear here.</span>
              </div>
            )}
          </div>
        </section>
        <section className="erp-section">
          <div className="erp-section-heading">
            <div>
              <p className="erp-kicker">Plan ahead</p>
              <h2>Holidays</h2>
            </div>
          </div>
          <div className="erp-notification-list">
            {holidays.map((h) => (
              <article className="erp-notification" key={h.id}>
                <div>
                  <h3>{h.name}</h3>
                  <p>
                    {h.type}
                    {h.isOptional ? " · Optional" : ""}
                  </p>
                </div>
                <time>
                  {new Date(h.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </time>
              </article>
            ))}
            {!holidays.length && (
              <div className="erp-empty">
                <strong>No holidays configured.</strong>
                <span>Official calendars are intentionally not fabricated.</span>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
export function LeavePage({
  management = false,
  divisionSlug,
}: {
  management?: boolean;
  divisionSlug?: DivisionSlug;
}) {
  return (
    <ProtectedErp requiredDivision={divisionSlug} requiredExecutive={management}>
      <LeaveContent management={management} />
    </ProtectedErp>
  );
}
