# TechM4India Website Deployment

## Production Architecture

```text
Browser / Client
      │
      ▼
www.techm4india.com (Vercel)
Static Vinext React 19 Frontend
```

The TechM4India website is deployed on Vercel as a high-performance static React 19 / Vinext site.

## Build and Output

- **Build Command**: `npx vinext build`
- **Output Directory**: `dist/client`
- **Routing**: Static export configured in `vercel.json` with clean URLs and redirects for legacy routes.
- **Node.js**: >= 22.13.0
