import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(
  new URL("../app/erp/founder/compliance/FounderCompliance.tsx", import.meta.url),
  "utf8",
);
const navigation = await readFile(
  new URL("../app/erp/components/FounderModuleNavigation.tsx", import.meta.url),
  "utf8",
);

test("Founder compliance is permission protected and uses only V2 endpoints", () => {
  assert.match(source, /ProtectedErp requiredCompliance/);
  assert.match(source, /\/compliance\/obligations/);
  assert.doesNotMatch(source, /localhost:3001/);
});

test("Compliance workspace exposes registration, evidence and the submission workflow", () => {
  assert.match(source, /Register obligation/);
  assert.match(source, /Add evidence/);
  assert.match(source, /Submit/);
  assert.match(source, /Complete/);
});

test("Founder navigation reaches compliance exactly once", () => {
  const matches = navigation.match(/\/erp\/founder\/compliance/g) ?? [];
  assert.equal(matches.length, 1);
});
