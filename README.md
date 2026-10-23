# TechM4India

The TechM4India public website: an editorial, image-led experience for the
Engineering, Solutions, Schools, Space and Institutes divisions.

## Local development

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

`npm run dev` starts the Vinext development server.

### Checks and Build

```bash
npm run lint       # ESLint check
npm run test       # Static build and HTML verification tests
npm run build      # Static Vinext production export in dist/
```

## Routes

The primary routes are:
- `/` (Home)
- `/about` (About us)
- `/engineering` (TechM4Engineering)
- `/solutions` (TechM4Solutions)
- `/schools` (TechM4Schools)
- `/space` (TechM4Space)
- `/institutes` (TechM4Institutes)
- `/contact` (Contact & Partnerships)

Legacy and previous routes redirect cleanly via `vercel.json`.

## Content and assets

Images used in the experience live under `public/images/`. Authentic
TechM4India workshop imagery is used for editorial sections; the Space hero is
credited to ISRO / Department of Space.
