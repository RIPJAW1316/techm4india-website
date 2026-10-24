import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const hrmsRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(hrmsRoot, '../..');

test('HRMS Independent Application Architecture & Configuration', async (t) => {
  await t.test('apps/hrms/package.json exists with independent scripts', () => {
    const pkgPath = path.join(hrmsRoot, 'package.json');
    assert.equal(fs.existsSync(pkgPath), true, 'package.json must exist in apps/hrms');

    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    assert.equal(pkg.name, '@techm4india/hrms');
    assert.ok(pkg.scripts.dev.includes('3002'), 'Dev script must target port 3002');
    assert.ok(pkg.scripts.build, 'Build script must exist');
    assert.ok(pkg.scripts.test, 'Test script must exist');
  });

  await t.test('apps/hrms/vite.config.ts configures dedicated port 3002 and proxy', () => {
    const configPath = path.join(hrmsRoot, 'vite.config.ts');
    assert.equal(fs.existsSync(configPath), true, 'vite.config.ts must exist');

    const content = fs.readFileSync(configPath, 'utf8');
    assert.match(content, /3002/, 'Must configure default port 3002');
    assert.match(content, /\/api/, 'Must configure /api backend proxy');
    assert.match(content, /next\/link/, 'Must configure Next.js compatibility shims');
    assert.match(content, /next\/navigation/, 'Must configure Next.js navigation shims');
  });

  await t.test('apps/hrms/src entry point and routing shell exist', () => {
    assert.equal(fs.existsSync(path.join(hrmsRoot, 'index.html')), true);
    assert.equal(fs.existsSync(path.join(hrmsRoot, 'src/main.tsx')), true);
    assert.equal(fs.existsSync(path.join(hrmsRoot, 'src/App.tsx')), true);
    assert.equal(fs.existsSync(path.join(hrmsRoot, 'src/shims/next-link.tsx')), true);
    assert.equal(fs.existsSync(path.join(hrmsRoot, 'src/shims/next-navigation.tsx')), true);
  });
});

test('HRMS Route Resolution & Deep Link Independence', async (t) => {
  const appContent = fs.readFileSync(path.join(hrmsRoot, 'src/App.tsx'), 'utf8');

  const requiredRoutes = [
    '/employees',
    '/attendance',
    '/leave',
    '/payroll',
    '/claims',
    '/documents',
    '/incidents',
    '/announcements',
    '/reports',
    '/settings',
    '/auth/callback',
  ];

  for (const route of requiredRoutes) {
    await t.test(`App.tsx router handles route "${route}" independently`, () => {
      assert.match(appContent, new RegExp(route.replace('/', '\\/')), `Route ${route} must be handled`);
    });
  }

  await t.test('App.tsx supports both clean subdomain routes and legacy /hrms prefix', () => {
    assert.match(appContent, /normalizedPath\.startsWith\('\/hrms'\)/);
  });
});

test('OIDC SSO Client Registration for Port 3002 & Subdomain', async (t) => {
  const oidcServicePath = path.join(repoRoot, 'apps/api/src/modules/auth/oidc.service.ts');
  const oidcContent = fs.readFileSync(oidcServicePath, 'utf8');

  await t.test('OIDC registered redirect URIs include localhost:3002', () => {
    assert.match(oidcContent, /http:\/\/localhost:3002\/auth\/callback/);
    assert.match(oidcContent, /http:\/\/localhost:3002\/hrms\/auth\/callback/);
  });

  await t.test('OIDC registered redirect URIs include production subdomain https://hrms.techm4india.com', () => {
    assert.match(oidcContent, /https:\/\/hrms\.techm4india\.com\/auth\/callback/);
    assert.match(oidcContent, /https:\/\/hrms\.techm4india\.com\/hrms\/auth\/callback/);
  });
});

test('Cross-Origin & CORS Security Hardening', async (t) => {
  const mainTsPath = path.join(repoRoot, 'apps/api/src/main.ts');
  const mainTsContent = fs.readFileSync(mainTsPath, 'utf8');

  await t.test('Backend CORS explicitly approves port 3002 and production subdomain', () => {
    assert.match(mainTsContent, /http:\/\/localhost:3002/);
    assert.match(mainTsContent, /https:\/\/hrms\.techm4india\.com/);
  });

  await t.test('Backend CORS rejects unapproved production origins', () => {
    assert.match(mainTsContent, /CORS rejected for unauthorized origin/);
  });
});

test('Bundle & Environment Secret Leakage Check', async (t) => {
  const envExample = fs.readFileSync(path.join(hrmsRoot, '.env.example'), 'utf8');

  await t.test('Environment template contains zero secrets or database credentials', () => {
    assert.doesNotMatch(envExample, /DATABASE_URL=postgres/);
    assert.doesNotMatch(envExample, /JWT_SECRET=/);
    assert.doesNotMatch(envExample, /password/i);
  });

  await t.test('Independent production build output exists and is valid', () => {
    const distHtml = path.join(hrmsRoot, 'dist/index.html');
    assert.equal(fs.existsSync(distHtml), true, 'dist/index.html must exist after build');
    const htmlContent = fs.readFileSync(distHtml, 'utf8');
    assert.match(htmlContent, /TechM4India HRMS/);
    assert.match(htmlContent, /assets\/index/);
  });
});
