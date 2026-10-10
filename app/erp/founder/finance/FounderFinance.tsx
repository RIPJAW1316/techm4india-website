"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { ApiError, apiFetchV2 } from "@/lib/api/client";
import { ErpLoading, ProtectedErp } from "@/app/erp/components/ProtectedErp";
import { FounderModuleNavigation } from "@/app/erp/components/FounderModuleNavigation";
import {
  compileFinancialStatements,
  calculateAgeing,
  STANDARD_CHART_OF_ACCOUNTS,
} from "@/lib/erp/finance.rules";
import { GstPanel } from "./GstPanel";

type Row = Record<string, any>;
type Tab = "overview" | "invoices" | "parties" | "expenses" | "payments" | "gst" | "ledger";
const tabs: Array<[Tab, string]> = [
  ["overview", "Overview"],
  ["invoices", "Invoices"],
  ["parties", "Customers & vendors"],
  ["expenses", "Expenses"],
  ["payments", "Payments"],
  ["gst", "GST"],
  ["ledger", "Ledger"],
];
const money = (value: unknown, code = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: code,
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
const date = (value?: string) => (value ? new Date(value).toLocaleDateString("en-IN") : "—");
const today = () => new Date().toISOString().slice(0, 10);

/**
 * The dashboard returns GST buckets keyed by tax head. Label them explicitly
 * rather than printing the object keys, so the screen never shows a reader a
 * field name like `taxableValue`.
 */
const GST_SUMMARY_LABELS: Array<[string, string]> = [
  ["taxableValue", "Taxable value"],
  ["GST", "GST (unsplit)"],
  ["CGST", "Central tax (CGST)"],
  ["SGST", "State tax (SGST)"],
  ["IGST", "Integrated tax (IGST)"],
  ["CESS", "Cess"],
  ["OTHER", "Other"],
];

function gstSummaryRows(summary: Row | null | undefined) {
  if (!summary) return [];
  return GST_SUMMARY_LABELS.filter(([key]) => key in summary).map(([key, label]) => ({
    key,
    label,
    value: summary[key],
  }));
}

function FounderFinanceContent() {
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<Row | null>(null);
  const [parties, setParties] = useState<Row[]>([]);
  const [taxes, setTaxes] = useState<Row[]>([]);
  const [invoices, setInvoices] = useState<Row[]>([]);
  const [expenses, setExpenses] = useState<Row[]>([]);
  const [payments, setPayments] = useState<Row[]>([]);
  const [receivables, setReceivables] = useState<Row[]>([]);
  const [payables, setPayables] = useState<Row[]>([]);
  const [accounts, setAccounts] = useState<Row[]>([]);
  const [journals, setJournals] = useState<Row[]>([]);
  const [ledgerSubTab, setLedgerSubTab] = useState<"journals" | "statements" | "ageing">("journals");

  const statements = useMemo(() => {
    const mappedAccounts =
      accounts.length > 0
        ? accounts.map((a) => ({
            id: a.id,
            code: a.code,
            name: a.name,
            type: a.type as "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE",
            normalBalance: (a.normalBalance ||
              (["ASSET", "EXPENSE"].includes(a.type) ? "DEBIT" : "CREDIT")) as
              | "DEBIT"
              | "CREDIT",
          }))
        : STANDARD_CHART_OF_ACCOUNTS.map((a) => ({
            id: a.code,
            code: a.code,
            name: a.name,
            type: a.type,
            normalBalance: a.naturalBalance,
          }));

    const lines = journals
      .filter((j) => j.status === "POSTED" && Array.isArray(j.lines))
      .flatMap((j) =>
        j.lines.map((l: any) => ({
          accountId: l.ledgerAccountId || l.accountId || l.account?.id,
          accountCode: l.account?.code,
          accountName: l.account?.name,
          debit: Number(l.debit || 0),
          credit: Number(l.credit || 0),
        })),
      );

    return compileFinancialStatements(mappedAccounts, lines);
  }, [accounts, journals]);

  const receivablesAgeing = useMemo(() => {
    const activeInvoices = invoices.filter(
      (i) => i.status !== "PAID" && i.status !== "CANCELLED",
    );
    return calculateAgeing(
      activeInvoices.map((inv) => ({
        id: String(inv.id),
        invoiceNumber: inv.invoiceNumber || String(inv.id),
        partyName: inv.party?.name || "Customer",
        balanceDue: Number(inv.totalAmount || inv.subtotal || 0),
        dueDate: inv.dueDate || inv.invoiceDate || today(),
      })),
    );
  }, [invoices]);

  const payablesAgeing = useMemo(() => {
    const activeExpenses = expenses.filter(
      (e) => e.status !== "PAID" && e.status !== "CANCELLED",
    );
    return calculateAgeing(
      activeExpenses.map((exp) => ({
        id: String(exp.id),
        invoiceNumber: exp.expenseNumber || exp.category || String(exp.id),
        partyName: exp.vendorParty?.name || exp.category || "Vendor",
        balanceDue: Number(exp.amount || 0),
        dueDate: exp.expenseDate || today(),
      })),
    );
  }, [expenses]);
  const [partyForm, setPartyForm] = useState({
    type: "CUSTOMER",
    name: "",
    email: "",
    gstin: "",
    isActive: true,
  });
  const [invoiceForm, setInvoiceForm] = useState({
    invoiceNumber: "",
    partyId: "",
    invoiceDate: today(),
    dueDate: "",
    currency: "INR",
    description: "",
    quantity: "1",
    unitPrice: "",
    discountAmount: "",
    taxRateId: "",
    hsnSacCode: "",
  });
  const [expenseForm, setExpenseForm] = useState({
    expenseNumber: "",
    vendorPartyId: "",
    category: "",
    description: "",
    expenseDate: today(),
    currency: "INR",
    amount: "",
    taxRateId: "",
  });
  const [paymentForm, setPaymentForm] = useState({
    direction: "RECEIVED",
    invoiceId: "",
    expenseId: "",
    partyId: "",
    amount: "",
    method: "BANK_TRANSFER",
    reference: "",
    paymentDate: today(),
    currency: "INR",
  });
  const [accountForm, setAccountForm] = useState({ code: "", name: "", type: "ASSET" });
  const [journalForm, setJournalForm] = useState({
    entryDate: today(),
    description: "",
    debitAccountId: "",
    creditAccountId: "",
    amount: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [d, pa, ta, inv, exp, pay, ar, ap, acc, jou] = await Promise.all([
        apiFetchV2<{ data: Row }>("/finance/dashboard"),
        apiFetchV2<{ data: Row[] }>("/finance/parties?limit=100"),
        apiFetchV2<{ data: Row[] }>("/finance/tax-rates"),
        apiFetchV2<{ data: Row[] }>("/finance/invoices?limit=100"),
        apiFetchV2<{ data: Row[] }>("/finance/expenses?limit=100"),
        apiFetchV2<{ data: Row[] }>("/finance/payments?limit=100"),
        apiFetchV2<{ data: Row[] }>("/finance/receivables"),
        apiFetchV2<{ data: Row[] }>("/finance/payables"),
        apiFetchV2<{ data: Row[] }>("/finance/ledger/accounts"),
        apiFetchV2<{ data: Row[] }>("/finance/journals"),
      ]);
      setDashboard(d.data);
      setParties(pa.data);
      setTaxes(ta.data);
      setInvoices(inv.data);
      setExpenses(exp.data);
      setPayments(pay.data);
      setReceivables(ar.data);
      setPayables(ap.data);
      setAccounts(acc.data);
      setJournals(jou.data);
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Finance workspace could not load.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  const customers = useMemo(
    () => parties.filter((row) => row.type !== "VENDOR" && row.isActive),
    [parties],
  );
  const vendors = useMemo(
    () => parties.filter((row) => row.type !== "CUSTOMER" && row.isActive),
    [parties],
  );
  async function submit(path: string, body: Row, done: () => void) {
    setBusy(true);
    setError(null);
    try {
      await apiFetchV2(path, { method: "POST", body: JSON.stringify(body) });
      done();
      await load();
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Finance action could not be saved.");
    } finally {
      setBusy(false);
    }
  }
  async function action(path: string, body?: Row) {
    setBusy(true);
    try {
      await apiFetchV2(path, { method: "POST", body: body ? JSON.stringify(body) : undefined });
      await load();
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Finance action failed.");
    } finally {
      setBusy(false);
    }
  }
  function confirmAction(message: string, path: string) {
    if (window.confirm(message)) void action(path, { reason: message });
  }
  if (loading) return <ErpLoading label="Loading finance workspace" />;
  return (
    <main className="erp-main">
      <div className="erp-content">
        <FounderModuleNavigation active="finance" />
        <section className="erp-welcome">
          <div>
            <p className="erp-kicker">Finance operations · configurable records</p>
            <h1>
              Finance &amp; <em>GST</em>
            </h1>
            <p>
              Manage commercial records, receivables, expenses and manual journals without assuming
              statutory treatment.
            </p>
          </div>
          <div className="erp-welcome-code">
            <span>Currency</span>
            <strong>INR</strong>
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
        <p className="erp-form-note">
          GST configuration and reports are based on organization-entered tax settings and should be
          reviewed by an authorized finance/tax professional before statutory filing.
        </p>
        <nav className="founder-tabs" aria-label="Finance workspace">
          {tabs.map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={tab === id ? "is-active" : ""}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </nav>
        {tab === "overview" && (
          <>
            <section className="erp-kpi-grid">
              <article>
                <span>Receivables</span>
                <strong>{money(dashboard?.receivables)}</strong>
                <small>Issued, unpaid invoices</small>
              </article>
              <article>
                <span>Overdue</span>
                <strong>{money(dashboard?.overdueReceivables)}</strong>
                <small>Derived from due date</small>
              </article>
              <article>
                <span>Payments received</span>
                <strong>{money(dashboard?.paymentsReceived)}</strong>
                <small>Selected period</small>
              </article>
              <article>
                <span>Outstanding payables</span>
                <strong>{money(dashboard?.outstandingPayables)}</strong>
                <small>Approved expenses</small>
              </article>
            </section>
            <section className="founder-detail-columns">
              <div className="erp-section">
                <div className="erp-section-heading">
                  <div>
                    <p className="erp-kicker">Accounts receivable</p>
                    <h2>Open invoices</h2>
                  </div>
                </div>
                <RecordList
                  rows={receivables}
                  empty="No outstanding receivables."
                  render={(row) => (
                    <>
                      <div>
                        <h3>
                          {row.invoiceNumber} · {row.party?.displayName || row.party?.name}
                        </h3>
                        <p>
                          Due {date(row.dueDate)} · {row.agingStatus}
                        </p>
                      </div>
                      <strong>{money(row.balanceDue, row.currency)}</strong>
                    </>
                  )}
                />
              </div>
              <div className="erp-section">
                <div className="erp-section-heading">
                  <div>
                    <p className="erp-kicker">Accounts payable</p>
                    <h2>Approved expenses</h2>
                  </div>
                </div>
                <RecordList
                  rows={payables}
                  empty="No outstanding payables."
                  render={(row) => (
                    <>
                      <div>
                        <h3>
                          {row.expenseNumber} · {row.vendor?.name || "No vendor"}
                        </h3>
                        <p>
                          {row.paymentStatus} · {date(row.expenseDate)}
                        </p>
                      </div>
                      <strong>
                        {money(Number(row.totalAmount) - Number(row.amountPaid), row.currency)}
                      </strong>
                    </>
                  )}
                />
              </div>
              <div className="erp-section">
                <div className="erp-section-heading">
                  <div>
                    <p className="erp-kicker">Configured tax</p>
                    <h2>GST summary</h2>
                  </div>
                </div>
                <div className="erp-notification-list">
                  {gstSummaryRows(dashboard?.gst).map((row) => (
                    <article className="erp-notification" key={row.key}>
                      <span>{row.label}</span>
                      <strong>{money(row.value)}</strong>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
        {tab === "parties" && (
          <section className="erp-section">
            <SectionHead
              kicker="External records"
              title="Customers & vendors"
              count={`${parties.length} parties`}
            />
            <form
              className="founder-form"
              onSubmit={(e: FormEvent) => {
                e.preventDefault();
                void submit("/finance/parties", partyForm, () =>
                  setPartyForm({
                    type: "CUSTOMER",
                    name: "",
                    email: "",
                    gstin: "",
                    isActive: true,
                  }),
                );
              }}
            >
              <div className="founder-form-grid">
                <label>
                  <span>Type</span>
                  <select
                    value={partyForm.type}
                    onChange={(e) => setPartyForm({ ...partyForm, type: e.target.value })}
                  >
                    <option>CUSTOMER</option>
                    <option>VENDOR</option>
                    <option>BOTH</option>
                  </select>
                </label>
                <label>
                  <span>Legal/display name</span>
                  <input
                    required
                    value={partyForm.name}
                    onChange={(e) => setPartyForm({ ...partyForm, name: e.target.value })}
                  />
                </label>
                <label>
                  <span>Email</span>
                  <input
                    type="email"
                    value={partyForm.email}
                    onChange={(e) => setPartyForm({ ...partyForm, email: e.target.value })}
                  />
                </label>
                <label>
                  <span>GSTIN (optional)</span>
                  <input
                    value={partyForm.gstin}
                    onChange={(e) => setPartyForm({ ...partyForm, gstin: e.target.value })}
                  />
                </label>
              </div>
              <button className="erp-button erp-button-primary" disabled={busy}>
                Add party ↗
              </button>
            </form>
            <RecordList
              rows={parties}
              empty="No finance parties yet."
              render={(row) => (
                <>
                  <div>
                    <h3>{row.displayName || row.name}</h3>
                    <p>
                      {row.type} · {row.email || "No email"}
                    </p>
                  </div>
                  <span>{row.isActive ? "Active" : "Archived"}</span>
                </>
              )}
            />
          </section>
        )}
        {tab === "invoices" && (
          <section className="erp-section">
            <SectionHead kicker="Billing" title="Invoices" count={`${invoices.length} records`} />
            <form
              className="founder-form"
              onSubmit={(e: FormEvent) => {
                e.preventDefault();
                void submit(
                  "/finance/invoices",
                  {
                    invoiceNumber: invoiceForm.invoiceNumber,
                    partyId: invoiceForm.partyId,
                    invoiceDate: invoiceForm.invoiceDate,
                    dueDate: invoiceForm.dueDate || undefined,
                    currency: invoiceForm.currency,
                    lines: [
                      {
                        description: invoiceForm.description,
                        quantity: Number(invoiceForm.quantity),
                        unitPrice: Number(invoiceForm.unitPrice),
                        discountAmount: Number(invoiceForm.discountAmount || 0),
                        taxRateId: invoiceForm.taxRateId || undefined,
                        hsnSacCode: invoiceForm.hsnSacCode || undefined,
                      },
                    ],
                  },
                  () =>
                    setInvoiceForm({
                      ...invoiceForm,
                      invoiceNumber: "",
                      description: "",
                      unitPrice: "",
                      discountAmount: "",
                    }),
                );
              }}
            >
              <div className="founder-form-grid">
                <label>
                  <span>Invoice number</span>
                  <input
                    required
                    value={invoiceForm.invoiceNumber}
                    onChange={(e) =>
                      setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value })
                    }
                  />
                </label>
                <label>
                  <span>Customer</span>
                  <select
                    required
                    value={invoiceForm.partyId}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, partyId: e.target.value })}
                  >
                    <option value="">Choose party</option>
                    {customers.map((row) => (
                      <option key={row.id} value={row.id}>
                        {row.displayName || row.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Invoice date</span>
                  <input
                    required
                    type="date"
                    value={invoiceForm.invoiceDate}
                    onChange={(e) =>
                      setInvoiceForm({ ...invoiceForm, invoiceDate: e.target.value })
                    }
                  />
                </label>
                <label>
                  <span>Due date</span>
                  <input
                    type="date"
                    value={invoiceForm.dueDate}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                  />
                </label>
                <label>
                  <span>Line description</span>
                  <input
                    required
                    value={invoiceForm.description}
                    onChange={(e) =>
                      setInvoiceForm({ ...invoiceForm, description: e.target.value })
                    }
                  />
                </label>
                <label>
                  <span>Quantity</span>
                  <input
                    required
                    type="number"
                    min="0.0001"
                    step="0.0001"
                    value={invoiceForm.quantity}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, quantity: e.target.value })}
                  />
                </label>
                <label>
                  <span>Unit price</span>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={invoiceForm.unitPrice}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, unitPrice: e.target.value })}
                  />
                </label>
                <label>
                  <span>Discount</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={invoiceForm.discountAmount}
                    onChange={(e) =>
                      setInvoiceForm({ ...invoiceForm, discountAmount: e.target.value })
                    }
                  />
                </label>
                <label>
                  <span>Tax configuration</span>
                  <select
                    value={invoiceForm.taxRateId}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, taxRateId: e.target.value })}
                  >
                    <option value="">No tax</option>
                    {taxes
                      .filter((row) => row.isActive)
                      .map((row) => (
                        <option key={row.id} value={row.id}>
                          {row.code} · {row.rate}%
                        </option>
                      ))}
                  </select>
                </label>
                <label>
                  <span>HSN/SAC (optional)</span>
                  <input
                    value={invoiceForm.hsnSacCode}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, hsnSacCode: e.target.value })}
                  />
                </label>
              </div>
              <button className="erp-button erp-button-primary" disabled={busy}>
                Create draft invoice ↗
              </button>
            </form>
            <RecordList
              rows={invoices}
              empty="No invoices yet."
              render={(row) => (
                <>
                  <div>
                    <h3>
                      {row.invoiceNumber} · {row.party?.displayName || row.party?.name}
                    </h3>
                    <p>
                      {row.status} · {date(row.invoiceDate)} · paid{" "}
                      {money(row.amountPaid, row.currency)}
                    </p>
                  </div>
                  <div className="founder-row-actions">
                    <strong>{money(row.balanceDue, row.currency)}</strong>
                    {row.status === "DRAFT" && (
                      <button
                        className="erp-text-button"
                        disabled={busy}
                        onClick={() => void action(`/finance/invoices/${row.id}/issue`)}
                      >
                        Issue ↗
                      </button>
                    )}
                    {["DRAFT", "ISSUED"].includes(row.status) && (
                      <button
                        className="erp-text-button"
                        disabled={busy}
                        onClick={() =>
                          confirmAction(
                            "Cancel this invoice? This preserves history.",
                            `/finance/invoices/${row.id}/cancel`,
                          )
                        }
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </>
              )}
            />
          </section>
        )}
        {tab === "expenses" && (
          <section className="erp-section">
            <SectionHead kicker="Payables" title="Expenses" count={`${expenses.length} records`} />
            <form
              className="founder-form"
              onSubmit={(e: FormEvent) => {
                e.preventDefault();
                void submit(
                  "/finance/expenses",
                  {
                    expenseNumber: expenseForm.expenseNumber,
                    vendorPartyId: expenseForm.vendorPartyId || undefined,
                    category: expenseForm.category,
                    description: expenseForm.description,
                    expenseDate: expenseForm.expenseDate,
                    currency: expenseForm.currency,
                    lines: [
                      {
                        description: expenseForm.description,
                        amount: Number(expenseForm.amount),
                        taxRateId: expenseForm.taxRateId || undefined,
                      },
                    ],
                  },
                  () =>
                    setExpenseForm({
                      ...expenseForm,
                      expenseNumber: "",
                      category: "",
                      description: "",
                      amount: "",
                    }),
                );
              }}
            >
              <div className="founder-form-grid">
                <label>
                  <span>Expense number</span>
                  <input
                    required
                    value={expenseForm.expenseNumber}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, expenseNumber: e.target.value })
                    }
                  />
                </label>
                <label>
                  <span>Vendor</span>
                  <select
                    value={expenseForm.vendorPartyId}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, vendorPartyId: e.target.value })
                    }
                  >
                    <option value="">No vendor</option>
                    {vendors.map((row) => (
                      <option key={row.id} value={row.id}>
                        {row.displayName || row.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Category</span>
                  <input
                    required
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  />
                </label>
                <label>
                  <span>Date</span>
                  <input
                    required
                    type="date"
                    value={expenseForm.expenseDate}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, expenseDate: e.target.value })
                    }
                  />
                </label>
                <label>
                  <span>Description</span>
                  <input
                    required
                    value={expenseForm.description}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, description: e.target.value })
                    }
                  />
                </label>
                <label>
                  <span>Amount</span>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  />
                </label>
                <label>
                  <span>Tax configuration</span>
                  <select
                    value={expenseForm.taxRateId}
                    onChange={(e) => setExpenseForm({ ...expenseForm, taxRateId: e.target.value })}
                  >
                    <option value="">No tax</option>
                    {taxes
                      .filter((row) => row.isActive)
                      .map((row) => (
                        <option key={row.id} value={row.id}>
                          {row.code} · {row.rate}%
                        </option>
                      ))}
                  </select>
                </label>
              </div>
              <button className="erp-button erp-button-primary" disabled={busy}>
                Create draft expense ↗
              </button>
            </form>
            <RecordList
              rows={expenses}
              empty="No expenses yet."
              render={(row) => (
                <>
                  <div>
                    <h3>
                      {row.expenseNumber} · {row.category}
                    </h3>
                    <p>
                      {row.vendor?.name || "No vendor"} · {row.status} · {row.paymentStatus}
                    </p>
                  </div>
                  <div className="founder-row-actions">
                    <strong>{money(row.totalAmount, row.currency)}</strong>
                    {row.status === "DRAFT" && (
                      <button
                        className="erp-text-button"
                        disabled={busy}
                        onClick={() => void action(`/finance/expenses/${row.id}/submit`)}
                      >
                        Submit ↗
                      </button>
                    )}
                    {row.status === "SUBMITTED" && (
                      <button
                        className="erp-text-button"
                        disabled={busy}
                        onClick={() => void action(`/finance/expenses/${row.id}/approve`)}
                      >
                        Approve ↗
                      </button>
                    )}
                  </div>
                </>
              )}
            />
          </section>
        )}
        {tab === "payments" && (
          <section className="erp-section">
            <SectionHead
              kicker="Cash records"
              title="Payments"
              count={`${payments.length} records`}
            />
            <form
              className="founder-form"
              onSubmit={(e: FormEvent) => {
                e.preventDefault();
                void submit(
                  "/finance/payments",
                  {
                    ...paymentForm,
                    invoiceId:
                      paymentForm.direction === "RECEIVED" ? paymentForm.invoiceId : undefined,
                    expenseId: paymentForm.direction === "PAID" ? paymentForm.expenseId : undefined,
                    partyId: paymentForm.partyId || undefined,
                    amount: Number(paymentForm.amount),
                  },
                  () =>
                    setPaymentForm({
                      ...paymentForm,
                      invoiceId: "",
                      expenseId: "",
                      partyId: "",
                      amount: "",
                      reference: "",
                    }),
                );
              }}
            >
              <div className="founder-form-grid">
                <label>
                  <span>Direction</span>
                  <select
                    value={paymentForm.direction}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        direction: e.target.value,
                        invoiceId: "",
                        expenseId: "",
                      })
                    }
                  >
                    <option value="RECEIVED">Received</option>
                    <option value="PAID">Paid</option>
                  </select>
                </label>
                {paymentForm.direction === "RECEIVED" ? (
                  <label>
                    <span>Invoice</span>
                    <select
                      required
                      value={paymentForm.invoiceId}
                      onChange={(e) =>
                        setPaymentForm({ ...paymentForm, invoiceId: e.target.value })
                      }
                    >
                      <option value="">Choose invoice</option>
                      {invoices
                        .filter((row) => ["ISSUED", "PARTIALLY_PAID"].includes(row.status))
                        .map((row) => (
                          <option key={row.id} value={row.id}>
                            {row.invoiceNumber} · {money(row.balanceDue, row.currency)}
                          </option>
                        ))}
                    </select>
                  </label>
                ) : (
                  <label>
                    <span>Approved expense</span>
                    <select
                      required
                      value={paymentForm.expenseId}
                      onChange={(e) =>
                        setPaymentForm({ ...paymentForm, expenseId: e.target.value })
                      }
                    >
                      <option value="">Choose expense</option>
                      {expenses
                        .filter((row) => row.status === "APPROVED" && row.paymentStatus !== "PAID")
                        .map((row) => (
                          <option key={row.id} value={row.id}>
                            {row.expenseNumber} ·{" "}
                            {money(row.totalAmount - row.amountPaid, row.currency)}
                          </option>
                        ))}
                    </select>
                  </label>
                )}
                <label>
                  <span>Amount</span>
                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  />
                </label>
                <label>
                  <span>Method</span>
                  <select
                    value={paymentForm.method}
                    onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                  >
                    {["BANK_TRANSFER", "UPI", "CASH", "CHEQUE", "CARD", "OTHER"].map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Date</span>
                  <input
                    required
                    type="date"
                    value={paymentForm.paymentDate}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, paymentDate: e.target.value })
                    }
                  />
                </label>
                <label>
                  <span>Reference</span>
                  <input
                    value={paymentForm.reference}
                    onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                  />
                </label>
              </div>
              <button className="erp-button erp-button-primary" disabled={busy}>
                Record payment ↗
              </button>
            </form>
            <RecordList
              rows={payments}
              empty="No payments yet."
              render={(row) => (
                <>
                  <div>
                    <h3>
                      {row.direction} · {money(row.amount, row.currency)}
                    </h3>
                    <p>
                      {date(row.paymentDate)} · {row.method} · {row.status}
                    </p>
                  </div>
                  {row.status === "RECORDED" && (
                    <button
                      className="erp-text-button"
                      disabled={busy}
                      onClick={() =>
                        confirmAction(
                          "Void this payment and restore its linked balance?",
                          `/finance/payments/${row.id}/void`,
                        )
                      }
                    >
                      Void
                    </button>
                  )}
                </>
              )}
            />
          </section>
        )}
        {tab === "gst" && <GstPanel />}
        {tab === "ledger" && (
          <section className="erp-section">
            <SectionHead
              kicker="Manual accounting foundation"
              title="Chart of accounts & journals"
              count={`${accounts.length} accounts`}
            />
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                marginBottom: "1.5rem",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                className={`erp-button ${ledgerSubTab === "journals" ? "erp-button-primary" : ""}`}
                style={{
                  backgroundColor:
                    ledgerSubTab === "journals" ? undefined : "var(--color-surface, #f8fafc)",
                  color: ledgerSubTab === "journals" ? undefined : "var(--color-text, #334155)",
                  border: "1px solid var(--color-border, #e2e8f0)",
                }}
                onClick={() => setLedgerSubTab("journals")}
              >
                Journal Entries ({journals.length})
              </button>
              <button
                type="button"
                className={`erp-button ${ledgerSubTab === "statements" ? "erp-button-primary" : ""}`}
                style={{
                  backgroundColor:
                    ledgerSubTab === "statements" ? undefined : "var(--color-surface, #f8fafc)",
                  color: ledgerSubTab === "statements" ? undefined : "var(--color-text, #334155)",
                  border: "1px solid var(--color-border, #e2e8f0)",
                }}
                onClick={() => setLedgerSubTab("statements")}
              >
                Financial Statements (Trial Balance, P&L, Balance Sheet)
              </button>
              <button
                type="button"
                className={`erp-button ${ledgerSubTab === "ageing" ? "erp-button-primary" : ""}`}
                style={{
                  backgroundColor:
                    ledgerSubTab === "ageing" ? undefined : "var(--color-surface, #f8fafc)",
                  color: ledgerSubTab === "ageing" ? undefined : "var(--color-text, #334155)",
                  border: "1px solid var(--color-border, #e2e8f0)",
                }}
                onClick={() => setLedgerSubTab("ageing")}
              >
                Ageing Analysis (Receivables & Payables)
              </button>
            </div>

            {ledgerSubTab === "journals" && (
              <>
                <form
                  className="founder-form"
                  onSubmit={(e: FormEvent) => {
                    e.preventDefault();
                    void submit("/finance/ledger/accounts", accountForm, () =>
                      setAccountForm({ code: "", name: "", type: "ASSET" }),
                    );
                  }}
                >
                  <div className="founder-form-grid">
                    <label>
                      <span>Account code</span>
                      <input
                        required
                        value={accountForm.code}
                        onChange={(e) => setAccountForm({ ...accountForm, code: e.target.value })}
                      />
                    </label>
                    <label>
                      <span>Account name</span>
                      <input
                        required
                        value={accountForm.name}
                        onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                      />
                    </label>
                    <label>
                      <span>Type</span>
                      <select
                        value={accountForm.type}
                        onChange={(e) => setAccountForm({ ...accountForm, type: e.target.value })}
                      >
                        {["ASSET", "LIABILITY", "EQUITY", "INCOME", "EXPENSE"].map((value) => (
                          <option key={value}>{value}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <button className="erp-button erp-button-primary" disabled={busy}>
                    Add ledger account ↗
                  </button>
                </form>
                <form
                  className="founder-form"
                  onSubmit={(e: FormEvent) => {
                    e.preventDefault();
                    void submit(
                      "/finance/journals",
                      {
                        entryDate: journalForm.entryDate,
                        description: journalForm.description,
                        lines: [
                          {
                            ledgerAccountId: journalForm.debitAccountId,
                            debit: Number(journalForm.amount),
                            credit: 0,
                          },
                          {
                            ledgerAccountId: journalForm.creditAccountId,
                            debit: 0,
                            credit: Number(journalForm.amount),
                          },
                        ],
                      },
                      () =>
                        setJournalForm({
                          entryDate: today(),
                          description: "",
                          debitAccountId: "",
                          creditAccountId: "",
                          amount: "",
                        }),
                    );
                  }}
                >
                  <div className="founder-form-grid">
                    <label>
                      <span>Entry date</span>
                      <input
                        required
                        type="date"
                        value={journalForm.entryDate}
                        onChange={(e) =>
                          setJournalForm({ ...journalForm, entryDate: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      <span>Description</span>
                      <input
                        required
                        value={journalForm.description}
                        onChange={(e) =>
                          setJournalForm({ ...journalForm, description: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      <span>Debit account</span>
                      <select
                        required
                        value={journalForm.debitAccountId}
                        onChange={(e) =>
                          setJournalForm({ ...journalForm, debitAccountId: e.target.value })
                        }
                      >
                        <option value="">Choose account</option>
                        {accounts
                          .filter((row) => row.isActive)
                          .map((row) => (
                            <option key={row.id} value={row.id}>
                              {row.code} · {row.name}
                            </option>
                          ))}
                      </select>
                    </label>
                    <label>
                      <span>Credit account</span>
                      <select
                        required
                        value={journalForm.creditAccountId}
                        onChange={(e) =>
                          setJournalForm({ ...journalForm, creditAccountId: e.target.value })
                        }
                      >
                        <option value="">Choose account</option>
                        {accounts
                          .filter((row) => row.isActive)
                          .map((row) => (
                            <option key={row.id} value={row.id}>
                              {row.code} · {row.name}
                            </option>
                          ))}
                      </select>
                    </label>
                    <label>
                      <span>Balanced amount</span>
                      <input
                        required
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={journalForm.amount}
                        onChange={(e) => setJournalForm({ ...journalForm, amount: e.target.value })}
                      />
                    </label>
                  </div>
                  <button className="erp-button erp-button-primary" disabled={busy}>
                    Create balanced journal ↗
                  </button>
                </form>
                <RecordList
                  rows={journals}
                  empty="No journals yet."
                  render={(row) => (
                    <>
                      <div>
                        <h3>{row.description}</h3>
                        <p>
                          {date(row.entryDate)} · {row.lines?.length ?? 0} lines
                        </p>
                      </div>
                      <div className="founder-row-actions">
                        <strong>{row.status}</strong>
                        {row.status === "DRAFT" && (
                          <button
                            className="erp-text-button"
                            disabled={busy}
                            onClick={() => void action(`/finance/journals/${row.id}/post`)}
                          >
                            Post ↗
                          </button>
                        )}
                      </div>
                    </>
                  )}
                />
              </>
            )}

            {ledgerSubTab === "statements" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div
                  style={{
                    padding: "1.25rem",
                    borderRadius: "8px",
                    backgroundColor: "var(--color-surface, #ffffff)",
                    border: "1px solid var(--color-border, #e2e8f0)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "1rem",
                    }}
                  >
                    <div>
                      <p className="erp-kicker" style={{ margin: 0 }}>
                        Double-Entry Verification
                      </p>
                      <h3 style={{ margin: "0.25rem 0 0" }}>Trial Balance</h3>
                    </div>
                    <span
                      className="erp-badge"
                      style={{
                        backgroundColor: statements.trialBalance.isBalanced
                          ? "rgba(16, 185, 129, 0.15)"
                          : "rgba(239, 68, 68, 0.15)",
                        color: statements.trialBalance.isBalanced ? "#059669" : "#dc2626",
                        fontWeight: 600,
                        padding: "4px 10px",
                      }}
                    >
                      {statements.trialBalance.isBalanced
                        ? "✓ Balanced (Debit = Credit)"
                        : "⚠️ Out of Balance"}
                    </span>
                  </div>
                  <table
                    style={{ width: "100%", fontSize: "0.85rem", borderCollapse: "collapse" }}
                  >
                    <thead>
                      <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                        <th style={{ padding: "8px" }}>Account</th>
                        <th style={{ padding: "8px" }}>Type</th>
                        <th style={{ padding: "8px", textAlign: "right" }}>Debit</th>
                        <th style={{ padding: "8px", textAlign: "right" }}>Credit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statements.trialBalance.items.map((l) => (
                        <tr key={l.code} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "8px" }}>
                            {l.code} · {l.name}
                          </td>
                          <td style={{ padding: "8px", color: "#64748b" }}>{l.type}</td>
                          <td style={{ padding: "8px", textAlign: "right" }}>
                            {l.debit > 0 ? money(l.debit) : "—"}
                          </td>
                          <td style={{ padding: "8px", textAlign: "right" }}>
                            {l.credit > 0 ? money(l.credit) : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ fontWeight: 700, borderTop: "2px solid #cbd5e1" }}>
                        <td style={{ padding: "10px 8px" }} colSpan={2}>
                          Total
                        </td>
                        <td style={{ padding: "10px 8px", textAlign: "right" }}>
                          {money(statements.trialBalance.totalDebit)}
                        </td>
                        <td style={{ padding: "10px 8px", textAlign: "right" }}>
                          {money(statements.trialBalance.totalCredit)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                    gap: "1.5rem",
                  }}
                >
                  <div
                    style={{
                      padding: "1.25rem",
                      borderRadius: "8px",
                      backgroundColor: "var(--color-surface, #ffffff)",
                      border: "1px solid var(--color-border, #e2e8f0)",
                    }}
                  >
                    <p className="erp-kicker" style={{ margin: 0 }}>
                      Operating Performance
                    </p>
                    <h3 style={{ margin: "0.25rem 0 1rem" }}>Profit & Loss Statement</h3>
                    <div style={{ marginBottom: "1rem" }}>
                      <strong
                        style={{
                          fontSize: "0.85rem",
                          color: "#64748b",
                          textTransform: "uppercase",
                        }}
                      >
                        Revenue
                      </strong>
                      {statements.profitAndLoss.revenue.items.length ? (
                        statements.profitAndLoss.revenue.items.map((r) => (
                          <div
                            key={r.code}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: "0.85rem",
                              padding: "4px 0",
                            }}
                          >
                            <span>{r.name}</span>
                            <span>{money(r.amount)}</span>
                          </div>
                        ))
                      ) : (
                        <div style={{ fontSize: "0.85rem", color: "#94a3b8", padding: "4px 0" }}>
                          No revenue recorded
                        </div>
                      )}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontWeight: 600,
                          fontSize: "0.88rem",
                          borderTop: "1px solid #e2e8f0",
                          paddingTop: "4px",
                          marginTop: "4px",
                        }}
                      >
                        <span>Total Revenue</span>
                        <span>{money(statements.profitAndLoss.revenue.total)}</span>
                      </div>
                    </div>
                    <div style={{ marginBottom: "1rem" }}>
                      <strong
                        style={{
                          fontSize: "0.85rem",
                          color: "#64748b",
                          textTransform: "uppercase",
                        }}
                      >
                        Expenses
                      </strong>
                      {statements.profitAndLoss.expenses.items.length ? (
                        statements.profitAndLoss.expenses.items.map((e) => (
                          <div
                            key={e.code}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: "0.85rem",
                              padding: "4px 0",
                            }}
                          >
                            <span>{e.name}</span>
                            <span>{money(e.amount)}</span>
                          </div>
                        ))
                      ) : (
                        <div style={{ fontSize: "0.85rem", color: "#94a3b8", padding: "4px 0" }}>
                          No expenses recorded
                        </div>
                      )}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontWeight: 600,
                          fontSize: "0.88rem",
                          borderTop: "1px solid #e2e8f0",
                          paddingTop: "4px",
                          marginTop: "4px",
                        }}
                      >
                        <span>Total Expenses</span>
                        <span>{money(statements.profitAndLoss.expenses.total)}</span>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "10px",
                        borderRadius: "6px",
                        backgroundColor:
                          statements.profitAndLoss.netProfit >= 0
                            ? "rgba(16, 185, 129, 0.1)"
                            : "rgba(239, 68, 68, 0.1)",
                        color: statements.profitAndLoss.netProfit >= 0 ? "#059669" : "#dc2626",
                        fontWeight: 700,
                        fontSize: "0.95rem",
                      }}
                    >
                      <span>Net Operating Profit</span>
                      <span>{money(statements.profitAndLoss.netProfit)}</span>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "1.25rem",
                      borderRadius: "8px",
                      backgroundColor: "var(--color-surface, #ffffff)",
                      border: "1px solid var(--color-border, #e2e8f0)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <p className="erp-kicker" style={{ margin: 0 }}>
                          Statutory Position
                        </p>
                        <h3 style={{ margin: "0.25rem 0 1rem" }}>Balance Sheet</h3>
                      </div>
                      <span
                        className="erp-badge"
                        style={{
                          backgroundColor: statements.balanceSheet.isBalanced
                            ? "rgba(16, 185, 129, 0.15)"
                            : "rgba(239, 68, 68, 0.15)",
                          color: statements.balanceSheet.isBalanced ? "#059669" : "#dc2626",
                          fontWeight: 600,
                          padding: "3px 8px",
                          fontSize: "0.75rem",
                        }}
                      >
                        {statements.balanceSheet.isBalanced ? "✓ Balanced" : "⚠️ Discrepancy"}
                      </span>
                    </div>
                    <div style={{ marginBottom: "0.75rem" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontWeight: 600,
                          fontSize: "0.88rem",
                        }}
                      >
                        <span>Total Assets</span>
                        <span>{money(statements.balanceSheet.assets.total)}</span>
                      </div>
                    </div>
                    <div style={{ marginBottom: "0.75rem" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontWeight: 600,
                          fontSize: "0.88rem",
                        }}
                      >
                        <span>Total Liabilities</span>
                        <span>{money(statements.balanceSheet.liabilities.total)}</span>
                      </div>
                    </div>
                    <div style={{ marginBottom: "0.75rem" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontWeight: 600,
                          fontSize: "0.88rem",
                        }}
                      >
                        <span>Total Equity</span>
                        <span>{money(statements.balanceSheet.equity.total)}</span>
                      </div>
                    </div>
                    <div
                      style={{
                        marginBottom: "0.75rem",
                        borderTop: "1px dashed #e2e8f0",
                        paddingTop: "0.5rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "0.85rem",
                          color: "#475569",
                        }}
                      >
                        <span>Current Period Retained Profit</span>
                        <span>{money(statements.balanceSheet.equity.currentPeriodProfit)}</span>
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#64748b",
                        backgroundColor: "#f8fafc",
                        padding: "8px",
                        borderRadius: "6px",
                      }}
                    >
                      Equation check: Assets ({money(statements.balanceSheet.assets.total)}) =
                      Liabilities & Equity (
                      {money(statements.balanceSheet.totalLiabilitiesAndEquity)}
                      )
                    </div>
                  </div>
                </div>
              </div>
            )}

            {ledgerSubTab === "ageing" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div
                  style={{
                    padding: "1.25rem",
                    borderRadius: "8px",
                    backgroundColor: "var(--color-surface, #ffffff)",
                    border: "1px solid var(--color-border, #e2e8f0)",
                  }}
                >
                  <p className="erp-kicker" style={{ margin: 0 }}>
                    Receivables Ageing
                  </p>
                  <h3 style={{ margin: "0.25rem 0 0.5rem" }}>Customer Invoices by Age</h3>
                  <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1rem" }}>
                    Total open receivables:{" "}
                    <strong>{money(receivablesAgeing.totalDue)}</strong>
                  </p>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "1rem",
                    }}
                  >
                    {[
                      {
                        label: "0-30 Days (Current)",
                        amount: receivablesAgeing.bucketTotals.b0_30,
                        count: receivablesAgeing.items.filter((i) => i.bucket === "0_30").length,
                        color: "#059669",
                        bg: "rgba(16, 185, 129, 0.08)",
                      },
                      {
                        label: "31-60 Days",
                        amount: receivablesAgeing.bucketTotals.b31_60,
                        count: receivablesAgeing.items.filter((i) => i.bucket === "31_60").length,
                        color: "#2563eb",
                        bg: "rgba(59, 130, 246, 0.08)",
                      },
                      {
                        label: "61-90 Days",
                        amount: receivablesAgeing.bucketTotals.b61_90,
                        count: receivablesAgeing.items.filter((i) => i.bucket === "61_90").length,
                        color: "#d97706",
                        bg: "rgba(245, 158, 11, 0.08)",
                      },
                      {
                        label: "90+ Days (Overdue)",
                        amount: receivablesAgeing.bucketTotals.b90Plus,
                        count: receivablesAgeing.items.filter((i) => i.bucket === "90_PLUS").length,
                        color: "#dc2626",
                        bg: "rgba(239, 68, 68, 0.08)",
                      },
                    ].map((b) => (
                      <div
                        key={b.label}
                        style={{
                          padding: "1rem",
                          borderRadius: "6px",
                          backgroundColor: b.bg,
                          border: `1px solid ${b.color}33`,
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: b.color,
                            textTransform: "uppercase",
                          }}
                        >
                          {b.label}
                        </span>
                        <strong
                          style={{
                            display: "block",
                            fontSize: "1.2rem",
                            margin: "4px 0",
                            color: "#0f172a",
                          }}
                        >
                          {money(b.amount)}
                        </strong>
                        <small style={{ color: "#64748b" }}>{b.count} invoices</small>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    padding: "1.25rem",
                    borderRadius: "8px",
                    backgroundColor: "var(--color-surface, #ffffff)",
                    border: "1px solid var(--color-border, #e2e8f0)",
                  }}
                >
                  <p className="erp-kicker" style={{ margin: 0 }}>
                    Payables Ageing
                  </p>
                  <h3 style={{ margin: "0.25rem 0 0.5rem" }}>Vendor Bills & Expenses by Age</h3>
                  <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1rem" }}>
                    Total open payables: <strong>{money(payablesAgeing.totalDue)}</strong>
                  </p>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "1rem",
                    }}
                  >
                    {[
                      {
                        label: "0-30 Days (Current)",
                        amount: payablesAgeing.bucketTotals.b0_30,
                        count: payablesAgeing.items.filter((i) => i.bucket === "0_30").length,
                        color: "#059669",
                        bg: "rgba(16, 185, 129, 0.08)",
                      },
                      {
                        label: "31-60 Days",
                        amount: payablesAgeing.bucketTotals.b31_60,
                        count: payablesAgeing.items.filter((i) => i.bucket === "31_60").length,
                        color: "#2563eb",
                        bg: "rgba(59, 130, 246, 0.08)",
                      },
                      {
                        label: "61-90 Days",
                        amount: payablesAgeing.bucketTotals.b61_90,
                        count: payablesAgeing.items.filter((i) => i.bucket === "61_90").length,
                        color: "#d97706",
                        bg: "rgba(245, 158, 11, 0.08)",
                      },
                      {
                        label: "90+ Days (Overdue)",
                        amount: payablesAgeing.bucketTotals.b90Plus,
                        count: payablesAgeing.items.filter((i) => i.bucket === "90_PLUS").length,
                        color: "#dc2626",
                        bg: "rgba(239, 68, 68, 0.08)",
                      },
                    ].map((b) => (
                      <div
                        key={b.label}
                        style={{
                          padding: "1rem",
                          borderRadius: "6px",
                          backgroundColor: b.bg,
                          border: `1px solid ${b.color}33`,
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: b.color,
                            textTransform: "uppercase",
                          }}
                        >
                          {b.label}
                        </span>
                        <strong
                          style={{
                            display: "block",
                            fontSize: "1.2rem",
                            margin: "4px 0",
                            color: "#0f172a",
                          }}
                        >
                          {money(b.amount)}
                        </strong>
                        <small style={{ color: "#64748b" }}>{b.count} bills</small>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

function SectionHead({ kicker, title, count }: { kicker: string; title: string; count?: string }) {
  return (
    <div className="erp-section-heading">
      <div>
        <p className="erp-kicker">{kicker}</p>
        <h2>{title}</h2>
      </div>
      {count && <span className="erp-section-count">{count}</span>}
    </div>
  );
}
function RecordList({
  rows,
  empty,
  render,
}: {
  rows: Row[];
  empty: string;
  render: (row: Row) => React.ReactNode;
}) {
  return (
    <div className="erp-notification-list">
      {rows.length ? (
        rows.map((row) => (
          <article className="erp-notification" key={row.id}>
            {render(row)}
          </article>
        ))
      ) : (
        <div className="erp-empty">
          <strong>{empty}</strong>
          <span>Create a configured record to begin.</span>
        </div>
      )}
    </div>
  );
}
export function FounderFinance() {
  return (
    <ProtectedErp requiredFinance>
      <FounderFinanceContent />
    </ProtectedErp>
  );
}
