import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(
  new URL("../app/erp/founder/cms/FounderCms.tsx", import.meta.url),
  "utf8",
);
const navigation = await readFile(new URL("../lib/erp/modules.ts", import.meta.url), "utf8");

test("Founder CMS is permission protected and uses only V2 endpoints", () => {
  assert.match(source, /ProtectedErp requiredCms/);
  assert.match(source, /\/cms\/pages/);
  assert.doesNotMatch(source, /localhost:3001/);
});

test("Content workspace exposes authoring, review and publish workflow", () => {
  assert.match(source, /Create page/);
  assert.match(source, /Add revision/);
  assert.match(source, /Submit for review/);
  assert.match(source, /Publish/);
});

test("Founder navigation reaches content exactly once", () => {
  const matches = navigation.match(/\/erp\/founder\/cms/g) ?? [];
  assert.equal(matches.length, 1);
});
