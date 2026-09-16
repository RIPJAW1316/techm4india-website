import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

const founderDir = new URL("../app/erp/founder/", import.meta.url);
const registry = await readFile(new URL("../lib/erp/modules.ts", import.meta.url), "utf8");

const routes = (await readdir(founderDir, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

/** Every `.tsx` under app/erp/founder, keyed by path, for source assertions. */
async function founderSources() {
  const sources = new Map();
  for (const route of routes) {
    const dir = new URL(`${route}/`, founderDir);
    for (const file of await readdir(dir)) {
      if (!file.endsWith(".tsx")) continue;
      sources.set(`${route}/${file}`, await readFile(new URL(file, dir), "utf8"));
    }
  }
  return sources;
}

const sources = await founderSources();

test("every founder route is reachable from the workspace navigation", () => {
  for (const route of routes) {
    assert.match(
      registry,
      new RegExp(`href: "/erp/founder/${route}(?:#[a-z]+)?"`),
      `route /erp/founder/${route} has no entry in lib/erp/modules.ts, so it would be ` +
        "unreachable from the sidebar",
    );
  }
});

test("every navigable module declares the permission that gates it", () => {
  // Each entry is `{ id, label, title, href, group, permission, summary }`;
  // pull the permission line that follows every href.
  const entries = registry.match(/href: "\/erp\/founder\/[^"]+",\n\s+group: "[^"]+",/g) ?? [];
  const permissions = registry.match(/\n\s+permission: "[^"]+",/g) ?? [];
  assert.equal(
    entries.length,
    permissions.length,
    "a module without a permission would render in the sidebar for every signed-in user",
  );
});

test("module ids and hrefs are unique", () => {
  const ids = (registry.match(/^\s{4}id: "([^"]+)",$/gm) ?? []).map((line) => line.trim());
  assert.equal(new Set(ids).size, ids.length, "duplicate module id in the registry");

  const hrefs = (registry.match(/href: "([^"]+)"/g) ?? []).map((line) => line.trim());
  assert.equal(new Set(hrefs).size, hrefs.length, "duplicate href in the registry");
});

test("founder pages mount the shared shell rather than their own sidebar", () => {
  const mounting = [...sources].filter(
    ([, source]) => source.includes("<ErpShell") || source.includes("FounderModuleNavigation"),
  );
  assert.ok(mounting.length >= routes.length, "some founder route renders no workspace navigation");

  for (const [path, source] of sources) {
    assert.doesNotMatch(
      source,
      /className="erp-sidebar/,
      `${path} still carries a hand-copied sidebar; navigation belongs to ErpShell`,
    );
    assert.doesNotMatch(
      source,
      /className="erp-app-shell/,
      `${path} still wraps itself in the old shell grid`,
    );
  }
});

test("the shell renders navigation filtered by the principal's permissions", async () => {
  const shell = await readFile(
    new URL("../app/erp/components/ErpShell.tsx", import.meta.url),
    "utf8",
  );
  assert.match(shell, /visibleModuleGroups\(permissions\)/);
  assert.match(shell, /context\?\.permissions \?\? \[\]/);
  // Breadcrumb and sign-out are shell responsibilities, not per-page ones.
  assert.match(shell, /aria-label="Breadcrumb"/);
  assert.match(shell, /erp-rail-signout/);
});
