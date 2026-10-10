import assert from 'node:assert/strict';

const BASE_URL = 'http://localhost:3000';
const PASSWORD = process.env.ERP_TEST_PASSWORD;

const ROLES_TO_TEST = [
  { email: 'admin@techm4india.com', expectedRole: 'SUPER_ADMIN' },
  { email: 'superadmin@techm4india.com', expectedRole: 'SUPER_ADMIN' },
  { email: 'ceo@techm4india.com', expectedRole: 'FOUNDER_CEO' },
  { email: 'founder@techm4india.com', expectedRole: 'FOUNDER_CEO' },
  { email: 'director@techm4india.com', expectedRole: 'DIRECTOR' },
  { email: 'divisionhead@techm4india.com', expectedRole: 'DIVISION_HEAD' },
  { email: 'hrmanager@techm4india.com', expectedRole: 'HR_MANAGER' },
  { email: 'hrexecutive@techm4india.com', expectedRole: 'HR_EXECUTIVE' },
  { email: 'financemanager@techm4india.com', expectedRole: 'FINANCE_MANAGER' },
  { email: 'financeexecutive@techm4india.com', expectedRole: 'FINANCE_EXECUTIVE' },
  { email: 'salesmanager@techm4india.com', expectedRole: 'SALES_MANAGER' },
  { email: 'salesexecutive@techm4india.com', expectedRole: 'SALES_EXECUTIVE' },
  { email: 'marketingmanager@techm4india.com', expectedRole: 'MARKETING_MANAGER' },
  { email: 'projectmanager@techm4india.com', expectedRole: 'PROJECT_MANAGER' },
  { email: 'faculty@techm4india.com', expectedRole: 'FACULTY_TRAINER' },
  { email: 'student@techm4india.com', expectedRole: 'STUDENT' },
  { email: 'institutionadmin@techm4india.com', expectedRole: 'INSTITUTION_ADMIN' },
  { email: 'contentmanager@techm4india.com', expectedRole: 'CONTENT_MANAGER' },
  { email: 'itadmin@techm4india.com', expectedRole: 'IT_ADMIN' },
  { email: 'vendor@techm4india.com', expectedRole: 'VENDOR' },
  { email: 'employee@techm4india.com', expectedRole: 'EMPLOYEE' },
  { email: 'viewer@techm4india.com', expectedRole: 'VIEWER' },
];

async function runTests() {
  if (!PASSWORD) throw new Error('Set ERP_TEST_PASSWORD for a local test account before running this script.');
  console.log('=== STARTING LOCAL END-TO-END VERIFICATION ===\n');

  // Test 1: Check login page renders
  console.log('1. Testing GET /login HTML:');
  const loginRes = await fetch(`${BASE_URL}/login`);
  assert.equal(loginRes.status, 200, 'Login page should return 200 OK');
  const loginHtml = await loginRes.text();
  assert.ok(loginHtml.includes('Welcome back.'), 'Should have "Welcome back." heading');
  assert.ok(!loginHtml.includes('Switch Persona'), 'Should NOT have persona switcher on /login');
  assert.ok(!loginHtml.includes('Quick Role Testing'), 'Should NOT have test matrix on /login');
  console.log('   ✓ Login page is clean, professional, and returns HTTP 200\n');

  // Test 2: Test invalid credentials via proxy
  console.log('2. Testing invalid password via /api/v1/auth/login (Vite Proxy):');
  const invalidRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@techm4india.com', password: 'WrongPassword123!' }),
  });
  assert.equal(invalidRes.status, 401, 'Invalid login must return 401');
  const invalidBody = await invalidRes.json();
  assert.equal(invalidBody.success, false, 'Invalid response success must be false');
  console.log('   ✓ Correctly rejected with HTTP 401 Unauthorized\n');

  // Test 3: Test valid logins for multiple roles via proxy
  console.log('3. Testing valid role logins via /api/v1/auth/login (Vite Proxy):');
  for (const { email, expectedRole } of ROLES_TO_TEST) {
    const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: PASSWORD }),
    });
    assert.equal(res.status, 201, `Login for ${email} should return 201`);
    const data = await res.json();
    assert.ok(data.success, `Login for ${email} should succeed`);
    assert.ok(data.data.accessToken, 'Should return access token');
    const roleCodes = data.data.user.roles.map((r) => typeof r === "string" ? r : r.role?.code || r.code);
    assert.ok(roleCodes.includes(expectedRole), `User ${email} should have role ${expectedRole}`);
    console.log(`   ✓ ${email} -> Logged in successfully as ${expectedRole} (${data.data.employee.firstName} ${data.data.employee.lastName})`);

    // Test 4: Verify authenticated session using access token
    const meRes = await fetch(`${BASE_URL}/api/v1/auth/me`, {
      headers: {
        'Authorization': `Bearer ${data.data.accessToken}`,
      },
    });
    assert.equal(meRes.status, 200, `/auth/me should return 200 with valid Bearer token`);
    const meData = await meRes.json();
    assert.equal(meData.data.user.email, email);
  }
  console.log('   ✓ Bearer token authentication verified on /auth/me for all roles\n');

  console.log('=== ALL LOCAL END-TO-END TESTS PASSED SUCCESSFULLY! ===');
}

runTests().catch((err) => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
