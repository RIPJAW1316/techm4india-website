import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(
  new URL("../app/erp/founder/supply-chain/FounderSupplyChain.tsx", import.meta.url),
  "utf8",
);
const navigation = await readFile(
  new URL("../app/erp/components/FounderModuleNavigation.tsx", import.meta.url),
  "utf8",
);

test("Founder supply chain is permission protected and uses only V2 endpoints", () => {
  assert.match(source, /ProtectedErp requiredSupplyChain/);
  for (const endpoint of ["/vendors", "/inventory-items", "/purchase-orders", "/assets"]) {
    assert.match(source, new RegExp(endpoint));
  }
  assert.doesNotMatch(source, /localhost:3001/);
});

test("Supply chain workspace exposes vendor, inventory, procurement and asset workflows", () => {
  assert.match(source, /Create vendor/);
  assert.match(source, /Approve/);
  assert.match(source, /Create item/);
  assert.match(source, /Adjust stock/);
  assert.match(source, /Create purchase order/);
  assert.match(source, /Receive/);
  assert.match(source, /Create asset/);
  assert.match(source, /Assign/);
});

test("Founder navigation reaches supply chain exactly once", () => {
  const matches = navigation.match(/\/erp\/founder\/supply-chain/g) ?? [];
  assert.equal(matches.length, 1);
});
