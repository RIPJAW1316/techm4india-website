"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Info,
  Lock,
  Mail,
  Shield,
  Sparkles,
} from "lucide-react";
import { getAccessToken, login } from "@/lib/auth-client";

interface DemoAccount {
  label: string;
  role: string;
  email: string;
  passwordHint: string;
  accessNote: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    label: "Super Admin",
    role: "Full Platform Admin",
    email: "admin@techm4india.com",
    passwordHint: "TechM4Admin#2026",
    accessNote: "Access to Central Admin, HRMS, and Finance ERP",
  },
  {
    label: "HR Lead",
    role: "HR Manager",
    email: "hrms.lead@techm4india.com",
    passwordHint: "TechM4Hrms#2026",
    accessNote: "Access to HRMS application",
  },
  {
    label: "Finance Lead",
    role: "Finance Manager",
    email: "finance.lead@techm4india.com",
    passwordHint: "TechM4Finance#2026",
    accessNote: "Access to Finance ERP application",
  },
  {
    label: "Staff Engineer",
    role: "General Employee",
    email: "engineer@techm4india.com",
    passwordHint: "TechM4Eng#2026",
    accessNote: "Standard employee portal access",
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [ssoInfo, setSsoInfo] = useState<{
    clientId: string;
    redirectUri: string;
    codeChallenge?: string;
    codeChallengeMethod?: string;
    state?: string;
    appName: string;
  } | null>(null);

  function completeSsoRedirect(redirectUri: string, state?: string, token?: string, appLabel?: string) {
    setSuccessMessage(`Session verified. Redirecting to ${appLabel || "application"}...`);
    const code = "auth_code_" + Math.random().toString(36).substring(2, 12) + "_" + Date.now();
    try {
      const url = new URL(redirectUri);
      url.searchParams.set("code", code);
      if (state) url.searchParams.set("state", state);
      if (token) url.searchParams.set("sso_token", token);
      setTimeout(() => {
        window.location.href = url.toString();
      }, 350);
    } catch {
      const sep = redirectUri.includes("?") ? "&" : "?";
      let dest = `${redirectUri}${sep}code=${encodeURIComponent(code)}`;
      if (state) dest += `&state=${encodeURIComponent(state)}`;
      if (token) dest += `&sso_token=${encodeURIComponent(token)}`;
      setTimeout(() => {
        window.location.href = dest;
      }, 350);
    }
  }

  // Check for OIDC SSO parameters and auto-authorize if session is active
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const clientId = params.get("client_id");
    const redirectUri = params.get("redirect_uri");
    const codeChallenge = params.get("code_challenge") || undefined;
    const codeChallengeMethod = params.get("code_challenge_method") || undefined;
    const state = params.get("state") || undefined;

    if (clientId && redirectUri) {
      const appName = clientId.includes("hrms")
        ? "TechM4 HRMS Portal"
        : clientId.includes("finance")
        ? "TechM4 Finance ERP"
        : "Enterprise Application";

      setSsoInfo({
        clientId,
        redirectUri,
        codeChallenge,
        codeChallengeMethod,
        state,
        appName,
      });

      // If already logged in, complete SSO authorization immediately
      const token = getAccessToken();
      if (token) {
        completeSsoRedirect(redirectUri, state, token, appName);
        return;
      }
    } else {
      // Normal login flow: Auto-redirect to dashboard if already logged in
      if (getAccessToken()) {
        window.location.href = "/dashboard";
      }
    }
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setErrorMessage("Please enter your corporate email address.");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter your account password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const authTokens = await login({ email, password });
      if (ssoInfo) {
        completeSsoRedirect(ssoInfo.redirectUri, ssoInfo.state, authTokens.accessToken, ssoInfo.appName);
      } else {
        setSuccessMessage("Authentication successful. Redirecting to Central Dashboard...");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 400);
      }
    } catch (err: unknown) {
      setIsSubmitting(false);
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("An unexpected authentication error occurred.");
      }
    }
  }

  function handleSelectDemoAccount(account: DemoAccount) {
    setEmail(account.email);
    setPassword(account.passwordHint);
    setErrorMessage(null);
  }

  return (
    <main className="min-h-[calc(100vh-120px)] bg-[#f7f6f2] text-[#20283b] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle blueprint paper watermark grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(rgba(198, 45, 55, 0.12) 1px, transparent 1px), radial-gradient(rgba(31, 41, 70, 0.08) 1px, #f7f6f2 1px)",
          backgroundSize: "36px 36px",
          backgroundPosition: "0 0, 18px 18px",
        }}
        aria-hidden="true"
      />

      {/* Gentle ambient warmth glows matching website editorial feel */}
      <div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#c62d37]/5 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#1f2946]/5 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center my-auto">
        {/* Left Column: Platform Branding & Architecture Overview */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
          <Link
            href="/"
            className="inline-flex items-center gap-3.5 group text-[#1f2946] decoration-none"
          >
            <img
              src="/images/brand/logo.png"
              alt="TechM4India Logo"
              width="52"
              height="52"
              className="transition-transform group-hover:scale-105 rounded-md"
            />
            <div>
              <div className="text-2xl font-black tracking-wider uppercase text-[#1f2946]">
                TECHM4<span className="text-[#c62d37]">INDIA</span>
              </div>
              <p className="text-xs text-[#5a6376] font-bold tracking-widest uppercase">
                Central Enterprise Platform
              </p>
            </div>
          </Link>

          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#fff1f2] text-[#c62d37] border border-[#fecdd3]">
              <Shield className="w-3.5 h-3.5" />
              Single Central Identity &amp; RBAC
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1f2946] tracking-tight leading-tight">
              One identity for all enterprise operations.
            </h1>
            <p className="text-sm sm:text-base text-[#5a6376] leading-relaxed max-w-lg">
              Sign in with your centralized TechM4India credentials to access HRMS, Finance ERP,
              and cross-functional management systems securely.
            </p>
          </div>

          {/* Key Security Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div className="p-4 rounded-xl bg-white border border-[#e3ded5] shadow-xs hover:border-[#cbd5e1] transition-colors">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1f2946]">
                <CheckCircle2 className="w-4 h-4 text-[#15803d]" />
                Argon2id &amp; JWT Auth
              </div>
              <p className="text-xs text-[#5a6376] mt-1.5 leading-normal">
                Zero plaintext storage with rotating session tokens.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-[#e3ded5] shadow-xs hover:border-[#cbd5e1] transition-colors">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1f2946]">
                <CheckCircle2 className="w-4 h-4 text-[#15803d]" />
                Dynamic RBAC Gates
              </div>
              <p className="text-xs text-[#5a6376] mt-1.5 leading-normal">
                Authorized applications revealed dynamically per role.
              </p>
            </div>
          </div>

          <div className="text-xs text-[#5a6376] flex items-center gap-2 pt-1">
            <span>TechM4India Innovations Pvt. Ltd.</span>
            <span>•</span>
            <Link href="/" className="text-[#1f2946] font-semibold hover:text-[#c62d37] underline transition-colors">
              Return to Website
            </Link>
          </div>
        </div>

        {/* Right Column: Login Card & Demo Selector */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto lg:max-w-none">
          <div className="bg-white border border-[#e3ded5] rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-900/5">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#1f2946] tracking-tight">
                {ssoInfo ? `Sign In to ${ssoInfo.appName}` : "Enterprise Sign In"}
              </h2>
              <p className="text-xs text-[#5a6376] mt-1">
                {ssoInfo
                  ? `Single Sign-On authentication for ${ssoInfo.appName}.`
                  : "Authenticate with your TechM4India corporate credentials."}
              </p>
            </div>

            {ssoInfo && (
              <div className="mb-5 p-3.5 rounded-xl bg-[#eff6ff] border border-[#bfdbfe] text-[#1e40af] text-xs flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-[#2563eb] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Single Sign-On (SSO) Request</p>
                  <p className="text-[11px] text-[#1e40af]/90 mt-0.5">
                    Authenticating will grant access to <strong>{ssoInfo.appName}</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {errorMessage && (
              <div
                role="alert"
                className="mb-5 p-3.5 rounded-lg bg-[#fef2f2] border border-[#fecdd3] text-[#be123c] text-xs flex items-start gap-2.5 animate-fadeIn"
              >
                <AlertCircle className="w-4 h-4 text-[#be123c] shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Success Banner */}
            {successMessage && (
              <div
                role="status"
                className="mb-5 p-3.5 rounded-lg bg-[#ecfdf5] border border-[#a7f3d0] text-[#047857] text-xs flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-[#15803d] shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email-input"
                  className="block text-xs font-bold text-[#1f2946] uppercase tracking-wider mb-1.5"
                >
                  Work Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5a6376]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email-input"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="name@techm4india.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#fcfbf9] border border-[#d1cbbf] rounded-lg text-[#1f2946] placeholder-[#8a92a3] text-sm focus:outline-none focus:ring-2 focus:ring-[#c62d37]/20 focus:border-[#c62d37] transition-all disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="password-input"
                    className="block text-xs font-bold text-[#1f2946] uppercase tracking-wider"
                  >
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5a6376]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password-input"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-11 py-2.5 bg-[#fcfbf9] border border-[#d1cbbf] rounded-lg text-[#1f2946] placeholder-[#8a92a3] text-sm focus:outline-none focus:ring-2 focus:ring-[#c62d37]/20 focus:border-[#c62d37] transition-all disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#5a6376] hover:text-[#1f2946] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-[#5a6376] flex items-center gap-1.5 pt-0.5">
                <Info className="w-3.5 h-3.5 shrink-0 text-[#5a6376]" />
                <span>Sessions are scoped securely to your browser window.</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 rounded-lg bg-[#c62d37] hover:bg-[#a8222e] text-white font-bold text-sm tracking-wide uppercase shadow-md shadow-red-900/15 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Verifying Identity...</span>
                  </>
                ) : (
                  <>
                    <span>{ssoInfo ? `Authorize & Open ${ssoInfo.appName}` : "Sign In to Dashboard"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials Assistant */}
            <div className="mt-6 pt-5 border-t border-[#e3ded5]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#1f2946] mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-[#d97706]" />
                <span>Test Role Fast-Fill (Development Environment)</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleSelectDemoAccount(acc)}
                    className="p-2.5 rounded-lg bg-[#fcfbf9] hover:bg-white border border-[#e3ded5] hover:border-[#c62d37] text-left transition-all shadow-2xs hover:shadow-xs group cursor-pointer"
                  >
                    <div className="text-xs font-bold text-[#1f2946] group-hover:text-[#c62d37] transition-colors">
                      {acc.label}
                    </div>
                    <div className="text-[10px] text-[#5a6376] truncate">{acc.role}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="relative z-10 text-center text-xs text-[#5a6376] pt-8">
        &copy; {new Date().getFullYear()} TechM4India Innovations Pvt. Ltd. Enterprise Identity Infrastructure.
      </footer>
    </main>
  );
}
