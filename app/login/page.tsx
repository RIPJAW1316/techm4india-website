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

  // Auto-redirect if already logged in
  useEffect(() => {
    if (getAccessToken()) {
      window.location.href = "/dashboard";
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
      await login({ email, password });
      setSuccessMessage("Authentication successful. Redirecting to Central Dashboard...");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 400);
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
    <main className="min-h-screen bg-[#12192d] text-slate-100 flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background motif */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(#d73531 1px, transparent 1px), radial-gradient(#252e4a 1px, #12192d 1px)",
          backgroundSize: "40px 40px",
          backgroundPosition: "0 0, 20px 20px",
        }}
        aria-hidden="true"
      />

      {/* Decorative accent glow */}
      <div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-red-600/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto">
        {/* Left Column: Platform Branding & Architecture Overview */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
          <Link
            href="/"
            className="inline-flex items-center gap-3 group text-white decoration-none"
          >
            <img
              src="/images/brand/logo.png"
              alt="TechM4India Logo"
              width="52"
              height="52"
              className="transition-transform group-hover:scale-105"
            />
            <div>
              <div className="text-2xl font-black tracking-wider uppercase">
                TECHM4<span className="text-[#d73531]">INDIA</span>
              </div>
              <p className="text-xs text-slate-400 font-medium tracking-widest uppercase">
                Central Enterprise Platform
              </p>
            </div>
          </Link>

          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
              <Shield className="w-3.5 h-3.5" />
              Single Central Identity & RBAC
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              One identity for all enterprise operations.
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg">
              Sign in with your centralized TechM4India credentials to access HRMS, Finance ERP,
              and cross-functional management systems securely.
            </p>
          </div>

          {/* Key Security Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Argon2id & JWT Auth
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Zero plaintext storage with rotating session tokens.
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Dynamic RBAC Gates
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Authorized applications revealed dynamically per role.
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2 pt-2">
            <span>TechM4India Innovations Pvt. Ltd.</span>
            <span>•</span>
            <Link href="/" className="text-slate-300 hover:text-white underline">
              Return to Website
            </Link>
          </div>
        </div>

        {/* Right Column: Login Card & Demo Selector */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto lg:max-w-none">
          <div className="bg-[#1c2438] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white tracking-tight">Enterprise Sign In</h2>
              <p className="text-xs text-slate-400 mt-1">
                Authenticate with your TechM4India corporate credentials.
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div
                role="alert"
                className="mb-5 p-3.5 rounded-lg bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-start gap-2.5 animate-fadeIn"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Success Banner */}
            {successMessage && (
              <div
                role="status"
                className="mb-5 p-3.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email-input"
                  className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
                >
                  Work Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
                    className="w-full pl-10 pr-4 py-2.5 bg-[#12192d] border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#d73531] focus:border-transparent transition-all disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="password-input"
                    className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
                  >
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
                    className="w-full pl-10 pr-11 py-2.5 bg-[#12192d] border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#d73531] focus:border-transparent transition-all disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                <span>Sessions are scoped securely to your browser window.</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 rounded-lg bg-[#d73531] hover:bg-[#b82a27] text-white font-bold text-sm tracking-wide uppercase shadow-lg shadow-red-900/40 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Verifying Identity...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials Assistant */}
            <div className="mt-6 pt-5 border-t border-slate-700/60">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Test Role Fast-Fill (Development Environment)</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleSelectDemoAccount(acc)}
                    className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition-all group"
                  >
                    <div className="text-xs font-bold text-white group-hover:text-red-400">
                      {acc.label}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{acc.role}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="relative z-10 text-center text-xs text-slate-500 pt-6">
        &copy; {new Date().getFullYear()} TechM4India Innovations Pvt. Ltd. Enterprise Identity Infrastructure.
      </footer>
    </main>
  );
}
