import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const finance = await readFile(
  new URL("../app/erp/founder/finance/FounderFinance.tsx", import.meta.url),
  "utf8",
);

test("Founder Finance workspace uses the protected live Finance API", () => {
  assert.match(finance, /ProtectedErp requiredFinance/);
  assert.match(finance, /GST configuration and reports are based on organization-entered tax settings/);
  for (const endpoint of [
    "/finance/dashboard",
    "/finance/invoices",
    "/finance/parties",
    "/finance/expenses",
    "/finance/payments",
    "/finance/gst/register",
    "/finance/ledger/accounts",
    "/finance/journals",
  ]) assert.match(finance, new RegExp(endpoint));
  assert.match(finance, /Create balanced journal/);
  assert.doesNotMatch(finance, /GSTR-1|GSTR-3B|file GST/i);
});
