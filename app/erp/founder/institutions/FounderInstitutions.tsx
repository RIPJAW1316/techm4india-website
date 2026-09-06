"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { apiFetchV2, ApiError } from "@/lib/api/client";
import { ErpLoading, ProtectedErp } from "../../components/ProtectedErp";

type Owner = { id: string; name: string };
type Account = {
  id: string;
  name: string;
  accountType: string;
  status: string;
  owner?: { firstName: string; lastName: string } | null;
};
type Opportunity = {
  id: string;
  name: string;
  stage: string;
  estimatedValue: string | number | null;
  currency: string | null;
};
type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  roleTitle: string | null;
  department: string | null;
  email: string | null;
  phone: string | null;
  alternatePhone: string | null;
  isPrimary: boolean;
  isDecisionMaker: boolean;
};
type Engagement = {
  id: string;
  title: string;
  type: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  ownerEmployeeId: string | null;
  owner?: { firstName: string; lastName: string } | null;
  crmOpportunityId: string | null;
  crmOpportunity?: Opportunity | null;
  estimatedParticipants: number | null;
  notes: string | null;
};
type Institution = {
  id: string;
  code: string;
  name: string;
  shortName: string | null;
  type: string;
  status: string;
  website: string | null;
  officialEmail: string | null;
  officialPhone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  relationshipOwnerEmployeeId: string | null;
  relationshipOwner?: { firstName: string; lastName: string } | null;
  primaryContact?: Contact | null;
  crmAccountId: string | null;
  crmAccount?: Account | null;
  studentStrength: number | null;
  notes: string | null;
  archivedAt: string | null;
  contacts?: Contact[];
  engagements?: Engagement[];
  _count?: { engagements: number };
};
type Dashboard = {
  total: number;
  active: number;
  prospects: number;
  onboarding: number;
  engagementCounts: Record<string, number>;
  upcoming: Engagement[];
};
type Tab = "overview" | "contacts" | "engagements" | "crm";
const types = [
  "SCHOOL",
  "COLLEGE",
  "UNIVERSITY",
  "TRAINING_INSTITUTE",
  "CORPORATE",
  "OTHER",
];
const statuses = ["PROSPECT", "ONBOARDING", "ACTIVE", "INACTIVE", "ARCHIVED"];
const engagementTypes = [
  "WORKSHOP",
  "TRAINING",
  "BOOTCAMP",
  "PROGRAM",
  "CONSULTING",
  "PARTNERSHIP",
  "OTHER",
];
const engagementStatuses = [
  "PLANNED",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "ARCHIVED",
];
const emptyInstitution = {
  code: "",
  name: "",
  shortName: "",
  type: "SCHOOL",
  status: "PROSPECT",
  website: "",
  officialEmail: "",
  officialPhone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  relationshipOwnerEmployeeId: "",
  crmAccountId: "",
  studentStrength: "",
  notes: "",
};
const emptyContact = {
  firstName: "",
  lastName: "",
  roleTitle: "",
  department: "",
  email: "",
  phone: "",
  alternatePhone: "",
  isPrimary: false,
  isDecisionMaker: false,
};
const emptyEngagement = {
  title: "",
  type: "WORKSHOP",
  status: "PLANNED",
  startDate: "",
  endDate: "",
  ownerEmployeeId: "",
  crmOpportunityId: "",
  estimatedParticipants: "",
  notes: "",
};
const date = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "—";
const inputDate = (value: string | null) => value?.slice(0, 10) ?? "";

function Content() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [employees, setEmployees] = useState<Owner[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [detail, setDetail] = useState<Institution | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [form, setForm] = useState(emptyInstitution);
  const [fromCrm, setFromCrm] = useState(false);
  const [contactForm, setContactForm] = useState(emptyContact);
  const [editingContact, setEditingContact] = useState<string | null>(null);
  const [engagementForm, setEngagementForm] = useState(emptyEngagement);
  const [editingEngagement, setEditingEngagement] = useState<string | null>(
    null,
  );
  const errorText = (reason: unknown) =>
    reason instanceof ApiError
      ? reason.message
      : "Institution operation failed.";
  const hydrateForm = (item: Institution) =>
    setForm({
      code: item.code,
      name: item.name,
      shortName: item.shortName ?? "",
      type: item.type,
      status: item.status,
      website: item.website ?? "",
      officialEmail: item.officialEmail ?? "",
      officialPhone: item.officialPhone ?? "",
      addressLine1: item.addressLine1 ?? "",
      addressLine2: item.addressLine2 ?? "",
      city: item.city ?? "",
      state: item.state ?? "",
      postalCode: item.postalCode ?? "",
      country: item.country ?? "",
      relationshipOwnerEmployeeId: item.relationshipOwnerEmployeeId ?? "",
      crmAccountId: item.crmAccountId ?? "",
      studentStrength:
        item.studentStrength === null ? "" : String(item.studentStrength),
      notes: item.notes ?? "",
    });
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [summary, list, people, accountList, opportunityList] =
        await Promise.all([
          apiFetchV2<{ data: Dashboard }>("/institutions/dashboard"),
          apiFetchV2<{ data: Institution[] }>(
            `/institutions?limit=100${search ? `&search=${encodeURIComponent(search)}` : ""}${status === "ALL" ? "" : `&status=${status}`}`,
          ),
          apiFetchV2<{
            data: Array<{ id: string; firstName: string; lastName: string }>;
          }>("/executive/employees?limit=100"),
          apiFetchV2<{ data: Account[] }>("/crm/accounts?limit=100"),
          apiFetchV2<{ data: Opportunity[] }>("/crm/opportunities?limit=100"),
        ]);
      setDashboard(summary.data);
      setInstitutions(list.data);
      setEmployees(
        people.data.map((item) => ({
          id: item.id,
          name: `${item.firstName} ${item.lastName}`,
        })),
      );
      setAccounts(accountList.data);
      setOpportunities(opportunityList.data);
      setError(null);
    } catch (reason) {
      setError(errorText(reason));
    } finally {
      setLoading(false);
    }
  }, [search, status]);
  const openDetail = useCallback(async (id: string) => {
    setDetailLoading(true);
    try {
      const response = await apiFetchV2<{ data: Institution }>(
        `/institutions/${id}`,
      );
      setDetail(response.data);
      hydrateForm(response.data);
      setError(null);
    } catch (reason) {
      setError(errorText(reason));
    } finally {
      setDetailLoading(false);
    }
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  async function mutate(
    action: () => Promise<unknown>,
    success: string,
    refresh = true,
  ) {
    setBusy(true);
    setError(null);
    try {
      await action();
      setNotice(success);
      await load();
      if (refresh && detail) await openDetail(detail.id);
      return true;
    } catch (reason) {
      setError(errorText(reason));
      return false;
    } finally {
      setBusy(false);
    }
  }
  const payload = () => ({
    ...form,
    shortName: form.shortName || undefined,
    website: form.website || undefined,
    officialEmail: form.officialEmail || undefined,
    officialPhone: form.officialPhone || undefined,
    addressLine1: form.addressLine1 || undefined,
    addressLine2: form.addressLine2 || undefined,
    city: form.city || undefined,
    state: form.state || undefined,
    postalCode: form.postalCode || undefined,
    country: form.country || undefined,
    relationshipOwnerEmployeeId: form.relationshipOwnerEmployeeId || undefined,
    crmAccountId: form.crmAccountId || undefined,
    studentStrength: form.studentStrength
      ? Number(form.studentStrength)
      : undefined,
    notes: form.notes || undefined,
  });
  async function createInstitution(event: FormEvent) {
    event.preventDefault();
    const endpoint =
      fromCrm && form.crmAccountId
        ? `/institutions/from-crm/${form.crmAccountId}`
        : "/institutions";
    if (
      await mutate(
        () =>
          apiFetchV2(endpoint, {
            method: "POST",
            body: JSON.stringify({
              ...payload(),
              name: fromCrm ? form.name || undefined : form.name,
            }),
          }),
        fromCrm ? "Institution created from CRM." : "Institution created.",
        false,
      )
    )
      setForm(emptyInstitution);
  }
  async function saveInstitution(event: FormEvent) {
    event.preventDefault();
    if (detail)
      await mutate(
        () =>
          apiFetchV2(`/institutions/${detail.id}`, {
            method: "PATCH",
            body: JSON.stringify(payload()),
          }),
        "Institution updated.",
      );
  }
  async function archiveInstitution() {
    if (
      detail &&
      window.confirm(
        `Archive ${detail.name}? Its history will be preserved and editing disabled.`,
      )
    )
      await mutate(
        () =>
          apiFetchV2(`/institutions/${detail.id}/archive`, { method: "POST" }),
        "Institution archived.",
      );
  }
  async function saveContact(event: FormEvent) {
    event.preventDefault();
    if (!detail) return;
    const path = editingContact
      ? `/institutions/${detail.id}/contacts/${editingContact}`
      : `/institutions/${detail.id}/contacts`;
    if (
      await mutate(
        () =>
          apiFetchV2(path, {
            method: editingContact ? "PATCH" : "POST",
            body: JSON.stringify(contactForm),
          }),
        editingContact ? "Contact updated." : "Contact added.",
      )
    ) {
      setContactForm(emptyContact);
      setEditingContact(null);
    }
  }
  const editContact = (item: Contact) => {
    setEditingContact(item.id);
    setContactForm({
      firstName: item.firstName,
      lastName: item.lastName,
      roleTitle: item.roleTitle ?? "",
      department: item.department ?? "",
      email: item.email ?? "",
      phone: item.phone ?? "",
      alternatePhone: item.alternatePhone ?? "",
      isPrimary: item.isPrimary,
      isDecisionMaker: item.isDecisionMaker,
    });
  };
  async function makePrimary(item: Contact) {
    if (detail)
      await mutate(
        () =>
          apiFetchV2(`/institutions/${detail.id}/contacts/${item.id}`, {
            method: "PATCH",
            body: JSON.stringify({ isPrimary: true }),
          }),
        "Primary contact updated.",
      );
  }
  async function saveEngagement(event: FormEvent) {
    event.preventDefault();
    if (!detail) return;
    const path = editingEngagement
      ? `/institutions/${detail.id}/engagements/${editingEngagement}`
      : `/institutions/${detail.id}/engagements`;
    const body = {
      ...engagementForm,
      startDate: engagementForm.startDate || undefined,
      endDate: engagementForm.endDate || undefined,
      ownerEmployeeId: engagementForm.ownerEmployeeId || undefined,
      crmOpportunityId: engagementForm.crmOpportunityId || undefined,
      estimatedParticipants: engagementForm.estimatedParticipants
        ? Number(engagementForm.estimatedParticipants)
        : undefined,
      notes: engagementForm.notes || undefined,
    };
    if (
      await mutate(
        () =>
          apiFetchV2(path, {
            method: editingEngagement ? "PATCH" : "POST",
            body: JSON.stringify(body),
          }),
        editingEngagement ? "Engagement updated." : "Engagement created.",
      )
    ) {
      setEngagementForm(emptyEngagement);
      setEditingEngagement(null);
    }
  }
  const editEngagement = (item: Engagement) => {
    setEditingEngagement(item.id);
    setEngagementForm({
      title: item.title,
      type: item.type,
      status: item.status,
      startDate: inputDate(item.startDate),
      endDate: inputDate(item.endDate),
      ownerEmployeeId: item.ownerEmployeeId ?? "",
      crmOpportunityId: item.crmOpportunityId ?? "",
      estimatedParticipants:
        item.estimatedParticipants === null
          ? ""
          : String(item.estimatedParticipants),
      notes: item.notes ?? "",
    });
  };
  if (loading && !dashboard) return <ErpLoading label="Loading institutions" />;
  const archived = detail?.status === "ARCHIVED" || Boolean(detail?.archivedAt);
  const ownerSelect = (value: string, update: (value: string) => void) => (
    <select value={value} onChange={(event) => update(event.target.value)}>
      <option value="">Unassigned</option>
      {employees.map((item) => (
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      ))}
    </select>
  );
  return (
    <main className="erp-main">
      <div className="erp-content founder-content">
        <section className="erp-welcome">
          <div>
            <p className="erp-kicker">Institutional partnerships</p>
            <h1>
              Institutions <em>workspace</em>
            </h1>
            <p>
              Manage schools, colleges, universities and training relationships
              without mixing CRM or student records.
            </p>
          </div>
          <div className="erp-welcome-code">
            <span>Active engagements</span>
            <strong>{dashboard?.engagementCounts.IN_PROGRESS ?? 0}</strong>
          </div>
        </section>
        {error && (
          <div className="erp-error" role="alert">
            <p>{error}</p>
            <button
              className="erp-text-button"
              onClick={() =>
                detail ? void openDetail(detail.id) : void load()
              }
            >
              Try again ↗
            </button>
          </div>
        )}
        {notice && (
          <p className="erp-success" role="status">
            {notice}
          </p>
        )}
        <section className="erp-kpi-grid founder-kpi-grid">
          {[
            ["Total institutions", dashboard?.total],
            ["Active", dashboard?.active],
            ["Prospects", dashboard?.prospects],
            ["Onboarding", dashboard?.onboarding],
            ["Upcoming engagements", dashboard?.upcoming.length],
          ].map(([label, value]) => (
            <article key={String(label)}>
              <span>{label}</span>
              <strong>{value ?? 0}</strong>
            </article>
          ))}
        </section>
        {!detail && (
          <section className="erp-section founder-workforce-section">
            <div className="erp-section-heading">
              <div>
                <p className="erp-kicker">New relationship</p>
                <h2>Create institution</h2>
              </div>
            </div>
            <label className="founder-checkbox">
              <input
                type="checkbox"
                checked={fromCrm}
                onChange={(event) => setFromCrm(event.target.checked)}
              />
              <span>Create from CRM Account</span>
            </label>
            <form
              className="founder-form"
              onSubmit={(event) => void createInstitution(event)}
            >
              <div className="founder-form-grid">
                <label>
                  <span>Code</span>
                  <input
                    required
                    value={form.code}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        code: event.target.value.toUpperCase(),
                      })
                    }
                  />
                </label>
                <label>
                  <span>Name</span>
                  <input
                    required={!fromCrm}
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                  />
                </label>
                <label>
                  <span>Type</span>
                  <select
                    value={form.type}
                    onChange={(event) =>
                      setForm({ ...form, type: event.target.value })
                    }
                  >
                    {types.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>CRM account</span>
                  <select
                    required={fromCrm}
                    value={form.crmAccountId}
                    onChange={(event) =>
                      setForm({ ...form, crmAccountId: event.target.value })
                    }
                  >
                    <option value="">No account</option>
                    {accounts.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Relationship owner</span>
                  {ownerSelect(form.relationshipOwnerEmployeeId, (value) =>
                    setForm({ ...form, relationshipOwnerEmployeeId: value }),
                  )}
                </label>
                <label>
                  <span>Official email</span>
                  <input
                    type="email"
                    value={form.officialEmail}
                    onChange={(event) =>
                      setForm({ ...form, officialEmail: event.target.value })
                    }
                  />
                </label>
              </div>
              <button className="erp-button erp-button-primary" disabled={busy}>
                Create institution ↗
              </button>
            </form>
          </section>
        )}
        <section className="erp-section">
          <div className="erp-section-heading">
            <div>
              <p className="erp-kicker">Relationship register</p>
              <h2>Institutions</h2>
            </div>
            <span className="erp-section-count">{institutions.length}</span>
          </div>
          <div className="founder-filters">
            <label>
              <span>Search</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name, code or city"
              />
            </label>
            <label>
              <span>Status</span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="ALL">All statuses</option>
                {statuses.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="crm-list">
            {institutions.length ? (
              institutions.map((item) => (
                <article className="crm-row" key={item.id}>
                  <div>
                    <h3>{item.name}</h3>
                    <p>
                      {item.code} · {item.type} ·{" "}
                      {[item.city, item.state].filter(Boolean).join(", ") ||
                        "Location pending"}
                    </p>
                    <small>
                      {item.primaryContact
                        ? `${item.primaryContact.firstName} ${item.primaryContact.lastName}`
                        : "No primary contact"}{" "}
                      ·{" "}
                      {item.relationshipOwner
                        ? `${item.relationshipOwner.firstName} ${item.relationshipOwner.lastName}`
                        : "Unassigned"}{" "}
                      · {item._count?.engagements ?? 0} engagements
                    </small>
                  </div>
                  <div className="crm-row-actions">
                    <span className="erp-status">{item.status}</span>
                    <button
                      className="erp-text-button"
                      onClick={() => {
                        setTab("overview");
                        void openDetail(item.id);
                      }}
                    >
                      View details ↗
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="erp-empty">
                <strong>No institutions match this view.</strong>
                <span>Change filters or create a relationship.</span>
              </div>
            )}
          </div>
        </section>
        {detailLoading && <ErpLoading label="Loading institution detail" />}
        {detail && !detailLoading && (
          <section
            className="erp-section founder-detail-section institution-detail"
            aria-label="Institution detail workspace"
          >
            <div className="erp-section-heading">
              <div>
                <p className="erp-kicker">Institution detail</p>
                <h2>{detail.name}</h2>
              </div>
              <button
                className="erp-text-button"
                onClick={() => {
                  setDetail(null);
                  setForm(emptyInstitution);
                }}
              >
                Close detail
              </button>
            </div>
            <nav className="crm-tabs" aria-label="Institution detail sections">
              {(["overview", "contacts", "engagements", "crm"] as Tab[]).map(
                (item) => (
                  <button
                    key={item}
                    className={tab === item ? "is-active" : ""}
                    onClick={() => setTab(item)}
                  >
                    {item === "crm" ? "CRM Relationship" : item}
                  </button>
                ),
              )}
            </nav>
            {archived && (
              <div className="erp-empty">
                <strong>Archived institution.</strong>
                <span>
                  History remains visible; mutation controls are disabled.
                </span>
              </div>
            )}
            {tab === "overview" && (
              <>
                <div className="founder-identity-strip">
                  <div>
                    <span>Code</span>
                    <strong>{detail.code}</strong>
                  </div>
                  <div>
                    <span>Type</span>
                    <strong>{detail.type}</strong>
                  </div>
                  <div>
                    <span>Status</span>
                    <strong>{detail.status}</strong>
                  </div>
                  <div>
                    <span>Owner</span>
                    <strong>
                      {detail.relationshipOwner
                        ? `${detail.relationshipOwner.firstName} ${detail.relationshipOwner.lastName}`
                        : "Unassigned"}
                    </strong>
                  </div>
                </div>
                {!archived && (
                  <form
                    className="founder-form institution-form"
                    onSubmit={(event) => void saveInstitution(event)}
                  >
                    <div className="founder-form-grid">
                      <label>
                        <span>Name</span>
                        <input
                          required
                          value={form.name}
                          onChange={(event) =>
                            setForm({ ...form, name: event.target.value })
                          }
                        />
                      </label>
                      <label>
                        <span>Short name</span>
                        <input
                          value={form.shortName}
                          onChange={(event) =>
                            setForm({ ...form, shortName: event.target.value })
                          }
                        />
                      </label>
                      <label>
                        <span>Type</span>
                        <select
                          value={form.type}
                          onChange={(event) =>
                            setForm({ ...form, type: event.target.value })
                          }
                        >
                          {types.map((item) => (
                            <option key={item}>{item}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        <span>Status</span>
                        <select
                          value={form.status}
                          onChange={(event) =>
                            setForm({ ...form, status: event.target.value })
                          }
                        >
                          {statuses
                            .filter((item) => item !== "ARCHIVED")
                            .map((item) => (
                              <option key={item}>{item}</option>
                            ))}
                        </select>
                      </label>
                      <label>
                        <span>Website</span>
                        <input
                          value={form.website}
                          onChange={(event) =>
                            setForm({ ...form, website: event.target.value })
                          }
                        />
                      </label>
                      <label>
                        <span>Email</span>
                        <input
                          type="email"
                          value={form.officialEmail}
                          onChange={(event) =>
                            setForm({
                              ...form,
                              officialEmail: event.target.value,
                            })
                          }
                        />
                      </label>
                      <label>
                        <span>Phone</span>
                        <input
                          value={form.officialPhone}
                          onChange={(event) =>
                            setForm({
                              ...form,
                              officialPhone: event.target.value,
                            })
                          }
                        />
                      </label>
                      <label>
                        <span>Address</span>
                        <input
                          value={form.addressLine1}
                          onChange={(event) =>
                            setForm({
                              ...form,
                              addressLine1: event.target.value,
                            })
                          }
                        />
                      </label>
                      <label>
                        <span>Address line 2</span>
                        <input
                          value={form.addressLine2}
                          onChange={(event) =>
                            setForm({
                              ...form,
                              addressLine2: event.target.value,
                            })
                          }
                        />
                      </label>
                      <label>
                        <span>City</span>
                        <input
                          value={form.city}
                          onChange={(event) =>
                            setForm({ ...form, city: event.target.value })
                          }
                        />
                      </label>
                      <label>
                        <span>State</span>
                        <input
                          value={form.state}
                          onChange={(event) =>
                            setForm({ ...form, state: event.target.value })
                          }
                        />
                      </label>
                      <label>
                        <span>Country</span>
                        <input
                          value={form.country}
                          onChange={(event) =>
                            setForm({ ...form, country: event.target.value })
                          }
                        />
                      </label>
                      <label>
                        <span>Postal code</span>
                        <input
                          value={form.postalCode}
                          onChange={(event) =>
                            setForm({ ...form, postalCode: event.target.value })
                          }
                        />
                      </label>
                      <label>
                        <span>Student strength</span>
                        <input
                          min="0"
                          type="number"
                          value={form.studentStrength}
                          onChange={(event) =>
                            setForm({
                              ...form,
                              studentStrength: event.target.value,
                            })
                          }
                        />
                      </label>
                      <label>
                        <span>Owner</span>
                        {ownerSelect(
                          form.relationshipOwnerEmployeeId,
                          (value) =>
                            setForm({
                              ...form,
                              relationshipOwnerEmployeeId: value,
                            }),
                        )}
                      </label>
                      <label>
                        <span>CRM account</span>
                        <select
                          value={form.crmAccountId}
                          onChange={(event) =>
                            setForm({
                              ...form,
                              crmAccountId: event.target.value,
                            })
                          }
                        >
                          <option value="">No linked account</option>
                          {accounts.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <label>
                      <span>Notes</span>
                      <textarea
                        value={form.notes}
                        onChange={(event) =>
                          setForm({ ...form, notes: event.target.value })
                        }
                      />
                    </label>
                    <div className="founder-dialog-actions">
                      <button
                        type="button"
                        className="erp-text-button founder-danger-button"
                        onClick={() => void archiveInstitution()}
                      >
                        Archive institution
                      </button>
                      <button
                        className="erp-button erp-button-primary"
                        disabled={busy}
                      >
                        Save changes ↗
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
            {tab === "contacts" && (
              <>
                <form
                  className="founder-form"
                  onSubmit={(event) => void saveContact(event)}
                >
                  <div className="erp-section-heading">
                    <div>
                      <p className="erp-kicker">Contacts</p>
                      <h3>{editingContact ? "Edit contact" : "Add contact"}</h3>
                    </div>
                  </div>
                  <div className="founder-form-grid">
                    <label>
                      <span>First name</span>
                      <input
                        required
                        value={contactForm.firstName}
                        onChange={(event) =>
                          setContactForm({
                            ...contactForm,
                            firstName: event.target.value,
                          })
                        }
                      />
                    </label>
                    <label>
                      <span>Last name</span>
                      <input
                        required
                        value={contactForm.lastName}
                        onChange={(event) =>
                          setContactForm({
                            ...contactForm,
                            lastName: event.target.value,
                          })
                        }
                      />
                    </label>
                    <label>
                      <span>Role / title</span>
                      <input
                        value={contactForm.roleTitle}
                        onChange={(event) =>
                          setContactForm({
                            ...contactForm,
                            roleTitle: event.target.value,
                          })
                        }
                      />
                    </label>
                    <label>
                      <span>Department</span>
                      <input
                        value={contactForm.department}
                        onChange={(event) =>
                          setContactForm({
                            ...contactForm,
                            department: event.target.value,
                          })
                        }
                      />
                    </label>
                    <label>
                      <span>Email</span>
                      <input
                        type="email"
                        value={contactForm.email}
                        onChange={(event) =>
                          setContactForm({
                            ...contactForm,
                            email: event.target.value,
                          })
                        }
                      />
                    </label>
                    <label>
                      <span>Phone</span>
                      <input
                        value={contactForm.phone}
                        onChange={(event) =>
                          setContactForm({
                            ...contactForm,
                            phone: event.target.value,
                          })
                        }
                      />
                    </label>
                    <label>
                      <span>Alternate phone</span>
                      <input
                        value={contactForm.alternatePhone}
                        onChange={(event) =>
                          setContactForm({
                            ...contactForm,
                            alternatePhone: event.target.value,
                          })
                        }
                      />
                    </label>
                  </div>
                  <div className="institution-checks">
                    <label className="founder-checkbox">
                      <input
                        type="checkbox"
                        checked={contactForm.isPrimary}
                        onChange={(event) =>
                          setContactForm({
                            ...contactForm,
                            isPrimary: event.target.checked,
                          })
                        }
                      />
                      <span>Primary contact</span>
                    </label>
                    <label className="founder-checkbox">
                      <input
                        type="checkbox"
                        checked={contactForm.isDecisionMaker}
                        onChange={(event) =>
                          setContactForm({
                            ...contactForm,
                            isDecisionMaker: event.target.checked,
                          })
                        }
                      />
                      <span>Decision maker</span>
                    </label>
                  </div>
                  <button
                    className="erp-button erp-button-primary"
                    disabled={busy || archived}
                  >
                    {editingContact ? "Save contact" : "Add contact"} ↗
                  </button>
                </form>
                <div className="crm-list institution-sublist">
                  {detail.contacts?.length ? (
                    detail.contacts.map((item) => (
                      <article className="crm-row" key={item.id}>
                        <div>
                          <h3>
                            {item.firstName} {item.lastName}{" "}
                            {item.isPrimary && (
                              <span className="erp-status">Primary</span>
                            )}
                          </h3>
                          <p>
                            {item.roleTitle ?? "No role"} ·{" "}
                            {item.department ?? "No department"}
                          </p>
                          <small>
                            {item.email ?? "No email"} ·{" "}
                            {item.phone ?? "No phone"}
                            {item.isDecisionMaker ? " · Decision maker" : ""}
                          </small>
                        </div>
                        {!archived && (
                          <div className="crm-row-actions">
                            <button
                              className="erp-text-button"
                              onClick={() => editContact(item)}
                            >
                              Edit
                            </button>
                            {!item.isPrimary && (
                              <button
                                className="erp-text-button"
                                onClick={() => void makePrimary(item)}
                              >
                                Make primary
                              </button>
                            )}
                          </div>
                        )}
                      </article>
                    ))
                  ) : (
                    <div className="erp-empty">
                      <strong>No contacts yet.</strong>
                      <span>Add the first institution contact.</span>
                    </div>
                  )}
                </div>
              </>
            )}
            {tab === "engagements" && (
              <>
                <form
                  className="founder-form"
                  onSubmit={(event) => void saveEngagement(event)}
                >
                  <div className="erp-section-heading">
                    <div>
                      <p className="erp-kicker">Engagements</p>
                      <h3>
                        {editingEngagement
                          ? "Edit engagement"
                          : "Create engagement"}
                      </h3>
                    </div>
                  </div>
                  <div className="founder-form-grid">
                    <label>
                      <span>Title</span>
                      <input
                        required
                        value={engagementForm.title}
                        onChange={(event) =>
                          setEngagementForm({
                            ...engagementForm,
                            title: event.target.value,
                          })
                        }
                      />
                    </label>
                    <label>
                      <span>Type</span>
                      <select
                        value={engagementForm.type}
                        onChange={(event) =>
                          setEngagementForm({
                            ...engagementForm,
                            type: event.target.value,
                          })
                        }
                      >
                        {engagementTypes.map((item) => (
                          <option key={item}>{item}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>Status</span>
                      <select
                        value={engagementForm.status}
                        onChange={(event) =>
                          setEngagementForm({
                            ...engagementForm,
                            status: event.target.value,
                          })
                        }
                      >
                        {engagementStatuses.map((item) => (
                          <option key={item}>{item}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>Owner</span>
                      {ownerSelect(engagementForm.ownerEmployeeId, (value) =>
                        setEngagementForm({
                          ...engagementForm,
                          ownerEmployeeId: value,
                        }),
                      )}
                    </label>
                    <label>
                      <span>Start</span>
                      <input
                        type="date"
                        value={engagementForm.startDate}
                        onChange={(event) =>
                          setEngagementForm({
                            ...engagementForm,
                            startDate: event.target.value,
                          })
                        }
                      />
                    </label>
                    <label>
                      <span>End</span>
                      <input
                        type="date"
                        value={engagementForm.endDate}
                        onChange={(event) =>
                          setEngagementForm({
                            ...engagementForm,
                            endDate: event.target.value,
                          })
                        }
                      />
                    </label>
                    <label>
                      <span>Participants</span>
                      <input
                        min="0"
                        type="number"
                        value={engagementForm.estimatedParticipants}
                        onChange={(event) =>
                          setEngagementForm({
                            ...engagementForm,
                            estimatedParticipants: event.target.value,
                          })
                        }
                      />
                    </label>
                    <label>
                      <span>CRM opportunity</span>
                      <select
                        value={engagementForm.crmOpportunityId}
                        onChange={(event) =>
                          setEngagementForm({
                            ...engagementForm,
                            crmOpportunityId: event.target.value,
                          })
                        }
                      >
                        <option value="">No opportunity</option>
                        {opportunities.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name} · {item.stage}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <label>
                    <span>Notes</span>
                    <textarea
                      value={engagementForm.notes}
                      onChange={(event) =>
                        setEngagementForm({
                          ...engagementForm,
                          notes: event.target.value,
                        })
                      }
                    />
                  </label>
                  <button
                    className="erp-button erp-button-primary"
                    disabled={busy || archived}
                  >
                    {editingEngagement
                      ? "Save engagement"
                      : "Create engagement"}{" "}
                    ↗
                  </button>
                </form>
                <div className="crm-list institution-sublist">
                  {detail.engagements?.length ? (
                    detail.engagements.map((item) => (
                      <article className="crm-row" key={item.id}>
                        <div>
                          <h3>{item.title}</h3>
                          <p>
                            {item.type} · {date(item.startDate)} to{" "}
                            {date(item.endDate)} ·{" "}
                            {item.owner
                              ? `${item.owner.firstName} ${item.owner.lastName}`
                              : "Unassigned"}
                          </p>
                          <small>
                            {item.estimatedParticipants ?? 0} participants ·{" "}
                            {item.crmOpportunity
                              ? `${item.crmOpportunity.name} (${item.crmOpportunity.stage})`
                              : "No CRM opportunity"}
                          </small>
                        </div>
                        {!archived && (
                          <div className="crm-row-actions">
                            <select
                              value={item.status}
                              onChange={(event) =>
                                void mutate(
                                  () =>
                                    apiFetchV2(
                                      `/institutions/${detail.id}/engagements/${item.id}`,
                                      {
                                        method: "PATCH",
                                        body: JSON.stringify({
                                          status: event.target.value,
                                        }),
                                      },
                                    ),
                                  "Engagement status updated.",
                                )
                              }
                            >
                              {engagementStatuses.map((value) => (
                                <option key={value}>{value}</option>
                              ))}
                            </select>
                            <button
                              className="erp-text-button"
                              onClick={() => editEngagement(item)}
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </article>
                    ))
                  ) : (
                    <div className="erp-empty">
                      <strong>No engagements yet.</strong>
                      <span>Create the first engagement.</span>
                    </div>
                  )}
                </div>
              </>
            )}
            {tab === "crm" && (
              <section className="founder-detail-columns">
                <div>
                  <p className="erp-kicker">Linked CRM Account</p>
                  {detail.crmAccount ? (
                    <article className="crm-row">
                      <div>
                        <h3>{detail.crmAccount.name}</h3>
                        <p>
                          {detail.crmAccount.accountType} ·{" "}
                          {detail.crmAccount.status}
                        </p>
                        <small>
                          {detail.crmAccount.owner
                            ? `${detail.crmAccount.owner.firstName} ${detail.crmAccount.owner.lastName}`
                            : "No account owner"}
                        </small>
                      </div>
                    </article>
                  ) : (
                    <div className="erp-empty">
                      <strong>No CRM account linked.</strong>
                      <span>Link one from Overview.</span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="erp-kicker">Linked opportunities</p>
                  {detail.engagements?.some((item) => item.crmOpportunity) ? (
                    detail.engagements
                      .filter((item) => item.crmOpportunity)
                      .map((item) => (
                        <article className="crm-row" key={item.id}>
                          <div>
                            <h3>{item.crmOpportunity?.name}</h3>
                            <p>
                              {item.title} · {item.crmOpportunity?.stage}
                            </p>
                            <small>
                              {item.crmOpportunity?.currency}{" "}
                              {item.crmOpportunity?.estimatedValue ??
                                "Value not recorded"}{" "}
                              · Estimated pipeline, not revenue
                            </small>
                          </div>
                        </article>
                      ))
                  ) : (
                    <div className="erp-empty">
                      <strong>No linked opportunities.</strong>
                      <span>Link an opportunity from an engagement.</span>
                    </div>
                  )}
                </div>
              </section>
            )}
          </section>
        )}
        <section className="erp-section">
          <div className="erp-section-heading">
            <div>
              <p className="erp-kicker">Upcoming work</p>
              <h2>Engagement dates</h2>
            </div>
          </div>
          {dashboard?.upcoming.length ? (
            dashboard.upcoming.map((item) => (
              <article className="erp-notification" key={item.id}>
                <div>
                  <h3>{item.title}</h3>
                </div>
                <time>{date(item.startDate)}</time>
              </article>
            ))
          ) : (
            <div className="erp-empty">
              <strong>No upcoming engagements.</strong>
              <span>Planned engagements appear here.</span>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export function FounderInstitutions() {
  return (
    <ProtectedErp requiredExecutive>
      <Content />
    </ProtectedErp>
  );
}
