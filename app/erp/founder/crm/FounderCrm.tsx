"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { apiFetchV2, ApiError } from "@/lib/api/client";
import { FounderModuleNavigation } from "@/app/erp/components/FounderModuleNavigation";
import type {
  ApiResponse,
  CrmAccount,
  CrmActivity,
  CrmContact,
  CrmDashboard,
  CrmLead,
  CrmOpportunity,
  ExecutiveEmployee,
} from "@/lib/api/types";
import { ErpLoading, ProtectedErp } from "../../components/ProtectedErp";

type Tab = "overview" | "leads" | "pipeline" | "accounts" | "activities";
const tabs: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "leads", label: "Leads" },
  { id: "pipeline", label: "Pipeline" },
  { id: "accounts", label: "Accounts" },
  { id: "activities", label: "Activities" },
];
const date = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "—";
const money = (value: string | number | null, currency: string | null) =>
  value === null
    ? "—"
    : `${currency ?? ""} ${Number(value).toLocaleString("en-IN")}`.trim();

function FounderCrmContent() {
  const [tab, setTab] = useState<Tab>("overview");
  const [dashboard, setDashboard] = useState<CrmDashboard | null>(null);
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [opportunities, setOpportunities] = useState<CrmOpportunity[]>([]);
  const [accounts, setAccounts] = useState<CrmAccount[]>([]);
  const [contacts, setContacts] = useState<CrmContact[]>([]);
  const [activities, setActivities] = useState<CrmActivity[]>([]);
  const [employees, setEmployees] = useState<ExecutiveEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [leadStatus, setLeadStatus] = useState("ALL");
  const [leadForm, setLeadForm] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    email: "",
    source: "WEBSITE",
    ownerEmployeeId: "",
    estimatedValue: "",
    currency: "INR",
    nextFollowUpAt: "",
  });
  const [accountForm, setAccountForm] = useState({
    name: "",
    accountType: "PROSPECT",
    ownerEmployeeId: "",
  });
  const [contactForm, setContactForm] = useState({
    accountId: "",
    firstName: "",
    lastName: "",
    email: "",
    ownerEmployeeId: "",
  });
  const [activityForm, setActivityForm] = useState({
    subject: "",
    type: "FOLLOW_UP",
    leadId: "",
    ownerEmployeeId: "",
    dueAt: "",
  });
  const [conversionLead, setConversionLead] = useState<CrmLead | null>(null);
  const [conversionForm, setConversionForm] = useState({
    accountName: "",
    contactFirstName: "",
    contactLastName: "",
    opportunityName: "",
    estimatedValue: "",
    currency: "INR",
    expectedCloseDate: "",
    ownerEmployeeId: "",
  });
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dr, lr, or, ar, cr, actr, er] = await Promise.all([
        apiFetchV2<ApiResponse<CrmDashboard>>("/crm/dashboard"),
        apiFetchV2<{ data: CrmLead[] }>(
          `/crm/leads?limit=100${search ? `&search=${encodeURIComponent(search)}` : ""}${leadStatus === "ALL" ? "" : `&status=${leadStatus}`}`,
        ),
        apiFetchV2<{ data: CrmOpportunity[] }>("/crm/opportunities?limit=100"),
        apiFetchV2<{ data: CrmAccount[] }>("/crm/accounts?limit=100"),
        apiFetchV2<{ data: CrmContact[] }>("/crm/contacts?limit=100"),
        apiFetchV2<{ data: CrmActivity[] }>("/crm/activities?limit=100"),
        apiFetchV2<ApiResponse<ExecutiveEmployee[]>>(
          "/executive/employees?limit=100",
        ),
      ]);
      setDashboard(dr.data);
      setLeads(lr.data);
      setOpportunities(or.data);
      setAccounts(ar.data);
      setContacts(cr.data);
      setActivities(actr.data);
      setEmployees(er.data);
    } catch (reason) {
      setError(
        reason instanceof ApiError
          ? reason.message
          : "CRM workspace could not load.",
      );
    } finally {
      setLoading(false);
    }
  }, [search, leadStatus]);
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  const owners = useMemo(
    () => employees.filter((employee) => employee.status === "ACTIVE"),
    [employees],
  );
  async function mutate(action: () => Promise<unknown>, message: string) {
    setBusy(true);
    setError(null);
    try {
      await action();
      setNotice(message);
      await load();
    } catch (reason) {
      setError(
        reason instanceof ApiError ? reason.message : "CRM update failed.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function createLead(event: FormEvent) {
    event.preventDefault();
    await mutate(
      () =>
        apiFetchV2("/crm/leads", {
          method: "POST",
          body: JSON.stringify({
            ...leadForm,
            ownerEmployeeId: leadForm.ownerEmployeeId || undefined,
            estimatedValue: leadForm.estimatedValue
              ? Number(leadForm.estimatedValue)
              : undefined,
            nextFollowUpAt: leadForm.nextFollowUpAt || undefined,
          }),
        }),
      "Lead created and assigned.",
    );
    setLeadForm({
      firstName: "",
      lastName: "",
      companyName: "",
      email: "",
      source: "WEBSITE",
      ownerEmployeeId: "",
      estimatedValue: "",
      currency: "INR",
      nextFollowUpAt: "",
    });
  }
  async function createAccount(event: FormEvent) {
    event.preventDefault();
    await mutate(
      () =>
        apiFetchV2("/crm/accounts", {
          method: "POST",
          body: JSON.stringify({
            ...accountForm,
            ownerEmployeeId: accountForm.ownerEmployeeId || undefined,
          }),
        }),
      "Account created.",
    );
    setAccountForm({ name: "", accountType: "PROSPECT", ownerEmployeeId: "" });
  }
  async function createActivity(event: FormEvent) {
    event.preventDefault();
    await mutate(
      () =>
        apiFetchV2("/crm/activities", {
          method: "POST",
          body: JSON.stringify({
            ...activityForm,
            leadId: activityForm.leadId || undefined,
            ownerEmployeeId: activityForm.ownerEmployeeId || undefined,
            dueAt: activityForm.dueAt || undefined,
          }),
        }),
      "CRM activity recorded.",
    );
    setActivityForm({
      subject: "",
      type: "FOLLOW_UP",
      leadId: "",
      ownerEmployeeId: "",
      dueAt: "",
    });
  }
  async function createContact(event: FormEvent) {
    event.preventDefault();
    await mutate(
      () =>
        apiFetchV2("/crm/contacts", {
          method: "POST",
          body: JSON.stringify({
            ...contactForm,
            accountId: contactForm.accountId || undefined,
            email: contactForm.email || undefined,
            ownerEmployeeId: contactForm.ownerEmployeeId || undefined,
          }),
        }),
      "Contact created.",
    );
    setContactForm({
      accountId: "",
      firstName: "",
      lastName: "",
      email: "",
      ownerEmployeeId: "",
    });
  }
  function openConversion(lead: CrmLead) {
    const contactName = `${lead.firstName} ${lead.lastName}`.trim();
    setConversionLead(lead);
    setConversionForm({
      accountName: lead.companyName ?? "",
      contactFirstName: lead.firstName,
      contactLastName: lead.lastName,
      opportunityName: `${lead.companyName ?? contactName} opportunity`,
      estimatedValue: lead.estimatedValue ? String(lead.estimatedValue) : "",
      currency: lead.currency ?? "INR",
      expectedCloseDate: "",
      ownerEmployeeId: lead.ownerEmployeeId ?? "",
    });
  }
  async function convertLead(event: FormEvent) {
    event.preventDefault();
    if (!conversionLead) return;
    await mutate(
      () =>
        apiFetchV2(`/crm/leads/${conversionLead.id}/convert`, {
          method: "POST",
          body: JSON.stringify({
            ...conversionForm,
            estimatedValue: conversionForm.estimatedValue
              ? Number(conversionForm.estimatedValue)
              : undefined,
            expectedCloseDate: conversionForm.expectedCloseDate || undefined,
            ownerEmployeeId: conversionForm.ownerEmployeeId || undefined,
          }),
        }),
      "Lead converted into an account, contact and opportunity.",
    );
    setConversionLead(null);
  }
  if (loading && !dashboard)
    return <ErpLoading label="Loading CRM workspace" />;
  return (
    <main className="erp-main">
      <div className="erp-content founder-content">
        <FounderModuleNavigation active="crm" />
        <section className="erp-welcome">
          <div>
            <p className="erp-kicker">Client relationships</p>
            <h1>
              CRM <em>Pipeline</em>
            </h1>
            <p>
              An organization-wide view of leads, opportunities and the next
              conversation that matters.
            </p>
          </div>
          <div className="erp-welcome-code">
            <span>Open pipeline</span>
            <strong>{dashboard?.openOpportunityCount ?? 0}</strong>
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
        {notice && (
          <p className="erp-success" role="status">
            {notice}
          </p>
        )}
        <nav className="crm-tabs" aria-label="CRM views">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              className={tab === item.id ? "is-active" : ""}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        {tab === "overview" && (
          <>
            <section className="erp-kpi-grid founder-kpi-grid">
              <article>
                <span>New leads</span>
                <strong>{dashboard?.leadCounts.NEW ?? 0}</strong>
                <small>{dashboard?.openLeads ?? 0} active leads</small>
              </article>
              <article>
                <span>Qualified</span>
                <strong>{dashboard?.qualifiedLeads ?? 0}</strong>
                <small>Ready for proposal</small>
              </article>
              <article>
                <span>Open opportunities</span>
                <strong>{dashboard?.openOpportunityCount ?? 0}</strong>
                <small>
                  {Object.entries(dashboard?.pipelineByCurrency ?? {})
                    .map(
                      ([currency, value]) =>
                        `${currency} ${Number(value).toLocaleString("en-IN")}`,
                    )
                    .join(" · ") || "No value recorded"}
                </small>
              </article>
              <article>
                <span>Won / lost</span>
                <strong>
                  {dashboard?.wonCount ?? 0} / {dashboard?.lostCount ?? 0}
                </strong>
                <small>Estimated values, not revenue</small>
              </article>
              <article>
                <span>Overdue follow-ups</span>
                <strong>{dashboard?.overdueFollowUps.length ?? 0}</strong>
                <small>Needs an owner action</small>
              </article>
            </section>
            <section className="founder-detail-columns">
              <div className="erp-section">
                <div className="erp-section-heading">
                  <div>
                    <p className="erp-kicker">Follow-up discipline</p>
                    <h2>Overdue</h2>
                  </div>
                </div>
                {dashboard?.overdueFollowUps.length ? (
                  dashboard.overdueFollowUps.map((activity) => (
                    <article className="erp-notification" key={activity.id}>
                      <div>
                        <h3>{activity.subject}</h3>
                        <p>
                          {activity.owner
                            ? `${activity.owner.firstName} ${activity.owner.lastName} · `
                            : ""}
                          Due {date(activity.dueAt)}
                        </p>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="erp-empty">
                    <strong>No overdue follow-ups.</strong>
                    <span>Keep this calm by recording the next action.</span>
                  </div>
                )}
              </div>
              <div className="erp-section">
                <div className="erp-section-heading">
                  <div>
                    <p className="erp-kicker">Live timeline</p>
                    <h2>Recent activity</h2>
                  </div>
                </div>
                {dashboard?.recentActivities.map((activity) => (
                  <article className="erp-notification" key={activity.id}>
                    <div>
                      <h3>{activity.subject}</h3>
                      <p>
                        {activity.type} ·{" "}
                        {activity.owner
                          ? `${activity.owner.firstName} ${activity.owner.lastName}`
                          : "Unassigned"}
                      </p>
                    </div>
                    <time>{date(activity.createdAt)}</time>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
        {tab === "leads" && (
          <>
            <section className="erp-section">
              <div className="erp-section-heading">
                <div>
                  <p className="erp-kicker">Inbound and outbound</p>
                  <h2>Leads</h2>
                </div>
                <span className="erp-section-count">{leads.length}</span>
              </div>
              <div className="founder-filters">
                <label>
                  <span>Search</span>
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Name, company or email"
                  />
                </label>
                <label>
                  <span>Status</span>
                  <select
                    value={leadStatus}
                    onChange={(event) => setLeadStatus(event.target.value)}
                  >
                    <option value="ALL">All statuses</option>
                    {[
                      "NEW",
                      "CONTACTED",
                      "QUALIFIED",
                      "UNQUALIFIED",
                      "CONVERTED",
                    ].map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </label>
              </div>
              <form
                className="founder-form"
                onSubmit={(event) => void createLead(event)}
              >
                <div className="founder-form-grid">
                  <label>
                    <span>First name</span>
                    <input
                      required
                      value={leadForm.firstName}
                      onChange={(event) =>
                        setLeadForm({
                          ...leadForm,
                          firstName: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    <span>Last name</span>
                    <input
                      required
                      value={leadForm.lastName}
                      onChange={(event) =>
                        setLeadForm({
                          ...leadForm,
                          lastName: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    <span>Company</span>
                    <input
                      value={leadForm.companyName}
                      onChange={(event) =>
                        setLeadForm({
                          ...leadForm,
                          companyName: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    <span>Email</span>
                    <input
                      type="email"
                      value={leadForm.email}
                      onChange={(event) =>
                        setLeadForm({ ...leadForm, email: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    <span>Source</span>
                    <select
                      value={leadForm.source}
                      onChange={(event) =>
                        setLeadForm({ ...leadForm, source: event.target.value })
                      }
                    >
                      {[
                        "WEBSITE",
                        "REFERRAL",
                        "OUTBOUND",
                        "EVENT",
                        "PARTNER",
                        "OTHER",
                      ].map((source) => (
                        <option key={source}>{source}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Owner</span>
                    <select
                      value={leadForm.ownerEmployeeId}
                      onChange={(event) =>
                        setLeadForm({
                          ...leadForm,
                          ownerEmployeeId: event.target.value,
                        })
                      }
                    >
                      <option value="">Unassigned</option>
                      {owners.map((owner) => (
                        <option key={owner.id} value={owner.id}>
                          {owner.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Estimated value</span>
                    <input
                      min="0"
                      type="number"
                      value={leadForm.estimatedValue}
                      onChange={(event) =>
                        setLeadForm({
                          ...leadForm,
                          estimatedValue: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    <span>Next follow-up</span>
                    <input
                      type="date"
                      value={leadForm.nextFollowUpAt}
                      onChange={(event) =>
                        setLeadForm({
                          ...leadForm,
                          nextFollowUpAt: event.target.value,
                        })
                      }
                    />
                  </label>
                </div>
                <button
                  className="erp-button erp-button-primary"
                  disabled={busy}
                >
                  Create lead ↗
                </button>
              </form>
            </section>
            <section className="erp-section">
              <div className="crm-list">
                {leads.map((lead) => (
                  <article key={lead.id} className="crm-row">
                    <div>
                      <h3>
                        {lead.firstName} {lead.lastName}
                      </h3>
                      <p>
                        {lead.companyName ?? "Independent contact"} ·{" "}
                        {lead.source} ·{" "}
                        {lead.owner
                          ? `${lead.owner.firstName} ${lead.owner.lastName}`
                          : "Unassigned"}
                      </p>
                      <small>
                        {money(lead.estimatedValue, lead.currency)} · Follow up{" "}
                        {date(lead.nextFollowUpAt)}
                      </small>
                    </div>
                    <div className="crm-row-actions">
                      <select
                        value={lead.status}
                        disabled={busy || lead.status === "CONVERTED"}
                        onChange={(event) =>
                          void mutate(
                            () =>
                              apiFetchV2(`/crm/leads/${lead.id}`, {
                                method: "PATCH",
                                body: JSON.stringify({
                                  status: event.target.value,
                                }),
                              }),
                            "Lead status updated.",
                          )
                        }
                      >
                        {[
                          "NEW",
                          "CONTACTED",
                          "QUALIFIED",
                          "UNQUALIFIED",
                          "CONVERTED",
                        ].map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </select>
                      <select
                        value={lead.ownerEmployeeId ?? ""}
                        disabled={busy || lead.status === "CONVERTED"}
                        aria-label={`Reassign ${lead.firstName} ${lead.lastName}`}
                        onChange={(event) =>
                          void mutate(
                            () =>
                              apiFetchV2(`/crm/leads/${lead.id}`, {
                                method: "PATCH",
                                body: JSON.stringify({
                                  ownerEmployeeId: event.target.value || null,
                                }),
                              }),
                            "Lead owner updated.",
                          )
                        }
                      >
                        <option value="">Unassigned</option>
                        {owners.map((owner) => (
                          <option key={owner.id} value={owner.id}>
                            {owner.name}
                          </option>
                        ))}
                      </select>
                      {lead.status !== "CONVERTED" && (
                        <button
                          className="erp-text-button"
                          disabled={busy}
                          onClick={() => openConversion(lead)}
                        >
                          Convert
                        </button>
                      )}
                      <button
                        className="erp-text-button founder-danger-button"
                        disabled={busy || lead.status === "CONVERTED"}
                        onClick={() =>
                          void mutate(
                            () =>
                              apiFetchV2(`/crm/leads/${lead.id}/archive`, {
                                method: "POST",
                              }),
                            "Lead archived; history remains available.",
                          )
                        }
                      >
                        Archive
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
        {tab === "pipeline" && (
          <section className="erp-section">
            <div className="erp-section-heading">
              <div>
                <p className="erp-kicker">Opportunity pipeline</p>
                <h2>Pipeline by stage</h2>
              </div>
            </div>
            <div className="crm-pipeline">
              {[
                "PROSPECTING",
                "QUALIFICATION",
                "PROPOSAL",
                "NEGOTIATION",
                "WON",
                "LOST",
              ].map((stage) => (
                <section key={stage}>
                  <h3>{stage.replaceAll("_", " ")}</h3>
                  {opportunities
                    .filter((item) => item.stage === stage)
                    .map((item) => (
                      <article key={item.id}>
                        <strong>{item.name}</strong>
                        <span>{item.account?.name ?? "No account"}</span>
                        <small>
                          {money(item.estimatedValue, item.currency)} ·{" "}
                          {item.owner
                            ? `${item.owner.firstName} ${item.owner.lastName}`
                            : "Unassigned"}
                        </small>
                        <select
                          disabled={busy}
                          value={item.stage}
                          onChange={(event) =>
                            void mutate(
                              () =>
                                apiFetchV2(`/crm/opportunities/${item.id}`, {
                                  method: "PATCH",
                                  body: JSON.stringify({
                                    stage: event.target.value,
                                    ...(event.target.value === "LOST"
                                      ? { lostReason: "Recorded in CRM" }
                                      : {}),
                                  }),
                                }),
                              "Opportunity stage updated.",
                            )
                          }
                        >
                          {[
                            "PROSPECTING",
                            "QUALIFICATION",
                            "PROPOSAL",
                            "NEGOTIATION",
                            "WON",
                            "LOST",
                          ].map((value) => (
                            <option key={value}>{value}</option>
                          ))}
                        </select>
                      </article>
                    ))}
                  {!opportunities.some((item) => item.stage === stage) && (
                    <p className="crm-empty-stage">No opportunities</p>
                  )}
                </section>
              ))}
            </div>
          </section>
        )}
        {tab === "accounts" && (
          <>
            <section className="erp-section">
              <div className="erp-section-heading">
                <div>
                  <p className="erp-kicker">People at each account</p>
                  <h2>Contacts</h2>
                </div>
                <span className="erp-section-count">{contacts.length}</span>
              </div>
              <form
                className="founder-form"
                onSubmit={(event) => void createContact(event)}
              >
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
                    <span>Account</span>
                    <select
                      value={contactForm.accountId}
                      onChange={(event) =>
                        setContactForm({
                          ...contactForm,
                          accountId: event.target.value,
                        })
                      }
                    >
                      <option value="">No account yet</option>
                      {accounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.name}
                        </option>
                      ))}
                    </select>
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
                    <span>Owner</span>
                    <select
                      value={contactForm.ownerEmployeeId}
                      onChange={(event) =>
                        setContactForm({
                          ...contactForm,
                          ownerEmployeeId: event.target.value,
                        })
                      }
                    >
                      <option value="">Unassigned</option>
                      {owners.map((owner) => (
                        <option key={owner.id} value={owner.id}>
                          {owner.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <button
                  className="erp-button erp-button-primary"
                  disabled={busy}
                >
                  Create contact ↗
                </button>
              </form>
              <div className="crm-list">
                {contacts.map((contact) => (
                  <article key={contact.id} className="crm-row">
                    <div>
                      <h3>
                        {contact.firstName} {contact.lastName}
                      </h3>
                      <p>{contact.account?.name ?? "Independent contact"}</p>
                      <small>
                        {contact.email ?? "No email"} ·{" "}
                        {contact.owner
                          ? `${contact.owner.firstName} ${contact.owner.lastName}`
                          : "Unassigned"}
                      </small>
                    </div>
                  </article>
                ))}
              </div>
            </section>
            <section className="erp-section">
              <div className="erp-section-heading">
                <div>
                  <p className="erp-kicker">Organizations</p>
                  <h2>Accounts</h2>
                </div>
              </div>
              <form
                className="founder-form"
                onSubmit={(event) => void createAccount(event)}
              >
                <div className="founder-form-grid">
                  <label>
                    <span>Account name</span>
                    <input
                      required
                      value={accountForm.name}
                      onChange={(event) =>
                        setAccountForm({
                          ...accountForm,
                          name: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    <span>Type</span>
                    <select
                      value={accountForm.accountType}
                      onChange={(event) =>
                        setAccountForm({
                          ...accountForm,
                          accountType: event.target.value,
                        })
                      }
                    >
                      {["PROSPECT", "CUSTOMER", "PARTNER", "OTHER"].map(
                        (type) => (
                          <option key={type}>{type}</option>
                        ),
                      )}
                    </select>
                  </label>
                  <label>
                    <span>Owner</span>
                    <select
                      value={accountForm.ownerEmployeeId}
                      onChange={(event) =>
                        setAccountForm({
                          ...accountForm,
                          ownerEmployeeId: event.target.value,
                        })
                      }
                    >
                      <option value="">Unassigned</option>
                      {owners.map((owner) => (
                        <option key={owner.id} value={owner.id}>
                          {owner.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <button
                  className="erp-button erp-button-primary"
                  disabled={busy}
                >
                  Create account ↗
                </button>
              </form>
            </section>
            <section className="erp-section">
              <div className="crm-list">
                {accounts.map((account) => (
                  <article key={account.id} className="crm-row">
                    <div>
                      <h3>{account.name}</h3>
                      <p>
                        {account.accountType} · {account.status} ·{" "}
                        {account.owner
                          ? `${account.owner.firstName} ${account.owner.lastName}`
                          : "Unassigned"}
                      </p>
                      <small>
                        {account._count?.contacts ?? 0} contacts ·{" "}
                        {account._count?.opportunities ?? 0} opportunities
                      </small>
                    </div>
                    <div className="crm-row-actions">
                      <select
                        aria-label={`Change ${account.name} status`}
                        disabled={busy}
                        value={account.status}
                        onChange={(event) =>
                          void mutate(
                            () =>
                              apiFetchV2(`/crm/accounts/${account.id}`, {
                                method: "PATCH",
                                body: JSON.stringify({
                                  status: event.target.value,
                                }),
                              }),
                            "Account status updated.",
                          )
                        }
                      >
                        {["ACTIVE", "INACTIVE", "ARCHIVED"].map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
        {tab === "activities" && (
          <>
            <section className="erp-section">
              <div className="erp-section-heading">
                <div>
                  <p className="erp-kicker">Relationship rhythm</p>
                  <h2>Activities</h2>
                </div>
              </div>
              <form
                className="founder-form"
                onSubmit={(event) => void createActivity(event)}
              >
                <div className="founder-form-grid">
                  <label>
                    <span>Subject</span>
                    <input
                      required
                      value={activityForm.subject}
                      onChange={(event) =>
                        setActivityForm({
                          ...activityForm,
                          subject: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    <span>Type</span>
                    <select
                      value={activityForm.type}
                      onChange={(event) =>
                        setActivityForm({
                          ...activityForm,
                          type: event.target.value,
                        })
                      }
                    >
                      {[
                        "CALL",
                        "EMAIL",
                        "MEETING",
                        "FOLLOW_UP",
                        "NOTE",
                        "OTHER",
                      ].map((type) => (
                        <option key={type}>{type}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Lead</span>
                    <select
                      value={activityForm.leadId}
                      onChange={(event) =>
                        setActivityForm({
                          ...activityForm,
                          leadId: event.target.value,
                        })
                      }
                    >
                      <option value="">No linked lead</option>
                      {leads.map((lead) => (
                        <option key={lead.id} value={lead.id}>
                          {lead.firstName} {lead.lastName}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Owner</span>
                    <select
                      value={activityForm.ownerEmployeeId}
                      onChange={(event) =>
                        setActivityForm({
                          ...activityForm,
                          ownerEmployeeId: event.target.value,
                        })
                      }
                    >
                      <option value="">Unassigned</option>
                      {owners.map((owner) => (
                        <option key={owner.id} value={owner.id}>
                          {owner.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Due</span>
                    <input
                      type="date"
                      value={activityForm.dueAt}
                      onChange={(event) =>
                        setActivityForm({
                          ...activityForm,
                          dueAt: event.target.value,
                        })
                      }
                    />
                  </label>
                </div>
                <button
                  className="erp-button erp-button-primary"
                  disabled={busy}
                >
                  Record activity ↗
                </button>
              </form>
            </section>
            <section className="erp-section">
              <div className="crm-list">
                {activities.map((activity) => (
                  <article className="crm-row" key={activity.id}>
                    <div>
                      <h3>{activity.subject}</h3>
                      <p>
                        {activity.type} ·{" "}
                        {activity.lead
                          ? `${activity.lead.firstName} ${activity.lead.lastName}`
                          : (activity.account?.name ??
                            activity.opportunity?.name ??
                            "No linked record")}
                      </p>
                      <small>
                        {activity.completedAt
                          ? `Completed ${date(activity.completedAt)}`
                          : `Due ${date(activity.dueAt)}`}
                      </small>
                    </div>
                    {!activity.completedAt && (
                      <button
                        className="erp-text-button"
                        disabled={busy}
                        onClick={() =>
                          void mutate(
                            () =>
                              apiFetchV2(
                                `/crm/activities/${activity.id}/complete`,
                                { method: "POST" },
                              ),
                            "Activity completed.",
                          )
                        }
                      >
                        Complete
                      </button>
                    )}
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
      {conversionLead && (
        <div className="founder-dialog-backdrop" role="presentation">
          <section
            aria-labelledby="crm-convert-title"
            aria-modal="true"
            className="founder-dialog"
            role="dialog"
          >
            <div className="founder-dialog-head">
              <div>
                <p className="erp-kicker">Conversion review</p>
                <h2 id="crm-convert-title">Create a qualified record.</h2>
              </div>
              <button
                aria-label="Close conversion dialog"
                className="erp-text-button"
                disabled={busy}
                onClick={() => setConversionLead(null)}
                type="button"
              >
                Close
              </button>
            </div>
            <p className="founder-form-note">
              This preserves the lead, then links a new account, contact and
              opportunity. Check ownership before converting.
            </p>
            <form
              className="founder-form"
              onSubmit={(event) => void convertLead(event)}
            >
              <div className="founder-form-grid">
                <label>
                  <span>Account name</span>
                  <input
                    required
                    value={conversionForm.accountName}
                    onChange={(event) =>
                      setConversionForm({
                        ...conversionForm,
                        accountName: event.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  <span>Opportunity</span>
                  <input
                    required
                    value={conversionForm.opportunityName}
                    onChange={(event) =>
                      setConversionForm({
                        ...conversionForm,
                        opportunityName: event.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  <span>Contact first name</span>
                  <input
                    required
                    value={conversionForm.contactFirstName}
                    onChange={(event) =>
                      setConversionForm({
                        ...conversionForm,
                        contactFirstName: event.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  <span>Contact last name</span>
                  <input
                    required
                    value={conversionForm.contactLastName}
                    onChange={(event) =>
                      setConversionForm({
                        ...conversionForm,
                        contactLastName: event.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  <span>Estimated value</span>
                  <input
                    min="0"
                    type="number"
                    value={conversionForm.estimatedValue}
                    onChange={(event) =>
                      setConversionForm({
                        ...conversionForm,
                        estimatedValue: event.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  <span>Currency</span>
                  <input
                    maxLength={3}
                    value={conversionForm.currency}
                    onChange={(event) =>
                      setConversionForm({
                        ...conversionForm,
                        currency: event.target.value.toUpperCase(),
                      })
                    }
                  />
                </label>
                <label>
                  <span>Expected close</span>
                  <input
                    type="date"
                    value={conversionForm.expectedCloseDate}
                    onChange={(event) =>
                      setConversionForm({
                        ...conversionForm,
                        expectedCloseDate: event.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  <span>Opportunity owner</span>
                  <select
                    value={conversionForm.ownerEmployeeId}
                    onChange={(event) =>
                      setConversionForm({
                        ...conversionForm,
                        ownerEmployeeId: event.target.value,
                      })
                    }
                  >
                    <option value="">Keep lead owner</option>
                    {owners.map((owner) => (
                      <option key={owner.id} value={owner.id}>
                        {owner.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="founder-dialog-actions">
                <button
                  className="erp-text-button"
                  disabled={busy}
                  onClick={() => setConversionLead(null)}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="erp-button erp-button-primary"
                  disabled={busy}
                >
                  Convert lead ↗
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
export function FounderCrm() {
  return (
    <ProtectedErp requiredExecutive>
      <FounderCrmContent />
    </ProtectedErp>
  );
}
