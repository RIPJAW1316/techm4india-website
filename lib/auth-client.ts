/**
 * TechM4India ERP — Central Authentication & Identity Client
 *
 * Implements token-based authentication against the NestJS Phase 1 & 2 backend.
 * Conforms to enterprise security policies:
 * - Short-lived access tokens and rotating refresh tokens
 * - No persistent tokens in localStorage (scoped exclusively to sessionStorage)
 * - Safe error message extraction without credential leakage
 */

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roles: string[];
  permissions: string[];
  organizationCode?: string;
  authorizedApplications: string[];
}

export interface ApplicationAccessInfo {
  code: string;
  name: string;
  description: string;
  baseUrl: string;
  isActive: boolean;
  grantedAt: string;
  expiresAt?: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

const SESSION_ACCESS_TOKEN_KEY = "tm4i_erp_access_token";
const SESSION_REFRESH_TOKEN_KEY = "tm4i_erp_refresh_token";

/**
 * Returns the configured API base URL, defaulting to local backend port 4000.
 */
export function getApiBaseUrl(): string {
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
  }
  if (typeof process !== "undefined" && process.env?.VITE_API_BASE_URL) {
    return process.env.VITE_API_BASE_URL.replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "");
  }
  return "https://techm4india-erp-api-l1gv.onrender.com";
}

/**
 * Retrieve the active access token from transient session storage.
 */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(SESSION_ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Retrieve the active refresh token from transient session storage.
 */
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(SESSION_REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Store credentials in tab-scoped session storage (never long-lived localStorage).
 */
export function setSession(tokens: AuthTokens): void {
  if (typeof window === "undefined") return;
  try {
    if (tokens.accessToken) {
      sessionStorage.setItem(SESSION_ACCESS_TOKEN_KEY, tokens.accessToken);
    }
    if (tokens.refreshToken) {
      sessionStorage.setItem(SESSION_REFRESH_TOKEN_KEY, tokens.refreshToken);
    }
  } catch {
    // Storage access may be blocked in private mode
  }
}

/**
 * Purge session credentials from browser memory.
 */
export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(SESSION_ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(SESSION_REFRESH_TOKEN_KEY);
  } catch {
    // Storage access may be blocked
  }
}

/**
 * Check whether a session token currently exists in memory.
 */
export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}

/**
 * Helper to unwrap NestJS TransformResponseInterceptor envelope
 * { success: true, statusCode: 200, data: T }
 */
function unwrapResponse<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

/**
 * Extract clean, user-friendly error message from failed HTTP responses.
 */
function extractErrorMessage(status: number, data: unknown): string {
  if (typeof data === "object" && data !== null) {
    const errorObj = data as Record<string, unknown>;
    if (Array.isArray(errorObj.message)) {
      return errorObj.message.join(", ");
    }
    if (typeof errorObj.message === "string") {
      return errorObj.message;
    }
  }

  if (status === 401) {
    return "Invalid email or password. Please verify your credentials.";
  }
  if (status === 403) {
    return "Account inactive or access forbidden. Please contact your system administrator.";
  }
  if (status >= 500) {
    return "The central ERP authentication server encountered an error. Please try again.";
  }
  return "An unexpected error occurred during authentication.";
}

/**
 * Authenticate with corporate credentials via POST /api/v1/auth/login
 */
export async function login(credentials: {
  email: string;
  password: string;
}): Promise<AuthTokens> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/v1/auth/login`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email: credentials.email.trim(),
        password: credentials.password,
      }),
    });
  } catch {
    throw new Error(
      "Unable to connect to the TechM4India authentication service. Please verify network connectivity.",
    );
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const errorMessage = extractErrorMessage(response.status, body);
    throw new Error(errorMessage);
  }

  const tokens = unwrapResponse<AuthTokens>(body);
  setSession(tokens);
  return tokens;
}

/**
 * Terminate the user session via POST /api/v1/auth/logout
 */
export async function logout(): Promise<void> {
  const baseUrl = getApiBaseUrl();
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  try {
    if (accessToken || refreshToken) {
      await fetch(`${baseUrl}/api/v1/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          refreshToken: refreshToken || undefined,
        }),
      });
    }
  } catch {
    // Ignore network error on logout to guarantee client cleanup
  } finally {
    clearSession();
  }
}

/**
 * Fetch current user profile via GET /api/v1/auth/me
 */
export async function getMe(): Promise<UserProfile> {
  const baseUrl = getApiBaseUrl();
  const accessToken = getAccessToken();

  if (!accessToken) {
    throw new Error("No active session found. Please sign in.");
  }

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/v1/auth/me`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch {
    throw new Error("Unable to connect to identity service.");
  }

  if (response.status === 401) {
    clearSession();
    throw new Error("Session expired. Please log in again.");
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    throw new Error(extractErrorMessage(response.status, body));
  }

  return unwrapResponse<UserProfile>(body);
}

/**
 * Fetch applications authorized for the current user via GET /api/v1/users/me/applications
 */
export async function getAuthorizedApplications(): Promise<ApplicationAccessInfo[]> {
  const baseUrl = getApiBaseUrl();
  const accessToken = getAccessToken();

  if (!accessToken) {
    throw new Error("No active session found. Please sign in.");
  }

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/v1/users/me/applications`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch {
    throw new Error("Unable to connect to application catalog.");
  }

  if (response.status === 401) {
    clearSession();
    throw new Error("Session expired. Please log in again.");
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    throw new Error(extractErrorMessage(response.status, body));
  }

  return unwrapResponse<ApplicationAccessInfo[]>(body);
}

// -----------------------------------------------------------------------------
// Unified authClient Namespace
// -----------------------------------------------------------------------------
export const authClient = {
  getAccessToken,
  getRefreshToken,
  getSession: () => ({
    accessToken: getAccessToken(),
    refreshToken: getRefreshToken(),
  }),
  saveSession: setSession,
  setSession,
  clearSession,
  isAuthenticated,
  login,
  logout,
  refreshSession: async () => null,
  getCurrentUser: getMe,
  getAuthorizedApplications,
};
