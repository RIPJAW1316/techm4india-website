"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState, type FormEvent } from "react";

import { FounderModuleNavigation } from "@/app/erp/components/FounderModuleNavigation";
import { ProtectedErp } from "@/app/erp/components/ProtectedErp";
import { useErpAuth } from "@/app/erp/components/AuthProvider";
import { ApiError, apiFetchV2 } from "@/lib/api/client";
import type {
  ApiResponse,
  HrEmployeeSummary,
  PerformanceCycle,
  PerformanceGoal,
  PerformanceReview,
} from "@/lib/api/types";

type ApiList<T> = { success: true; data: T[]; meta?: { total: number } };
type Tab = "cycles" | "goals" | "reviews";

const emptyCycle = {
  code: "",
  name: "",
  type: "ANNUAL",
  startsOn: "",
  endsOn: "",
  ratingScaleMax: "5",
};

const emptyGoal = {
  employeeId: "",
  title: "",
  category: "BUSINESS",
  weight: "20",
};

const emptyReview = { employeeId: "", reviewerEmployeeId: "" };

const pretty = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const rating = (value: string | null) => (value === null ? "—" : Number(value).toFixed(2));

async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

function FounderPerformanceContent() {
  const { context } = useErpAuth();
  const [tab, setTab] = useState<Tab>("cycles");
  const [cycles, setCycles] = useState<PerformanceCycle[]>([]);
  const [employees, setEmployees] = useState<HrEmployeeSummary[]>([]);
  const [selectedCycle, setSelectedCycle] = useState<PerformanceCycle | null>(null);
  const [goals, setGoals] = useState<PerformanceGoal[]>([]);
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);

  const [cycleForm, setCycleForm] = useState(emptyCycle);
  const [goalForm, setGoalForm] = useState(emptyGoal);
  const [reviewForm, setReviewForm] = useState(emptyReview);
  const [selfForm, setSelfForm] = useState({ selfRating: "4", selfComments: "" });
  const [managerForm, setManagerForm] = useState({ managerRating: "4", managerComments: "" });
  const [finalForm, setFinalForm] = useState({ finalRating: "4", calibrationNotes: "" });
  const [ackForm, setAckForm] = useState({ acknowledgement: "" });

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const myEmployeeId = context?.employee?.id ?? null;
  const canManageCycles = Boolean(context?.permissions.includes("performance.cycles.manage"));
  const canManageGoals = Boolean(context?.permissions.includes("performance.goals.manage"));
  const canManageReviews = Boolean(context?.permissions.includes("performance.reviews.manage"));
  const canFinalize = Boolean(context?.permissions.includes("performance.reviews.finalize"));
  const canSelf = Boolean(context?.permissions.includes("performance.reviews.self"));

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cycleResponse = await apiFetchV2<ApiList<PerformanceCycle>>(
        "/performance/cycles?limit=100",
      );
      setCycles(cycleResponse.data);
      const employeeResponse = await safe<ApiList<HrEmployeeSummary>>(
        apiFetchV2("/hr/employees?limit=100"),
        { success: true, data: [] },
      );
      setEmployees(employeeResponse.data);
    } catch (reason) {
      setError(
        reason instanceof ApiError ? reason.message : "Performance workspace could not load.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const loadCycle = useCallback(async (cycleId: string) => {
    const [goalResponse, reviewResponse] = await Promise.all([
      safe<ApiList<PerformanceGoal>>(
        apiFetchV2(`/performance/goals?cycleId=${cycleId}&limit=100`),
        { success: true, data: [] },
      ),
      safe<ApiList<PerformanceReview>>(
        apiFetchV2(`/performance/reviews?cycleId=${cycleId}&limit=100`),
        { success: true, data: [] },
      ),
    ]);
    setGoals(goalResponse.data);
    setReviews(reviewResponse.data);
  }, []);

  async function openCycle(cycle: PerformanceCycle, nextTab?: Tab) {
    setError(null);
    setSelectedCycle(cycle);
    setSelectedReview(null);
    try {
      await loadCycle(cycle.id);
      if (nextTab) setTab(nextTab);
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Cycle details could not load.");
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
      if (selectedCycle) await loadCycle(selectedCycle.id);
      if (selectedReview) {
        const refreshed = await apiFetchV2<ApiResponse<PerformanceReview>>(
          `/performance/reviews/${selectedReview.id}`,
        );
        setSelectedReview(refreshed.data);
      }
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "The action could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  async function createCycle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runAction(
      () =>
        apiFetchV2("/performance/cycles", {
          method: "POST",
          body: JSON.stringify({
            code: cycleForm.code,
            name: cycleForm.name,
            type: cycleForm.type,
            startsOn: cycleForm.startsOn,
            endsOn: cycleForm.endsOn,
            ratingScaleMax: Number(cycleForm.ratingScaleMax),
          }),
        }),
      "Draft cycle created.",
    );
    setCycleForm(emptyCycle);
  }

  async function cycleAction(id: string, action: "activate" | "close") {
    await runAction(
      () => apiFetchV2(`/performance/cycles/${id}/${action}`, { method: "POST" }),
      action === "activate" ? "Cycle activated." : "Cycle closed.",
    );
  }

  async function createGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedCycle) return;
    await runAction(
      () =>
        apiFetchV2(`/performance/cycles/${selectedCycle.id}/goals`, {
          method: "POST",
          body: JSON.stringify({
            employeeId: goalForm.employeeId,
            title: goalForm.title,
            category: goalForm.category,
            weight: Number(goalForm.weight),
          }),
        }),
      "Goal added to the cycle.",
    );
    setGoalForm((current) => ({ ...emptyGoal, employeeId: current.employeeId }));
  }

  async function createReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedCycle) return;
    await runAction(
      () =>
        apiFetchV2(`/performance/cycles/${selectedCycle.id}/reviews`, {
          method: "POST",
          body: JSON.stringify({
            employeeId: reviewForm.employeeId,
            reviewerEmployeeId: reviewForm.reviewerEmployeeId,
          }),
        }),
      "Appraisal review opened.",
    );
    setReviewForm(emptyReview);
  }

  async function submitSelf(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedReview) return;
    await runAction(
      () =>
        apiFetchV2(`/performance/reviews/${selectedReview.id}/self-assessment`, {
          method: "POST",
          body: JSON.stringify({
            selfRating: Number(selfForm.selfRating),
            selfComments: selfForm.selfComments,
          }),
        }),
      "Self-assessment submitted.",
    );
    setSelfForm({ selfRating: "4", selfComments: "" });
  }

  async function submitManager(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedReview) return;
    await runAction(
      () =>
        apiFetchV2(`/performance/reviews/${selectedReview.id}/manager-review`, {
          method: "POST",
          body: JSON.stringify({
            managerRating: Number(managerForm.managerRating),
            managerComments: managerForm.managerComments,
          }),
        }),
      "Manager review submitted.",
    );
    setManagerForm({ managerRating: "4", managerComments: "" });
  }

  async function submitFinalize(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedReview) return;
    await runAction(
      () =>
        apiFetchV2(`/performance/reviews/${selectedReview.id}/finalize`, {
          method: "POST",
          body: JSON.stringify({
            finalRating: Number(finalForm.finalRating),
            calibrationNotes: finalForm.calibrationNotes || undefined,
          }),
        }),
      "Review finalized.",
    );
    setFinalForm({ finalRating: "4", calibrationNotes: "" });
  }

  async function submitAcknowledge(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedReview) return;
    await runAction(
      () =>
        apiFetchV2(`/performance/reviews/${selectedReview.id}/acknowledge`, {
          method: "POST",
          body: JSON.stringify({ acknowledgement: ackForm.acknowledgement || undefined }),
        }),
      "Review acknowledged.",
    );
    setAckForm({ acknowledgement: "" });
  }

  const isSubject = selectedReview ? selectedReview.employeeId === myEmployeeId : false;

  return (
    <main className="erp-main">
      <div className="erp-content">
        <FounderModuleNavigation active="performance" />

        <section className="erp-welcome">
          <div>
            <p className="erp-kicker">People operations · calibration controlled</p>
            <h1>
              Performance &amp; <em>appraisal</em>
            </h1>
            <p>
              Run review cycles, set weighted goals, and move appraisals through self-assessment,
              manager review, calibrated finalization and employee acknowledgement.
            </p>
          </div>
          <div className="erp-welcome-code">
            <span>Cycles</span>
            <strong>{cycles.length}</strong>
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

        <nav className="founder-tabs" aria-label="Performance workspace">
          <button
            type="button"
            className={tab === "cycles" ? "is-active" : ""}
            onClick={() => setTab("cycles")}
          >
            Cycles
          </button>
          <button
            type="button"
            className={tab === "goals" ? "is-active" : ""}
            disabled={!selectedCycle}
            onClick={() => setTab("goals")}
          >
            Goals
          </button>
          <button
            type="button"
            className={tab === "reviews" ? "is-active" : ""}
            disabled={!selectedCycle}
            onClick={() => setTab("reviews")}
          >
            Reviews
          </button>
        </nav>

        {selectedCycle ? (
          <p className="founder-form-note">
            Active context: {selectedCycle.code} · {selectedCycle.name} ·{" "}
            {pretty(selectedCycle.status)}
          </p>
        ) : null}

        {loading ? (
          <div className="erp-state" role="status">
            <span className="erp-loader" aria-hidden="true" />
            <p>Loading performance workspace</p>
          </div>
        ) : null}

        {!loading && tab === "cycles" ? (
          <>
            {canManageCycles ? (
              <section className="erp-section">
                <div className="erp-section-heading">
                  <div>
                    <p className="erp-kicker">Review period</p>
                    <h2>Create cycle</h2>
                  </div>
                </div>
                <form className="founder-form" onSubmit={(event) => void createCycle(event)}>
                  <div className="founder-form-grid">
                    <label>
                      <span>Cycle code</span>
                      <input
                        required
                        value={cycleForm.code}
                        onChange={(event) =>
                          setCycleForm({ ...cycleForm, code: event.target.value })
                        }
                      />
                    </label>
                    <label>
                      <span>Cycle name</span>
                      <input
                        required
                        value={cycleForm.name}
                        onChange={(event) =>
                          setCycleForm({ ...cycleForm, name: event.target.value })
                        }
                      />
                    </label>
                    <label>
                      <span>Type</span>
                      <select
                        value={cycleForm.type}
                        onChange={(event) =>
                          setCycleForm({ ...cycleForm, type: event.target.value })
                        }
                      >
                        {["ANNUAL", "HALF_YEARLY", "QUARTERLY", "PROBATION"].map((item) => (
                          <option key={item} value={item}>
                            {pretty(item)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>Rating scale max</span>
                      <input
                        required
                        type="number"
                        min="1"
                        max="10"
                        value={cycleForm.ratingScaleMax}
                        onChange={(event) =>
                          setCycleForm({ ...cycleForm, ratingScaleMax: event.target.value })
                        }
                      />
                    </label>
                    <label>
                      <span>Starts on</span>
                      <input
                        required
                        type="date"
                        value={cycleForm.startsOn}
                        onChange={(event) =>
                          setCycleForm({ ...cycleForm, startsOn: event.target.value })
                        }
                      />
                    </label>
                    <label>
                      <span>Ends on</span>
                      <input
                        required
                        type="date"
                        value={cycleForm.endsOn}
                        onChange={(event) =>
                          setCycleForm({ ...cycleForm, endsOn: event.target.value })
                        }
                      />
                    </label>
                  </div>
                  <button className="erp-button erp-button-primary" disabled={busy}>
                    Create cycle ↗
                  </button>
                </form>
              </section>
            ) : null}

            <section className="erp-section">
              <div className="erp-section-heading">
                <div>
                  <p className="erp-kicker">Review periods</p>
                  <h2>Cycles</h2>
                </div>
              </div>
              {cycles.length === 0 ? (
                <div className="erp-empty">
                  <strong>No cycles yet.</strong>
                  <span>Create a cycle to plan goals and reviews.</span>
                </div>
              ) : (
                <div className="erp-notification-list">
                  {cycles.map((item) => (
                    <article className="erp-notification" key={item.id}>
                      <div>
                        <span className="founder-org-code">{item.code}</span>
                        <h3>{item.name}</h3>
                        <p>
                          {pretty(item.type)} · scale {item.ratingScaleMax} ·{" "}
                          {item._count?.reviews ?? 0} reviews
                        </p>
                      </div>
                      <div className="founder-org-row-actions">
                        <strong className="founder-status">{pretty(item.status)}</strong>
                        <button
                          type="button"
                          className="erp-text-button"
                          onClick={() => void openCycle(item, "goals")}
                        >
                          Open cycle
                        </button>
                        {item.status === "DRAFT" && canManageCycles ? (
                          <button
                            type="button"
                            className="erp-text-button"
                            disabled={busy}
                            onClick={() => void cycleAction(item.id, "activate")}
                          >
                            Activate
                          </button>
                        ) : null}
                        {item.status === "ACTIVE" && canManageCycles ? (
                          <button
                            type="button"
                            className="erp-text-button"
                            disabled={busy}
                            onClick={() => void cycleAction(item.id, "close")}
                          >
                            Close
                          </button>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : null}

        {!loading && tab === "goals" && selectedCycle ? (
          <>
            {canManageGoals && selectedCycle.status !== "CLOSED" ? (
              <section className="erp-section">
                <div className="erp-section-heading">
                  <div>
                    <p className="erp-kicker">Weighted objectives</p>
                    <h2>Add goal</h2>
                  </div>
                </div>
                <form className="founder-form" onSubmit={(event) => void createGoal(event)}>
                  <div className="founder-form-grid">
                    <label>
                      <span>Employee</span>
                      <select
                        required
                        value={goalForm.employeeId}
                        onChange={(event) =>
                          setGoalForm({ ...goalForm, employeeId: event.target.value })
                        }
                      >
                        <option value="">Select employee</option>
                        {employees.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.firstName} {item.lastName}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>Category</span>
                      <select
                        value={goalForm.category}
                        onChange={(event) =>
                          setGoalForm({ ...goalForm, category: event.target.value })
                        }
                      >
                        {["BUSINESS", "TECHNICAL", "BEHAVIORAL", "LEARNING"].map((item) => (
                          <option key={item} value={item}>
                            {pretty(item)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>Weight (%)</span>
                      <input
                        required
                        type="number"
                        min="0"
                        max="100"
                        value={goalForm.weight}
                        onChange={(event) =>
                          setGoalForm({ ...goalForm, weight: event.target.value })
                        }
                      />
                    </label>
                    <label className="founder-form-wide">
                      <span>Goal title</span>
                      <input
                        required
                        value={goalForm.title}
                        onChange={(event) =>
                          setGoalForm({ ...goalForm, title: event.target.value })
                        }
                      />
                    </label>
                  </div>
                  <p className="founder-form-note">
                    Active goal weight per employee cannot exceed 100% within a cycle.
                  </p>
                  <button className="erp-button erp-button-primary" disabled={busy}>
                    Add goal ↗
                  </button>
                </form>
              </section>
            ) : null}

            <section className="erp-section">
              <div className="erp-section-heading">
                <div>
                  <p className="erp-kicker">Objectives</p>
                  <h2>Goals</h2>
                </div>
              </div>
              {goals.length === 0 ? (
                <div className="erp-empty">
                  <strong>No goals yet.</strong>
                  <span>Add weighted goals for employees in this cycle.</span>
                </div>
              ) : (
                <div className="erp-notification-list">
                  {goals.map((item) => (
                    <article className="erp-notification" key={item.id}>
                      <div>
                        <h3>{item.title}</h3>
                        <p>
                          {item.employee
                            ? `${item.employee.firstName} ${item.employee.lastName}`
                            : "Employee"}{" "}
                          · {pretty(item.category)} · weight {Number(item.weight)}%
                        </p>
                      </div>
                      <div className="founder-org-row-actions">
                        <strong className="founder-status">{pretty(item.status)}</strong>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : null}

        {!loading && tab === "reviews" && selectedCycle ? (
          <>
            {canManageReviews && selectedCycle.status === "ACTIVE" ? (
              <section className="erp-section">
                <div className="erp-section-heading">
                  <div>
                    <p className="erp-kicker">Appraisal</p>
                    <h2>Open review</h2>
                  </div>
                </div>
                <form className="founder-form" onSubmit={(event) => void createReview(event)}>
                  <div className="founder-form-grid">
                    <label>
                      <span>Employee</span>
                      <select
                        required
                        value={reviewForm.employeeId}
                        onChange={(event) =>
                          setReviewForm({ ...reviewForm, employeeId: event.target.value })
                        }
                      >
                        <option value="">Select employee</option>
                        {employees.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.firstName} {item.lastName}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>Reviewer</span>
                      <select
                        required
                        value={reviewForm.reviewerEmployeeId}
                        onChange={(event) =>
                          setReviewForm({ ...reviewForm, reviewerEmployeeId: event.target.value })
                        }
                      >
                        <option value="">Select reviewer</option>
                        {employees.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.firstName} {item.lastName}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <button className="erp-button erp-button-primary" disabled={busy}>
                    Open review ↗
                  </button>
                </form>
              </section>
            ) : null}

            <section className="erp-section">
              <div className="erp-section-heading">
                <div>
                  <p className="erp-kicker">Appraisal pipeline</p>
                  <h2>Reviews</h2>
                </div>
              </div>
              {reviews.length === 0 ? (
                <div className="erp-empty">
                  <strong>No reviews yet.</strong>
                  <span>Open a review for an employee in this active cycle.</span>
                </div>
              ) : (
                <div className="erp-notification-list">
                  {reviews.map((item) => (
                    <article className="erp-notification" key={item.id}>
                      <div>
                        <h3>
                          {item.employee
                            ? `${item.employee.firstName} ${item.employee.lastName}`
                            : "Employee"}
                        </h3>
                        <p>
                          Reviewer:{" "}
                          {item.reviewer
                            ? `${item.reviewer.firstName} ${item.reviewer.lastName}`
                            : "—"}{" "}
                          · final {rating(item.finalRating)}
                        </p>
                      </div>
                      <div className="founder-org-row-actions">
                        <strong className="founder-status">{pretty(item.status)}</strong>
                        <button
                          type="button"
                          className="erp-text-button"
                          onClick={() => setSelectedReview(item)}
                        >
                          Open
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {selectedReview ? (
              <section className="erp-section">
                <div className="erp-section-heading">
                  <div>
                    <p className="erp-kicker">Review · {pretty(selectedReview.status)}</p>
                    <h2>
                      {selectedReview.employee
                        ? `${selectedReview.employee.firstName} ${selectedReview.employee.lastName}`
                        : "Review"}
                    </h2>
                    <p>
                      Self {rating(selectedReview.selfRating)} · Manager{" "}
                      {rating(selectedReview.managerRating)} · Final{" "}
                      {rating(selectedReview.finalRating)}
                    </p>
                  </div>
                </div>

                {selectedReview.status === "PENDING_SELF" && isSubject && canSelf ? (
                  <form className="founder-form" onSubmit={(event) => void submitSelf(event)}>
                    <div className="founder-form-grid">
                      <label>
                        <span>Self rating</span>
                        <input
                          required
                          type="number"
                          min="0"
                          max={selectedReview.cycle?.ratingScaleMax ?? 5}
                          step="0.01"
                          value={selfForm.selfRating}
                          onChange={(event) =>
                            setSelfForm({ ...selfForm, selfRating: event.target.value })
                          }
                        />
                      </label>
                      <label className="founder-form-wide">
                        <span>Self-assessment comments</span>
                        <textarea
                          required
                          value={selfForm.selfComments}
                          onChange={(event) =>
                            setSelfForm({ ...selfForm, selfComments: event.target.value })
                          }
                        />
                      </label>
                    </div>
                    <button className="erp-button erp-button-primary" disabled={busy}>
                      Submit self-assessment ↗
                    </button>
                  </form>
                ) : null}

                {selectedReview.status === "PENDING_MANAGER" && canManageReviews ? (
                  <form className="founder-form" onSubmit={(event) => void submitManager(event)}>
                    <div className="founder-form-grid">
                      <label>
                        <span>Manager rating</span>
                        <input
                          required
                          type="number"
                          min="0"
                          max={selectedReview.cycle?.ratingScaleMax ?? 5}
                          step="0.01"
                          value={managerForm.managerRating}
                          onChange={(event) =>
                            setManagerForm({ ...managerForm, managerRating: event.target.value })
                          }
                        />
                      </label>
                      <label className="founder-form-wide">
                        <span>Manager review comments</span>
                        <textarea
                          required
                          value={managerForm.managerComments}
                          onChange={(event) =>
                            setManagerForm({ ...managerForm, managerComments: event.target.value })
                          }
                        />
                      </label>
                    </div>
                    <button className="erp-button erp-button-primary" disabled={busy}>
                      Submit manager review ↗
                    </button>
                  </form>
                ) : null}

                {selectedReview.status === "PENDING_FINALIZATION" && canFinalize ? (
                  <form className="founder-form" onSubmit={(event) => void submitFinalize(event)}>
                    <div className="founder-form-grid">
                      <label>
                        <span>Final rating</span>
                        <input
                          required
                          type="number"
                          min="0"
                          max={selectedReview.cycle?.ratingScaleMax ?? 5}
                          step="0.01"
                          value={finalForm.finalRating}
                          onChange={(event) =>
                            setFinalForm({ ...finalForm, finalRating: event.target.value })
                          }
                        />
                      </label>
                      <label className="founder-form-wide">
                        <span>Calibration notes</span>
                        <textarea
                          value={finalForm.calibrationNotes}
                          onChange={(event) =>
                            setFinalForm({ ...finalForm, calibrationNotes: event.target.value })
                          }
                        />
                      </label>
                    </div>
                    <button className="erp-button erp-button-primary" disabled={busy}>
                      Finalize review ↗
                    </button>
                  </form>
                ) : null}

                {selectedReview.status === "FINALIZED" && isSubject && canSelf ? (
                  <form
                    className="founder-form"
                    onSubmit={(event) => void submitAcknowledge(event)}
                  >
                    <div className="founder-form-grid">
                      <label className="founder-form-wide">
                        <span>Acknowledgement</span>
                        <textarea
                          value={ackForm.acknowledgement}
                          onChange={(event) =>
                            setAckForm({ ...ackForm, acknowledgement: event.target.value })
                          }
                        />
                      </label>
                    </div>
                    <button className="erp-button erp-button-primary" disabled={busy}>
                      Acknowledge review ↗
                    </button>
                  </form>
                ) : null}

                {selectedReview.status === "ACKNOWLEDGED" ? (
                  <div className="erp-empty">
                    <strong>Review complete.</strong>
                    <span>The employee has acknowledged the finalized rating.</span>
                  </div>
                ) : null}
              </section>
            ) : null}
          </>
        ) : null}
      </div>
    </main>
  );
}

export function FounderPerformance() {
  return (
    <ProtectedErp requiredPerformance>
      <FounderPerformanceContent />
    </ProtectedErp>
  );
}
