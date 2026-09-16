import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(
  new URL("../app/erp/founder/users/FounderUsers.tsx", import.meta.url),
  "utf8",
);
const dashboard = await readFile(
  new URL("../app/erp/founder/dashboard/FounderDashboard.tsx", import.meta.url),
  "utf8",
);
const employees = await readFile(
  new URL("../app/erp/founder/employees/FounderEmployees.tsx", import.meta.url),
  "utf8",
);
// Workspace navigation is declared once in the module registry and rendered by
// ErpShell, rather than hand-copied into each page.
const navigation = await readFile(new URL("../lib/erp/modules.ts", import.meta.url), "utf8");

test("Founder Users & Roles route exposes the protected administration workspace", () => {
  assert.match(source, /ProtectedErp requiredAdmin/);
  assert.match(source, /Users & Roles/);
  assert.match(source, /\/admin\/users/);
  assert.match(source, /\/admin\/users\/\$\{detail\.id\}\/roles/);
});

test("admin UI includes safe account, role and employee-work controls", () => {
  for (const label of [
    "Official Roles",
    "Permission Matrix",
    "Deactivate account",
    "Activate account",
    "Attendance",
    "Pending leave",
    "Completed",
    "Overdue",
    "Open task control",
  ])
    assert.match(source, new RegExp(label));
  assert.match(source, /Remove \$\{role\.displayName\}/);
  assert.match(source, /No matching users/);
  assert.doesNotMatch(source, /passwordHash|tokenHash/);
});

test("Founder navigation and task-control handoff remain available", () => {
  assert.match(navigation, /\/erp\/founder\/users/);
  assert.match(dashboard, /new URLSearchParams\(window\.location\.search\)/);
  assert.match(dashboard, /Cancelled work/);
  assert.match(dashboard, /cancelledTasks/);
  // Both pages mount the shared shell instead of carrying their own sidebar.
  assert.match(dashboard, /<ErpShell active="dashboard" \/>/);
  assert.match(employees, /<ErpShell active="employees" \/>/);
  for (const path of [
    "/erp/founder/attendance",
    "/erp/founder/leave",
    "/erp/founder/payroll",
    "/erp/founder/finance",
    "/erp/founder/crm",
    "/erp/founder/institutions",
  ])
    assert.match(navigation, new RegExp(path));
});
