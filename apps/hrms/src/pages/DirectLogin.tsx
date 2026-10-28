import React, { useState } from 'react';
import {
  Lock,
  Mail,
  AlertCircle,
  Shield,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { createPkceChallenge, login } from '@/lib/auth-client';

export default function DirectLoginPage({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const MAIN_PORTAL_URL =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? (((import.meta as any).env?.VITE_MAIN_PORTAL_URL) || 'http://localhost:5173')
      : 'https://techm4india.com';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      onLoginSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid corporate credentials. Please check your email and password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCentralSso = async () => {
    try {
      const { codeVerifier, codeChallenge } = await createPkceChallenge();
      const state = Math.random().toString(36).substring(2);
      const redirectUri = `${window.location.origin}/auth/callback`;

      sessionStorage.setItem('tm4i_oidc_state', state);
      sessionStorage.setItem('tm4i_oidc_verifier', codeVerifier);

      const targetUrl = new URL(`${MAIN_PORTAL_URL}/login`);
      targetUrl.searchParams.set('client_id', 'techm4-hrms');
      targetUrl.searchParams.set('redirect_uri', redirectUri);
      targetUrl.searchParams.set('response_type', 'code');
      targetUrl.searchParams.set('scope', 'openid profile email hrms');
      targetUrl.searchParams.set('state', state);
      targetUrl.searchParams.set('code_challenge', codeChallenge);
      targetUrl.searchParams.set('code_challenge_method', 'S256');

      window.location.href = targetUrl.toString();
    } catch {
      window.location.href = `${MAIN_PORTAL_URL}/login`;
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f6f2] text-[#20283b] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Blueprint background grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(rgba(198, 45, 55, 0.12) 1px, transparent 1px), radial-gradient(rgba(31, 41, 70, 0.08) 1px, #f7f6f2 1px)',
          backgroundSize: '36px 36px',
          backgroundPosition: '0 0, 18px 18px',
        }}
        aria-hidden="true"
      />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#1f2946] text-white flex items-center justify-center font-black tracking-wider text-base shadow-lg relative border border-white/20 shrink-0">
            <img
              src="/images/brand/logo.png"
              alt="TechM4 Logo"
              width="48"
              height="48"
              className="w-full h-full object-cover relative z-10"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-black tracking-wider text-white">
              TM4
            </span>
          </div>
          <div>
            <h1 className="text-xl font-black text-[#1f2946] tracking-tight uppercase">
              TECHM4<span className="text-[#c62d37]">INDIA</span>
            </h1>
            <p className="text-[11px] font-bold text-[#5a6376] tracking-widest uppercase">
              Human Capital &amp; Workforce ERP
            </p>
          </div>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg relative z-10">
        <div className="bg-white border border-[#e3ded5] rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-900/5">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#1f2946]">Sign In to HRMS</h2>
              <p className="text-xs text-[#5a6376] mt-1">
                Access workforce directory, time attendance, payroll registers, and expense claims.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="p-3.5 rounded-xl bg-[#fef2f2] border border-[#fecdd3] text-[#be123c] flex items-start gap-2.5 text-xs animate-in fade-in"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="font-semibold">{error}</div>
              </div>
            )}

            {/* Central OIDC Single Sign-On Button */}
            <button
              type="button"
              onClick={handleCentralSso}
              className="w-full py-3 px-4 rounded-xl border border-[#d1cbbf] bg-[#fbfbf9] hover:bg-[#f1efe9] text-[#1f2946] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs hover:border-[#1f2946] cursor-pointer"
            >
              <Shield className="w-4 h-4 text-[#c62d37]" />
              <span>Sign In via TechM4 Central SSO</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-[#e3ded5] w-full" />
              <span className="bg-white px-3 text-[11px] font-semibold text-[#5a6376] uppercase tracking-wider relative">
                or corporate email
              </span>
            </div>

            {/* Direct Credentials Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1f2946] mb-1.5">
                  Corporate Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#5a6376] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@techm4india.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#fbfbf9] border border-[#d1cbbf] rounded-xl text-xs font-medium text-[#1f2946] focus:outline-none focus:border-[#1f2946] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1f2946] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#5a6376] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#fbfbf9] border border-[#d1cbbf] rounded-xl text-xs font-medium text-[#1f2946] focus:outline-none focus:border-[#1f2946] focus:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5a6376] hover:text-[#1f2946]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-[#1f2946] hover:bg-[#12192d] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to HRMS</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <footer className="relative z-10 text-center text-xs text-[#5a6376] pt-8">
        &copy; {new Date().getFullYear()} TechM4India Innovations Pvt. Ltd. Enterprise Identity Infrastructure.
      </footer>
    </main>
  );
}
