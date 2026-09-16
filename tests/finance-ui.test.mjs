import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const finance = await readFile(
  new URL("../app/erp/founder/finance/FounderFinance.tsx", import.meta.url),
  "utf8",
);
const gst = await readFile(
  new URL("../app/erp/founder/finance/GstPanel.tsx", import.meta.url),
  "utf8",
);
/** The panel with comments stripped, so assertions test code and not prose. */
const gstCode = gst.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

test("Founder Finance workspace uses the protected live Finance API", () => {
  assert.match(finance, /ProtectedErp requiredFinance/);
  assert.match(
    finance,
    /GST configuration and reports are based on organization-entered tax settings/,
  );
  for (const endpoint of [
    "/finance/dashboard",
    "/finance/invoices",
    "/finance/parties",
    "/finance/expenses",
    "/finance/payments",
    "/finance/ledger/accounts",
    "/finance/journals",
  ])
    assert.match(finance, new RegExp(endpoint));
  assert.match(finance, /Create balanced journal/);
});

test("GST is reported rate-wise and code-wise, never in units", () => {
  for (const endpoint of ["/gst/gstr-1", "/gst/gstr-3b", "/gst/itc-register", "/gst/hsn-codes"])
    assert.match(gst, new RegExp(endpoint));

  // Tax must be broken into the heads that are actually reported.
  for (const head of ["CGST", "SGST", "IGST", "Cess"]) assert.match(gst, new RegExp(head));
  assert.match(gst, /Place of supply/);
  assert.match(gst, /HSN \/ SAC/);

  // The client's objection: GST presentation must not be quantity-driven.
  // Quantity and unit price belong on the invoice, not in a return working.
  assert.doesNotMatch(gstCode, /quantity|unitPrice|unit price/i);
});

test("the workspace presents GST as a working, never as a filed return", () => {
  assert.match(gst, /not a filed return/i);
  // Nothing here reaches the GST portal, so it must not claim to.
  assert.doesNotMatch(gst, /file (?:the )?return|filed with|submit to (?:the )?portal/i);
});

test("no raw field names leak into the finance summary", () => {
  // `taxableValue` used to be printed straight from the API response object.
  assert.doesNotMatch(finance, /Object\.entries\(dashboard\?\.gst/);
  assert.match(finance, /GST_SUMMARY_LABELS/);
});
