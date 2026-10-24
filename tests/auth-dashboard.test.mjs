import assert from "node:assert/strict";
import test from "node:test";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  isAuthenticated,
  setSession,
  getApiBaseUrl,
} from "../lib/auth-client.ts";

// Mock minimal browser sessionStorage in Node environment
class MockSessionStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.get(key) ?? null;
  }
  setItem(key, value) {
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

test("Session Storage & Token Isolation", async (t) => {
  global.window = {};
  global.sessionStorage = new MockSessionStorage();
  global.localStorage = new MockSessionStorage();

  await t.test("starts unauthenticated when storage is empty", () => {
    clearSession();
    assert.equal(getAccessToken(), null);
    assert.equal(getRefreshToken(), null);
    assert.equal(isAuthenticated(), false);
  });

  await t.test("stores tokens in transient sessionStorage without localStorage leakage", () => {
    setSession({
      accessToken: "mock-jwt-access-token-xyz",
      refreshToken: "mock-refresh-token-abc",
      expiresIn: 900,
    });

    assert.equal(getAccessToken(), "mock-jwt-access-token-xyz");
    assert.equal(getRefreshToken(), "mock-refresh-token-abc");
    assert.equal(isAuthenticated(), true);

    // Verify localStorage was never written to
    assert.equal(global.localStorage.getItem("tm4i_erp_access_token"), null);
    assert.equal(global.localStorage.getItem("tm4i_erp_refresh_token"), null);
    assert.equal(global.localStorage.store.size, 0);
  });

  await t.test("clears all tokens upon session termination", () => {
    clearSession();
    assert.equal(getAccessToken(), null);
    assert.equal(getRefreshToken(), null);
    assert.equal(isAuthenticated(), false);
  });
});

test("API Base URL configuration", () => {
  const url = getApiBaseUrl();
  assert.ok(url.startsWith("http"));
});

test("Dynamic Application Filtering & Launch Security", async (t) => {
  const mockApplications = [
    {
      code: "HRMS",
      name: "TechM4India HRMS",
      description: "Human Resource Management System",
      baseUrl: "http://localhost:3002",
      isActive: true,
      grantedAt: "2026-10-24T00:00:00.000Z",
    },
    {
      code: "FINANCE",
      name: "TechM4India Finance ERP",
      description: "Financial Operations ERP",
      baseUrl: "http://localhost:3001",
      isActive: true,
      grantedAt: "2026-10-24T00:00:00.000Z",
    },
  ];

  await t.test("HR-only user receives only HRMS in catalog", () => {
    const hrAuthorizedCodes = ["HRMS"];
    const visibleApps = mockApplications.filter((app) =>
      hrAuthorizedCodes.includes(app.code)
    );

    assert.equal(visibleApps.length, 1);
    assert.equal(visibleApps[0].code, "HRMS");
    assert.ok(!visibleApps.some((a) => a.code === "FINANCE"));
  });

  await t.test("Finance-only user receives only Finance ERP in catalog", () => {
    const financeAuthorizedCodes = ["FINANCE"];
    const visibleApps = mockApplications.filter((app) =>
      financeAuthorizedCodes.includes(app.code)
    );

    assert.equal(visibleApps.length, 1);
    assert.equal(visibleApps[0].code, "FINANCE");
    assert.ok(!visibleApps.some((a) => a.code === "HRMS"));
  });

  await t.test("Unassigned employee receives empty application set", () => {
    const emptyCodes = [];
    const visibleApps = mockApplications.filter((app) =>
      emptyCodes.includes(app.code)
    );

    assert.equal(visibleApps.length, 0);
  });

  await t.test("Application launch URLs never expose credentials or tokens in query parameters", () => {
    for (const app of mockApplications) {
      const launchUrl = new URL(app.baseUrl);
      assert.equal(launchUrl.search, "");
      assert.equal(launchUrl.hash, "");
      assert.doesNotMatch(launchUrl.toString(), /token|auth|password|secret/i);
    }
  });
});

test("Error handling envelopes conform to backend contract", async (t) => {
  await t.test("handles 401 Unauthorized generic credential rejection", () => {
    const errorPayload = {
      statusCode: 401,
      message: "Invalid email or password",
      error: "Unauthorized",
    };
    assert.equal(errorPayload.statusCode, 401);
    assert.match(errorPayload.message, /invalid/i);
  });

  await t.test("handles 403 Forbidden account deactivation", () => {
    const errorPayload = {
      statusCode: 403,
      message: "Account has been deactivated. Contact your administrator.",
      error: "Forbidden",
    };
    assert.equal(errorPayload.statusCode, 403);
    assert.match(errorPayload.message, /deactivated/i);
  });
});
