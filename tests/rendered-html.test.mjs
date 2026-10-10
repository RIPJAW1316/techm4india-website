import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const output = path === "/" ? "index.html" : `${path.slice(1)}.html`;
  return readFile(new URL(`../dist/client/${output}`, import.meta.url), "utf8");
}

for (const [path, heading] of [
  ["/", "Engineering imagination"],
  ["/about", "We&#x27;re building India&#x27;s largest"],
  ["/engineering", "Industrial Future"],
  ["/solutions", "We build the software"],
  ["/solutions/erp", "One operating system for a more"],
  ["/schools", "From curiosity to capability"],
  ["/space", "Build Real Satellites"],
  ["/institutes", "A partner that stays for"],
  ["/contact", "Let&#x27;s build India&#x27;s"],
  ["/login", "Company Management ERP"],
  ["/erp", "Restoring your workspace"],
  ["/erp/founder/dashboard", "Restoring your workspace"],
  ["/erp/founder/employees", "Restoring your workspace"],
  ["/erp/founder/recruitment", "Restoring your workspace"],
  ["/erp/founder/organization", "Restoring your workspace"],
  ["/erp/founder/attendance", "Restoring your workspace"],
  ["/erp/founder/leave", "Restoring your workspace"],
  ["/erp/founder/crm", "Restoring your workspace"],
  ["/erp/founder/institutions", "Restoring your workspace"],
  ["/erp/founder/programs", "Restoring your workspace"],
  ["/erp/founder/performance", "Restoring your workspace"],
  ["/erp/founder/supply-chain", "Restoring your workspace"],
  ["/erp/founder/support", "Restoring your workspace"],
  ["/erp/founder/cms", "Restoring your workspace"],
  ["/erp/founder/compliance", "Restoring your workspace"],
  ["/erp/founder/delivery", "Restoring your workspace"],
  ["/erp/founder/analytics", "Restoring your workspace"],
  ["/erp/founder/users", "Restoring your workspace"],
  ["/erp/founder/payroll", "Restoring your workspace"],
  ["/erp/founder/finance", "Restoring your workspace"],
  ["/erp/engineering/dashboard", "Restoring your workspace"],
  ["/erp/solutions/dashboard", "Restoring your workspace"],
  ["/erp/schools/dashboard", "Restoring your workspace"],
  ["/erp/space/dashboard", "Restoring your workspace"],
  ["/erp/engineering/attendance", "Restoring your workspace"],
  ["/erp/engineering/leave", "Restoring your workspace"],
  ["/erp/solutions/attendance", "Restoring your workspace"],
  ["/erp/solutions/leave", "Restoring your workspace"],
  ["/erp/schools/attendance", "Restoring your workspace"],
  ["/erp/schools/leave", "Restoring your workspace"],
  ["/erp/space/attendance", "Restoring your workspace"],
  ["/erp/space/leave", "Restoring your workspace"],
  ["/erp/engineering/payslips", "Restoring your workspace"],
  ["/erp/solutions/payslips", "Restoring your workspace"],
  ["/erp/schools/payslips", "Restoring your workspace"],
  ["/erp/space/payslips", "Restoring your workspace"],
]) {
  test(`exports ${path}`, async () => {
    const html = await render(path);
    assert.match(html, /^<!doctype html>/i);
    assert.match(html, /TechM4India/i);
    assert.match(html, new RegExp(heading, "i"));
    assert.doesNotMatch(html, /Your site is taking shape|codex-preview/i);
  });
}
