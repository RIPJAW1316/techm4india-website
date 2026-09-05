# TechM4India

The TechM4India public website: an editorial, image-led experience for the
Engineering, Solutions, Schools and Space divisions.

## Local development

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

The production checks are:

```bash
npm run lint
npx tsc --noEmit --incremental false
npm test
```

`npm run build` creates the static Vinext export in `dist/`.

## Routes

The primary routes are `/`, `/about`, `/engineering`, `/solutions`,
`/solutions/erp`,
`/schools`, `/space` and `/contact`. Legacy routes such as `/programs` and
`/research` redirect to the closest current division so existing links keep
working.

## Content and assets

Images used in the experience live under `public/images/`. Authentic
TechM4India workshop imagery is used for editorial sections; the Space hero is
credited to ISRO / Department of Space. Confirm permissions and model releases
for event photography before public campaigns or paid media use.
