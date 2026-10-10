# Railway ERP routing for the Vercel website

## Acceptance criteria

- Push the reviewed website and backend source changes only to Git `dev`.
- Publish the website to its existing Vercel production project.
- Browser ERP API calls stay on the website origin and reach the Railway service.
- The ERP health endpoint reports a database connection, invalid login is rejected,
  and an authorized login can fetch `/auth/me` and sign out.

## Frontend and backend

Vercel rewrites `/api/v1/*` and `/api/v2/*` to the Railway production domain.
The browser API client uses relative paths; server rendering uses a configurable
absolute API URL with Railway as its default. The ERP settings panel names the
configured service accurately. Railway currently follows Git `main`, so a push
to `dev` does not redeploy the backend.

The backend seed creates demo users only with an explicitly supplied development
password and preserves existing passwords on later runs. It must not reset a
production user to a shared demo password.

## Security and verification

The role switcher requires the selected account's password rather than shipping
one in browser JavaScript. Production login tests create a short lived session;
database writing tests must use an isolated test database. Historical credentials
published in Git must be rotated separately from this source change.
