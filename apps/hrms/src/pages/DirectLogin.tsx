import React, { useState } from 'react';
import { Lock, Mail, AlertCircle, Shield, ArrowRight } from 'lucide-react';
import { login, setSession } from '@/lib/auth-client';

export default function DirectLoginPage({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      onLoginSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Authentication failed. Please verify credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCentralPortalSso = () => {
    // Generate PKCE code challenge and redirect to central portal OIDC authorization
    const centralUrl = import.meta.env.VITE_CENTRAL_AUTH_URL || 'http://localhost:3000/login';
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback`);
    window.location.href = `${centralUrl}?app=hrms&redirect_uri=${redirectUri}`;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-[#1f2946] text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Shield className="w-8 h-8 text-[#c62d37]" />
          </div>
          <h1 className="text-2xl font-black text-[#1f2946] tracking-tight">TechM4India HRMS</h1>
          <p className="text-xs text-slate-500">
            Enterprise Workforce &amp; Human Resource Management
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Corporate Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@techm4india.com"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1f2946]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1f2946]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#c62d37] hover:bg-[#a8222e] text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to HRMS'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-4 text-xs text-slate-400 uppercase font-semibold">or</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        <button
          type="button"
          onClick={handleCentralPortalSso}
          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-[#1f2946] font-bold text-xs rounded-xl border border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Shield className="w-4 h-4 text-[#1f2946]" />
          <span>Single Sign-On with Central Identity Portal</span>
        </button>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 text-center">
          <strong>Demo HR Lead:</strong> hrms.lead@techm4india.com / TechM4Hrms#2026
        </div>
      </div>
    </div>
  );
}
