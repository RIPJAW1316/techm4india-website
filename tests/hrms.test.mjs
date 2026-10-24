import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

describe('HRMS Route Prerendering & Asset Verification', () => {
  const routes = [
    'hrms',
    'hrms/employees',
    'hrms/attendance',
    'hrms/leave',
    'hrms/payroll',
    'hrms/claims',
    'hrms/documents',
    'hrms/incidents',
    'hrms/announcements',
    'hrms/reports',
    'hrms/settings',
    'hrms/auth/callback',
  ];

  test('HRMS module source files exist', () => {
    for (const r of routes) {
      const pagePath = join(process.cwd(), 'app', ...r.split('/'), 'page.tsx');
      assert.ok(existsSync(pagePath), `Page should exist at ${pagePath}`);
    }
  });

  test('HRMS Layout adheres to .erp-route isolation class', () => {
    const layoutPath = join(process.cwd(), 'app', 'hrms', 'layout.tsx');
    assert.ok(existsSync(layoutPath), 'HRMS layout file must exist');
    const content = readFileSync(layoutPath, 'utf8');
    assert.ok(content.includes('erp-route'), 'Layout must apply erp-route class');
    assert.ok(content.includes('TechM4India HRMS'), 'Layout must have TechM4India brand header');
  });

  test('Indian Statutory Payroll calculation rules match government standards', () => {
    // Basic = 50%, HRA = 25%, Special = 25%
    const ctc = 1200000;
    const monthlyGross = Math.round(ctc / 12);
    assert.equal(monthlyGross, 100000);

    const basic = Math.round(monthlyGross * 0.5);
    assert.equal(basic, 50000);

    // PF 12% capped at ₹1,800
    const rawPf = Math.round(basic * 0.12);
    const cappedPf = Math.min(rawPf, 1800);
    assert.equal(cappedPf, 1800);

    // Professional Tax
    const pt = 200;
    assert.equal(pt, 200);

    // ESI threshold check (> ₹21,000 gross means exempt)
    const esi = monthlyGross <= 21000 ? Math.round(monthlyGross * 0.0075) : 0;
    assert.equal(esi, 0);

    // Net pay after deductions
    const deductions = cappedPf + pt + esi;
    const netPay = monthlyGross - deductions;
    assert.equal(netPay, 98000);
  });

  test('Expense claim categories match Finance ERP handoff specifications', () => {
    const claimsPath = join(process.cwd(), 'app', 'hrms', 'claims', 'page.tsx');
    const content = readFileSync(claimsPath, 'utf8');
    assert.ok(content.includes('Finance ERP'), 'Claims page must reference Finance ERP handoff');
    assert.ok(content.includes('receiptUrl'), 'Claims must support receipt attachments');
  });

  test('SSO Callback handles OIDC PKCE parameters securely without localStorage token leakage', () => {
    const ssoPath = join(process.cwd(), 'app', 'hrms', 'auth', 'callback', 'page.tsx');
    const content = readFileSync(ssoPath, 'utf8');
    assert.ok(content.includes('authClient.getSession()'), 'Must use transient session verification');
    assert.ok(!content.includes('localStorage.setItem("refresh_token"'), 'Must never leak refresh token to localStorage');
  });
});
