import assert from "node:assert/strict";
import test from "node:test";

const { apiFetch, clearAccessToken, setAccessToken } = await import("../lib/api/client.ts");

test("api client single-flights concurrent refresh requests", async () => {
  const originalFetch = globalThis.fetch;
  let refreshCalls = 0;
  let protectedCalls = 0;
  setAccessToken(null);

  globalThis.fetch = async (input, init = {}) => {
    const url = String(input);
    if (url.endsWith("/auth/refresh")) {
      refreshCalls += 1;
      await new Promise((resolve) => setTimeout(resolve, 15));
      return new Response(JSON.stringify({ data: { accessToken: "fresh-access-token" } }), { status: 200, headers: { "content-type": "application/json" } });
    }
    protectedCalls += 1;
    const authorization = new Headers(init.headers).get("Authorization");
    if (authorization !== "Bearer fresh-access-token") return new Response(JSON.stringify({ message: "expired" }), { status: 401, headers: { "content-type": "application/json" } });
    return new Response(JSON.stringify({ success: true, data: { ok: true } }), { status: 200, headers: { "content-type": "application/json" } });
  };

  try {
    const responses = await Promise.all(Array.from({ length: 5 }, () => apiFetch("/protected")));
    assert.equal(refreshCalls, 1);
    assert.equal(protectedCalls, 10);
    assert.equal(responses.length, 5);
  } finally {
    globalThis.fetch = originalFetch;
    clearAccessToken();
  }
});
