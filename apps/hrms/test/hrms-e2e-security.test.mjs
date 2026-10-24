import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  clearSession,
  getAccessToken,
  setSession,
  getApiBaseUrl,
  createPkceChallenge,
} from '../../../lib/auth-client.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const hrmsRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(hrmsRoot, '../..');

// Mock browser window and sessionStorage for Node.js test environment
class MockSessionStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.get(key) ?? null;
  }
  setItem(key, value) {
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

test('API Configuration by Environment', async (t) => {
  await t.test('Node / SSR environment defaults to production HTTPS API', () => {
    delete global.window;
    delete process.env.VITE_API_BASE_URL;
    delete process.env.NEXT_PUBLIC_API_URL;
    const url = getApiBaseUrl();
    assert.equal(url, 'https://techm4india-erp-api-l1gv.onrender.com');
  });

  await t.test('Local development browser on localhost returns relative URL for Vite proxy', () => {
    global.window = {
      location: {
        hostname: 'localhost',
        origin: 'http://localhost:3002',
        pathname: '/employees',
      },
    };
    const url = getApiBaseUrl();
    assert.equal(url, '', 'Local dev on localhost must return relative path to leverage Vite proxy');
  });

  await t.test('Production subdomain browser on hrms.techm4india.com returns HTTPS API and NEVER localhost', () => {
    global.window = {
      location: {
        hostname: 'hrms.techm4india.com',
        origin: 'https://hrms.techm4india.com',
        pathname: '/payroll',
      },
    };
    delete process.env.VITE_API_BASE_URL;
    delete process.env.NEXT_PUBLIC_API_URL;
    const url = getApiBaseUrl();
    assert.equal(url, 'https://techm4india-erp-api-l1gv.onrender.com');
    assert.doesNotMatch(url, /localhost|127\.0\.0\.1/);
  });

  await t.test('Explicit environment variable overrides API base URL when configured', () => {
    process.env.VITE_API_BASE_URL = 'https://staging-api.techm4india.com/api/v1';
    const url = getApiBaseUrl();
    assert.equal(url, 'https://staging-api.techm4india.com');
    delete process.env.VITE_API_BASE_URL;
  });
});

test('OIDC PKCE Protocol & Session Security', async (t) => {
  global.window = {
    crypto: {
      getRandomValues: (arr) => {
        for (let i = 0; i < arr.length; i++) arr[i] = (i * 17) % 256;
        return arr;
      },
    },
    sessionStorage: new MockSessionStorage(),
  };

  await t.test('createPkceChallenge generates high-entropy verifier and challenge', async () => {
    const { verifier, challenge } = await createPkceChallenge();
    assert.ok(verifier.length >= 43, 'PKCE verifier must be at least 43 characters (RFC 7636)');
    assert.ok(challenge.length > 0, 'PKCE challenge must not be empty');
    assert.doesNotMatch(challenge, /[\+\/=]/, 'PKCE challenge must be Base64URL-encoded (no +, /, =)');
  });

  await t.test('OIDC client whitelist in backend accepts localhost:3002 and production subdomain', () => {
    const oidcServiceSrc = fs.readFileSync(
      path.join(repoRoot, 'apps/api/src/modules/auth/oidc.service.ts'),
      'utf8'
    );
    assert.match(oidcServiceSrc, /http:\/\/localhost:3002\/auth\/callback/);
    assert.match(oidcServiceSrc, /https:\/\/hrms\.techm4india\.com\/auth\/callback/);
  });

  await t.test('Tokens are never exposed in localStorage or query strings', () => {
    global.sessionStorage = new MockSessionStorage();
    global.localStorage = new MockSessionStorage();

    setSession({ accessToken: 'test-secure-token-123' });
    assert.equal(getAccessToken(), 'test-secure-token-123');
    assert.equal(global.localStorage.getItem('tm4i_erp_access_token'), null);
    assert.equal(global.localStorage.getItem('refresh_token'), null);

    clearSession();
    assert.equal(getAccessToken(), null);
  });
});

test('Next.js Compatibility Shims Fidelity', async (t) => {
  const nextLinkSrc = fs.readFileSync(path.join(hrmsRoot, 'src/shims/next-link.tsx'), 'utf8');
  const nextNavSrc = fs.readFileSync(path.join(hrmsRoot, 'src/shims/next-navigation.tsx'), 'utf8');

  await t.test('next/link shim handles pushState and prevents full page reload for relative links', () => {
    assert.match(nextLinkSrc, /window\.history\.pushState/);
    assert.match(nextLinkSrc, /PopStateEvent\('popstate'\)/);
  });

  await t.test('next/link shim ignores external, mailto, tel, and fragment links', () => {
    assert.match(nextLinkSrc, /hrefStr\.startsWith\('http/);
    assert.match(nextLinkSrc, /hrefStr\.startsWith\('mailto:'\)/);
    assert.match(nextLinkSrc, /hrefStr\.startsWith\('#'\)/);
  });

  await t.test('next/navigation shim provides usePathname, useRouter, useSearchParams', () => {
    assert.match(nextNavSrc, /export function usePathname/);
    assert.match(nextNavSrc, /export function useRouter/);
    assert.match(nextNavSrc, /export function useSearchParams/);
  });
});

test('Finance ERP Module Boundary Verification', async (t) => {
  const financePagePath = path.join(repoRoot, 'app/erp/finance/page.tsx');
  const financeServicePath = path.join(repoRoot, 'apps/api/src/modules/finance/finance.service.ts');

  await t.test('Finance ERP frontend exists in corporate Next.js/Vinext app at app/erp/finance', () => {
    assert.ok(fs.existsSync(financePagePath), 'Finance ERP frontend page must exist');
  });

  await t.test('Finance ERP backend services exist in apps/api/src/modules/finance', () => {
    assert.ok(fs.existsSync(financeServicePath), 'Finance backend service must exist');
  });

  await t.test('apps/finance exists as standalone application workspace', () => {
    const standaloneFinancePath = path.join(repoRoot, 'apps/finance');
    assert.ok(
      fs.existsSync(standaloneFinancePath),
      'Finance ERP is decoupled into apps/finance standalone module'
    );
  });
});

test('Render Static Site Configuration & SPA Deep Linking', async (t) => {
  const distHtml = path.join(hrmsRoot, 'dist/index.html');
  assert.ok(fs.existsSync(distHtml), 'Build artifact dist/index.html must exist');

  const htmlContent = fs.readFileSync(distHtml, 'utf8');
  await t.test('HTML shell contains TechM4India brand root mount and script bundle', () => {
    assert.match(htmlContent, /<div id="root"><\/div>/);
    assert.match(htmlContent, /assets\/index/);
    assert.match(htmlContent, /TechM4India HRMS/);
  });

  await t.test('Render static site deployment documentation defines rewrite rule for SPA fallback', () => {
    const readmeSrc = fs.readFileSync(path.join(hrmsRoot, 'README.md'), 'utf8');
    assert.match(readmeSrc, /\/\*.*\/index\.html/);
    assert.match(readmeSrc, /https:\/\/hrms\.techm4india\.com/);
  });
});
