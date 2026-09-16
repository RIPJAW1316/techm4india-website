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
  Program,
  ProgramAssignment,
  ProgramBatch,
  Student,
} from "@/lib/api/types";

type ApiList<T> = { success: true; data: T[]; meta?: { total: number } };
type Tab = "programs" | "students" | "delivery";

const emptyProgram = {
  code: "",
  name: "",
  slug: "",
  category: "",
  shortDescription: "",
  durationHours: "24",
  deliveryMode: "OFFLINE",
  assessmentMethod: "PROJECT",
  capacity: "30",
  divisionId: "",
  departmentId: "",
};

const emptyModule = { title: "", description: "", position: "1" };

const emptyLesson = {
  moduleId: "",
  title: "",
  contentType: "TEXT",
  contentBody: "",
  contentUrl: "",
  durationMinutes: "60",
  position: "1",
};

const emptyStudent = {
  studentCode: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  guardianName: "",
  guardianPhone: "",
};

const emptyBatch = {
  code: "",
  name: "",
  trainerEmployeeId: "",
  startsOn: "",
  endsOn: "",
  capacity: "20",
};

const pretty = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const dateValue = (value: string) => new Date(value).toLocaleDateString("en-IN");

async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

function FounderProgramsContent() {
  const { context } = useErpAuth();
  const [tab, setTab] = useState<Tab>("programs");
  const [programs, setPrograms] = useState<Program[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [divisions, setDivisions] = useState<CompanyDivision[]>([]);
  const [departments, setDepartments] = useState<CompanyDepartment[]>([]);
  const [employees, setEmployees] = useState<HrEmployeeSummary[]>([]);

  const [selected, setSelected] = useState<Program | null>(null);
  const [batches, setBatches] = useState<ProgramBatch[]>([]);
  const [batchDetail, setBatchDetail] = useState<ProgramBatch | null>(null);
  const [assignments, setAssignments] = useState<ProgramAssignment[]>([]);
  const [assignmentForm, setAssignmentForm] = useState({ title: "", maxScore: "100" });

  const [programForm, setProgramForm] = useState(emptyProgram);
  const [moduleForm, setModuleForm] = useState(emptyModule);
  const [lessonForm, setLessonForm] = useState(emptyLesson);
  const [studentForm, setStudentForm] = useState(emptyStudent);
  const [batchForm, setBatchForm] = useState(emptyBatch);
  const [progressForm, setProgressForm] = useState({
    enrollmentId: "",
    lessonId: "",
    progressPercent: "100",
  });

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const canManagePrograms = Boolean(context?.permissions.includes("programs.manage"));
  const canPublish = Boolean(context?.permissions.includes("programs.publish"));
  const canManageContent = Boolean(context?.permissions.includes("programs.content.manage"));
  const canManageBatches = Boolean(context?.permissions.includes("programs.batches.manage"));
  const canManageEnrollments = Boolean(
    context?.permissions.includes("programs.enrollments.manage"),
  );
  const canManageStudents = Boolean(context?.permissions.includes("students.manage"));

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const programResponse = await apiFetchV2<ApiList<Program>>("/programs?limit=100");
      setPrograms(programResponse.data);
      const [studentResponse, divisionResponse, departmentResponse, employeeResponse] =
        await Promise.all([
          safe<ApiList<Student>>(apiFetchV2("/students?limit=100"), {
            success: true,
            data: [],
          }),
          safe<ApiResponse<CompanyDivision[]>>(apiFetchV2("/company/divisions"), {
            success: true,
            data: [],
          }),
          safe<ApiResponse<CompanyDepartment[]>>(apiFetchV2("/company/departments"), {
            success: true,
            data: [],
          }),
          safe<ApiList<HrEmployeeSummary>>(apiFetchV2("/hr/employees?limit=100"), {
            success: true,
            data: [],
          }),
        ]);
      setStudents(studentResponse.data);
      setDivisions(divisionResponse.data);
      setDepartments(departmentResponse.data);
      setEmployees(employeeResponse.data);
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Programs workspace could not load.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredDepartments = useMemo(
    () =>
      programForm.divisionId
        ? departments.filter((item) => item.divisionId === programForm.divisionId)
        : departments,
    [departments, programForm.divisionId],
  );

  const publishedPrograms = useMemo(
    () => programs.filter((item) => item.status === "PUBLISHED"),
    [programs],
  );

  const lessonOptions = useMemo(
    () =>
      (selected?.modules ?? []).flatMap((programModule) =>
        (programModule.lessons ?? []).map((lesson) => ({
          id: lesson.id,
          label: `${programModule.title} · ${lesson.title}`,
        })),
      ),
    [selected],
  );

  const refreshSelected = useCallback(async (programId: string) => {
    const [detail, batchList, assignmentList] = await Promise.all([
      apiFetchV2<ApiResponse<Program>>(`/programs/${programId}`),
      safe<ApiList<ProgramBatch>>(apiFetchV2(`/programs/${programId}/batches?limit=100`), {
        success: true,
        data: [],
      }),
      safe<ApiList<ProgramAssignment>>(apiFetchV2(`/programs/${programId}/assignments?limit=100`), {
        success: true,
        data: [],
      }),
    ]);
    setSelected(detail.data);
    setBatches(batchList.data);
    setAssignments(assignmentList.data);
  }, []);

  async function openProgram(id: string, nextTab?: Tab) {
    setError(null);
    setBatchDetail(null);
    try {
      await refreshSelected(id);
      if (nextTab) setTab(nextTab);
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Program details could not load.");
    }
  }

  async function openBatchDetail(id: string) {
    setError(null);
    try {
      const response = await apiFetchV2<ApiResponse<ProgramBatch>>(`/program-batches/${id}`);
      setBatchDetail(response.data);
      setProgressForm((current) => ({
        ...current,
        enrollmentId: response.data.enrollments?.[0]?.id ?? "",
      }));
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Batch details could not load.");
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
      if (selected) await refreshSelected(selected.id);
      if (batchDetail) await openBatchDetail(batchDetail.id);
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "The action could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  async function createProgram(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runAction(
      () =>
        apiFetchV2("/programs", {
          method: "POST",
          body: JSON.stringify({
            code: programForm.code,
            name: programForm.name,
            slug: programForm.slug,
            category: programForm.category,
            shortDescription: programForm.shortDescription,
            durationHours: Number(programForm.durationHours),
            deliveryMode: programForm.deliveryMode,
            assessmentMethod: programForm.assessmentMethod,
            capacity: programForm.capacity ? Number(programForm.capacity) : undefined,
            divisionId: programForm.divisionId || undefined,
            departmentId: programForm.departmentId || undefined,
          }),
        }),
      "Draft program created.",
    );
    setProgramForm(emptyProgram);
  }

  async function programAction(id: string, action: "submit" | "publish") {
    await runAction(
      () => apiFetchV2(`/programs/${id}/${action}`, { method: "POST" }),
      action === "submit" ? "Program submitted for review." : "Program published.",
    );
  }

  async function createModule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    await runAction(
      () =>
        apiFetchV2(`/programs/${selected.id}/modules`, {
          method: "POST",
          body: JSON.stringify({
            title: moduleForm.title,
            description: moduleForm.description || undefined,
            position: Number(moduleForm.position),
          }),
        }),
      "Module added to curriculum.",
    );
    setModuleForm(emptyModule);
  }

  async function createLesson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runAction(
      () =>
        apiFetchV2(`/program-modules/${lessonForm.moduleId}/lessons`, {
          method: "POST",
          body: JSON.stringify({
            title: lessonForm.title,
            contentType: lessonForm.contentType,
            contentBody: lessonForm.contentBody || undefined,
            contentUrl: lessonForm.contentUrl || undefined,
            durationMinutes: Number(lessonForm.durationMinutes),
            position: Number(lessonForm.position),
          }),
        }),
      "Lesson added to module.",
    );
    setLessonForm((current) => ({ ...emptyLesson, moduleId: current.moduleId }));
  }

  async function createStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runAction(
      () =>
        apiFetchV2("/students", {
          method: "POST",
          body: JSON.stringify({
            studentCode: studentForm.studentCode,
            firstName: studentForm.firstName,
            lastName: studentForm.lastName,
            email: studentForm.email || undefined,
            phone: studentForm.phone || undefined,
            guardianName: studentForm.guardianName || undefined,
            guardianPhone: studentForm.guardianPhone || undefined,
            consentAt: new Date().toISOString(),
          }),
        }),
      "Student registered with recorded consent.",
    );
    setStudentForm(emptyStudent);
  }

  async function createBatch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    await runAction(
      () =>
        apiFetchV2(`/programs/${selected.id}/batches`, {
          method: "POST",
          body: JSON.stringify({
            code: batchForm.code,
            name: batchForm.name,
            trainerEmployeeId: batchForm.trainerEmployeeId || undefined,
            startsOn: batchForm.startsOn,
            endsOn: batchForm.endsOn,
            capacity: Number(batchForm.capacity),
          }),
        }),
      "Batch created for the published program.",
    );
    setBatchForm(emptyBatch);
  }

  async function enrollStudent(batchId: string, studentId: string) {
    if (!studentId) return;
    await runAction(
      () =>
        apiFetchV2(`/program-batches/${batchId}/enrollments`, {
          method: "POST",
          body: JSON.stringify({ studentId }),
        }),
      "Student enrolled in the batch.",
    );
  }

  async function updateProgress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runAction(
      () =>
        apiFetchV2(
          `/program-enrollments/${progressForm.enrollmentId}/lessons/${progressForm.lessonId}/progress`,
          {
            method: "PUT",
            body: JSON.stringify({ progressPercent: Number(progressForm.progressPercent) }),
          },
        ),
      "Lesson progress recorded.",
    );
  }

  async function createAssignment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    await runAction(
      () =>
        apiFetchV2(`/programs/${selected.id}/assignments`, {
          method: "POST",
          body: JSON.stringify({
            title: assignmentForm.title,
            maxScore: Number(assignmentForm.maxScore),
          }),
        }),
      "Assignment created.",
    );
    setAssignmentForm({ title: "", maxScore: "100" });
  }

  async function issueCertificate(enrollmentId: string) {
    await runAction(
      () =>
        apiFetchV2(`/program-enrollments/${enrollmentId}/certificate`, {
          method: "POST",
          body: JSON.stringify({}),
        }),
      "Completion certificate issued.",
    );
  }

  const draftCount = programs.filter((item) => item.status !== "PUBLISHED").length;

  return (
    <main className="erp-main">
      <div className="erp-content">
        <FounderModuleNavigation active="programs" />

        <section className="erp-welcome">
          <div>
            <p className="erp-kicker">Education delivery · review controlled</p>
            <h1>
              Programs &amp; <em>learning</em>
            </h1>
            <p>
              Author curriculum, route programmes through founder review and publication, then
              deliver them to consented students through capacity-controlled batches.
            </p>
          </div>
          <div className="erp-welcome-code">
            <span>Published programmes</span>
            <strong>{publishedPrograms.length}</strong>
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

        <section className="erp-stat-grid" aria-label="Programs summary">
          <article>
            <span>Total programmes</span>
            <strong>{programs.length}</strong>
            <small>All lifecycle states</small>
          </article>
          <article>
            <span>In authoring / review</span>
            <strong>{draftCount}</strong>
            <small>Draft or in review</small>
          </article>
          <article>
            <span>Published</span>
            <strong>{publishedPrograms.length}</strong>
            <small>Ready for batches</small>
          </article>
          <article>
            <span>Registered students</span>
            <strong>{students.length}</strong>
            <small>Consent on file</small>
          </article>
        </section>

        <nav className="founder-tabs" aria-label="Programs workspace">
          <button
            type="button"
            className={tab === "programs" ? "is-active" : ""}
            onClick={() => setTab("programs")}
          >
            Programmes
          </button>
          <button
            type="button"
            className={tab === "students" ? "is-active" : ""}
            onClick={() => setTab("students")}
          >
            Students
          </button>
          <button
            type="button"
            className={tab === "delivery" ? "is-active" : ""}
            onClick={() => setTab("delivery")}
          >
            Delivery
          </button>
        </nav>

        {loading ? (
          <div className="erp-state" role="status">
            <span className="erp-loader" aria-hidden="true" />
            <p>Loading programs workspace</p>
          </div>
        ) : null}

        {!loading && tab === "programs" ? (
          <>
            {canManagePrograms ? (
              <section className="erp-section">
                <div className="erp-section-heading">
                  <div>
                    <p className="erp-kicker">Curriculum blueprint</p>
                    <h2>Create program</h2>
                  </div>
                </div>
                <form className="founder-form" onSubmit={(event) => void createProgram(event)}>
                  <div className="founder-form-grid">
                    <label>
                      <span>Program code</span>
                      <input
                        required
                        value={programForm.code}
                        onChange={(event) =>
                          setProgramForm({ ...programForm, code: event.target.value })
                        }
                      />
                    </label>
                    <label>
                      <span>Program name</span>
                      <input
                        required
                        value={programForm.name}
                        onChange={(event) =>
                          setProgramForm({ ...programForm, name: event.target.value })
                        }
                      />
                    </label>
                    <label>
                      <span>Slug</span>
                      <input
                        required
                        value={programForm.slug}
                        onChange={(event) =>
                          setProgramForm({ ...programForm, slug: event.target.value })
                        }
                      />
                    </label>
                    <label>
                      <span>Category</span>
                      <input
                        required
                        value={programForm.category}
                        onChange={(event) =>
                          setProgramForm({ ...programForm, category: event.target.value })
                        }
                      />
                    </label>
                    <label>
                      <span>Delivery mode</span>
                      <select
                        value={programForm.deliveryMode}
                        onChange={(event) =>
                          setProgramForm({ ...programForm, deliveryMode: event.target.value })
                        }
                      >
                        {["ONLINE", "OFFLINE", "HYBRID"].map((item) => (
                          <option key={item} value={item}>
                            {pretty(item)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>Assessment method</span>
                      <input
                        required
                        value={programForm.assessmentMethod}
                        onChange={(event) =>
                          setProgramForm({ ...programForm, assessmentMethod: event.target.value })
                        }
                      />
                    </label>
                    <label>
                      <span>Duration (hours)</span>
                      <input
                        required
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={programForm.durationHours}
                        onChange={(event) =>
                          setProgramForm({ ...programForm, durationHours: event.target.value })
                        }
                      />
                    </label>
                    <label>
                      <span>Capacity</span>
                      <input
                        type="number"
                        min="1"
                        value={programForm.capacity}
                        onChange={(event) =>
                          setProgramForm({ ...programForm, capacity: event.target.value })
                        }
                      />
                    </label>
                    <label>
                      <span>Division</span>
                      <select
                        value={programForm.divisionId}
                        onChange={(event) =>
                          setProgramForm({
                            ...programForm,
                            divisionId: event.target.value,
                            departmentId: "",
                          })
                        }
                      >
                        <option value="">Organization-wide</option>
                        {divisions.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>Department</span>
                      <select
                        value={programForm.departmentId}
                        onChange={(event) =>
                          setProgramForm({ ...programForm, departmentId: event.target.value })
                        }
                      >
                        <option value="">Not specified</option>
                        {filteredDepartments.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="founder-form-wide">
                      <span>Short description</span>
                      <textarea
                        required
                        minLength={2}
                        value={programForm.shortDescription}
                        onChange={(event) =>
                          setProgramForm({ ...programForm, shortDescription: event.target.value })
                        }
                      />
                    </label>
                  </div>
                  <button className="erp-button erp-button-primary" disabled={busy}>
                    Create program ↗
                  </button>
                </form>
              </section>
            ) : null}

            <section className="erp-section">
              <div className="erp-section-heading">
                <div>
                  <p className="erp-kicker">Programme catalogue</p>
                  <h2>Programmes</h2>
                </div>
              </div>
              {programs.length === 0 ? (
                <div className="erp-empty">
                  <strong>No programmes yet.</strong>
                  <span>Create a draft to begin authoring curriculum.</span>
                </div>
              ) : (
                <div className="erp-notification-list">
                  {programs.map((item) => (
                    <article className="erp-notification" key={item.id}>
                      <div>
                        <span className="founder-org-code">
                          {item.code} · v{item.version}
                        </span>
                        <h3>{item.name}</h3>
                        <p>
                          {item.category} · {pretty(item.deliveryMode)} ·{" "}
                          {Number(item.durationHours)} hrs
                        </p>
                        <small>
                          {item.division?.name ?? "Organization-wide"} · {item._count?.modules ?? 0}{" "}
                          modules
                        </small>
                      </div>
                      <div className="founder-org-row-actions">
                        <strong className="founder-status">{pretty(item.status)}</strong>
                        <button
                          type="button"
                          className="erp-text-button"
                          onClick={() => void openProgram(item.id)}
                        >
                          Open curriculum
                        </button>
                        {item.status === "DRAFT" && canManageContent ? (
                          <button
                            type="button"
                            className="erp-text-button"
                            disabled={busy}
                            onClick={() => void programAction(item.id, "submit")}
                          >
                            Submit for review
                          </button>
                        ) : null}
                        {item.status === "IN_REVIEW" && canPublish ? (
                          <button
                            type="button"
                            className="erp-text-button"
                            disabled={busy}
                            onClick={() => void programAction(item.id, "publish")}
                          >
                            Publish program
                          </button>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {selected ? (
              <section className="erp-section">
                <div className="erp-section-heading">
                  <div>
                    <p className="erp-kicker">Curriculum · {pretty(selected.status)}</p>
                    <h2>{selected.name}</h2>
                    <p>
                      {selected.code} · v{selected.version}
                    </p>
                  </div>
                </div>

                {canManageContent &&
                (selected.status === "DRAFT" || selected.status === "IN_REVIEW") ? (
                  <form className="founder-form" onSubmit={(event) => void createModule(event)}>
                    <div className="founder-form-grid">
                      <label>
                        <span>Module title</span>
                        <input
                          required
                          value={moduleForm.title}
                          onChange={(event) =>
                            setModuleForm({ ...moduleForm, title: event.target.value })
                          }
                        />
                      </label>
                      <label>
                        <span>Position</span>
                        <input
                          required
                          type="number"
                          min="1"
                          value={moduleForm.position}
                          onChange={(event) =>
                            setModuleForm({ ...moduleForm, position: event.target.value })
                          }
                        />
                      </label>
                      <label className="founder-form-wide">
                        <span>Description</span>
                        <textarea
                          value={moduleForm.description}
                          onChange={(event) =>
                            setModuleForm({ ...moduleForm, description: event.target.value })
                          }
                        />
                      </label>
                    </div>
                    <button className="erp-button erp-button-primary" disabled={busy}>
                      Add module ↗
                    </button>
                  </form>
                ) : null}

                <div className="erp-notification-list">
                  {(selected.modules ?? []).length === 0 ? (
                    <div className="erp-empty">
                      <strong>No modules yet.</strong>
                      <span>Add a module, then attach lessons to it.</span>
                    </div>
                  ) : null}
                  {(selected.modules ?? []).map((programModule) => (
                    <article className="erp-notification" key={programModule.id}>
                      <div>
                        <span className="founder-org-code">Module {programModule.position}</span>
                        <h3>{programModule.title}</h3>
                        <p>
                          {(programModule.lessons ?? []).length} lesson
                          {(programModule.lessons ?? []).length === 1 ? "" : "s"}
                        </p>
                        <ul className="founder-plain-list">
                          {(programModule.lessons ?? []).map((lesson) => (
                            <li key={lesson.id}>
                              {lesson.position}. {lesson.title} · {pretty(lesson.contentType)} ·{" "}
                              {lesson.durationMinutes} min · {pretty(lesson.status)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </article>
                  ))}
                </div>

                {canManageContent &&
                (selected.status === "DRAFT" || selected.status === "IN_REVIEW") &&
                (selected.modules ?? []).length > 0 ? (
                  <form className="founder-form" onSubmit={(event) => void createLesson(event)}>
                    <div className="founder-form-grid">
                      <label>
                        <span>Module</span>
                        <select
                          required
                          value={lessonForm.moduleId}
                          onChange={(event) =>
                            setLessonForm({ ...lessonForm, moduleId: event.target.value })
                          }
                        >
                          <option value="">Select module</option>
                          {(selected.modules ?? []).map((programModule) => (
                            <option key={programModule.id} value={programModule.id}>
                              {programModule.title}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        <span>Lesson title</span>
                        <input
                          required
                          value={lessonForm.title}
                          onChange={(event) =>
                            setLessonForm({ ...lessonForm, title: event.target.value })
                          }
                        />
                      </label>
                      <label>
                        <span>Content type</span>
                        <select
                          value={lessonForm.contentType}
                          onChange={(event) =>
                            setLessonForm({ ...lessonForm, contentType: event.target.value })
                          }
                        >
                          {["TEXT", "VIDEO", "PDF", "LIVE"].map((item) => (
                            <option key={item} value={item}>
                              {pretty(item)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        <span>Position</span>
                        <input
                          required
                          type="number"
                          min="1"
                          value={lessonForm.position}
                          onChange={(event) =>
                            setLessonForm({ ...lessonForm, position: event.target.value })
                          }
                        />
                      </label>
                      <label>
                        <span>Duration (minutes)</span>
                        <input
                          type="number"
                          min="0"
                          value={lessonForm.durationMinutes}
                          onChange={(event) =>
                            setLessonForm({ ...lessonForm, durationMinutes: event.target.value })
                          }
                        />
                      </label>
                      {lessonForm.contentType === "TEXT" ? (
                        <label className="founder-form-wide">
                          <span>Content body</span>
                          <textarea
                            required
                            value={lessonForm.contentBody}
                            onChange={(event) =>
                              setLessonForm({ ...lessonForm, contentBody: event.target.value })
                            }
                          />
                        </label>
                      ) : (
                        <label className="founder-form-wide">
                          <span>HTTPS content URL</span>
                          <input
                            required
                            type="url"
                            pattern="https://.*"
                            value={lessonForm.contentUrl}
                            onChange={(event) =>
                              setLessonForm({ ...lessonForm, contentUrl: event.target.value })
                            }
                          />
                        </label>
                      )}
                    </div>
                    <button className="erp-button erp-button-primary" disabled={busy}>
                      Add lesson ↗
                    </button>
                  </form>
                ) : null}
              </section>
            ) : null}
          </>
        ) : null}

        {!loading && tab === "students" ? (
          <>
            {canManageStudents ? (
              <section className="erp-section">
                <div className="erp-section-heading">
                  <div>
                    <p className="erp-kicker">Consent recorded</p>
                    <h2>Register student</h2>
                  </div>
                </div>
                <form className="founder-form" onSubmit={(event) => void createStudent(event)}>
                  <div className="founder-form-grid">
                    <label>
                      <span>Student code</span>
                      <input
                        required
                        value={studentForm.studentCode}
                        onChange={(event) =>
                          setStudentForm({ ...studentForm, studentCode: event.target.value })
                        }
                      />
                    </label>
                    <label>
                      <span>First name</span>
                      <input
                        required
                        value={studentForm.firstName}
                        onChange={(event) =>
                          setStudentForm({ ...studentForm, firstName: event.target.value })
                        }
                      />
                    </label>
                    <label>
                      <span>Last name</span>
                      <input
                        required
                        value={studentForm.lastName}
                        onChange={(event) =>
                          setStudentForm({ ...studentForm, lastName: event.target.value })
                        }
                      />
                    </label>
                    <label>
                      <span>Email</span>
                      <input
                        type="email"
                        value={studentForm.email}
                        onChange={(event) =>
                          setStudentForm({ ...studentForm, email: event.target.value })
                        }
                      />
                    </label>
                    <label>
                      <span>Phone</span>
                      <input
                        value={studentForm.phone}
                        onChange={(event) =>
                          setStudentForm({ ...studentForm, phone: event.target.value })
                        }
                      />
                    </label>
                    <label>
                      <span>Guardian name</span>
                      <input
                        value={studentForm.guardianName}
                        onChange={(event) =>
                          setStudentForm({ ...studentForm, guardianName: event.target.value })
                        }
                      />
                    </label>
                    <label>
                      <span>Guardian phone</span>
                      <input
                        value={studentForm.guardianPhone}
                        onChange={(event) =>
                          setStudentForm({ ...studentForm, guardianPhone: event.target.value })
                        }
                      />
                    </label>
                  </div>
                  <p className="founder-form-note">
                    Submitting records the current timestamp as the student&apos;s data-processing
                    consent.
                  </p>
                  <button className="erp-button erp-button-primary" disabled={busy}>
                    Register student ↗
                  </button>
                </form>
              </section>
            ) : null}

            <section className="erp-section">
              <div className="erp-section-heading">
                <div>
                  <p className="erp-kicker">Learner directory</p>
                  <h2>Students</h2>
                </div>
              </div>
              {students.length === 0 ? (
                <div className="erp-empty">
                  <strong>No students yet.</strong>
                  <span>Register a consented student to enable enrollment.</span>
                </div>
              ) : (
                <div className="erp-notification-list">
                  {students.map((item) => (
                    <article className="erp-notification" key={item.id}>
                      <div>
                        <span className="founder-org-code">{item.studentCode}</span>
                        <h3>
                          {item.firstName} {item.lastName}
                        </h3>
                        <p>
                          {item.email ?? "No email"} · consent {dateValue(item.consentAt)}
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

        {!loading && tab === "delivery" ? (
          <>
            <section className="erp-section">
              <div className="erp-section-heading">
                <div>
                  <p className="erp-kicker">Published programmes only</p>
                  <h2>Choose a programme to deliver</h2>
                </div>
              </div>
              {publishedPrograms.length === 0 ? (
                <div className="erp-empty">
                  <strong>No published programmes.</strong>
                  <span>Publish a programme before creating delivery batches.</span>
                </div>
              ) : (
                <label className="founder-form-inline">
                  <span>Programme</span>
                  <select
                    value={selected?.status === "PUBLISHED" ? selected.id : ""}
                    onChange={(event) => event.target.value && void openProgram(event.target.value)}
                  >
                    <option value="">Select a published programme</option>
                    {publishedPrograms.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.code} · {item.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </section>

            {selected && selected.status === "PUBLISHED" ? (
              <>
                {canManageBatches ? (
                  <section className="erp-section">
                    <div className="erp-section-heading">
                      <div>
                        <p className="erp-kicker">Cohort delivery</p>
                        <h2>Create batch</h2>
                      </div>
                    </div>
                    <form className="founder-form" onSubmit={(event) => void createBatch(event)}>
                      <div className="founder-form-grid">
                        <label>
                          <span>Batch code</span>
                          <input
                            required
                            value={batchForm.code}
                            onChange={(event) =>
                              setBatchForm({ ...batchForm, code: event.target.value })
                            }
                          />
                        </label>
                        <label>
                          <span>Batch name</span>
                          <input
                            required
                            value={batchForm.name}
                            onChange={(event) =>
                              setBatchForm({ ...batchForm, name: event.target.value })
                            }
                          />
                        </label>
                        <label>
                          <span>Trainer</span>
                          <select
                            value={batchForm.trainerEmployeeId}
                            onChange={(event) =>
                              setBatchForm({ ...batchForm, trainerEmployeeId: event.target.value })
                            }
                          >
                            <option value="">Not assigned</option>
                            {employees.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.firstName} {item.lastName}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          <span>Starts on</span>
                          <input
                            required
                            type="date"
                            value={batchForm.startsOn}
                            onChange={(event) =>
                              setBatchForm({ ...batchForm, startsOn: event.target.value })
                            }
                          />
                        </label>
                        <label>
                          <span>Ends on</span>
                          <input
                            required
                            type="date"
                            value={batchForm.endsOn}
                            onChange={(event) =>
                              setBatchForm({ ...batchForm, endsOn: event.target.value })
                            }
                          />
                        </label>
                        <label>
                          <span>Capacity</span>
                          <input
                            required
                            type="number"
                            min="1"
                            value={batchForm.capacity}
                            onChange={(event) =>
                              setBatchForm({ ...batchForm, capacity: event.target.value })
                            }
                          />
                        </label>
                      </div>
                      <button className="erp-button erp-button-primary" disabled={busy}>
                        Create batch ↗
                      </button>
                    </form>
                  </section>
                ) : null}

                <section className="erp-section">
                  <div className="erp-section-heading">
                    <div>
                      <p className="erp-kicker">Delivery pipeline</p>
                      <h2>Batches</h2>
                    </div>
                  </div>
                  {batches.length === 0 ? (
                    <div className="erp-empty">
                      <strong>No batches yet.</strong>
                      <span>Create a batch to enroll students.</span>
                    </div>
                  ) : (
                    <div className="erp-notification-list">
                      {batches.map((item) => (
                        <article className="erp-notification" key={item.id}>
                          <div>
                            <span className="founder-org-code">{item.code}</span>
                            <h3>{item.name}</h3>
                            <p>
                              {dateValue(item.startsOn)} → {dateValue(item.endsOn)} ·{" "}
                              {item._count?.enrollments ?? 0}/{item.capacity} enrolled
                            </p>
                          </div>
                          <div className="founder-org-row-actions">
                            <strong className="founder-status">{pretty(item.status)}</strong>
                            {item.status === "PLANNED" && canManageBatches ? (
                              <button
                                type="button"
                                className="erp-text-button"
                                disabled={busy}
                                onClick={() =>
                                  void runAction(
                                    () =>
                                      apiFetchV2(`/program-batches/${item.id}/open`, {
                                        method: "POST",
                                      }),
                                    "Batch opened for enrollment.",
                                  )
                                }
                              >
                                Open batch
                              </button>
                            ) : null}
                            <button
                              type="button"
                              className="erp-text-button"
                              onClick={() => void openBatchDetail(item.id)}
                            >
                              View roster
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>

                <section className="erp-section">
                  <div className="erp-section-heading">
                    <div>
                      <p className="erp-kicker">Assessment</p>
                      <h2>Assignments</h2>
                    </div>
                  </div>
                  {canManageContent ? (
                    <form
                      className="founder-form"
                      onSubmit={(event) => void createAssignment(event)}
                    >
                      <div className="founder-form-grid">
                        <label className="founder-form-wide">
                          <span>Assignment title</span>
                          <input
                            required
                            value={assignmentForm.title}
                            onChange={(event) =>
                              setAssignmentForm({ ...assignmentForm, title: event.target.value })
                            }
                          />
                        </label>
                        <label>
                          <span>Max score</span>
                          <input
                            required
                            type="number"
                            min="1"
                            max="1000"
                            value={assignmentForm.maxScore}
                            onChange={(event) =>
                              setAssignmentForm({ ...assignmentForm, maxScore: event.target.value })
                            }
                          />
                        </label>
                      </div>
                      <button className="erp-button erp-button-primary" disabled={busy}>
                        Create assignment ↗
                      </button>
                    </form>
                  ) : null}
                  <div className="erp-notification-list">
                    {assignments.length === 0 ? (
                      <div className="erp-empty">
                        <strong>No assignments yet.</strong>
                        <span>Create an assignment to grade learners.</span>
                      </div>
                    ) : null}
                    {assignments.map((item) => (
                      <article className="erp-notification" key={item.id}>
                        <div>
                          <h3>{item.title}</h3>
                          <p>Max score {Number(item.maxScore)}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                {batchDetail ? (
                  <section className="erp-section">
                    <div className="erp-section-heading">
                      <div>
                        <p className="erp-kicker">Batch roster · {pretty(batchDetail.status)}</p>
                        <h2>{batchDetail.name}</h2>
                      </div>
                    </div>

                    {canManageEnrollments &&
                    (batchDetail.status === "OPEN" || batchDetail.status === "ACTIVE") ? (
                      <form
                        className="founder-form"
                        onSubmit={(event) => {
                          event.preventDefault();
                          const data = new FormData(event.currentTarget);
                          void enrollStudent(batchDetail.id, String(data.get("studentId") ?? ""));
                        }}
                      >
                        <div className="founder-form-grid">
                          <label>
                            <span>Student</span>
                            <select required name="studentId" defaultValue="">
                              <option value="">Select a student</option>
                              {students.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.studentCode} · {item.firstName} {item.lastName}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                        <button className="erp-button erp-button-primary" disabled={busy}>
                          Enroll student ↗
                        </button>
                      </form>
                    ) : null}

                    <div className="erp-notification-list">
                      {(batchDetail.enrollments ?? []).length === 0 ? (
                        <div className="erp-empty">
                          <strong>No enrollments yet.</strong>
                          <span>Open the batch and enroll a registered student.</span>
                        </div>
                      ) : null}
                      {(batchDetail.enrollments ?? []).map((enrollment) => (
                        <article className="erp-notification" key={enrollment.id}>
                          <div>
                            <h3>
                              {enrollment.student
                                ? `${enrollment.student.firstName} ${enrollment.student.lastName}`
                                : "Student"}
                            </h3>
                            <p>
                              {enrollment.student?.studentCode} ·{" "}
                              {Number(enrollment.progressPercent)}% complete
                            </p>
                          </div>
                          <div className="founder-org-row-actions">
                            <strong className="founder-status">{pretty(enrollment.status)}</strong>
                            {canManageContent && enrollment.status === "COMPLETED" ? (
                              <button
                                type="button"
                                className="erp-text-button"
                                disabled={busy}
                                onClick={() => void issueCertificate(enrollment.id)}
                              >
                                Issue certificate
                              </button>
                            ) : null}
                          </div>
                        </article>
                      ))}
                    </div>

                    {canManageEnrollments &&
                    (batchDetail.enrollments ?? []).length > 0 &&
                    lessonOptions.length > 0 ? (
                      <form
                        className="founder-form"
                        onSubmit={(event) => void updateProgress(event)}
                      >
                        <div className="founder-form-grid">
                          <label>
                            <span>Enrollment</span>
                            <select
                              required
                              value={progressForm.enrollmentId}
                              onChange={(event) =>
                                setProgressForm({
                                  ...progressForm,
                                  enrollmentId: event.target.value,
                                })
                              }
                            >
                              <option value="">Select enrollment</option>
                              {(batchDetail.enrollments ?? []).map((enrollment) => (
                                <option key={enrollment.id} value={enrollment.id}>
                                  {enrollment.student
                                    ? `${enrollment.student.firstName} ${enrollment.student.lastName}`
                                    : enrollment.id}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label>
                            <span>Lesson</span>
                            <select
                              required
                              value={progressForm.lessonId}
                              onChange={(event) =>
                                setProgressForm({ ...progressForm, lessonId: event.target.value })
                              }
                            >
                              <option value="">Select lesson</option>
                              {lessonOptions.map((lesson) => (
                                <option key={lesson.id} value={lesson.id}>
                                  {lesson.label}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label>
                            <span>Progress (%)</span>
                            <input
                              required
                              type="number"
                              min="0"
                              max="100"
                              value={progressForm.progressPercent}
                              onChange={(event) =>
                                setProgressForm({
                                  ...progressForm,
                                  progressPercent: event.target.value,
                                })
                              }
                            />
                          </label>
                        </div>
                        <button className="erp-button erp-button-primary" disabled={busy}>
                          Update lesson progress ↗
                        </button>
                      </form>
                    ) : null}
                  </section>
                ) : null}
              </>
            ) : null}
          </>
        ) : null}
      </div>
    </main>
  );
}

export function FounderPrograms() {
  return (
    <ProtectedErp requiredPrograms>
      <FounderProgramsContent />
    </ProtectedErp>
  );
}
