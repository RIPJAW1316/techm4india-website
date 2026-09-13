import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(
  new URL("../app/erp/founder/recruitment/FounderRecruitment.tsx", import.meta.url),
  "utf8",
);
const navigation = await readFile(
  new URL("../app/erp/components/FounderModuleNavigation.tsx", import.meta.url),
  "utf8",
);

test("Founder recruitment is permission protected and uses only V2 endpoints", () => {
  assert.match(source, /ProtectedErp requiredRecruitment/);
  for (const endpoint of [
    "/recruitment/dashboard",
    "/recruitment/requisitions",
    "/recruitment/applicants",
  ]) {
    assert.match(source, new RegExp(endpoint));
  }
  assert.doesNotMatch(source, /localhost:3001/);
});

test("Recruitment workspace exposes guarded requisition and candidate workflows", () => {
  assert.match(source, /Create requisition/);
  assert.match(source, /Add applicant/);
  assert.match(source, /Submit for approval/);
  assert.match(source, /Approve requisition/);
  assert.match(source, /Schedule interview/);
  assert.match(source, /Create offer/);
  assert.match(source, /Onboarding checklist/);
});

test("Founder navigation reaches recruitment exactly once", () => {
  const matches = navigation.match(/\/erp\/founder\/recruitment/g) ?? [];
  assert.equal(matches.length, 1);
});
