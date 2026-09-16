import assert from "node:assert/strict";
import test from "node:test";

const { resolveDashboardPath, canAccessDivisionWorkspace, canAccessExecutiveWorkspace } =
  await import("../lib/erp/divisions.ts");

function context(slug, roles = ["EMPLOYEE"], permissions = ["organization.read_self"]) {
  return {
    user: { id: "user", email: "employee@techm4india.com", roles },
    employee: {
      id: "employee",
      employeeCode: "EMP-TEST",
      firstName: "Test",
      lastName: "Employee",
      designation: "Employee",
      division: slug ? { id: slug, slug, name: slug } : null,
      department: null,
    },
    permissions,
  };
}

for (const slug of ["engineering", "solutions", "schools", "space"]) {
  test(`${slug} resolves to its own dashboard`, () => {
    assert.equal(resolveDashboardPath(context(slug)), `/erp/${slug}/dashboard`);
  });
}

test("unsupported or missing division resolves safely to /erp", () => {
  assert.equal(resolveDashboardPath(context("other")), "/erp");
  assert.equal(resolveDashboardPath(context(null)), "/erp");
});

test("organization-wide context resolves to the workspace selector", () => {
  const director = context("engineering", ["DIRECTOR"], ["organization.read_all"]);
  assert.equal(resolveDashboardPath(director), "/erp");
  assert.equal(canAccessDivisionWorkspace(director, "space"), true);
});

test("founder resolves to the executive control centre", () => {
  const founder = context(
    "engineering",
    ["FOUNDER_CEO"],
    ["organization.read_all", "executive.dashboard.read"],
  );
  assert.equal(resolveDashboardPath(founder), "/erp/founder/dashboard");
  assert.equal(canAccessExecutiveWorkspace(founder), true);
});

test("single-division context cannot access another division workspace", () => {
  const engineering = context("engineering");
  assert.equal(canAccessDivisionWorkspace(engineering, "engineering"), true);
  assert.equal(canAccessDivisionWorkspace(engineering, "space"), false);
});

test("regular employees cannot access the Founder workspace", () => {
  const employee = context("engineering");
  assert.equal(canAccessExecutiveWorkspace(employee), false);
  assert.equal(resolveDashboardPath(employee), "/erp/engineering/dashboard");
});
