"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState, type FormEvent } from "react";

import { FounderModuleNavigation } from "@/app/erp/components/FounderModuleNavigation";
import { ProtectedErp } from "@/app/erp/components/ProtectedErp";
import { useErpAuth } from "@/app/erp/components/AuthProvider";
import { ApiError, apiFetchV2 } from "@/lib/api/client";
import type { ApiResponse, ComplianceObligation, HrEmployeeSummary } from "@/lib/api/types";

type ApiList<T> = { success: true; data: T[]; meta?: { total: number } };

const pretty = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const dateValue = (value: string) => new Date(value).toLocaleDateString("en-IN");

const emptyObligation = {
  code: "",
  title: "",
  category: "TAX",
  authority: "",
  frequency: "QUARTERLY",
  dueDate: "",
  ownerEmployeeId: "",
};

async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

function FounderComplianceContent() {
  const { context } = useErpAuth();
  const [obligations, setObligations] = useState<ComplianceObligation[]>([]);
  const [selected, setSelected] = useState<ComplianceObligation | null>(null);
  const [employees, setEmployees] = useState<HrEmployeeSummary[]>([]);
  const [form, setForm] = useState(emptyObligation);
  const [evidence, setEvidence] = useState({ title: "", documentUrl: "" });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const canManage = Boolean(context?.permissions.includes("compliance.manage"));

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetchV2<ApiList<ComplianceObligation>>("/compliance/obligations?limit=100");
      setObligations(response.data);
      const employeeRes = await safe<ApiList<HrEmployeeSummary>>(
        apiFetchV2("/hr/employees?limit=100"),
        { success: true, data: [] },
      );
      setEmployees(employeeRes.data);
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Compliance workspace could not load.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function openObligation(id: string) {
    setError(null);
    try {
      const response = await apiFetchV2<ApiResponse<ComplianceObligation>>(`/compliance/obligations/${id}`);
      setSelected(response.data);
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Obligation details could not load.");
    }
  }

  async function runAction(action: () => Promise<unknown>, success: string) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await action();
      setNotice(success);
      await load();
      if (selected) await openObligation(selected.id);
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "The action could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  async function createObligation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runAction(
      () =>
        apiFetchV2("/compliance/obligations", {
          method: "POST",
          body: JSON.stringify({
            code: form.code,
            title: form.title,
            category: form.category,
            authority: form.authority || undefined,
            frequency: form.frequency,
            dueDate: form.dueDate,
            ownerEmployeeId: form.ownerEmployeeId || undefined,
          }),
        }),
      "Obligation registered on the calendar.",
    );
    setForm(emptyObligation);
  }

  async function addEvidence(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    await runAction(
      () =>
        apiFetchV2(`/compliance/obligations/${selected.id}/evidence`, {
          method: "POST",
          body: JSON.stringify({
            title: evidence.title,
            documentUrl: evidence.documentUrl || undefined,
          }),
        }),
      "Evidence attached.",
    );
    setEvidence({ title: "", documentUrl: "" });
  }

  const overdue = obligations.filter(
    (item) => new Date(item.dueDate) < new Date() && !["COMPLETED", "WAIVED"].includes(item.status),
  ).length;

  return (
    <main className="erp-main">
      <div className="erp-content">
        <FounderModuleNavigation active="compliance" />

        <section className="erp-welcome">
          <div>
            <p className="erp-kicker">Regulatory calendar · evidence backed</p>
            <h1>
              Compliance <em>calendar</em>
            </h1>
            <p>
              Track statutory obligations by due date, attach filing evidence, and move each
              obligation from pending through submission to completion.
            </p>
          </div>
          <div className="erp-welcome-code">
            <span>Overdue</span>
            <strong>{overdue}</strong>
          </div>
        </section>

        {error ? <div className="erp-error" role="alert">{error}</div> : null}
        {notice ? <div className="erp-success" role="status">{notice}</div> : null}

        {canManage ? (
          <section className="erp-section">
            <div className="erp-section-heading"><div><p className="erp-kicker">New obligation</p><h2>Register obligation</h2></div></div>
            <form className="founder-form" onSubmit={(event) => void createObligation(event)}>
              <div className="founder-form-grid">
                <label><span>Reference code</span><input required value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} /></label>
                <label><span>Category</span><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{["TAX", "LABOUR", "CORPORATE", "DATA_PRIVACY", "ENVIRONMENTAL", "LICENSING", "OTHER"].map((item) => <option key={item} value={item}>{pretty(item)}</option>)}</select></label>
                <label><span>Frequency</span><select value={form.frequency} onChange={(event) => setForm({ ...form, frequency: event.target.value })}>{["ONE_TIME", "MONTHLY", "QUARTERLY", "HALF_YEARLY", "ANNUAL"].map((item) => <option key={item} value={item}>{pretty(item)}</option>)}</select></label>
                <label><span>Due date</span><input required type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} /></label>
                <label><span>Authority</span><input value={form.authority} onChange={(event) => setForm({ ...form, authority: event.target.value })} /></label>
                <label><span>Owner</span><select value={form.ownerEmployeeId} onChange={(event) => setForm({ ...form, ownerEmployeeId: event.target.value })}><option value="">Unassigned</option>{employees.map((item) => <option key={item.id} value={item.id}>{item.firstName} {item.lastName}</option>)}</select></label>
                <label className="founder-form-wide"><span>Title</span><input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
              </div>
              <button className="erp-button erp-button-primary" disabled={busy}>Register obligation ↗</button>
            </form>
          </section>
        ) : null}

        {loading ? (
          <div className="erp-state" role="status"><span className="erp-loader" aria-hidden="true" /><p>Loading compliance calendar</p></div>
        ) : null}

        {!loading ? (
          <section className="erp-section">
            <div className="erp-section-heading"><div><p className="erp-kicker">Calendar</p><h2>Obligations</h2></div></div>
            {obligations.length === 0 ? <div className="erp-empty"><strong>No obligations yet.</strong><span>Register a statutory obligation to track it.</span></div> : (
              <div className="erp-notification-list">
                {obligations.map((item) => (
                  <article className="erp-notification" key={item.id}>
                    <div><span className="founder-org-code">{item.code}</span><h3>{item.title}</h3><p>{pretty(item.category)} · {pretty(item.frequency)} · due {dateValue(item.dueDate)}</p></div>
                    <div className="founder-org-row-actions">
                      <strong className="founder-status">{pretty(item.status)}</strong>
                      <button type="button" className="erp-text-button" onClick={() => void openObligation(item.id)}>Open</button>
                      {canManage && item.status === "PENDING" ? <button type="button" className="erp-text-button" disabled={busy} onClick={() => void runAction(() => apiFetchV2(`/compliance/obligations/${item.id}/start`, { method: "POST" }), "Obligation in progress.")}>Start</button> : null}
                      {canManage && item.status === "IN_PROGRESS" ? <button type="button" className="erp-text-button" disabled={busy} onClick={() => void runAction(() => apiFetchV2(`/compliance/obligations/${item.id}/submit`, { method: "POST" }), "Obligation submitted.")}>Submit</button> : null}
                      {canManage && item.status === "SUBMITTED" ? <button type="button" className="erp-text-button" disabled={busy} onClick={() => void runAction(() => apiFetchV2(`/compliance/obligations/${item.id}/complete`, { method: "POST" }), "Obligation completed.")}>Complete</button> : null}
                      {canManage && !["COMPLETED", "WAIVED"].includes(item.status) ? <button type="button" className="erp-text-button" disabled={busy} onClick={() => void runAction(() => apiFetchV2(`/compliance/obligations/${item.id}/waive`, { method: "POST" }), "Obligation waived.")}>Waive</button> : null}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {selected ? (
          <section className="erp-section">
            <div className="erp-section-heading"><div><p className="erp-kicker">{pretty(selected.status)} · due {dateValue(selected.dueDate)}</p><h2>{selected.title}</h2><p>{selected.code}{selected.authority ? ` · ${selected.authority}` : ""}</p></div></div>
            <div className="erp-notification-list">
              {(selected.evidence ?? []).length === 0 ? <div className="erp-empty"><strong>No evidence yet.</strong><span>Attach filing evidence before submitting.</span></div> : null}
              {(selected.evidence ?? []).map((item) => (
                <article className="erp-notification" key={item.id}>
                  <div><h3>{item.title}</h3><p>{item.documentUrl ?? item.note ?? "No document link"}</p></div>
                </article>
              ))}
            </div>
            {canManage && !["COMPLETED", "WAIVED"].includes(selected.status) ? (
              <form className="founder-form" onSubmit={(event) => void addEvidence(event)}>
                <div className="founder-form-grid">
                  <label><span>Evidence title</span><input required value={evidence.title} onChange={(event) => setEvidence({ ...evidence, title: event.target.value })} /></label>
                  <label><span>HTTPS document URL</span><input type="url" pattern="https://.*" value={evidence.documentUrl} onChange={(event) => setEvidence({ ...evidence, documentUrl: event.target.value })} /></label>
                </div>
                <button className="erp-button erp-button-primary" disabled={busy}>Add evidence ↗</button>
              </form>
            ) : null}
          </section>
        ) : null}
      </div>
    </main>
  );
}

export function FounderCompliance() {
  return (
    <ProtectedErp requiredCompliance>
      <FounderComplianceContent />
    </ProtectedErp>
  );
}
