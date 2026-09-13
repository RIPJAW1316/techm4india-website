"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";

import { FounderModuleNavigation } from "@/app/erp/components/FounderModuleNavigation";
import { ProtectedErp } from "@/app/erp/components/ProtectedErp";
import { useErpAuth } from "@/app/erp/components/AuthProvider";
import { ApiError, apiFetchV2 } from "@/lib/api/client";
import type {
  ApiResponse,
  CompanyDepartment,
  CompanyDivision,
  HrEmployeeSummary,
  JobRequisition,
  RecruitmentApplicant,
  RecruitmentDashboard,
} from "@/lib/api/types";

type ApiList<T> = { success: true; data: T[]; meta?: { total: number } };
type Tab = "requisitions" | "applicants" | "candidate";

const emptyRequisition = {
  code: "",
  title: "",
  divisionId: "",
  departmentId: "",
  hiringManagerEmployeeId: "",
  employmentType: "FULL_TIME",
  openings: "1",
  priority: "MEDIUM",
  description: "",
  requirements: "",
  location: "",
};

const emptyApplicant = {
  requisitionId: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  source: "WEBSITE",
  resumeUrl: "",
  notes: "",
};

const pretty = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const dateTimeValue = (value: string) => new Date(value).toLocaleString("en-IN");

function FounderRecruitmentContent() {
  const { context } = useErpAuth();
  const [tab, setTab] = useState<Tab>("requisitions");
  const [dashboard, setDashboard] = useState<RecruitmentDashboard | null>(null);
  const [requisitions, setRequisitions] = useState<JobRequisition[]>([]);
  const [applicants, setApplicants] = useState<RecruitmentApplicant[]>([]);
  const [selected, setSelected] = useState<RecruitmentApplicant | null>(null);
  const [divisions, setDivisions] = useState<CompanyDivision[]>([]);
  const [departments, setDepartments] = useState<CompanyDepartment[]>([]);
  const [employees, setEmployees] = useState<HrEmployeeSummary[]>([]);
  const [requisitionForm, setRequisitionForm] = useState(emptyRequisition);
  const [applicantForm, setApplicantForm] = useState(emptyApplicant);
  const [interviewForm, setInterviewForm] = useState({
    roundName: "",
    scheduledAt: "",
    durationMinutes: "60",
    mode: "VIDEO",
    interviewerEmployeeId: "",
  });
  const [offerForm, setOfferForm] = useState({ annualCtc: "", joiningDate: "" });
  const [onboardingForm, setOnboardingForm] = useState({
    title: "",
    ownerEmployeeId: "",
    dueDate: "",
  });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const canApprove = Boolean(
    context?.permissions.includes("recruitment.requisitions.approve"),
  );
  const canManageOffers = Boolean(
    context?.permissions.includes("recruitment.offers.manage"),
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashboardResponse, requisitionResponse, applicantResponse, divisionResponse, departmentResponse, employeeResponse] =
        await Promise.all([
          apiFetchV2<ApiResponse<RecruitmentDashboard>>("/recruitment/dashboard"),
          apiFetchV2<ApiList<JobRequisition>>("/recruitment/requisitions?limit=100"),
          apiFetchV2<ApiList<RecruitmentApplicant>>("/recruitment/applicants?limit=100"),
          apiFetchV2<ApiResponse<CompanyDivision[]>>("/company/divisions"),
          apiFetchV2<ApiResponse<CompanyDepartment[]>>("/company/departments"),
          apiFetchV2<ApiList<HrEmployeeSummary>>("/hr/employees?limit=100"),
        ]);
      setDashboard(dashboardResponse.data);
      setRequisitions(requisitionResponse.data);
      setApplicants(applicantResponse.data);
      setDivisions(divisionResponse.data);
      setDepartments(departmentResponse.data);
      setEmployees(employeeResponse.data);
      const firstOpen = requisitionResponse.data.find((item) => item.status === "OPEN");
      setApplicantForm((current) =>
        current.requisitionId || !firstOpen
          ? current
          : { ...current, requisitionId: firstOpen.id },
      );
    } catch (reason) {
      setError(
        reason instanceof ApiError
          ? reason.message
          : "Recruitment workspace could not load.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredDepartments = useMemo(
    () =>
      requisitionForm.divisionId
        ? departments.filter((item) => item.divisionId === requisitionForm.divisionId)
        : departments,
    [departments, requisitionForm.divisionId],
  );

  async function runAction(action: () => Promise<unknown>, success: string) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await action();
      setNotice(success);
      await load();
      if (selected) await openApplicant(selected.id);
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "The action could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  async function createRequisition(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runAction(
      () =>
        apiFetchV2("/recruitment/requisitions", {
          method: "POST",
          body: JSON.stringify({
            ...requisitionForm,
            divisionId: requisitionForm.divisionId || undefined,
            departmentId: requisitionForm.departmentId || undefined,
            hiringManagerEmployeeId:
              requisitionForm.hiringManagerEmployeeId || undefined,
            openings: Number(requisitionForm.openings),
            requirements: requisitionForm.requirements || undefined,
            location: requisitionForm.location || undefined,
          }),
        }),
      "Draft requisition created.",
    );
    setRequisitionForm(emptyRequisition);
  }

  async function requisitionAction(id: string, action: string) {
    const labels: Record<string, string> = {
      submit: "Requisition submitted for approval.",
      approve: "Requisition approved.",
      open: "Requisition opened for applicants.",
      hold: "Requisition placed on hold.",
      close: "Requisition closed.",
      cancel: "Requisition cancelled.",
    };
    await runAction(
      () =>
        apiFetchV2(`/recruitment/requisitions/${id}/${action}`, { method: "POST" }),
      labels[action] ?? "Requisition updated.",
    );
  }

  async function createApplicant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runAction(
      () =>
        apiFetchV2("/recruitment/applicants", {
          method: "POST",
          body: JSON.stringify({
            ...applicantForm,
            phone: applicantForm.phone || undefined,
            resumeUrl: applicantForm.resumeUrl || undefined,
            notes: applicantForm.notes || undefined,
            consentAt: new Date().toISOString(),
          }),
        }),
      "Applicant added with consent timestamp.",
    );
    setApplicantForm((current) => ({ ...emptyApplicant, requisitionId: current.requisitionId }));
  }

  async function openApplicant(id: string) {
    setError(null);
    try {
      const response = await apiFetchV2<ApiResponse<RecruitmentApplicant>>(
        `/recruitment/applicants/${id}`,
      );
      setSelected(response.data);
      setTab("candidate");
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Applicant details could not load.");
    }
  }

  async function scheduleInterview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    await runAction(
      () =>
        apiFetchV2(`/recruitment/applicants/${selected.id}/interviews`, {
          method: "POST",
          body: JSON.stringify({
            ...interviewForm,
            scheduledAt: new Date(interviewForm.scheduledAt).toISOString(),
            durationMinutes: Number(interviewForm.durationMinutes),
          }),
        }),
      "Interview scheduled.",
    );
    setInterviewForm((current) => ({ ...current, roundName: "", scheduledAt: "" }));
  }

  async function completeInterview(id: string) {
    await runAction(
      () =>
        apiFetchV2(`/recruitment/interviews/${id}/complete`, {
          method: "POST",
          body: JSON.stringify({
            score: 4,
            recommendation: "HIRE",
            feedback: "Interview completed and marked for hiring review.",
          }),
        }),
      "Interview feedback recorded.",
    );
  }

  async function createOffer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    await runAction(
      () =>
        apiFetchV2(`/recruitment/applicants/${selected.id}/offers`, {
          method: "POST",
          body: JSON.stringify({
            annualCtc: Number(offerForm.annualCtc),
            currency: "INR",
            joiningDate: offerForm.joiningDate,
          }),
        }),
      "Confidential offer draft created.",
    );
    setOfferForm({ annualCtc: "", joiningDate: "" });
  }

  async function createOnboardingTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    await runAction(
      () =>
        apiFetchV2(`/recruitment/applicants/${selected.id}/onboarding-tasks`, {
          method: "POST",
          body: JSON.stringify({
            ...onboardingForm,
            dueDate: onboardingForm.dueDate || undefined,
          }),
        }),
      "Onboarding task added.",
    );
    setOnboardingForm((current) => ({ ...current, title: "", dueDate: "" }));
  }

  const activeRequisitions =
    (dashboard?.requisitions.OPEN ?? 0) +
    (dashboard?.requisitions.PENDING_APPROVAL ?? 0) +
    (dashboard?.requisitions.APPROVED ?? 0);
  const activeApplicants =
    (dashboard?.applicants.APPLIED ?? 0) +
    (dashboard?.applicants.SCREENING ?? 0) +
    (dashboard?.applicants.INTERVIEW ?? 0) +
    (dashboard?.applicants.OFFERED ?? 0);

  return (
    <main className="erp-main">
      <div className="erp-content">
        <FounderModuleNavigation active="recruitment" />

        <section className="erp-welcome">
          <div>
            <p className="erp-kicker">People operations · approval controlled</p>
            <h1>
              Recruitment &amp; <em>onboarding</em>
            </h1>
            <p>
              Move approved roles from requisition to candidate, interview, offer and
              accountable onboarding without exposing compensation to general HR users.
            </p>
          </div>
          <div className="erp-welcome-code">
            <span>Active pipeline</span>
            <strong>{activeApplicants}</strong>
          </div>
        </section>

        {error ? <div className="erp-error" role="alert">{error}</div> : null}
        {notice ? <div className="erp-success" role="status">{notice}</div> : null}

        <section className="erp-stat-grid" aria-label="Recruitment summary">
          <article><span>Live requisitions</span><strong>{activeRequisitions}</strong><small>Approved and in review</small></article>
          <article><span>Active applicants</span><strong>{activeApplicants}</strong><small>Across the hiring funnel</small></article>
          <article><span>Upcoming interviews</span><strong>{dashboard?.upcomingInterviews ?? 0}</strong><small>Scheduled from today</small></article>
          <article><span>Onboarding actions</span><strong>{dashboard?.outstandingOnboardingTasks ?? 0}</strong><small>Pending or in progress</small></article>
        </section>

        <nav className="founder-tabs" aria-label="Recruitment workspace">
          <button type="button" className={tab === "requisitions" ? "is-active" : ""} onClick={() => setTab("requisitions")}>Requisitions</button>
          <button type="button" className={tab === "applicants" ? "is-active" : ""} onClick={() => setTab("applicants")}>Applicants</button>
          <button type="button" className={tab === "candidate" ? "is-active" : ""} disabled={!selected} onClick={() => setTab("candidate")}>Candidate detail</button>
        </nav>

        {loading ? (
          <div className="erp-state" role="status"><span className="erp-loader" aria-hidden="true" /><p>Loading recruitment workspace</p></div>
        ) : null}

        {!loading && tab === "requisitions" ? (
          <>
            <section className="erp-section">
              <div className="erp-section-heading"><div><p className="erp-kicker">Controlled headcount</p><h2>Create requisition</h2></div></div>
              <form className="founder-form" onSubmit={(event) => void createRequisition(event)}>
                <div className="founder-form-grid">
                  <label><span>Requisition code</span><input required value={requisitionForm.code} onChange={(event) => setRequisitionForm({ ...requisitionForm, code: event.target.value })} /></label>
                  <label><span>Role title</span><input required value={requisitionForm.title} onChange={(event) => setRequisitionForm({ ...requisitionForm, title: event.target.value })} /></label>
                  <label><span>Division</span><select value={requisitionForm.divisionId} onChange={(event) => setRequisitionForm({ ...requisitionForm, divisionId: event.target.value, departmentId: "" })}><option value="">Organization-wide</option>{divisions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                  <label><span>Department</span><select value={requisitionForm.departmentId} onChange={(event) => setRequisitionForm({ ...requisitionForm, departmentId: event.target.value })}><option value="">Not specified</option>{filteredDepartments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                  <label><span>Hiring manager</span><select value={requisitionForm.hiringManagerEmployeeId} onChange={(event) => setRequisitionForm({ ...requisitionForm, hiringManagerEmployeeId: event.target.value })}><option value="">Not assigned</option>{employees.map((item) => <option key={item.id} value={item.id}>{item.firstName} {item.lastName}</option>)}</select></label>
                  <label><span>Employment type</span><select value={requisitionForm.employmentType} onChange={(event) => setRequisitionForm({ ...requisitionForm, employmentType: event.target.value })}>{["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN"].map((item) => <option key={item} value={item}>{pretty(item)}</option>)}</select></label>
                  <label><span>Openings</span><input required type="number" min="1" max="100" value={requisitionForm.openings} onChange={(event) => setRequisitionForm({ ...requisitionForm, openings: event.target.value })} /></label>
                  <label><span>Priority</span><select value={requisitionForm.priority} onChange={(event) => setRequisitionForm({ ...requisitionForm, priority: event.target.value })}>{["LOW", "MEDIUM", "HIGH", "URGENT"].map((item) => <option key={item} value={item}>{pretty(item)}</option>)}</select></label>
                  <label><span>Location</span><input value={requisitionForm.location} onChange={(event) => setRequisitionForm({ ...requisitionForm, location: event.target.value })} /></label>
                  <label className="founder-form-wide"><span>Description</span><textarea required minLength={10} value={requisitionForm.description} onChange={(event) => setRequisitionForm({ ...requisitionForm, description: event.target.value })} /></label>
                  <label className="founder-form-wide"><span>Requirements</span><textarea value={requisitionForm.requirements} onChange={(event) => setRequisitionForm({ ...requisitionForm, requirements: event.target.value })} /></label>
                </div>
                <button className="erp-button erp-button-primary" disabled={busy}>Create requisition ↗</button>
              </form>
            </section>

            <section className="erp-section">
              <div className="erp-section-heading"><div><p className="erp-kicker">Headcount pipeline</p><h2>Requisitions</h2></div></div>
              {requisitions.length === 0 ? <div className="erp-empty"><strong>No requisitions yet.</strong><span>Create a draft to begin the approval workflow.</span></div> : (
                <div className="erp-notification-list">
                  {requisitions.map((item) => (
                    <article className="erp-notification" key={item.id}>
                      <div><span className="founder-org-code">{item.code}</span><h3>{item.title}</h3><p>{item.division?.name ?? "Organization-wide"} · {item.openings} opening{item.openings === 1 ? "" : "s"} · {pretty(item.priority)}</p><small>{item._count.applicants} applicants</small></div>
                      <div className="founder-org-row-actions"><strong className="founder-status">{pretty(item.status)}</strong>
                        {item.status === "DRAFT" ? <button type="button" className="erp-text-button" disabled={busy} onClick={() => void requisitionAction(item.id, "submit")}>Submit for approval</button> : null}
                        {item.status === "PENDING_APPROVAL" && canApprove ? <button type="button" className="erp-text-button" disabled={busy} onClick={() => void requisitionAction(item.id, "approve")}>Approve requisition</button> : null}
                        {item.status === "APPROVED" ? <button type="button" className="erp-text-button" disabled={busy} onClick={() => void requisitionAction(item.id, "open")}>Open hiring</button> : null}
                        {item.status === "OPEN" ? <button type="button" className="erp-text-button" disabled={busy} onClick={() => void requisitionAction(item.id, "hold")}>Place on hold</button> : null}
                        {item.status === "ON_HOLD" ? <button type="button" className="erp-text-button" disabled={busy} onClick={() => void requisitionAction(item.id, "open")}>Reopen</button> : null}
                        {["OPEN", "ON_HOLD"].includes(item.status) ? <button type="button" className="erp-text-button" disabled={busy} onClick={() => void requisitionAction(item.id, "close")}>Close</button> : null}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : null}

        {!loading && tab === "applicants" ? (
          <>
            <section className="erp-section">
              <div className="erp-section-heading"><div><p className="erp-kicker">Consent recorded</p><h2>Add applicant</h2></div></div>
              <form className="founder-form" onSubmit={(event) => void createApplicant(event)}>
                <div className="founder-form-grid">
                  <label><span>Open requisition</span><select required value={applicantForm.requisitionId} onChange={(event) => setApplicantForm({ ...applicantForm, requisitionId: event.target.value })}><option value="">Select requisition</option>{requisitions.filter((item) => item.status === "OPEN").map((item) => <option key={item.id} value={item.id}>{item.code} · {item.title}</option>)}</select></label>
                  <label><span>First name</span><input required value={applicantForm.firstName} onChange={(event) => setApplicantForm({ ...applicantForm, firstName: event.target.value })} /></label>
                  <label><span>Last name</span><input required value={applicantForm.lastName} onChange={(event) => setApplicantForm({ ...applicantForm, lastName: event.target.value })} /></label>
                  <label><span>Email</span><input required type="email" value={applicantForm.email} onChange={(event) => setApplicantForm({ ...applicantForm, email: event.target.value })} /></label>
                  <label><span>Phone</span><input value={applicantForm.phone} onChange={(event) => setApplicantForm({ ...applicantForm, phone: event.target.value })} /></label>
                  <label><span>Source</span><select value={applicantForm.source} onChange={(event) => setApplicantForm({ ...applicantForm, source: event.target.value })}>{["WEBSITE", "REFERRAL", "LINKEDIN", "JOB_PORTAL", "CAMPUS", "AGENCY", "OTHER"].map((item) => <option key={item} value={item}>{pretty(item)}</option>)}</select></label>
                  <label className="founder-form-wide"><span>HTTPS resume URL</span><input type="url" pattern="https://.*" value={applicantForm.resumeUrl} onChange={(event) => setApplicantForm({ ...applicantForm, resumeUrl: event.target.value })} /></label>
                  <label className="founder-form-wide"><span>Recruiter notes</span><textarea value={applicantForm.notes} onChange={(event) => setApplicantForm({ ...applicantForm, notes: event.target.value })} /></label>
                </div>
                <p className="founder-form-note">Submitting records the current timestamp as the applicant&apos;s consent confirmation. Only approved HTTPS document links are accepted.</p>
                <button className="erp-button erp-button-primary" disabled={busy}>Add applicant ↗</button>
              </form>
            </section>
            <section className="erp-section"><div className="erp-section-heading"><div><p className="erp-kicker">Candidate funnel</p><h2>Applicants</h2></div></div>
              {applicants.length === 0 ? <div className="erp-empty"><strong>No applicants yet.</strong><span>Add a candidate against an open requisition.</span></div> : <div className="erp-notification-list">{applicants.map((item) => <article className="erp-notification" key={item.id}><div><h3>{item.firstName} {item.lastName}</h3><p>{item.requisition.code} · {item.requisition.title}</p><small>{item.email} · {pretty(item.source)}</small></div><div className="founder-org-row-actions"><strong className="founder-status">{pretty(item.status)}</strong><button type="button" className="erp-text-button" onClick={() => void openApplicant(item.id)}>View details</button></div></article>)}</div>}
            </section>
          </>
        ) : null}

        {!loading && tab === "candidate" && selected ? (
          <>
            <section className="erp-section"><div className="erp-section-heading"><div><p className="erp-kicker">Candidate record</p><h2>{selected.firstName} {selected.lastName}</h2><p>{selected.requisition.code} · {selected.requisition.title} · {selected.email}</p></div><strong className="founder-status">{pretty(selected.status)}</strong></div></section>

            <section className="erp-section"><div className="erp-section-heading"><div><p className="erp-kicker">Structured review</p><h2>Schedule interview</h2></div></div>
              <form className="founder-form" onSubmit={(event) => void scheduleInterview(event)}><div className="founder-form-grid">
                <label><span>Round name</span><input required value={interviewForm.roundName} onChange={(event) => setInterviewForm({ ...interviewForm, roundName: event.target.value })} /></label>
                <label><span>Date and time</span><input required type="datetime-local" value={interviewForm.scheduledAt} onChange={(event) => setInterviewForm({ ...interviewForm, scheduledAt: event.target.value })} /></label>
                <label><span>Minutes</span><input required type="number" min="15" max="480" value={interviewForm.durationMinutes} onChange={(event) => setInterviewForm({ ...interviewForm, durationMinutes: event.target.value })} /></label>
                <label><span>Mode</span><select value={interviewForm.mode} onChange={(event) => setInterviewForm({ ...interviewForm, mode: event.target.value })}>{["VIDEO", "PHONE", "IN_PERSON"].map((item) => <option key={item} value={item}>{pretty(item)}</option>)}</select></label>
                <label><span>Interviewer</span><select required value={interviewForm.interviewerEmployeeId} onChange={(event) => setInterviewForm({ ...interviewForm, interviewerEmployeeId: event.target.value })}><option value="">Select interviewer</option>{employees.map((item) => <option key={item.id} value={item.id}>{item.firstName} {item.lastName}</option>)}</select></label>
              </div><button className="erp-button erp-button-primary" disabled={busy}>Schedule interview ↗</button></form>
              <div className="erp-notification-list">{selected.interviews?.map((item) => <article className="erp-notification" key={item.id}><div><h3>{item.roundName}</h3><p>{dateTimeValue(item.scheduledAt)} · {pretty(item.mode)} · {item.durationMinutes} minutes</p><small>{item.feedback ?? "Feedback pending"}</small></div><div className="founder-org-row-actions"><strong className="founder-status">{pretty(item.status)}</strong>{item.status === "SCHEDULED" ? <button className="erp-text-button" type="button" disabled={busy} onClick={() => void completeInterview(item.id)}>Complete interview</button> : null}</div></article>)}</div>
            </section>

            {canManageOffers ? <section className="erp-section"><div className="erp-section-heading"><div><p className="erp-kicker">Restricted compensation data</p><h2>Create offer</h2></div></div>
              <form className="founder-form" onSubmit={(event) => void createOffer(event)}><div className="founder-form-grid"><label><span>Annual CTC (INR)</span><input required type="number" min="1" step="0.01" value={offerForm.annualCtc} onChange={(event) => setOfferForm({ ...offerForm, annualCtc: event.target.value })} /></label><label><span>Joining date</span><input required type="date" value={offerForm.joiningDate} onChange={(event) => setOfferForm({ ...offerForm, joiningDate: event.target.value })} /></label></div><button className="erp-button erp-button-primary" disabled={busy}>Create offer ↗</button></form>
              <div className="erp-notification-list">{selected.offers?.map((item) => <article className="erp-notification" key={item.id}><div><h3>{item.currency} {Number(item.annualCtc).toLocaleString("en-IN")}</h3><p>Joining {new Date(item.joiningDate).toLocaleDateString("en-IN")}</p></div><div className="founder-org-row-actions"><strong className="founder-status">{pretty(item.status)}</strong>{item.status === "DRAFT" ? <button type="button" className="erp-text-button" disabled={busy} onClick={() => void runAction(() => apiFetchV2(`/recruitment/offers/${item.id}/issue`, { method: "POST" }), "Offer issued.")}>Issue</button> : null}{item.status === "ISSUED" ? <><button type="button" className="erp-text-button" disabled={busy} onClick={() => void runAction(() => apiFetchV2(`/recruitment/offers/${item.id}/record-response`, { method: "POST", body: JSON.stringify({ accepted: true }) }), "Offer accepted.")}>Record accepted</button><button type="button" className="erp-text-button" disabled={busy} onClick={() => void runAction(() => apiFetchV2(`/recruitment/offers/${item.id}/record-response`, { method: "POST", body: JSON.stringify({ accepted: false }) }), "Offer declined.")}>Record declined</button></> : null}</div></article>)}</div>
            </section> : null}

            <section className="erp-section"><div className="erp-section-heading"><div><p className="erp-kicker">Accepted candidates only</p><h2>Onboarding checklist</h2></div></div>
              {selected.status === "HIRED" ? <form className="founder-form" onSubmit={(event) => void createOnboardingTask(event)}><div className="founder-form-grid"><label><span>Task</span><input required value={onboardingForm.title} onChange={(event) => setOnboardingForm({ ...onboardingForm, title: event.target.value })} /></label><label><span>Owner</span><select required value={onboardingForm.ownerEmployeeId} onChange={(event) => setOnboardingForm({ ...onboardingForm, ownerEmployeeId: event.target.value })}><option value="">Select owner</option>{employees.map((item) => <option key={item.id} value={item.id}>{item.firstName} {item.lastName}</option>)}</select></label><label><span>Due date</span><input type="date" value={onboardingForm.dueDate} onChange={(event) => setOnboardingForm({ ...onboardingForm, dueDate: event.target.value })} /></label></div><button className="erp-button erp-button-primary" disabled={busy}>Add onboarding task ↗</button></form> : <div className="erp-empty"><strong>Onboarding is locked.</strong><span>It becomes available after an issued offer is accepted.</span></div>}
              <div className="erp-notification-list">{selected.onboardingTasks?.map((item) => <article className="erp-notification" key={item.id}><div><h3>{item.title}</h3><p>{item.owner ? `${item.owner.firstName} ${item.owner.lastName}` : "Owner"}{item.dueDate ? ` · due ${new Date(item.dueDate).toLocaleDateString("en-IN")}` : ""}</p></div><div className="founder-org-row-actions"><strong className="founder-status">{pretty(item.status)}</strong>{!["COMPLETED", "WAIVED"].includes(item.status) ? <button type="button" className="erp-text-button" disabled={busy} onClick={() => void runAction(() => apiFetchV2(`/recruitment/onboarding-tasks/${item.id}`, { method: "PATCH", body: JSON.stringify({ status: "COMPLETED" }) }), "Onboarding task completed.")}>Mark complete</button> : null}</div></article>)}</div>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}

export function FounderRecruitment() {
  return (
    <ProtectedErp requiredRecruitment>
      <FounderRecruitmentContent />
    </ProtectedErp>
  );
}
