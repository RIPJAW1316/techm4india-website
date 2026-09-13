import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(
  new URL("../app/erp/founder/delivery/FounderDelivery.tsx", import.meta.url),
  "utf8",
);
const navigation = await readFile(
  new URL("../app/erp/components/FounderModuleNavigation.tsx", import.meta.url),
  "utf8",
);

test("Founder delivery is permission protected and uses only V2 delivery endpoints", () => {
  assert.match(source, /ProtectedErp requiredDelivery/);
  for (const endpoint of ["/milestones", "/risks", "/sprints", "/time-logs"]) {
    assert.match(source, new RegExp(endpoint));
  }
  assert.doesNotMatch(source, /localhost:3001/);
});

test("Delivery workspace exposes milestones, risks, sprints and time logs", () => {
  assert.match(source, /Create milestone/);
  assert.match(source, /Add risk/);
  assert.match(source, /Plan sprint/);
  assert.match(source, /Log time/);
});

test("Founder navigation reaches delivery exactly once", () => {
  const matches = navigation.match(/\/erp\/founder\/delivery/g) ?? [];
  assert.equal(matches.length, 1);
});
