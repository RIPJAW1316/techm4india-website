# TechM4India ERP Backend — Render Deployment Guide

This document describes the step-by-step procedure to deploy the TechM4India centralized ERP backend (`apps/api`) to Render using a managed PostgreSQL database and Node.js Web Service.

---

## 1. Prerequisites

- A Render account ([render.com](https://render.com)) with administrative access.
- Access to the GitHub repository containing the codebase.
- No real credentials committed to version control.

> [!WARNING]
> **Free Tier Warning**: Render's free tier databases expire after 30 days and free web services sleep after 15 minutes of inactivity. For TechM4India enterprise ERP data, always use Render's **Starter** (or higher) paid PostgreSQL and Web Service instances with persistent storage and automated backups.

---

## 2. Step 1: Provision Managed PostgreSQL Database

1. In the **Render Dashboard**, click **New +** > **PostgreSQL**.
2. Configure the database instance:
   - **Name**: `techm4india-erp-db`
   - **Database**: `techm4india_erp`
   - **User**: `techm4india_admin`
   - **Region**: Choose the region closest to primary users (e.g., `Singapore` or `Frankfurt`).
   - **PostgreSQL Version**: `16` (or latest supported).
   - **Plan**: `Starter` ($7/mo) or higher for persistent storage.
3. Once provisioned, note the two connection strings:
   - **Internal Database URL** (e.g., `postgresql://techm4india_admin:...@dpg-...:5432/techm4india_erp`): Use this for Web Services hosted within the same Render account/region (no bandwidth cost, faster, internal SSL).
   - **External Database URL**: Use for external migrations or local development with `?sslmode=require`.

---

## 3. Step 2: Provision Web Service for the API

1. In the Render Dashboard, click **New +** > **Web Service**.
2. Connect your GitHub repository: `techm4india-website`.
3. Configure the service settings:
   - **Name**: `techm4india-api`
   - **Language**: `Node`
   - **Branch**: `main` (or active deployment branch)
   - **Region**: Same region as the database.
   - **Root Directory**: `apps/api`
   - **Build Command**:
     ```bash
     npm install && npm run prisma:generate && npm run build
     ```
   - **Pre-Deploy Command** (under *Advanced Settings*):
     ```bash
     npm run prisma:migrate
     ```
     *This runs `npx prisma migrate deploy` safely against PostgreSQL before the new build starts serving traffic.*
   - **Start Command**:
     ```bash
     npm run start:prod
     ```
   - **Plan**: `Starter` ($7/mo) or higher.

---

## 4. Step 3: Configure Environment Variables

Under **Environment Variables** in the Web Service settings, add the following:

| Variable | Description | Example / Source |
| :--- | :--- | :--- |
| `NODE_ENV` | Operating environment | `production` |
| `PORT` | Auto-provided by Render | Render sets this automatically (usually `10000`). |
| `HOST` | Binding address | `0.0.0.0` |
| `DATABASE_URL` | PostgreSQL connection string | Use **Render Internal Connection String** or select *Add from Database*. |
| `API_PREFIX` | Versioned prefix | `api/v1` |
| `SWAGGER_PATH` | Swagger documentation path | `api/v1/docs` |
| `CORS_ORIGIN` | Allowed client origins | `https://techm4india.com,https://app.techm4india.com` |
| `RATE_LIMIT_TTL` | Throttler time window (ms) | `60000` |
| `RATE_LIMIT_LIMIT` | Throttler max requests | `100` |
| `JWT_SECRET` | Auth secret (Phase 2) | Generate via Render secret generator (min 32 chars) |
| `JWT_REFRESH_SECRET` | Refresh secret (Phase 2) | Generate via Render secret generator (min 32 chars) |

---

## 5. Step 4: Health Check Configuration

Under **Advanced Settings** in Render:
- **Health Check Path**: `/api/v1/health`

Render will query this endpoint during rolling deployments. If `/api/v1/health` does not respond with HTTP 200 within the timeout, the deployment will not be routed traffic, ensuring zero downtime.

---

## 6. Step 5: Post-Deployment Verification

Once the deployment completes:

1. **Verify Liveness**:
   ```bash
   curl -i https://<your-render-url>/api/v1/health
   ```
   Expected response:
   ```json
   {
     "success": true,
     "statusCode": 200,
     "data": {
       "status": "ok",
       "uptime": 12.34,
       "timestamp": "2026-10-23T18:00:00.000Z",
       "version": "1.0.0"
     },
     "timestamp": "2026-10-23T18:00:00.000Z",
     "correlationId": "..."
   }
   ```

2. **Verify Readiness (Database Connectivity)**:
   ```bash
   curl -i https://<your-render-url>/api/v1/health/ready
   ```
   Expected response:
   ```json
   {
     "success": true,
     "statusCode": 200,
     "data": {
       "status": "ok",
       "database": {
         "status": "up",
         "latencyMs": 3
       },
       "uptime": 14.56,
       "timestamp": "2026-10-23T18:00:00.000Z",
       "version": "1.0.0"
     },
     "timestamp": "2026-10-23T18:00:00.000Z",
     "correlationId": "..."
   }
   ```

3. **Verify Interactive OpenAPI / Swagger Documentation**:
   Visit `https://<your-render-url>/api/v1/docs` in your browser. Verify the OpenAPI specification and Swagger UI interactive console load cleanly.

---

## 7. Database Migration & Seeding Workflow

### Automatic Production Migrations
In production, migrations are applied non-destructively through the Render **Pre-Deploy Command**:
```bash
npm run prisma:migrate
# Executes: prisma migrate deploy --schema prisma/schema.prisma
```
This applies only pending migrations and terminates with an error if a conflict occurs, preventing broken deployments.

### Initial Database Seeding (Optional)
To seed baseline organization, system roles and applications in a new production environment, connect via Render Shell or run a One-Off Job:
```bash
npm run prisma:seed
```
*Note: The seed script uses idempotent `upsert` queries and is safe to execute multiple times.*
