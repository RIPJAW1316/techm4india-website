import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(
  new URL(
    "../app/erp/founder/institutions/FounderInstitutions.tsx",
    import.meta.url,
  ),
  "utf8",
);
const founder = await readFile(
  new URL("../app/erp/founder/dashboard/FounderDashboard.tsx", import.meta.url),
  "utf8",
);

test("institution list exposes a detail action and Founder navigation", () => {
  assert.match(source, /View details/);
  assert.match(founder, /\/erp\/founder\/institutions/);
});

test("institution detail exposes only the required V2-6 sections", () => {
  for (const section of ["overview", "contacts", "engagements", "crm"]) {
    assert.match(source, new RegExp(`\\"${section}\\"`));
  }
  assert.doesNotMatch(source, /Student tab|LMS tab|Courses tab/i);
});

test("contacts, primary selection, engagements and CRM controls are live", () => {
  assert.match(source, /Make primary/);
  assert.match(source, /saveContact/);
  assert.match(source, /saveEngagement/);
  assert.match(source, /CRM opportunity/);
  assert.match(source, /from-crm/);
  assert.match(source, /Archive institution/);
});
