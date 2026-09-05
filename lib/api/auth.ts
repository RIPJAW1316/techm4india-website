import { apiFetch, clearAccessToken, refreshSessionToken, setAccessToken } from "./client";
import type { ApiResponse, AuthContext } from "./types";

type AuthPayload = AuthContext & { accessToken: string };

export async function loginRequest(email: string, password: string) {
  const response = await apiFetch<ApiResponse<AuthPayload>>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }, false);
  setAccessToken(response.data.accessToken);
  return response.data;
}

export async function currentUser() {
  const response = await apiFetch<ApiResponse<AuthContext>>("/auth/me");
  return response.data;
}

export async function restoreSession() {
  await refreshSessionToken();
  return currentUser();
}

export async function logoutRequest() {
  try { await apiFetch("/auth/logout", { method: "POST" }, false); } finally { clearAccessToken(); }
}
