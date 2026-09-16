import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(
  new URL("../app/erp/founder/programs/FounderPrograms.tsx", import.meta.url),
  "utf8",
);
const navigation = await readFile(new URL("../lib/erp/modules.ts", import.meta.url), "utf8");

test("Founder programs is permission protected and uses only V2 endpoints", () => {
  assert.match(source, /ProtectedErp requiredPrograms/);
  for (const endpoint of ["/programs", "/students", "/program-batches"]) {
    assert.match(source, new RegExp(endpoint));
  }
  assert.doesNotMatch(source, /localhost:3001/);
});

test("Programs workspace exposes curriculum, publication and delivery workflows", () => {
  assert.match(source, /Create program/);
  assert.match(source, /Add module/);
  assert.match(source, /Add lesson/);
  assert.match(source, /Submit for review/);
  assert.match(source, /Publish program/);
  assert.match(source, /Register student/);
  assert.match(source, /Create batch/);
  assert.match(source, /Open batch/);
  assert.match(source, /Enroll student/);
  assert.match(source, /Update lesson progress/);
});

test("Founder navigation reaches programs exactly once", () => {
  const matches = navigation.match(/\/erp\/founder\/programs/g) ?? [];
  assert.equal(matches.length, 1);
});
