# TechM4India ERP Backend — Shared Database & Render Deployment Guide

This guide details how to configure the TechM4India centralized ERP backend (`apps/api`) so that **both the local developer backend and the deployed online Render backend access the exact same PostgreSQL database instance**, ensuring identical data across environments without committing credentials.

---

## 1. Shared Database Architecture

Both environments target the **same managed PostgreSQL database instance** (`techm4india-erp-db`) on Render:

```
┌─────────────────────────────────┐                 ┌─────────────────────────────────┐
│       ONLINE RENDER BACKEND     │                 │          LOCAL BACKEND          │
│       (Web Service in Cloud)    │                 │   (Developer Workstation / PC)  │
└────────────────┬────────────────┘                 └────────────────┬────────────────┘
                 │                                                   │
                 │ Internal Connection URL                           │ External Connection URL
                 │ (Private Cloud Network, fast)                     │ (Over Internet, SSL Enforced)
                 │ postgresql://admin:***@dpg-xxx:5432/...           │ postgresql://admin:***@dpg-xxx.region.render.com:5432/...?sslmode=require
                 ▼                                                   ▼
         ┌───────────────────────────────────────────────────────────────────┐
         │                    SHARED RENDER POSTGRESQL                       │
         │                  Instance: techm4india-erp-db                     │
         │                   Database: techm4india_erp                       │
         │                   User: techm4india_admin                         │
         └───────────────────────────────────────────────────────────────────┘
```

> [!WARNING]
> **Shared Data Warning**:
> Because the local backend connects to the live database, any entity created, updated, or deleted locally will be immediately visible on the online backend.
> - **NEVER** run destructive commands (`npx prisma migrate reset`, `DROP TABLE`, or table truncation).
> - Never write dummy test data into production user or organizational tables.
> - Always perform manual backups before applying schema migrations.

---

## 2. Step 1: Provision & Configure Shared PostgreSQL on Render

1. Log into your **Render Dashboard** ([render.com](https://render.com)).
2. Click **New +** > **PostgreSQL**.
3. Fill in the database settings:
   - **Name**: `techm4india-erp-db`
   - **Database**: `techm4india_erp`
   - **User**: `techm4india_admin`
   - **Region**: Choose the region closest to your team (e.g., `Singapore` or `Frankfurt`).
   - **PostgreSQL Version**: `16` (or latest stable).
   - **Plan**: `Starter` ($7/mo) or higher for persistent storage, automated backups, and non-expiring data.
4. **Configure IP Access Control (Allow Local Access)**:
   - In the database dashboard, navigate to **Access Control** / **IP Allow List**.
   - Add `0.0.0.0/0` (Description: `Local developer access with SSL`) or specify your team's static IP CIDRs.
   - *Note: External connections are always SSL encrypted (`sslmode=require`).*
5. Copy the two connection strings from the **Connections** panel:
   - **Internal Database URL**: Format `postgresql://techm4india_admin:<PASSWORD>@dpg-<ID>:5432/techm4india_erp`
   - **External Database URL**: Format `postgresql://techm4india_admin:<PASSWORD>@dpg-<ID>.<REGION>-postgres.render.com:5432/techm4india_erp?sslmode=require`

---

## 3. Step 2: Configure Online Web Service on Render

1. In Render, click **New +** > **Web Service**.
2. Connect the GitHub repository: `techm4india-website`.
3. Set the build and runtime parameters:
   - **Name**: `techm4india-api`
   - **Language**: `Node`
   - **Branch**: `main` (or active release branch)
   - **Region**: Same region as `techm4india-erp-db`.
   - **Root Directory**: `apps/api`
   - **Build Command**:
     ```bash
     npm install && npm run prisma:generate && npm run build
     ```
   - **Pre-Deploy Command** (under *Advanced*):
     ```bash
     npm run prisma:migrate
     ```
     *(Runs `prisma migrate deploy` safely against PostgreSQL before traffic routes to the new build).*
   - **Start Command**:
     ```bash
     npm run start:prod
     ```
   - **Health Check Path**: `/api/v1/health`
4. **Environment Variables**:
   Add the following in the Web Service settings:

   | Key | Value / Source |
   | :--- | :--- |
   | `NODE_ENV` | `production` |
   | `PORT` | Auto-managed by Render (binds to `0.0.0.0`) |
   | `DATABASE_URL` | Select **Add from Database** > `techm4india-erp-db` > **Internal Connection String** |
   | `API_PREFIX` | `api/v1` |
   | `SWAGGER_PATH` | `api/v1/docs` |
   | `CORS_ORIGIN` | `https://techm4india.com` (or client origin) |
   | `JWT_SECRET` | Auto-generate (min 32 characters) |
   | `JWT_REFRESH_SECRET` | Auto-generate (min 32 characters) |

---

## 4. Step 3: Configure Local Environment

1. Inside `apps/api/`, create your local `.env` from the template:
   ```bash
   cp .env.example .env
   ```
2. Paste the **External Database URL** from Render into `apps/api/.env`:
   ```ini
   DATABASE_URL="postgresql://techm4india_admin:YOUR_RENDER_PASSWORD@dpg-cxxxxxx-a.singapore-postgres.render.com:5432/techm4india_erp?sslmode=require"
   PORT=4000
   NODE_ENV=development
   ```
3. Generate the Prisma Client with the cloud schema:
   ```bash
   npm run prisma:generate
   ```
4. Verify local connectivity without printing credentials:
   ```bash
   npm run db:verify
   ```

---

## 5. Step 4: Cross-Environment Verification Procedure

To definitively confirm both local and online backends access the **exact same database**:

### Step 5.1: Confirm Database Identity & Probes via Health Endpoint
Call the readiness endpoint on both environments:
- **Local**: `curl -s http://localhost:4000/api/v1/health/ready`
- **Online**: `curl -s https://techm4india-api.onrender.com/api/v1/health/ready`

Both responses must return:
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "status": "ok",
    "database": {
      "status": "up",
      "database": "techm4india_erp",
      "ssl": true
    }
  }
}
```

### Step 5.2: Safe Cross-Environment Probe Verification
We use the safe probe script [`scripts/verify-shared-db.ts`](file:///d:/techm4india-website/apps/api/scripts/verify-shared-db.ts) which operates strictly on `audit_logs` probe entities:

1. **Create probe from Local environment**:
   ```bash
   npm run db:verify -- --create-probe
   ```
   Output:
   ```text
   🚀 Probe Created in Shared Database!
      Probe ID: probe-crossenv-1774378900-a1b2c3
   ```
2. **Verify probe from Online Render Web Service**:
   Open **Render Shell** in your `techm4india-api` Web Service dashboard and run:
   ```bash
   npm run db:verify -- --verify-probe probe-crossenv-1774378900-a1b2c3 --delete
   ```
   Output:
   ```text
   ✅ Probe DETECTED successfully in shared database!
   🧹 Probe deleted cleanly. Zero residual test data.
   🔒 Baseline entity integrity confirmed (0 production entities changed).
   ```
3. This proves write-read synchronization across environments without modifying any production user, HRMS, or finance entities!

---

## 6. Database Backup & Safe Migration Workflow

### Pre-Migration Backup (Manual Export)
Before applying new migrations to the shared database, take a snapshot:
```bash
pg_dump "postgresql://techm4india_admin:<PASSWORD>@dpg-<ID>.<REGION>-postgres.render.com:5432/techm4india_erp?sslmode=require" > backup_$(date +%Y%m%d_%H%M%S).sql
```
*(Render Starter PostgreSQL also maintains automated daily snapshots).*

### Inspect Migration Status
```bash
npx prisma migrate status --schema prisma/schema.prisma
```

### Apply Migrations Non-Destructively
```bash
npm run prisma:migrate
# Executes: prisma migrate deploy
```
*Never execute `prisma migrate reset` against the shared database.*
