import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const output = path === "/" ? "index.html" : `${path.slice(1)}.html`;
  return readFile(new URL(`../dist/client/${output}`, import.meta.url), "utf8");
}

for (const [path, heading] of [
  ["/", "Engineering imagination"],
  ["/about", "We&#x27;re building India&#x27;s largest"],
  ["/engineering", "Industrial Future"],
  ["/solutions", "We build the software"],
  ["/schools", "From curiosity to capability"],
  ["/space", "Build Real Satellites"],
  ["/institutes", "A partner that stays for"],
  ["/contact", "Let&#x27;s build India&#x27;s"],
  ["/login", "Enterprise"],
  ["/dashboard", "Dashboard"],
]) {
  test(`exports ${path}`, async () => {
    const html = await render(path);
    assert.match(html, /^<!doctype html>/i);
    assert.match(html, /TechM4India/i);
    assert.match(html, new RegExp(heading, "i"));
    assert.doesNotMatch(html, /Your site is taking shape|codex-preview/i);
  });
}
