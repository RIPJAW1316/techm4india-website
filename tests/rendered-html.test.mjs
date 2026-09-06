import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

for (const [path, heading] of [
  ["/", "Most Ambitious"],
  ["/about", "We&#x27;re building India&#x27;s largest"],
  ["/engineering", "Industrial Future"],
  ["/solutions", "Engineering the future through"],
  ["/solutions/erp", "One operating system for a more"],
  ["/schools", "Transforming education through"],
  ["/space", "Build Real Satellites"],
  ["/contact", "Let&#x27;s build India&#x27;s"],
  ["/login", "Company Management ERP"],
  ["/erp", "Restoring your workspace"],
  ["/erp/founder/dashboard", "Restoring your workspace"],
  ["/erp/founder/organization", "Restoring your workspace"],
  ["/erp/engineering/dashboard", "Restoring your workspace"],
  ["/erp/solutions/dashboard", "Restoring your workspace"],
  ["/erp/schools/dashboard", "Restoring your workspace"],
  ["/erp/space/dashboard", "Restoring your workspace"],
]) {
  test(`server-renders ${path}`, async () => {
    const response = await render(path);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
    const html = await response.text();
    assert.match(html, /TechM4India/i);
    assert.match(html, new RegExp(heading, "i"));
    assert.doesNotMatch(html, /Your site is taking shape|codex-preview/i);
  });
}
