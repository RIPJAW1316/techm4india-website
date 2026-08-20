# TechM4India — Vercel deployment

This copy has been adapted from the original Vinext + Cloudflare development setup to Vinext + Nitro for Vercel.

## Vercel settings

- Root directory: project root (the folder containing `package.json`)
- Build command: `npm run build`
- Output directory: `.output`
- Install command: `npm install`
- Node.js: 22.x or newer (the project requires Node >= 22.13.0)

The included `vercel.json` already provides the build/output/install settings.

## Local check

```bash
npm install
npm run build
```

For a Vercel-specific local Nitro build you can also run:

```bash
NITRO_PRESET=vercel npm run build
```

On Vercel, Nitro auto-detects the Vercel environment.
