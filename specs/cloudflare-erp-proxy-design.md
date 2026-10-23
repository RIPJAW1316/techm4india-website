# Cloudflare website / ERP API bridge

## Requirement

The Cloudflare website must serve ERP browser requests through `/api/*` on its own origin while the existing NestJS API runs on Vercel. The API remains connected to the existing Neon PostgreSQL database. Cloudflare Containers cannot run on the current Workers Free plan.

## Frontend

The ERP client already calls relative `/api/v1` and `/api/v2` URLs. Keep its form validation, loading states, error messages, and refresh-cookie flow unchanged. The website Worker handles those paths before the page renderer.

## Backend

The website Worker forwards the original path, query, method, body, authorization header, and cookies to the fixed `techm4india-erp-api.vercel.app` origin. The current NestJS API continues to validate DTOs, enforce guards and roles, record audit events, and access Neon through Prisma. Deploy the current backend code to its existing Vercel project before switching the website proxy.

## Security

Only `/api` and `/api/*` are forwarded. The upstream hostname is a fixed deployment variable, never selected from a request header or query. Reject browser requests whose `Origin` differs from the website origin, then omit `Origin` on the trusted server-to-server hop because the API's existing exact-origin allowlist does not include the Cloudflare preview hostname. Preserve `Set-Cookie` so the refresh cookie is scoped by the browser to the website origin. Never expose database credentials or JWT secrets in the Worker.

## Verification

Build and test both projects. Confirm Cloudflare `/api/v1/health` reports a connected database, unauthenticated protected routes reject access, cross-origin writes are denied, cookies and login errors pass through, and all public pages render. Production domain cutover requires adding the zone to Cloudflare and changing Namecheap DNS; the current domain stays on Vercel until that is done.
