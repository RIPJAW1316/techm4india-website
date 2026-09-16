"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState, type FormEvent } from "react";

import { FounderModuleNavigation } from "@/app/erp/components/FounderModuleNavigation";
import { ProtectedErp } from "@/app/erp/components/ProtectedErp";
import { useErpAuth } from "@/app/erp/components/AuthProvider";
import { ApiError, apiFetchV2 } from "@/lib/api/client";
import type { ApiResponse, HrEmployeeSummary, SupportTicket } from "@/lib/api/types";

type ApiList<T> = { success: true; data: T[]; meta?: { total: number } };

const pretty = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const dateTime = (value: string) => new Date(value).toLocaleString("en-IN");

const emptyTicket = { subject: "", description: "", category: "TECHNICAL", priority: "MEDIUM" };

async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

function FounderSupportContent() {
  const { context } = useErpAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [employees, setEmployees] = useState<HrEmployeeSummary[]>([]);
  const [ticketForm, setTicketForm] = useState(emptyTicket);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const canResolve = Boolean(context?.permissions.includes("support.tickets.resolve"));

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const ticketRes = await apiFetchV2<ApiList<SupportTicket>>("/support/tickets?limit=100");
      setTickets(ticketRes.data);
      const employeeRes = await safe<ApiList<HrEmployeeSummary>>(
        apiFetchV2("/hr/employees?limit=100"),
        { success: true, data: [] },
      );
      setEmployees(employeeRes.data);
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Helpdesk workspace could not load.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function openTicket(id: string) {
    setError(null);
    try {
      const response = await apiFetchV2<ApiResponse<SupportTicket>>(`/support/tickets/${id}`);
      setSelected(response.data);
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Ticket details could not load.");
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
      if (selected) await openTicket(selected.id);
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "The action could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  async function raiseTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runAction(
      () =>
        apiFetchV2("/support/tickets", {
          method: "POST",
          body: JSON.stringify(ticketForm),
        }),
      "Ticket raised with an SLA target.",
    );
    setTicketForm(emptyTicket);
  }

  async function addComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || !comment.trim()) return;
    await runAction(
      () =>
        apiFetchV2(`/support/tickets/${selected.id}/comments`, {
          method: "POST",
          body: JSON.stringify({ body: comment }),
        }),
      "Comment added.",
    );
    setComment("");
  }

  return (
    <main className="erp-main">
      <div className="erp-content">
        <FounderModuleNavigation active="support" />

        <section className="erp-welcome">
          <div>
            <p className="erp-kicker">Helpdesk · SLA tracked</p>
            <h1>
              Support <em>desk</em>
            </h1>
            <p>
              Raise tickets with automatic SLA targets, triage and assign them to agents, and move
              each request through resolution to closure with a full comment trail.
            </p>
          </div>
          <div className="erp-welcome-code">
            <span>Open tickets</span>
            <strong>
              {tickets.filter((item) => !["RESOLVED", "CLOSED"].includes(item.status)).length}
            </strong>
          </div>
        </section>

        {error ? (
          <div className="erp-error" role="alert">
            {error}
          </div>
        ) : null}
        {notice ? (
          <div className="erp-success" role="status">
            {notice}
          </div>
        ) : null}

        <section className="erp-section">
          <div className="erp-section-heading">
            <div>
              <p className="erp-kicker">New request</p>
              <h2>Raise ticket</h2>
            </div>
          </div>
          <form className="founder-form" onSubmit={(event) => void raiseTicket(event)}>
            <div className="founder-form-grid">
              <label>
                <span>Category</span>
                <select
                  value={ticketForm.category}
                  onChange={(event) =>
                    setTicketForm({ ...ticketForm, category: event.target.value })
                  }
                >
                  {["TECHNICAL", "ACCESS", "HR", "FINANCE", "FACILITIES", "OTHER"].map((item) => (
                    <option key={item} value={item}>
                      {pretty(item)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Priority</span>
                <select
                  value={ticketForm.priority}
                  onChange={(event) =>
                    setTicketForm({ ...ticketForm, priority: event.target.value })
                  }
                >
                  {["LOW", "MEDIUM", "HIGH", "URGENT"].map((item) => (
                    <option key={item} value={item}>
                      {pretty(item)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="founder-form-wide">
                <span>Subject</span>
                <input
                  required
                  value={ticketForm.subject}
                  onChange={(event) =>
                    setTicketForm({ ...ticketForm, subject: event.target.value })
                  }
                />
              </label>
              <label className="founder-form-wide">
                <span>Description</span>
                <textarea
                  required
                  minLength={5}
                  value={ticketForm.description}
                  onChange={(event) =>
                    setTicketForm({ ...ticketForm, description: event.target.value })
                  }
                />
              </label>
            </div>
            <button className="erp-button erp-button-primary" disabled={busy}>
              Raise ticket ↗
            </button>
          </form>
        </section>

        {loading ? (
          <div className="erp-state" role="status">
            <span className="erp-loader" aria-hidden="true" />
            <p>Loading helpdesk</p>
          </div>
        ) : null}

        {!loading ? (
          <section className="erp-section">
            <div className="erp-section-heading">
              <div>
                <p className="erp-kicker">Queue</p>
                <h2>Tickets</h2>
              </div>
            </div>
            {tickets.length === 0 ? (
              <div className="erp-empty">
                <strong>No tickets yet.</strong>
                <span>Raise a ticket to start the queue.</span>
              </div>
            ) : (
              <div className="erp-notification-list">
                {tickets.map((item) => (
                  <article className="erp-notification" key={item.id}>
                    <div>
                      <span className="founder-org-code">{item.code}</span>
                      <h3>{item.subject}</h3>
                      <p>
                        {pretty(item.category)} · {pretty(item.priority)}
                        {item.assignee
                          ? ` · ${item.assignee.firstName} ${item.assignee.lastName}`
                          : " · unassigned"}
                      </p>
                      <small>{item.slaDueAt ? `SLA due ${dateTime(item.slaDueAt)}` : ""}</small>
                    </div>
                    <div className="founder-org-row-actions">
                      <strong className="founder-status">{pretty(item.status)}</strong>
                      <button
                        type="button"
                        className="erp-text-button"
                        onClick={() => void openTicket(item.id)}
                      >
                        Open
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {selected ? (
          <section className="erp-section">
            <div className="erp-section-heading">
              <div>
                <p className="erp-kicker">Ticket · {pretty(selected.status)}</p>
                <h2>{selected.subject}</h2>
                <p>
                  {selected.code} · {pretty(selected.category)} · {pretty(selected.priority)}
                </p>
              </div>
            </div>
            <p className="founder-form-note">{selected.description}</p>

            {canResolve ? (
              <div className="founder-org-row-actions">
                {selected.status !== "RESOLVED" && selected.status !== "CLOSED" ? (
                  <form
                    className="founder-inline-form"
                    onSubmit={(event) => {
                      event.preventDefault();
                      const data = new FormData(event.currentTarget);
                      const employeeId = String(data.get("employeeId") ?? "");
                      if (employeeId)
                        void runAction(
                          () =>
                            apiFetchV2(`/support/tickets/${selected.id}/assign`, {
                              method: "POST",
                              body: JSON.stringify({ assigneeEmployeeId: employeeId }),
                            }),
                          "Ticket assigned.",
                        );
                    }}
                  >
                    <select name="employeeId" defaultValue="">
                      <option value="">Assign to…</option>
                      {employees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.firstName} {employee.lastName}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="erp-text-button" disabled={busy}>
                      Assign
                    </button>
                  </form>
                ) : null}
                {selected.status === "IN_PROGRESS" ? (
                  <button
                    type="button"
                    className="erp-text-button"
                    disabled={busy}
                    onClick={() =>
                      void runAction(
                        () =>
                          apiFetchV2(`/support/tickets/${selected.id}/hold`, { method: "POST" }),
                        "Ticket on hold.",
                      )
                    }
                  >
                    Hold
                  </button>
                ) : null}
                {selected.status === "PENDING" ? (
                  <button
                    type="button"
                    className="erp-text-button"
                    disabled={busy}
                    onClick={() =>
                      void runAction(
                        () =>
                          apiFetchV2(`/support/tickets/${selected.id}/resume`, { method: "POST" }),
                        "Ticket resumed.",
                      )
                    }
                  >
                    Resume
                  </button>
                ) : null}
                {["IN_PROGRESS", "PENDING"].includes(selected.status) ? (
                  <button
                    type="button"
                    className="erp-text-button"
                    disabled={busy}
                    onClick={() =>
                      void runAction(
                        () =>
                          apiFetchV2(`/support/tickets/${selected.id}/resolve`, { method: "POST" }),
                        "Ticket resolved.",
                      )
                    }
                  >
                    Resolve
                  </button>
                ) : null}
                {selected.status === "RESOLVED" ? (
                  <button
                    type="button"
                    className="erp-text-button"
                    disabled={busy}
                    onClick={() =>
                      void runAction(
                        () =>
                          apiFetchV2(`/support/tickets/${selected.id}/close`, { method: "POST" }),
                        "Ticket closed.",
                      )
                    }
                  >
                    Close
                  </button>
                ) : null}
                {["RESOLVED", "CLOSED"].includes(selected.status) ? (
                  <button
                    type="button"
                    className="erp-text-button"
                    disabled={busy}
                    onClick={() =>
                      void runAction(
                        () =>
                          apiFetchV2(`/support/tickets/${selected.id}/reopen`, { method: "POST" }),
                        "Ticket reopened.",
                      )
                    }
                  >
                    Reopen
                  </button>
                ) : null}
              </div>
            ) : null}

            <div className="erp-notification-list">
              {(selected.comments ?? []).map((item) => (
                <article className="erp-notification" key={item.id}>
                  <div>
                    <h3>{item.isInternal ? "Internal note" : "Reply"}</h3>
                    <p>{item.body}</p>
                    <small>{dateTime(item.createdAt)}</small>
                  </div>
                </article>
              ))}
            </div>

            <form className="founder-form" onSubmit={(event) => void addComment(event)}>
              <div className="founder-form-grid">
                <label className="founder-form-wide">
                  <span>Add comment</span>
                  <textarea
                    required
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                  />
                </label>
              </div>
              <button className="erp-button erp-button-primary" disabled={busy}>
                Add comment ↗
              </button>
            </form>
          </section>
        ) : null}
      </div>
    </main>
  );
}

export function FounderSupport() {
  return (
    <ProtectedErp requiredSupport>
      <FounderSupportContent />
    </ProtectedErp>
  );
}
