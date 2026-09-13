"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState, type FormEvent } from "react";

import { FounderModuleNavigation } from "@/app/erp/components/FounderModuleNavigation";
import { ProtectedErp } from "@/app/erp/components/ProtectedErp";
import { useErpAuth } from "@/app/erp/components/AuthProvider";
import { ApiError, apiFetch, apiFetchV2 } from "@/lib/api/client";
import type {
  Project,
  ProjectMilestone,
  ProjectRisk,
  ProjectSprint,
  ProjectTimeLog,
} from "@/lib/api/types";

type ApiList<T> = { success: true; data: T[]; meta?: { total: number } };
type Tab = "milestones" | "risks" | "sprints" | "time";

const pretty = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const dateValue = (value: string) => new Date(value).toLocaleDateString("en-IN");

function FounderDeliveryContent() {
  const { context } = useErpAuth();
  const [tab, setTab] = useState<Tab>("milestones");
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [risks, setRisks] = useState<ProjectRisk[]>([]);
  const [sprints, setSprints] = useState<ProjectSprint[]>([]);
  const [timeLogs, setTimeLogs] = useState<ProjectTimeLog[]>([]);

  const [milestoneForm, setMilestoneForm] = useState({ title: "", dueDate: "" });
  const [riskForm, setRiskForm] = useState({ title: "", severity: "MEDIUM", likelihood: "MEDIUM" });
  const [sprintForm, setSprintForm] = useState({ name: "", startsOn: "", endsOn: "" });
  const [timeForm, setTimeForm] = useState({ workDate: "", hours: "8", note: "" });

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const canManage = Boolean(context?.permissions.includes("projects.delivery.manage"));
  const canLogTime = Boolean(context?.permissions.includes("projects.timelog.manage"));

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch<ApiList<Project>>("/projects?limit=100");
      setProjects(response.data);
      setProjectId((current) => current || response.data[0]?.id || "");
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Delivery workspace could not load.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const loadProject = useCallback(async (id: string) => {
    if (!id) return;
    const [ms, rk, sp, tl] = await Promise.all([
      apiFetchV2<ApiList<ProjectMilestone>>(`/projects/${id}/milestones?limit=100`),
      apiFetchV2<ApiList<ProjectRisk>>(`/projects/${id}/risks?limit=100`),
      apiFetchV2<ApiList<ProjectSprint>>(`/projects/${id}/sprints?limit=100`),
      apiFetchV2<ApiList<ProjectTimeLog>>(`/projects/${id}/time-logs?limit=100`),
    ]);
    setMilestones(ms.data);
    setRisks(rk.data);
    setSprints(sp.data);
    setTimeLogs(tl.data);
  }, []);

  useEffect(() => {
    if (!projectId) return;
    void loadProject(projectId).catch((reason) =>
      setError(reason instanceof ApiError ? reason.message : "Project delivery could not load."),
    );
  }, [projectId, loadProject]);

  async function runAction(action: () => Promise<unknown>, success: string) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await action();
      setNotice(success);
      if (projectId) await loadProject(projectId);
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "The action could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  async function createMilestone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runAction(
      () => apiFetchV2(`/projects/${projectId}/milestones`, { method: "POST", body: JSON.stringify(milestoneForm) }),
      "Milestone created.",
    );
    setMilestoneForm({ title: "", dueDate: "" });
  }

  async function createRisk(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runAction(
      () => apiFetchV2(`/projects/${projectId}/risks`, { method: "POST", body: JSON.stringify(riskForm) }),
      "Risk logged.",
    );
    setRiskForm({ title: "", severity: "MEDIUM", likelihood: "MEDIUM" });
  }

  async function createSprint(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runAction(
      () => apiFetchV2(`/projects/${projectId}/sprints`, { method: "POST", body: JSON.stringify(sprintForm) }),
      "Sprint planned.",
    );
    setSprintForm({ name: "", startsOn: "", endsOn: "" });
  }

  async function logTime(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runAction(
      () =>
        apiFetchV2(`/projects/${projectId}/time-logs`, {
          method: "POST",
          body: JSON.stringify({
            workDate: timeForm.workDate,
            hours: Number(timeForm.hours),
            note: timeForm.note || undefined,
          }),
        }),
      "Time logged.",
    );
    setTimeForm({ workDate: "", hours: "8", note: "" });
  }

  return (
    <main className="erp-main">
      <div className="erp-content">
        <FounderModuleNavigation active="delivery" />

        <section className="erp-welcome">
          <div>
            <p className="erp-kicker">Delivery · milestones, risks, sprints, time</p>
            <h1>
              Project <em>delivery</em>
            </h1>
            <p>
              Plan milestones and sprints, track and mitigate delivery risks, and capture
              time against each project to keep delivery on schedule.
            </p>
          </div>
          <div className="erp-welcome-code">
            <span>Projects</span>
            <strong>{projects.length}</strong>
          </div>
        </section>

        {error ? <div className="erp-error" role="alert">{error}</div> : null}
        {notice ? <div className="erp-success" role="status">{notice}</div> : null}

        <section className="erp-section">
          <div className="erp-section-heading"><div><p className="erp-kicker">Choose a project</p><h2>Delivery board</h2></div></div>
          {loading ? <div className="erp-state" role="status"><span className="erp-loader" aria-hidden="true" /><p>Loading projects</p></div> : projects.length === 0 ? <div className="erp-empty"><strong>No projects.</strong><span>Create a project first to plan its delivery.</span></div> : (
            <label className="founder-form-inline"><span>Project</span><select value={projectId} onChange={(event) => setProjectId(event.target.value)}>{projects.map((item) => <option key={item.id} value={item.id}>{item.code} · {item.name}</option>)}</select></label>
          )}
        </section>

        {projectId ? (
          <>
            <nav className="founder-tabs" aria-label="Delivery workspace">
              <button type="button" className={tab === "milestones" ? "is-active" : ""} onClick={() => setTab("milestones")}>Milestones</button>
              <button type="button" className={tab === "risks" ? "is-active" : ""} onClick={() => setTab("risks")}>Risks</button>
              <button type="button" className={tab === "sprints" ? "is-active" : ""} onClick={() => setTab("sprints")}>Sprints</button>
              <button type="button" className={tab === "time" ? "is-active" : ""} onClick={() => setTab("time")}>Time logs</button>
            </nav>

            {tab === "milestones" ? (
              <section className="erp-section">
                <div className="erp-section-heading"><div><p className="erp-kicker">Schedule</p><h2>Milestones</h2></div></div>
                {canManage ? (
                  <form className="founder-form" onSubmit={(event) => void createMilestone(event)}>
                    <div className="founder-form-grid">
                      <label className="founder-form-wide"><span>Title</span><input required value={milestoneForm.title} onChange={(event) => setMilestoneForm({ ...milestoneForm, title: event.target.value })} /></label>
                      <label><span>Due date</span><input required type="date" value={milestoneForm.dueDate} onChange={(event) => setMilestoneForm({ ...milestoneForm, dueDate: event.target.value })} /></label>
                    </div>
                    <button className="erp-button erp-button-primary" disabled={busy}>Create milestone ↗</button>
                  </form>
                ) : null}
                <div className="erp-notification-list">
                  {milestones.map((item) => (
                    <article className="erp-notification" key={item.id}>
                      <div><h3>{item.title}</h3><p>Due {dateValue(item.dueDate)}</p></div>
                      <div className="founder-org-row-actions">
                        <strong className="founder-status">{pretty(item.status)}</strong>
                        {canManage && item.status !== "COMPLETED" && item.status !== "MISSED" ? <button type="button" className="erp-text-button" disabled={busy} onClick={() => void runAction(() => apiFetchV2(`/project-milestones/${item.id}/complete`, { method: "POST" }), "Milestone completed.")}>Complete</button> : null}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            {tab === "risks" ? (
              <section className="erp-section">
                <div className="erp-section-heading"><div><p className="erp-kicker">Risk register</p><h2>Risks</h2></div></div>
                {canManage ? (
                  <form className="founder-form" onSubmit={(event) => void createRisk(event)}>
                    <div className="founder-form-grid">
                      <label className="founder-form-wide"><span>Title</span><input required value={riskForm.title} onChange={(event) => setRiskForm({ ...riskForm, title: event.target.value })} /></label>
                      <label><span>Severity</span><select value={riskForm.severity} onChange={(event) => setRiskForm({ ...riskForm, severity: event.target.value })}>{["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((item) => <option key={item} value={item}>{pretty(item)}</option>)}</select></label>
                      <label><span>Likelihood</span><select value={riskForm.likelihood} onChange={(event) => setRiskForm({ ...riskForm, likelihood: event.target.value })}>{["LOW", "MEDIUM", "HIGH"].map((item) => <option key={item} value={item}>{pretty(item)}</option>)}</select></label>
                    </div>
                    <button className="erp-button erp-button-primary" disabled={busy}>Add risk ↗</button>
                  </form>
                ) : null}
                <div className="erp-notification-list">
                  {risks.map((item) => (
                    <article className="erp-notification" key={item.id}>
                      <div><h3>{item.title}</h3><p>{pretty(item.severity)} severity · {pretty(item.likelihood)} likelihood</p></div>
                      <div className="founder-org-row-actions">
                        <strong className="founder-status">{pretty(item.status)}</strong>
                        {canManage && item.status !== "CLOSED" && item.status !== "ACCEPTED" ? <button type="button" className="erp-text-button" disabled={busy} onClick={() => void runAction(() => apiFetchV2(`/project-risks/${item.id}`, { method: "PATCH", body: JSON.stringify({ status: "CLOSED" }) }), "Risk closed.")}>Close</button> : null}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            {tab === "sprints" ? (
              <section className="erp-section">
                <div className="erp-section-heading"><div><p className="erp-kicker">Iterations</p><h2>Sprints</h2></div></div>
                {canManage ? (
                  <form className="founder-form" onSubmit={(event) => void createSprint(event)}>
                    <div className="founder-form-grid">
                      <label className="founder-form-wide"><span>Sprint name</span><input required value={sprintForm.name} onChange={(event) => setSprintForm({ ...sprintForm, name: event.target.value })} /></label>
                      <label><span>Starts on</span><input required type="date" value={sprintForm.startsOn} onChange={(event) => setSprintForm({ ...sprintForm, startsOn: event.target.value })} /></label>
                      <label><span>Ends on</span><input required type="date" value={sprintForm.endsOn} onChange={(event) => setSprintForm({ ...sprintForm, endsOn: event.target.value })} /></label>
                    </div>
                    <button className="erp-button erp-button-primary" disabled={busy}>Plan sprint ↗</button>
                  </form>
                ) : null}
                <div className="erp-notification-list">
                  {sprints.map((item) => (
                    <article className="erp-notification" key={item.id}>
                      <div><h3>{item.name}</h3><p>{dateValue(item.startsOn)} → {dateValue(item.endsOn)}</p></div>
                      <div className="founder-org-row-actions">
                        <strong className="founder-status">{pretty(item.status)}</strong>
                        {canManage && item.status === "PLANNED" ? <button type="button" className="erp-text-button" disabled={busy} onClick={() => void runAction(() => apiFetchV2(`/project-sprints/${item.id}/start`, { method: "POST" }), "Sprint started.")}>Start</button> : null}
                        {canManage && item.status === "ACTIVE" ? <button type="button" className="erp-text-button" disabled={busy} onClick={() => void runAction(() => apiFetchV2(`/project-sprints/${item.id}/complete`, { method: "POST" }), "Sprint completed.")}>Complete</button> : null}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            {tab === "time" ? (
              <section className="erp-section">
                <div className="erp-section-heading"><div><p className="erp-kicker">Effort</p><h2>Time logs</h2></div></div>
                {canLogTime ? (
                  <form className="founder-form" onSubmit={(event) => void logTime(event)}>
                    <div className="founder-form-grid">
                      <label><span>Work date</span><input required type="date" value={timeForm.workDate} onChange={(event) => setTimeForm({ ...timeForm, workDate: event.target.value })} /></label>
                      <label><span>Hours</span><input required type="number" min="0.25" max="24" step="0.25" value={timeForm.hours} onChange={(event) => setTimeForm({ ...timeForm, hours: event.target.value })} /></label>
                      <label className="founder-form-wide"><span>Note</span><input value={timeForm.note} onChange={(event) => setTimeForm({ ...timeForm, note: event.target.value })} /></label>
                    </div>
                    <button className="erp-button erp-button-primary" disabled={busy}>Log time ↗</button>
                  </form>
                ) : null}
                <div className="erp-notification-list">
                  {timeLogs.map((item) => (
                    <article className="erp-notification" key={item.id}>
                      <div><h3>{item.employee ? `${item.employee.firstName} ${item.employee.lastName}` : "Member"}</h3><p>{dateValue(item.workDate)} · {Number(item.hours)}h{item.note ? ` · ${item.note}` : ""}</p></div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </>
        ) : null}
      </div>
    </main>
  );
}

export function FounderDelivery() {
  return (
    <ProtectedErp requiredDelivery>
      <FounderDeliveryContent />
    </ProtectedErp>
  );
}
