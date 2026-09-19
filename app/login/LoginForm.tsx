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
    if (!email || !password) {
      setError("Please enter your company email and password.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const auth = await loginRequest(email.trim(), password);
      setPassword("");
      router.replace(resolveDashboardPath(auth));
    } catch (reason) {
      console.error("Authentication error:", reason);
      if (reason instanceof ApiError) {
        if (reason.status === 401) {
          setError("The email or password was not recognised.");
        } else if (reason.status === 429) {
          setError("Too many login attempts. Please wait a minute and try again.");
        } else if (reason.message) {
          setError(reason.message);
        } else {
          setError(`ERP service error (${reason.status}). Please try again.`);
        }
      } else if (reason instanceof Error && reason.message) {
        setError(reason.message);
      } else {
        setError("We could not reach the ERP service. Please verify your connection and try again.");
      }
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
          placeholder="admin@techm4india.com"
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
          placeholder="••••••••••••"
        />
      </div>
      {error && (
        <div className="erp-form-error" role="alert" style={{ marginBottom: "16px" }}>
          <p>{error}</p>
        </div>
      )}
      <button className="erp-button erp-button-primary" type="submit" disabled={busy}>
        {busy ? "Signing in…" : "Sign in to ERP"}
        <span aria-hidden="true">↗</span>
      </button>
      <p className="erp-security-note">
        Company workspace · Secure session · TechM4India internal use
      </p>
    </form>
  );
}
