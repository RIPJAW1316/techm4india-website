# TechM4India ERP Backend Migration to Render

This guide explains how to deploy and operate the TechM4India ERP NestJS backend and PostgreSQL database on [Render](https://render.com), replacing the local Docker container workflow with high-availability cloud infrastructure.

---

## 1. Architecture Overview

```text
Browser / Frontend
   │
   │ (HTTPS REST + Cookies / Bearer JWT)
   ▼
Render Web Service (techm4india-erp-api)
   │ Node 22 runtime · NestJS 11 · Port 10000 · Singapore Region
   │
   ▼
Render Managed PostgreSQL 16 (techm4india-erp-db)
   │ Private Network ConnectionString · Automated Daily Backups
```

- **Region**: `singapore` (lowest latency for India / `Asia/Kolkata` operations).
- **Automation**: Managed via `render.yaml` Blueprint specification.
- **Data Persistence**: Managed PostgreSQL database with automatic connection-string injection.

---

## 2. Deploy via Render Blueprint (1-Click Recommended)

The repository includes a ready-to-use [`render.yaml`](./render.yaml) blueprint that configures both the database and the API service in one step.

### Steps to Deploy:

1. **Sign in to Render**:
   Open [dashboard.render.com](https://dashboard.render.com).

2. **Create New Blueprint**:
   - Click the **New +** button in the top right.
   - Select **Blueprint**.
   - Connect your GitHub account and select repository:
     `RIPJAW1316/techm4india-website`
   - Select branch: `dev` (or `main`).

3. **Apply Blueprint**:
   - Render will parse `render.yaml` and display:
     - **Database**: `techm4india-erp-db` (PostgreSQL 16)
     - **Web Service**: `techm4india-erp-api` (Node)
   - Click **Apply**.

4. **Automatic Deployment Pipeline**:
   Render will automatically:
   - Provision the PostgreSQL database.
   - Inject the internal `DATABASE_URL` into the web service.
   - Generate a 32+ character cryptographically secure `JWT_ACCESS_SECRET`.
   - Run `npm run render:build` (`npm ci && prisma generate && npm run build`).
   - Run `npm run render:start` (`prisma migrate deploy && node dist/src/main.js`).

---

## 3. Environment Variables Reference

When deploying via `render.yaml`, these variables are configured automatically. If deploying manually or configuring custom domains, reference this table:

| Variable | Recommended Value | Purpose |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Production mode optimizations |
| `PORT` | `10000` | Port assigned by Render router |
| `DATABASE_URL` | *(From Database)* | Internal PostgreSQL connection URL |
| `JWT_ACCESS_SECRET` | *(Render auto-generated)* | 256-bit secret for signing access JWTs |
| `ACCESS_TOKEN_TTL` | `15m` | Access token lifespan |
| `REFRESH_TOKEN_TTL` | `30d` | Refresh token lifespan |
| `REFRESH_COOKIE_NAME` | `tm4_refresh` | Cookie name for session refresh |
| `COOKIE_SECURE` | `true` | Enforces HTTPS-only cookies |
| `COOKIE_SAME_SITE` | `none` | Allows cross-origin cookies between Vercel and Render |
| `TRUST_PROXY` | `true` | Enables correct client IP detection behind Render proxy |
| `BUSINESS_TIMEZONE` | `Asia/Kolkata` | Working hours and attendance timezone |
| `CORS_ORIGINS` | `https://techm4india.com,https://www.techm4india.com` | Allowed frontend origins |

---

## 4. Bootstrapping Initial Founder Account

Once the database and web service are running:

### Option A: One-time Production Bootstrap (Recommended)
In the Render Web Service dashboard under **Environment**:
1. Add:
   ```env
   BOOTSTRAP_FOUNDER_ENABLED=true
   BOOTSTRAP_FOUNDER_EMAIL=founder@techm4india.com
   BOOTSTRAP_FOUNDER_PASSWORD=YourSecureProductionPassword123!
   ```
2. Trigger a deploy or restart the service. The service will create the founder account and organization hierarchy on startup.
3. Immediately **delete or set `BOOTSTRAP_FOUNDER_ENABLED=false`** and remove the password variable.

### Option B: Render Web Shell Seeding
1. Go to the **Shell** tab in your Render Web Service.
2. Run:
   ```bash
   SEED_DEMO_PASSWORD="your-dev-password" npx prisma db seed
   ```

---

## 5. Connecting the Frontend

In your frontend deployment (e.g. Vercel, Cloudflare, or local `.env`):

```env
VITE_API_BASE_URL=https://techm4india-erp-api.onrender.com/api/v1
```

Replace `techm4india-erp-api.onrender.com` with your custom domain (e.g. `api.techm4india.com`) if configured.

---

## 6. Developing Locally with Render Cloud Database (No Docker Required)

If you want to run the backend or frontend locally without running Docker on your machine:

1. In Render Dashboard, go to `techm4india-erp-db`.
2. Under **Connections**, copy the **External Database URL**.
3. In `backend/.env`:
   ```env
   DATABASE_URL=postgresql://techm4india:<password>@dpg-...-a.singapore-postgres.render.com/techm4india_erp?sslmode=require
   ```
4. Now running `npm run dev` or `npm --prefix backend run start:dev` connects directly to your cloud Render database without needing Docker Desktop running!
