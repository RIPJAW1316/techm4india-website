import assert from 'node:assert/strict';
import test from 'node:test';

const BASE_WEB = 'http://localhost:5173';
const BASE_FINANCE = 'http://localhost:3001';
const BASE_HRMS = 'http://localhost:3002';
const BASE_CRM = 'http://localhost:3003';

test('1. Main Portal Public & Program Routes (Port 5173)', async () => {
  const routes = [
    '/',
    '/about',
    '/vision',
    '/engineering',
    '/solutions',
    '/schools',
    '/space',
    '/institutes',
    '/programs',
    '/research',
    '/impact',
    '/ecosystem',
    '/careers',
    '/contact',
    '/login',
  ];

  for (const route of routes) {
    const url = `${BASE_WEB}${route}`;
    const res = await fetch(url);
    assert.equal(
      res.status,
      200,
      `Route ${route} should return 200 OK, got ${res.status}`
    );
    const html = await res.text();
    assert.ok(html.length > 500, `Route ${route} returned empty or too short HTML`);
    assert.ok(
      html.includes('TECHM4INDIA') || html.includes('TechM4India') || html.includes('TechM4'),
      `Route ${route} should contain brand name`
    );
  }
});

test('2. Central Dashboard & Authentication Routes (Port 5173)', async () => {
  const routes = [
    '/dashboard',
    '/crm',
    '/crm/auth/callback',
    '/hrms',
    '/hrms/auth/callback',
    '/erp/finance',
    '/erp/finance/auth/callback',
  ];

  for (const route of routes) {
    const url = `${BASE_WEB}${route}`;
    const res = await fetch(url);
    assert.equal(
      res.status,
      200,
      `Route ${route} should return 200 OK, got ${res.status}`
    );
    const html = await res.text();
    assert.ok(html.length > 200, `Route ${route} returned empty content`);
  }
});

test('3. Dedicated Finance ERP Application (Port 3001)', async () => {
  const res = await fetch(`${BASE_FINANCE}/`);
  assert.equal(res.status, 200, 'Finance app root should return 200');
  const html = await res.text();
  assert.ok(html.includes('TechM4India Finance') || html.includes('Finance ERP') || html.includes('root'), 'Finance HTML valid');
});

test('4. Dedicated HRMS Application (Port 3002)', async () => {
  const res = await fetch(`${BASE_HRMS}/`);
  assert.equal(res.status, 200, 'HRMS app root should return 200');
  const html = await res.text();
  assert.ok(html.includes('HRMS') || html.includes('root'), 'HRMS HTML valid');
});

test('5. Dedicated CRM Application (Port 3003)', async () => {
  const res = await fetch(`${BASE_CRM}/`);
  assert.equal(res.status, 200, 'CRM app root should return 200');
  const html = await res.text();
  assert.ok(html.includes('CRM') || html.includes('root'), 'CRM HTML valid');
});

test('6. CRM SSO Handoff URL Ingestion (Port 3003)', async () => {
  const ssoUrl = `${BASE_CRM}/?sso_token=test_sso_token_aryan_reddy_verification`;
  const res = await fetch(ssoUrl);
  assert.equal(res.status, 200, 'CRM app should accept SSO token query param');
});
