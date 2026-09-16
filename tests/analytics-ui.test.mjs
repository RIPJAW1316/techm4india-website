import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(
  new URL("../app/erp/founder/analytics/FounderAnalytics.tsx", import.meta.url),
  "utf8",
);
const navigation = await readFile(new URL("../lib/erp/modules.ts", import.meta.url), "utf8");

test("Founder analytics is permission protected and uses the V2 overview endpoint", () => {
  assert.match(source, /ProtectedErp requiredAnalytics/);
  assert.match(source, /\/analytics\/overview/);
  assert.doesNotMatch(source, /localhost:3001/);
});

test("Analytics overview renders the cross-domain sections", () => {
  assert.match(source, /Learning delivery/);
  assert.match(source, /Supply chain/);
  assert.match(source, /Talent pipeline/);
});

test("Founder navigation reaches analytics exactly once", () => {
  const matches = navigation.match(/\/erp\/founder\/analytics/g) ?? [];
  assert.equal(matches.length, 1);
});
