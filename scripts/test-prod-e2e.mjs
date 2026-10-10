import assert from 'node:assert/strict';

const PROD_URL = 'https://techm4india-website.vercel.app';
const PASSWORD = process.env.ERP_TEST_PASSWORD;

const ROLES_TO_VERIFY = [
  { email: 'admin@techm4india.com', role: 'SUPER_ADMIN' },
  { email: 'ceo@techm4india.com', role: 'FOUNDER_CEO' },
  { email: 'founder@techm4india.com', role: 'FOUNDER_CEO' },
  { email: 'financemanager@techm4india.com', role: 'FINANCE_MANAGER' },
  { email: 'director@techm4india.com', role: 'DIRECTOR' },
  { email: 'hrmanager@techm4india.com', role: 'HR_MANAGER' },
  { email: 'salesmanager@techm4india.com', role: 'SALES_MANAGER' },
];

async function runProductionTests() {
  if (!PASSWORD) throw new Error('Set ERP_TEST_PASSWORD for an authorized test account before running this script.');
  console.log('=== VERIFYING LIVE VERCEL PRODUCTION DEPLOYMENT ===\n');
  console.log(`Target URL: ${PROD_URL}\n`);

  // 1. Homepage Check
  console.log('1. Checking Public Website (Homepage):');
  const homeRes = await fetch(PROD_URL);
  assert.equal(homeRes.status, 200, 'Homepage must return 200 OK');
  console.log('   ✓ Public Website is live and healthy (HTTP 200)\n');

  // 2. Login Page UI & Cleanliness Check
  console.log('2. Checking Official Login Page:');
  const loginRes = await fetch(`${PROD_URL}/login`);
  assert.equal(loginRes.status, 200, 'Login page must return 200 OK');
  const loginHtml = await loginRes.text();
  assert.ok(loginHtml.includes('Welcome back.'), 'Should have "Welcome back." heading');
  assert.ok(!loginHtml.includes('Switch Persona'), 'Must NOT have Switch Persona on /login');
  assert.ok(!loginHtml.includes('Quick Role Testing'), 'Must NOT have Quick Role Testing on /login');
  assert.ok(!loginHtml.includes('Demo Credentials'), 'Must NOT have Demo Credentials on /login');
  assert.ok(!loginHtml.includes('Preview Workspace'), 'Must NOT have Preview Workspace button');
  console.log('   ✓ Login page is 100% clean, professional, and free of banners/test matrix\n');

  // 3. Client JS Bundle Architecture Check
  console.log('3. Inspecting Client JS Chunks on Production:');
  const scriptRegex = /<script\s+[^>]*src=["']([^"']+)["']/gi;
  let scriptMatch;
  const scriptUrls = [];
  while ((scriptMatch = scriptRegex.exec(loginHtml)) !== null) {
    scriptUrls.push(scriptMatch[1]);
  }
  assert.ok(scriptUrls.length > 0, 'Should load scripts on login page');
  console.log(`   ✓ Found ${scriptUrls.length} script tags on /login`);

  // 4. Invalid Password Handling
  console.log('4. Testing Invalid Password via Vercel Edge Proxy (/api/v1/auth/login):');
  const badRes = await fetch(`${PROD_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@techm4india.com', password: 'InvalidPassword123!' }),
  });
  assert.equal(badRes.status, 401, 'Invalid password must return HTTP 401');
  const badData = await badRes.json();
  assert.equal(badData.success, false);
  console.log('   ✓ Rejected correctly with HTTP 401 Unauthorized\n');

  // 5. Valid Logins & Token Session Verification
  console.log('5. Testing Live Enterprise Logins via Vercel Edge Proxy:');
  for (const { email, role } of ROLES_TO_VERIFY) {
    const loginAttempt = await fetch(`${PROD_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: PASSWORD }),
    });
    assert.equal(loginAttempt.status, 201, `Login for ${email} must return HTTP 201`);
    const authData = await loginAttempt.json();
    assert.ok(authData.success, `Login for ${email} should succeed`);
    assert.ok(authData.data.accessToken, 'Should return access token');

    const roleCodes = authData.data.user.roles.map((r) => (typeof r === 'string' ? r : r.role?.code || r.code));
    assert.ok(roleCodes.includes(role), `Expected role ${role} for ${email}`);
    console.log(`   ✓ ${email} -> Logged in as ${role} (${authData.data.employee.firstName} ${authData.data.employee.lastName})`);

    // Verify token on /auth/me
    const meAttempt = await fetch(`${PROD_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${authData.data.accessToken}` },
    });
    assert.equal(meAttempt.status, 200, '/auth/me must return 200 with Bearer token');
    const meData = await meAttempt.json();
    assert.equal(meData.data.user.email, email);
  }
  console.log('   ✓ All test personas verified with Bearer authorization\n');

  // 6. ERP Shell Check
  console.log('6. Checking ERP Workspace Route (/erp):');
  const erpRes = await fetch(`${PROD_URL}/erp`);
  assert.equal(erpRes.status, 200, '/erp must return 200 OK');
  console.log('   ✓ ERP workspace shell is live and accessible\n');

  console.log('====================================================');
  console.log('🎉 ALL VERCEL PRODUCTION VERIFICATION TESTS PASSED!');
  console.log('====================================================');
}

runProductionTests().catch((err) => {
  console.error('PRODUCTION VERIFICATION FAILED:', err);
  process.exit(1);
});
