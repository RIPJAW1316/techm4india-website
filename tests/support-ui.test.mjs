import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(
  new URL("../app/erp/founder/support/FounderSupport.tsx", import.meta.url),
  "utf8",
);
const navigation = await readFile(
  new URL("../app/erp/components/FounderModuleNavigation.tsx", import.meta.url),
  "utf8",
);

test("Founder helpdesk is permission protected and uses only V2 endpoints", () => {
  assert.match(source, /ProtectedErp requiredSupport/);
  assert.match(source, /\/support\/tickets/);
  assert.doesNotMatch(source, /localhost:3001/);
});

test("Helpdesk workspace exposes ticket raise, assignment and resolution", () => {
  assert.match(source, /Raise ticket/);
  assert.match(source, /Assign/);
  assert.match(source, /Resolve/);
  assert.match(source, /Add comment/);
});

test("Founder navigation reaches helpdesk exactly once", () => {
  const matches = navigation.match(/\/erp\/founder\/support/g) ?? [];
  assert.equal(matches.length, 1);
});
