import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const payroll = await readFile(
  new URL("../app/erp/founder/payroll/FounderPayroll.tsx", import.meta.url),
  "utf8",
);
const payslips = await readFile(
  new URL("../app/erp/components/PayslipsPage.tsx", import.meta.url),
  "utf8",
);

test("Founder payroll workspace keeps statutory values configured and exposes the controlled lifecycle", () => {
  assert.match(payroll, /ProtectedErp requiredPayroll/);
  assert.match(payroll, /organization-configured/);
  for (const endpoint of [
    "/payroll/components",
    "/payroll/salary-structures",
    "/payroll/periods",
    "/payroll/runs",
    "submit-review",
    "finalize",
  ]) assert.match(payroll, new RegExp(endpoint));
  assert.match(payroll, /Finalized payslips are immutable/);
});

test("employee payslips are routed through the self-only API", () => {
  assert.match(payslips, /\/payroll\/me\/payslips/);
  assert.match(payslips, /Only finalized payroll snapshots/);
  assert.doesNotMatch(payslips, /\/payroll\/runs/);
});
