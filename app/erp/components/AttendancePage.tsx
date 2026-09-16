"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { apiFetchV2, ApiError } from "@/lib/api/client";
import type { ApiResponse, AttendanceRecord, AttendanceSummary } from "@/lib/api/types";
import { ErpLoading, ProtectedErp } from "./ProtectedErp";
import type { DivisionSlug } from "@/lib/erp/divisions";

function businessDate() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}
function AttendanceContent({ management = false }: { management?: boolean }) {
  const [record, setRecord] = useState<AttendanceRecord | null>(null);
  const [rows, setRows] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [selectedDate, setSelectedDate] = useState(businessDate());
  const [status, setStatus] = useState("");
  const [correction, setCorrection] = useState({
    id: "",
    status: "PRESENT",
    checkInAt: "",
    checkOutAt: "",
    reason: "",
  });
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (management) {
        const query = `/attendance?from=${selectedDate}&to=${selectedDate}&limit=100${status ? `&status=${status}` : ""}`;
        const [list, summaryResponse] = await Promise.all([
          apiFetchV2<{ data: AttendanceRecord[] }>(query),
          apiFetchV2<ApiResponse<AttendanceSummary>>(`/attendance/summary?date=${selectedDate}`),
        ]);
        setRows(list.data);
        setSummary(summaryResponse.data);
      } else {
        const [current, list] = await Promise.all([
          apiFetchV2<ApiResponse<AttendanceRecord>>(`/attendance/me/today`),
          apiFetchV2<{ data: AttendanceRecord[] }>(`/attendance/me?limit=31`),
        ]);
        setRecord(current.data);
        setRows(list.data);
      }
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Attendance could not load.");
    } finally {
      setLoading(false);
    }
  }, [management, selectedDate, status]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  async function action(path: string) {
    setBusy(true);
    setError(null);
    try {
      await apiFetchV2<ApiResponse<AttendanceRecord>>(path, { method: "POST" });
      await load();
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Attendance action failed.");
    } finally {
      setBusy(false);
    }
  }
  async function correct(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await apiFetchV2(`/attendance/${correction.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: correction.status,
          checkInAt: correction.checkInAt || undefined,
          checkOutAt: correction.checkOutAt || undefined,
          reason: correction.reason,
        }),
      });
      setCorrection({ id: "", status: "PRESENT", checkInAt: "", checkOutAt: "", reason: "" });
      await load();
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Attendance correction failed.");
    } finally {
      setBusy(false);
    }
  }
  if (loading) return <ErpLoading label="Loading attendance" />;
  return (
    <main className="erp-main">
      <div className="erp-content">
        <section className="erp-welcome">
          <div>
            <p className="erp-kicker">People operations</p>
            <h1>{management ? "Attendance control" : "My attendance"}</h1>
            <p>
              {management
                ? "A clear, auditable view of attendance across the organization."
                : "Check in, check out, and keep your workday record accurate."}
            </p>
          </div>
          <div className="erp-welcome-code">
            <span>Business date</span>
            <strong>{management ? selectedDate : businessDate()}</strong>
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
        {management && (
          <>
            <section className="erp-kpi-grid" aria-label="Attendance summary">
              <article>
                <span>Expected</span>
                <strong>{summary?.employeesExpected ?? "—"}</strong>
              </article>
              <article>
                <span>Present</span>
                <strong>{summary?.present ?? "—"}</strong>
              </article>
              <article>
                <span>On leave</span>
                <strong>{summary?.onLeave ?? "—"}</strong>
              </article>
              <article>
                <span>Missing checkout</span>
                <strong>{summary?.missingCheckout ?? "—"}</strong>
              </article>
            </section>
            <section className="erp-section">
              <div className="founder-filters">
                <label>
                  <span>Date</span>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </label>
                <label>
                  <span>Status</span>
                  <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="">All statuses</option>
                    <option value="PRESENT">Present</option>
                    <option value="REMOTE">Remote</option>
                    <option value="HALF_DAY">Half day</option>
                    <option value="MISSING_CHECKOUT">Missing checkout</option>
                    <option value="ON_LEAVE">On leave</option>
                  </select>
                </label>
              </div>
            </section>
          </>
        )}
        {!management && (
          <section className="erp-section">
            <div className="erp-section-heading">
              <div>
                <p className="erp-kicker">Today</p>
                <h2>{record ? record.status.replaceAll("_", " ") : "Not checked in"}</h2>
              </div>
              <div className="founder-dialog-actions">
                <button
                  className="erp-button erp-button-primary"
                  disabled={busy || Boolean(record?.checkInAt)}
                  onClick={() => void action("/attendance/me/check-in")}
                >
                  Check in
                </button>
                <button
                  className="erp-button"
                  disabled={busy || !record?.checkInAt || Boolean(record?.checkOutAt)}
                  onClick={() => void action("/attendance/me/check-out")}
                >
                  Check out
                </button>
              </div>
            </div>
            <p className="erp-form-note">
              {record?.checkInAt
                ? `Started ${new Date(record.checkInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : "Your business-day clock starts when you check in."}
              {record?.checkOutAt
                ? ` · Finished ${new Date(record.checkOutAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : ""}
            </p>
          </section>
        )}
        {management ? (
          <section className="erp-section">
            <div className="erp-section-heading">
              <div>
                <p className="erp-kicker">Register</p>
                <h2>Attendance records</h2>
              </div>
              <span className="erp-section-count">{rows.length} records</span>
            </div>
            <div className="erp-notification-list">
              {rows.length ? (
                rows.map((row) => (
                  <article className="erp-notification" key={row.id}>
                    <div>
                      <h3>
                        {row.employee?.firstName} {row.employee?.lastName}
                      </h3>
                      <p>
                        {row.employee?.division?.name ?? "Organization"} ·{" "}
                        {row.status.replaceAll("_", " ")}
                      </p>
                    </div>
                    <div className="founder-dialog-actions">
                      <time>
                        {row.checkInAt
                          ? new Date(row.checkInAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}{" "}
                        →{" "}
                        {row.checkOutAt
                          ? new Date(row.checkOutAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </time>
                      <button
                        className="erp-text-button"
                        onClick={() =>
                          setCorrection({
                            id: row.id,
                            status: row.status,
                            checkInAt: row.checkInAt ? row.checkInAt.slice(0, 16) : "",
                            checkOutAt: row.checkOutAt ? row.checkOutAt.slice(0, 16) : "",
                            reason: "",
                          })
                        }
                      >
                        Correct
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="erp-empty">
                  <strong>No records yet.</strong>
                  <span>Attendance appears here as people check in.</span>
                </div>
              )}
            </div>
          </section>
        ) : (
          <section className="erp-section">
            <div className="erp-section-heading">
              <div>
                <p className="erp-kicker">Recent history</p>
                <h2>My attendance</h2>
              </div>
            </div>
            <div className="erp-notification-list">
              {rows.map((row) => (
                <article className="erp-notification" key={row.id}>
                  <div>
                    <h3>
                      {new Date(row.businessDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </h3>
                    <p>{row.status.replaceAll("_", " ")}</p>
                  </div>
                  <time>
                    {row.checkInAt
                      ? new Date(row.checkInAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </time>
                </article>
              ))}
            </div>
          </section>
        )}
        {management && correction.id && (
          <section className="erp-section">
            <div className="erp-section-heading">
              <div>
                <p className="erp-kicker">Manual correction</p>
                <h2>Correct attendance</h2>
              </div>
            </div>
            <form className="founder-form" onSubmit={(e) => void correct(e)}>
              <div className="founder-form-grid">
                <label>
                  <span>Status</span>
                  <select
                    value={correction.status}
                    onChange={(e) => setCorrection({ ...correction, status: e.target.value })}
                  >
                    <option value="PRESENT">Present</option>
                    <option value="REMOTE">Remote</option>
                    <option value="HALF_DAY">Half day</option>
                    <option value="ABSENT">Absent</option>
                    <option value="ON_LEAVE">On leave</option>
                    <option value="MISSING_CHECKOUT">Missing checkout</option>
                  </select>
                </label>
                <label>
                  <span>Check in</span>
                  <input
                    type="datetime-local"
                    value={correction.checkInAt}
                    onChange={(e) => setCorrection({ ...correction, checkInAt: e.target.value })}
                  />
                </label>
                <label>
                  <span>Check out</span>
                  <input
                    type="datetime-local"
                    value={correction.checkOutAt}
                    onChange={(e) => setCorrection({ ...correction, checkOutAt: e.target.value })}
                  />
                </label>
                <label>
                  <span>Required reason</span>
                  <input
                    required
                    value={correction.reason}
                    onChange={(e) => setCorrection({ ...correction, reason: e.target.value })}
                  />
                </label>
              </div>
              <button className="erp-button erp-button-primary" disabled={busy}>
                Save correction ↗
              </button>
            </form>
          </section>
        )}
      </div>
    </main>
  );
}
export function AttendancePage({
  management = false,
  divisionSlug,
}: {
  management?: boolean;
  divisionSlug?: DivisionSlug;
}) {
  return (
    <ProtectedErp requiredDivision={divisionSlug} requiredExecutive={management}>
      <AttendanceContent management={management} />
    </ProtectedErp>
  );
}
