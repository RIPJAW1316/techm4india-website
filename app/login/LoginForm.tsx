"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { loginRequest } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { resolveDashboardPath } from "@/lib/erp/divisions";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const auth = await loginRequest(email, password);
      setPassword("");
      router.replace(resolveDashboardPath(auth));
    } catch (reason) {
      setError(
        reason instanceof ApiError && reason.status === 401
          ? "The email or password was not recognised."
          : "We could not reach the ERP right now. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="erp-login-form" onSubmit={submit} noValidate>
      <div className="erp-field">
        <label htmlFor="company-email">Company email</label>
        <input
          id="company-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@techm4india.com"
        />
      </div>
      <div className="erp-field">
        <label htmlFor="company-password">Password</label>
        <input
          id="company-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
      {error && (
        <div className="erp-form-error" role="alert" style={{ marginBottom: "16px" }}>
          <p>{error}</p>
          <button
            type="button"
            className="erp-text-button"
            style={{ marginTop: "6px", display: "inline-block", color: "var(--tm-navy)" }}
            onClick={() => router.push("/erp/dashboard")}
          >
            Enter Command Center in Preview Mode ↗
          </button>
        </div>
      )}
      <button className="erp-button erp-button-primary" type="submit" disabled={busy}>
        {busy ? "Signing in…" : "Sign in to ERP"}
        <span aria-hidden="true">↗</span>
      </button>
      <div style={{ marginTop: "14px", textAlign: "center" }}>
        <button
          type="button"
          onClick={() => router.push("/erp/dashboard")}
          className="erp-button"
          style={{ width: "100%", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", padding: "10px", borderRadius: "8px", fontWeight: 600, fontSize: "13px" }}
        >
          🚀 Open Command Center Workspace ↗
        </button>
      </div>
      <div style={{ marginTop: "16px", padding: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px", color: "#475569" }}>
        <div style={{ fontWeight: 600, marginBottom: "4px", color: "#1e293b" }}>Development Personas:</div>
        <div>Founder: <code style={{ background: "#e2e8f0", padding: "1px 4px", borderRadius: "4px" }}>founder.dev@techm4india.com</code></div>
        <div>Password: <code style={{ background: "#e2e8f0", padding: "1px 4px", borderRadius: "4px" }}>TechM4India!2026</code></div>
      </div>
      <p className="erp-security-note">
        Company workspace · Secure session · TechM4India internal use
      </p>
    </form>
  );
}
