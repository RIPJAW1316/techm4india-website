# TechM4India Enterprise HRMS — Independent Application

This directory contains the standalone, decoupled **Human Resource Management System (HRMS)** for TechM4India Innovations Pvt. Ltd.

It is independently buildable, runnable, and deployable on its own dedicated development port (`3002`) and production subdomain (`https://hrms.techm4india.com`).

---

## 1. Architecture Overview

- **Application Root**: `apps/hrms/`
- **Frontend Stack**: React 19, Vite 8, Tailwind CSS, TypeScript
- **Shared API Backbone**: `apps/api/` (NestJS on port 4000)
- **Central Identity Provider**: OIDC Authorization Code Flow with PKCE (`S256`) via client `hrms-app-client`
- **Routing**: Deep-link capable client-side routing supporting both clean paths (`/employees`, `/attendance`, `/payroll`) and compatibility paths (`/hrms/employees`, etc.)

---

## 2. Developer Quickstart

### 2.1 Starting HRMS Independently
To run the HRMS application alone without the corporate site:
```bash
# From workspace root
npm run dev:hrms

# Or directly inside apps/hrms
npm --prefix apps/hrms run dev
```
The HRMS starts at: `http://localhost:3002`

### 2.2 Starting the Shared Backend API
```bash
npm run api:dev
```
The backend API listens on: `http://localhost:4000/api/v1`

### 2.3 Starting All ERP Applications Together
```bash
npm run dev:all
```
- Corporate Website & Central Dashboard: `http://localhost:3000`
- HRMS Independent App: `http://localhost:3002`
- Shared Backend API: `http://localhost:4000`

---

## 3. Production Deployment Guide

### 3.1 Proposed Production Subdomain
- **Production Hostname**: `https://hrms.techm4india.com`
- **Staging Hostname**: `https://staging-hrms.techm4india.com`

### 3.2 Build Command & Output
- **Build Command**: `npm --prefix apps/hrms run build` (or `npm run build:hrms`)
- **Output Directory**: `apps/hrms/dist/`
- **Runtime Requirement**: Static web server (Cloudflare Pages, Render Static Site, AWS S3 + CloudFront, Vercel, or Nginx).

### 3.3 Required Environment Variables
| Variable | Development | Staging | Production | Description |
| :--- | :--- | :--- | :--- | :--- |
| `PORT` | `3002` | `3002` | `443` | Development / local preview port |
| `VITE_API_BASE_URL` | `http://localhost:4000/api/v1` | `https://staging-api.techm4india.com/api/v1` | `https://techm4india-erp-api-l1gv.onrender.com/api/v1` | Central NestJS API endpoint |
| `VITE_CENTRAL_AUTH_URL` | `http://localhost:3000/login` | `https://staging.techm4india.com/login` | `https://techm4india.com/login` | Central Login Portal |
| `VITE_OIDC_CLIENT_ID` | `hrms-app-client` | `hrms-app-client` | `hrms-app-client` | Registered OIDC client ID |
| `VITE_APP_ORIGIN` | `http://localhost:3002` | `https://staging-hrms.techm4india.com` | `https://hrms.techm4india.com` | Public base URL |

### 3.4 SPA Deep-Link Fallback Configuration
Because HRMS uses client-side routing, any direct visit or page refresh to `/employees`, `/attendance`, `/payroll`, etc. must serve `index.html`.

#### Cloudflare Pages
Add a `_redirects` file in `public/` or `dist/`:
```
/*    /index.html   200
```

#### Nginx
```nginx
server {
    listen 443 ssl http2;
    server_name hrms.techm4india.com;

    root /var/www/techm4india-hrms/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static assets caching (1 year)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform, immutable";
    }
}
```

### 3.5 DNS and Custom-Domain Setup
1. Log in to domain DNS provider (Cloudflare / Namecheap / Route 53).
2. Add a `CNAME` record:
   - **Type**: `CNAME`
   - **Name**: `hrms`
   - **Target**: `<your-hosting-target>.onrender.com` or `pages.dev`
   - **TTL**: Auto / 300
3. Enable Automatic SSL / TLS (Full or Strict).

### 3.6 Release & Rollback Procedure
1. Build verification in CI/CD pipeline:
   ```bash
   npm run build:hrms && npm run test:hrms
   ```
2. Deploy `apps/hrms/dist/` to staging environment.
3. Smoke test OIDC callback: `https://staging-hrms.techm4india.com/auth/callback`.
4. Promote staging to production.
5. If rollback is required, re-point DNS or trigger zero-downtime rollback to previous deployment commit in Render / Cloudflare Pages dashboard.
