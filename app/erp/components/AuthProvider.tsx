"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { currentUser, loginRequest, logoutRequest, restoreSession } from "@/lib/api/auth";
import type { AuthContext } from "@/lib/api/types";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";
type AuthProviderValue = {
  status: AuthStatus;
  context: AuthContext | null;
  login: (email: string, password: string) => Promise<AuthContext>;
  refreshSession: () => Promise<AuthContext | null>;
  logout: () => Promise<void>;
};

const AuthContextState = createContext<AuthProviderValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [context, setContext] = useState<AuthContext | null>(null);

  const refreshSession = useCallback(async () => {
    try {
      const next = await restoreSession();
      setContext(next);
      setStatus("authenticated");
      return next;
    } catch {
      setContext(null);
      setStatus("unauthenticated");
      return null;
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void refreshSession(); }, 0);
    return () => window.clearTimeout(timer);
  }, [refreshSession]);

  const login = useCallback(async (email: string, password: string) => {
    const next = await loginRequest(email, password);
    setContext(next);
    setStatus("authenticated");
    return next;
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setContext(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo(() => ({ status, context, login, refreshSession, logout }), [status, context, login, refreshSession, logout]);
  return <AuthContextState.Provider value={value}>{children}</AuthContextState.Provider>;
}

export function useErpAuth() {
  const value = useContext(AuthContextState);
  if (!value) throw new Error("useErpAuth must be used inside AuthProvider");
  return value;
}

export async function refreshAuthoritativeContext() {
  return currentUser();
}
