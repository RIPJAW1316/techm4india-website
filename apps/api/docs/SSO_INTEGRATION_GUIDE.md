# TechM4India ERP — Single Sign-On (SSO) Integration Guide
## Central Identity Architecture for HRMS & Finance ERP Developers

This document serves as the technical integration specification for the HRMS and Finance ERP developers. Both modules rely on the centralized identity, user registry, and Role-Based Access Control (RBAC) provided by the TechM4India central backend (`apps/api`).

---

## 1. High-Level Architecture & Core Principles

```
                               ┌──────────────────────────────────────────────┐
                               │       Central Identity & Dashboard (IdP)     │
                               │           https://portal.techm4india.com     │
                               │                (apps/api)                    │
                               └──────────────────────┬───────────────────────┘
                                                      │
                       ┌──────────────────────────────┴──────────────────────────────┐
                       │                                                             │
                       ▼                                                             ▼
         ┌───────────────────────────┐                                 ┌───────────────────────────┐
         │       HRMS Application    │                                 │     Finance ERP Module    │
         │ (https://hrms.techm4india)│                                 │(https://finance.techm4...)│
         └───────────────────────────┘                                 └───────────────────────────┘
```

### Core Tenets
1. **Single Central Account**: Every employee has exactly one user record in `users`. They do NOT maintain separate login credentials for HRMS or Finance.
2. **Access Isolation**: Granting an employee access to HRMS does **not** grant access to Finance ERP. Permissions and application access grants are independently checked on every server call.
3. **No Tokens in URLs**: Bearer tokens and credentials must **never** be passed in query strings, fragment identifiers, or browser address bars.
4. **No Cross-Subdomain Cookie Assumptions**: Browsers enforce strict cookie jar isolation. Application sessions must be established via a controlled authorization code exchange or backend verification.

---

## 2. Recommended SSO Flow: Authorization Code Flow with PKCE

To achieve standards-compliant and secure authentication across independent web clients, TechM4India adopts the **OAuth 2.1 / OIDC Authorization Code Flow with PKCE** (Proof Key for Code Exchange).

### 2.1 Complete Flow Diagram

```
[Employee Browser]            [HRMS / Finance Client]          [Central Identity API (apps/api)]
        │                                │                                    │
        │── 1. Clicks "Launch App" ─────▶│                                    │
        │                                │── 2. Generates PKCE pair          │
        │                                │      (code_verifier & challenge)   │
        │◀── 3. Redirects to Central ────│                                    │
        │       (with code_challenge)    │                                    │
        │                                                                     │
        │── 4. GET /api/v1/auth/authorize?client_id=HRMS&challenge=... ──────▶│
        │                                                                     │ Check user session
        │                                                                     │ Check App Access Grant
        │◀── 5. Redirects back to HRMS with temporary auth_code (60s TTL) ────│
        │                                                                     │
        │── 6. Delivers auth_code ──────▶│                                    │
        │                                │── 7. POST /api/v1/auth/token ─────▶│ (Backend-to-Backend)
        │                                │      (auth_code + code_verifier)   │
        │                                │                                    │ Validates PKCE
        │                                │◀── 8. Issues App-scoped JWT ───────│
        │                                │                                    │
        │◀── 9. Sets HTTP-Only Cookie ───│                                    │
```

---

## 3. Step-by-Step Implementation for Application Developers

### Step 1: Central Login
Employees authenticate at the central portal:
- Endpoint: `POST /api/v1/auth/login`
- Body: `{ "email": "...", "password": "..." }`
- Response: Access Token (`15m` TTL) and Refresh Token (`7d` TTL).
- The central client queries `GET /api/v1/users/me/applications` to render dashboard tiles for authorized applications only.

### Step 2: Requesting Application Access
When an employee clicks on the **HRMS** or **Finance** tile:
1. The destination client application creates a cryptographically secure random string: `code_verifier` (43 to 128 characters).
2. Computes the SHA-256 hash: `code_challenge = BASE64URL(SHA256(code_verifier))`.
3. Stores `code_verifier` in secure temporary session storage (e.g. server-side session or memory).
4. Redirects the user's browser to the central application launch endpoint:
   ```text
   GET https://api.techm4india.com/api/v1/auth/authorize
       ?client_id=HRMS
       &redirect_uri=https://hrms.techm4india.com/auth/callback
       &code_challenge=<code_challenge>
       &code_challenge_method=S256
       &state=<random_state_csrf_token>
   ```

### Step 3: Destination URL & Redirect Validation
Central Identity validates:
- Is `client_id` registered and active? (`Application.code = 'HRMS'`).
- Does `redirect_uri` match configured `TRUSTED_APP_URLS`? **Untrusted or arbitrary redirect URIs are strictly rejected.**
- Does the authenticated employee have active grant (`UserApplicationAccess.isActive = true`)?
- If authorized, Central Identity generates a single-use authorization code (`auth_code`) valid for 60 seconds and redirects:
  ```text
  302 Redirect: https://hrms.techm4india.com/auth/callback?code=<auth_code>&state=<state>
  ```

### Step 4: Token Exchange (Backend-to-Backend)
The destination app's backend intercepts the callback and exchanges the code:
```http
POST /api/v1/auth/token HTTP/1.1
Host: api.techm4india.com
Content-Type: application/json

{
  "grant_type": "authorization_code",
  "client_id": "HRMS",
  "code": "<auth_code>",
  "code_verifier": "<original_code_verifier>",
  "redirect_uri": "https://hrms.techm4india.com/auth/callback"
}
```
Central Identity verifies that `SHA256(code_verifier) === code_challenge`.
Upon verification, it issues an application-scoped session token containing:
```json
{
  "sub": "user-uuid",
  "email": "employee@techm4india.com",
  "organizationId": "org-uuid",
  "roles": ["HRMS_USER"],
  "permissions": ["hrms:access", "hrms:attendance:read"],
  "aud": "HRMS",
  "iss": "https://api.techm4india.com"
}
```

### Step 5: Session Storage at Destination
- The destination application (HRMS or Finance) stores the session identifier in a **`Secure; HttpOnly; SameSite=Lax`** cookie.
- **Never** store tokens in browser `localStorage` or `sessionStorage` (vulnerable to XSS extraction).

---

## 4. Authorization Enforcement & Role Mapping

Each application backend must enforce permissions on **every API request**:

| Role | Module | Permitted Capabilities |
| :--- | :--- | :--- |
| `SUPER_ADMIN` | Global | Full access across all applications and administrative APIs. |
| `HRMS_ADMIN` | HRMS | Employee onboarding, attendance management, payroll administration, leave approvals. |
| `HRMS_USER` | HRMS | Self-service profile, attendance punch-in/out, leave requests. **No access to Finance ERP.** |
| `FINANCE_ADMIN` | Finance | General ledger, tax (GST) processing, invoice approvals, bank reconciliations. |
| `FINANCE_USER` | Finance | Invoice creation, expense report submission, viewing accounting entries. **No access to HRMS admin.** |

### Role Verification in Destination Code
Destination applications can validate tokens offline using the Central Identity public key / JWT secret, verifying:
1. `iss === 'https://api.techm4india.com'`
2. `aud === '<APP_CODE>'` (e.g. `HRMS`)
3. `exp > current_time`
4. User role possesses required module capability.

---

## 5. Single Logout & Security Invalidation

When an employee logs out:
1. **Local App Logout**: The destination application destroys its local cookie session.
2. **Central Invalidation**: Destination calls Central Identity:
   ```http
   POST /api/v1/auth/logout HTTP/1.1
   Authorization: Bearer <token>
   ```
3. **Session Revocation**: Central Identity invalidates active refresh tokens in `refresh_tokens`.
4. **Administrative Kill-Switch**: If an employee leaves the company or a laptop is stolen, administrators can immediately revoke all active sessions via:
   ```http
   POST /api/v1/users/:id/revoke-sessions HTTP/1.1
   ```
   This immediately prevents token refreshing across all applications.

---

## 6. Implementation Status & Limitations

- **Complete in Phase 2**: Central user registry, Argon2id authentication, rotating refresh tokens with reuse detection, granular RBAC decorators (`@Roles`, `@Permissions`), application access catalog, and access isolation.
- **Pending Phase 3**: Frontend UI dashboards for HRMS and Finance ERP, and live cross-domain callback endpoint handlers in destination client apps.
