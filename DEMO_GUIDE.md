# TechM4India ERP demo guide

This guide covers the current employee vertical slice. Demo passwords are intentionally not stored in Git; use the local `SEED_DEMO_PASSWORD` value used to create the development personas.

## Start locally

1. Start Docker Desktop and PostgreSQL from the backend directory:

   ```bash
   cd backend
   docker compose up -d postgres
   ```

2. Install dependencies in the root and `backend` directories.
3. Copy the example environment files to local `.env` files and set a local API secret and development seed password.
4. Apply migrations and seed development data:

   ```bash
   npx prisma migrate deploy
   npm run prisma:seed
   npm run start:dev
   ```

5. In another terminal, start the frontend:

   ```bash
   npm run dev
   ```

## Demonstration flow

1. Open `http://localhost:3000/login`.
2. Sign in with the Engineering development employee.
3. Show the employee identity and division/department.
4. Show KPI summary, assigned tasks, and project progress.
5. Change an assigned task status.
6. Show the updated task and KPI summary.
7. Open Notifications and mark the development notification read.
8. Refresh the browser to demonstrate refresh-cookie session restoration and read-state persistence.
9. Open a different division URL directly and show the safe redirect.
10. Log out and confirm ERP routes return to sign in.

The Solutions, Schools, and Space personas use the development-only company email addresses created by the seed. They are synthetic and must not be presented as real employee records.
