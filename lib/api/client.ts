const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
const browserHost = typeof window === "undefined" ? "" : window.location.hostname;
const defaultApiBaseUrl =
  browserHost === "localhost" || browserHost === "127.0.0.1"
    ? "http://localhost:3001/api/v1"
    : "https://techm4india-erp-api.onrender.com/api/v1";
export const API_BASE_URL = (env?.VITE_API_BASE_URL || defaultApiBaseUrl).replace(/\/$/, "");
export const API_V2_BASE_URL = API_BASE_URL.replace(/\/v1$/, "/v2");

let accessToken: string | null = null;
let refreshPromise: Promise<string> | null = null;

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function clearAccessToken() {
  accessToken = null;
}

export function getAccessToken() {
  return accessToken;
}

async function parseError(response: Response): Promise<ApiError> {
  let payload: { message?: string | string[]; error?: string } | undefined;
  try {
    payload = (await response.json()) as typeof payload;
  } catch {
    /* non-JSON response */
  }
  const message = Array.isArray(payload?.message)
    ? payload.message.join(", ")
    : payload?.message || payload?.error || `Request failed (${response.status})`;
  return new ApiError(response.status, message, payload);
}

async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw await parseError(response);
      const payload = (await response.json()) as { data: { accessToken: string } };
      setAccessToken(payload.data.accessToken);
      return payload.data.accessToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function refreshSessionToken() {
  return refreshAccessToken();
}

async function apiFetchAtBase<T>(
  baseUrl: string,
  path: string,
  init: RequestInit = {},
  canRetry = true,
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  const response = await fetch(`${baseUrl}${path}`, { ...init, headers, credentials: "include" });
  if (
    response.status === 401 &&
    canRetry &&
    !path.endsWith("/auth/refresh") &&
    !path.endsWith("/auth/login")
  ) {
    try {
      await refreshAccessToken();
      return apiFetchAtBase<T>(baseUrl, path, init, false);
    } catch {
      clearAccessToken();
      throw new ApiError(401, "Your session has expired. Please sign in again.");
    }
  }
  if (!response.ok) throw await parseError(response);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  canRetry = true,
): Promise<T> {
  return apiFetchAtBase(API_BASE_URL, path, init, canRetry);
}

export async function apiFetchV2<T>(
  path: string,
  init: RequestInit = {},
  canRetry = true,
): Promise<T> {
  return apiFetchAtBase(API_V2_BASE_URL, path, init, canRetry);
}
