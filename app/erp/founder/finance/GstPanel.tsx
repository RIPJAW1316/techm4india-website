"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";

import { ApiError, apiFetchV2 } from "@/lib/api/client";

/**
 * GST return workings.
 *
 * Indian GST is reported rate-wise and code-wise, not line-by-line: GSTR-1
 * summarises outward supplies per counterparty and per HSN/SAC, and GSTR-3B
 * offsets that output tax against input credit. Quantity and unit price belong
 * on the invoice, not here — a services business reports taxable value against
 * a SAC code, so nothing on this screen is expressed in units.
 */

type Split = { cgst: string; sgst: string; igst: string; cess: string; total: string };

type SupplyRow = Split & {
  partyName?: string;
  partyGstin?: string;
  placeOfSupply: string;
  ratePercent: string;
  taxableValue: string;
  totalTax: string;
  invoiceCount: number;
};

type HsnRow = Split & {
  hsnSacCode: string;
  ratePercent: string;
  taxableValue: string;
  totalTax: string;
  invoiceCount: number;
};

type Gstr1 = {
  period: { from: string | null; to: string | null };
  supplier: { legalName: string | null; gstin: string | null };
  b2b: SupplyRow[];
  b2c: SupplyRow[];
  hsnSummary: HsnRow[];
  documentSummary: { issued: number; cancelled: number };
  totals: Split & { taxableValue: string; totalTax: string };
};

type Gstr3b = {
  outwardTaxableSupplies: Split & { taxableValue: string };
  eligibleItc: Split & { taxableValue: string };
  netTaxPayable: Split;
};

type ItcRow = Split & {
  expenseNumber: string;
  expenseDate: string;
  vendorName: string;
  vendorGstin: string | null;
  hsnSacCode: string;
  description: string;
  taxableValue: string;
  ratePercent: string;
};

type HsnCode = {
  id: string;
  code: string;
  kind: "HSN" | "SAC";
  description: string;
  defaultRatePercent: string;
  isActive: boolean;
};

type View = "gstr1" | "gstr3b" | "itc" | "master";

const VIEWS: Array<[View, string]> = [
  ["gstr1", "GSTR-1 · Outward supplies"],
  ["gstr3b", "GSTR-3B · Summary"],
  ["itc", "Input tax credit"],
  ["master", "HSN / SAC master"],
];

const inr = (value: unknown) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));

const percent = (value: unknown) => `${Number(value ?? 0).toFixed(2)}%`;

const day = (value?: string) => (value ? new Date(value).toLocaleDateString("en-IN") : "—");

/** First day of the current month, and today, as the default reporting period. */
function defaultPeriod() {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const iso = (value: Date) => value.toISOString().slice(0, 10);
  return { from: iso(first), to: iso(now) };
}

/** The four tax heads, rendered in the same order everywhere on this screen. */
function TaxHeadCells({ row }: { row: Split }) {
  return (
    <>
      <td className="is-numeric">{inr(row.cgst)}</td>
      <td className="is-numeric">{inr(row.sgst)}</td>
      <td className="is-numeric">{inr(row.igst)}</td>
      <td className="is-numeric">{inr(row.cess)}</td>
    </>
  );
}

function TaxHeadHeadings() {
  return (
    <>
      <th className="is-numeric">CGST</th>
      <th className="is-numeric">SGST</th>
      <th className="is-numeric">IGST</th>
      <th className="is-numeric">Cess</th>
    </>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="erp-empty">
      <p>{children}</p>
    </div>
  );
}

export function GstPanel() {
  const [view, setView] = useState<View>("gstr1");
  const [period, setPeriod] = useState(defaultPeriod);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [gstr1, setGstr1] = useState<Gstr1 | null>(null);
  const [gstr3b, setGstr3b] = useState<Gstr3b | null>(null);
  const [itc, setItc] = useState<ItcRow[]>([]);
  const [codes, setCodes] = useState<HsnCode[]>([]);
  const [codeForm, setCodeForm] = useState({
    code: "",
    kind: "SAC",
    description: "",
    defaultRatePercent: "18",
  });

  const query = useMemo(
    () => `from=${encodeURIComponent(period.from)}&to=${encodeURIComponent(period.to)}`,
    [period],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [one, threeB, credit, master] = await Promise.all([
        apiFetchV2<{ data: Gstr1 }>(`/gst/gstr-1?${query}`),
        apiFetchV2<{ data: Gstr3b }>(`/gst/gstr-3b?${query}`),
        apiFetchV2<{ data: ItcRow[] }>(`/gst/itc-register?${query}&limit=100`),
        apiFetchV2<{ data: HsnCode[] }>("/gst/hsn-codes"),
      ]);
      setGstr1(one.data);
      setGstr3b(threeB.data);
      setItc(credit.data);
      setCodes(master.data);
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "GST workings could not load.");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void load();
  }, [load]);

  async function addCode(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await apiFetchV2("/gst/hsn-codes", {
        method: "POST",
        body: JSON.stringify({
          code: codeForm.code.trim(),
          kind: codeForm.kind,
          description: codeForm.description.trim(),
          defaultRatePercent: Number(codeForm.defaultRatePercent),
        }),
      });
      setCodeForm({ code: "", kind: "SAC", description: "", defaultRatePercent: "18" });
      await load();
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "The code could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <section className="erp-section">
        <div className="erp-section-heading">
          <div>
            <p className="erp-kicker">
              {gstr1?.supplier.gstin ? `GSTIN ${gstr1.supplier.gstin}` : "GSTIN not recorded"}
            </p>
            <h2>GST return workings</h2>
            <p>
              Computed from invoices and approved expenses in this workspace. Figures are workings
              for review by an authorised tax professional, not a filed return.
            </p>
          </div>
        </div>

        <div className="erp-toolbar">
          <label>
            <span>Period from</span>
            <input
              type="date"
              value={period.from}
              onChange={(event) => setPeriod({ ...period, from: event.target.value })}
            />
          </label>
          <label>
            <span>Period to</span>
            <input
              type="date"
              value={period.to}
              onChange={(event) => setPeriod({ ...period, to: event.target.value })}
            />
          </label>
          <div className="erp-toolbar-spacer" />
          <button className="erp-button-secondary" onClick={() => void load()} type="button">
            Refresh
          </button>
        </div>

        <div className="founder-tabs" role="tablist">
          {VIEWS.map(([id, label]) => (
            <button
              aria-selected={view === id}
              className={view === id ? "is-active" : undefined}
              key={id}
              onClick={() => setView(id)}
              role="tab"
              type="button"
            >
              {label}
            </button>
          ))}
        </div>

        {error ? (
          <div className="erp-error" role="alert">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="erp-state" role="status">
            <span aria-hidden="true" className="erp-loader" />
            <p>Computing GST workings</p>
          </div>
        ) : null}
      </section>

      {!loading && view === "gstr1" && gstr1 ? (
        <>
          <div aria-label="GSTR-1 totals" className="erp-stat-grid">
            <article>
              <span>Taxable value</span>
              <strong>{inr(gstr1.totals.taxableValue)}</strong>
              <small>{gstr1.documentSummary.issued} invoices reported</small>
            </article>
            <article>
              <span>Central tax</span>
              <strong>{inr(gstr1.totals.cgst)}</strong>
              <small>CGST on intra-state supply</small>
            </article>
            <article>
              <span>State tax</span>
              <strong>{inr(gstr1.totals.sgst)}</strong>
              <small>SGST on intra-state supply</small>
            </article>
            <article>
              <span>Integrated tax</span>
              <strong>{inr(gstr1.totals.igst)}</strong>
              <small>IGST on inter-state supply</small>
            </article>
          </div>

          <section className="erp-section">
            <div className="erp-section-heading">
              <div>
                <p className="erp-kicker">Table 4 · registered counterparties</p>
                <h2>B2B supplies</h2>
              </div>
              <span className="erp-section-count">{gstr1.b2b.length} rows</span>
            </div>
            {gstr1.b2b.length === 0 ? (
              <Empty>No supplies to registered counterparties in this period.</Empty>
            ) : (
              <div className="erp-table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Counterparty</th>
                      <th>GSTIN</th>
                      <th>Place of supply</th>
                      <th className="is-numeric">Rate</th>
                      <th className="is-numeric">Taxable value</th>
                      <TaxHeadHeadings />
                      <th className="is-numeric">Invoices</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gstr1.b2b.map((row) => (
                      <tr key={`${row.partyGstin}-${row.placeOfSupply}-${row.ratePercent}`}>
                        <td>
                          <strong>{row.partyName}</strong>
                        </td>
                        <td>{row.partyGstin}</td>
                        <td>{row.placeOfSupply}</td>
                        <td className="is-numeric">{percent(row.ratePercent)}</td>
                        <td className="is-numeric">{inr(row.taxableValue)}</td>
                        <TaxHeadCells row={row} />
                        <td className="is-numeric">{row.invoiceCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="erp-section">
            <div className="erp-section-heading">
              <div>
                <p className="erp-kicker">Table 7 · unregistered customers</p>
                <h2>B2C supplies</h2>
                <p>Aggregated by place of supply and rate, as the return requires.</p>
              </div>
              <span className="erp-section-count">{gstr1.b2c.length} rows</span>
            </div>
            {gstr1.b2c.length === 0 ? (
              <Empty>No supplies to unregistered customers in this period.</Empty>
            ) : (
              <div className="erp-table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Place of supply</th>
                      <th className="is-numeric">Rate</th>
                      <th className="is-numeric">Taxable value</th>
                      <TaxHeadHeadings />
                      <th className="is-numeric">Invoices</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gstr1.b2c.map((row) => (
                      <tr key={`${row.placeOfSupply}-${row.ratePercent}`}>
                        <td>{row.placeOfSupply}</td>
                        <td className="is-numeric">{percent(row.ratePercent)}</td>
                        <td className="is-numeric">{inr(row.taxableValue)}</td>
                        <TaxHeadCells row={row} />
                        <td className="is-numeric">{row.invoiceCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="erp-section">
            <div className="erp-section-heading">
              <div>
                <p className="erp-kicker">Table 12 · classification summary</p>
                <h2>HSN / SAC summary</h2>
              </div>
              <span className="erp-section-count">{gstr1.hsnSummary.length} codes</span>
            </div>
            {gstr1.hsnSummary.length === 0 ? (
              <Empty>No classified supplies in this period.</Empty>
            ) : (
              <div className="erp-table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>HSN / SAC</th>
                      <th className="is-numeric">Rate</th>
                      <th className="is-numeric">Taxable value</th>
                      <TaxHeadHeadings />
                      <th className="is-numeric">Total tax</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gstr1.hsnSummary.map((row) => (
                      <tr key={`${row.hsnSacCode}-${row.ratePercent}`}>
                        <td>
                          <strong>{row.hsnSacCode}</strong>
                          <small>
                            {codes.find((entry) => entry.code === row.hsnSacCode)?.description ??
                              "Not in the classification master"}
                          </small>
                        </td>
                        <td className="is-numeric">{percent(row.ratePercent)}</td>
                        <td className="is-numeric">{inr(row.taxableValue)}</td>
                        <TaxHeadCells row={row} />
                        <td className="is-numeric">
                          <strong>{inr(row.totalTax)}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : null}

      {!loading && view === "gstr3b" && gstr3b ? (
        <section className="erp-section">
          <div className="erp-section-heading">
            <div>
              <p className="erp-kicker">Summary return</p>
              <h2>GSTR-3B working</h2>
              <p>
                Output tax on outward supplies, less input tax credit on approved purchases, set off
                head-wise. Credit never reduces a head below zero.
              </p>
            </div>
          </div>
          <div className="erp-table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Particulars</th>
                  <th className="is-numeric">Taxable value</th>
                  <TaxHeadHeadings />
                  <th className="is-numeric">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>3.1(a) Outward taxable supplies</strong>
                    <small>Issued invoices in the period</small>
                  </td>
                  <td className="is-numeric">{inr(gstr3b.outwardTaxableSupplies.taxableValue)}</td>
                  <TaxHeadCells row={gstr3b.outwardTaxableSupplies} />
                  <td className="is-numeric">{inr(gstr3b.outwardTaxableSupplies.total)}</td>
                </tr>
                <tr>
                  <td>
                    <strong>4(A) Eligible input tax credit</strong>
                    <small>Approved expenses carrying tax</small>
                  </td>
                  <td className="is-numeric">{inr(gstr3b.eligibleItc.taxableValue)}</td>
                  <TaxHeadCells row={gstr3b.eligibleItc} />
                  <td className="is-numeric">{inr(gstr3b.eligibleItc.total)}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Net tax payable</strong>
                    <small>Output tax less credit, by head</small>
                  </td>
                  <td className="is-numeric">—</td>
                  <TaxHeadCells row={gstr3b.netTaxPayable} />
                  <td className="is-numeric">
                    <strong>{inr(gstr3b.netTaxPayable.total)}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {!loading && view === "itc" ? (
        <section className="erp-section">
          <div className="erp-section-heading">
            <div>
              <p className="erp-kicker">Purchases carrying tax</p>
              <h2>Input tax credit register</h2>
            </div>
            <span className="erp-section-count">{itc.length} lines</span>
          </div>
          {itc.length === 0 ? (
            <Empty>No approved purchases carrying tax in this period.</Empty>
          ) : (
            <div className="erp-table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Expense</th>
                    <th>Vendor</th>
                    <th>Vendor GSTIN</th>
                    <th>HSN / SAC</th>
                    <th className="is-numeric">Rate</th>
                    <th className="is-numeric">Taxable value</th>
                    <TaxHeadHeadings />
                  </tr>
                </thead>
                <tbody>
                  {itc.map((row, index) => (
                    <tr key={`${row.expenseNumber}-${index}`}>
                      <td>
                        <strong>{row.expenseNumber}</strong>
                        <small>{day(row.expenseDate)}</small>
                      </td>
                      <td>{row.vendorName}</td>
                      <td>{row.vendorGstin ?? "Unregistered"}</td>
                      <td>{row.hsnSacCode}</td>
                      <td className="is-numeric">{percent(row.ratePercent)}</td>
                      <td className="is-numeric">{inr(row.taxableValue)}</td>
                      <TaxHeadCells row={row} />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}

      {!loading && view === "master" ? (
        <section className="erp-section">
          <div className="erp-section-heading">
            <div>
              <p className="erp-kicker">Classification</p>
              <h2>HSN / SAC master</h2>
              <p>
                HSN classifies goods and SAC classifies services. Every invoice line should carry
                one so the GSTR-1 summary can be produced.
              </p>
            </div>
            <span className="erp-section-count">{codes.length} codes</span>
          </div>

          <form className="founder-form" onSubmit={addCode}>
            <div className="founder-form-grid">
              <label>
                <span>Code</span>
                <input
                  inputMode="numeric"
                  onChange={(event) => setCodeForm({ ...codeForm, code: event.target.value })}
                  pattern="\d{4,8}"
                  placeholder="998313"
                  required
                  title="4 to 8 digits"
                  value={codeForm.code}
                />
              </label>
              <label>
                <span>Kind</span>
                <select
                  onChange={(event) => setCodeForm({ ...codeForm, kind: event.target.value })}
                  value={codeForm.kind}
                >
                  <option value="SAC">SAC · services</option>
                  <option value="HSN">HSN · goods</option>
                </select>
              </label>
              <label>
                <span>Description</span>
                <input
                  onChange={(event) =>
                    setCodeForm({ ...codeForm, description: event.target.value })
                  }
                  placeholder="Information technology consulting"
                  required
                  value={codeForm.description}
                />
              </label>
              <label>
                <span>Default rate (%)</span>
                <input
                  max="100"
                  min="0"
                  onChange={(event) =>
                    setCodeForm({ ...codeForm, defaultRatePercent: event.target.value })
                  }
                  required
                  step="0.01"
                  type="number"
                  value={codeForm.defaultRatePercent}
                />
              </label>
              <button className="erp-button erp-button-primary" disabled={busy} type="submit">
                {busy ? "Saving…" : "Add classification"}
              </button>
            </div>
          </form>

          {codes.length === 0 ? (
            <Empty>No classification codes recorded yet.</Empty>
          ) : (
            <div className="erp-table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Kind</th>
                    <th>Description</th>
                    <th className="is-numeric">Default rate</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {codes.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <strong>{row.code}</strong>
                      </td>
                      <td>{row.kind}</td>
                      <td>{row.description}</td>
                      <td className="is-numeric">{percent(row.defaultRatePercent)}</td>
                      <td>
                        <span className={`erp-badge ${row.isActive ? "is-success" : ""}`}>
                          {row.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}
    </>
  );
}
