import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(
  new URL("../app/erp/founder/performance/FounderPerformance.tsx", import.meta.url),
  "utf8",
);
const navigation = await readFile(new URL("../lib/erp/modules.ts", import.meta.url), "utf8");

test("Founder performance is permission protected and uses only V2 endpoints", () => {
  assert.match(source, /ProtectedErp requiredPerformance/);
  for (const endpoint of ["/performance/cycles", "/performance/goals", "/performance/reviews"]) {
    assert.match(source, new RegExp(endpoint));
  }
  assert.doesNotMatch(source, /localhost:3001/);
});

test("Performance workspace exposes the cycle, goal and appraisal workflows", () => {
  assert.match(source, /Create cycle/);
  assert.match(source, /Activate/);
  assert.match(source, /Add goal/);
  assert.match(source, /Open review/);
  assert.match(source, /Self-assessment/);
  assert.match(source, /Manager review/);
  assert.match(source, /Finalize/);
  assert.match(source, /Acknowledge/);
});

test("Founder navigation reaches performance exactly once", () => {
  const matches = navigation.match(/\/erp\/founder\/performance/g) ?? [];
  assert.equal(matches.length, 1);
});
