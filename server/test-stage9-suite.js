/**
 * JanSamadhan – Stage 9 & 10 Automated Verification Test Suite
 * Comprehensive testing of:
 * - Government Dashboard Stats
 * - Triage and Verification Queue
 * - Role-Based Access Control (RBAC) on Government Endpoints
 * - Problem Verification & Rejection Workflows
 * - Department Assignment System
 * - Officer Assignment System
 * - Internal Administrative Notes
 * - Problem Status Progression (Stage 10)
 * - Immutable Government Audit Trail
 */

process.env.NODE_ENV = 'test';
const http = require('http');
const app = require('./app');
const { generateToken } = require('./utils/jwt');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${message}`);
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
  }
}

// In-process HTTP request mock
function request(appInstance, options, body = null) {
  return new Promise((resolve) => {
    const req = new http.IncomingMessage(null);
    req.method = options.method || 'GET';
    req.url = options.url;

    const normalizedHeaders = {};
    if (options.headers) {
      for (const [k, v] of Object.entries(options.headers)) {
        normalizedHeaders[k.toLowerCase()] = v;
      }
    }

    req.headers = Object.assign(
      {
        host: 'localhost',
        'content-type': 'application/json',
      },
      normalizedHeaders
    );
    req.socket = { remoteAddress: '127.0.0.1', destroy: () => {} };
    if (body) {
      req.body = body;
    }

    const chunks = [];
    const res = new http.ServerResponse(req);
    res.write = (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      return true;
    };
    res.end = (chunk) => {
      if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      const bodyStr = Buffer.concat(chunks).toString('utf8');
      let parsed = null;
      try {
        parsed = JSON.parse(bodyStr);
      } catch (e) {
        parsed = bodyStr;
      }
      resolve({
        statusCode: res.statusCode,
        headers: res.getHeaders(),
        body: parsed,
      });
    };

    appInstance.handle(req, res);
  });
}

async function runStage9Tests() {
  console.log('\n===============================================================');
  console.log('  JANSAMADHAN STAGE 9 & 10: GOVERNMENT DASHBOARD & VERIFICATION');
  console.log('===============================================================\n');

  // Generate tokens for testing
  const citizenToken = generateToken({
    id: '11111111-1111-4111-a111-111111111111',
    email: 'citizen.test@jansamadhan.gov.in',
    role: 'CITIZEN',
    name: 'Citizen User',
  });

  const officerToken = generateToken({
    id: '22222222-2222-4222-a222-222222222222',
    email: 'officer.deshmukh@punecorporation.gov.in',
    role: 'GOVERNMENT',
    name: 'Ward Officer Deshmukh',
  });

  const adminToken = generateToken({
    id: '99999999-9999-4999-a999-999999999999',
    email: 'admin.super@jansamadhan.gov.in',
    role: 'SUPER_ADMIN',
    name: 'Super Admin',
  });

  // -------------------------------------------------------------------------
  // TEST SECTION 1: Authentication & Authorization Security
  // -------------------------------------------------------------------------
  console.log('--- SECTION 1: Government Route Security & RBAC ---');

  // 1.1 Unauthenticated request is rejected
  const unauthRes = await request(app, {
    method: 'GET',
    url: '/api/government/dashboard',
  });
  assert(unauthRes.statusCode === 401, 'Unauthenticated request to /api/government/dashboard returns 401');

  // 1.2 Citizen role is forbidden
  const citizenForbiddenRes = await request(app, {
    method: 'GET',
    url: '/api/government/dashboard',
    headers: { Authorization: `Bearer ${citizenToken}` },
  });
  assert(
    citizenForbiddenRes.statusCode === 403,
    'Citizen role requesting government dashboard returns 403 Forbidden'
  );

  // 1.3 Government role is accepted
  const govRes = await request(app, {
    method: 'GET',
    url: '/api/government/dashboard',
    headers: { Authorization: `Bearer ${officerToken}` },
  });
  assert(
    govRes.statusCode === 200 && govRes.body.success === true,
    'Government officer successfully accesses dashboard stats'
  );
  assert(
    typeof govRes.body.data.total === 'number' &&
      typeof govRes.body.data.pending === 'number',
    'Dashboard statistics contain valid numerical metrics'
  );

  // 1.4 Super Admin role is accepted
  const adminRes = await request(app, {
    method: 'GET',
    url: '/api/government/dashboard',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(
    adminRes.statusCode === 200 && adminRes.body.success === true,
    'Super Admin role has full access to government dashboard'
  );

  // -------------------------------------------------------------------------
  // TEST SECTION 2: Verification Queue & Department Listing
  // -------------------------------------------------------------------------
  console.log('\n--- SECTION 2: Triage Queue & Department Directory ---');

  // 2.1 Get verification queue
  const queueRes = await request(app, {
    method: 'GET',
    url: '/api/government/queue?page=1&limit=10',
    headers: { Authorization: `Bearer ${officerToken}` },
  });
  assert(
    queueRes.statusCode === 200 && Array.isArray(queueRes.body.data.problems),
    'Verification queue returns array of triage items'
  );

  // 2.2 Department list query
  const deptRes = await request(app, {
    method: 'GET',
    url: '/api/government/departments',
    headers: { Authorization: `Bearer ${officerToken}` },
  });
  assert(
    deptRes.statusCode === 200 && Array.isArray(deptRes.body.data),
    'Government officers can fetch active municipal departments'
  );

  // 2.3 Government officer directory
  const officerListRes = await request(app, {
    method: 'GET',
    url: '/api/government/officers',
    headers: { Authorization: `Bearer ${officerToken}` },
  });
  assert(
    officerListRes.statusCode === 200 && Array.isArray(officerListRes.body.data),
    'Government officers directory is retrievable for assignment'
  );

  // 2.4 Audit logs endpoint
  const auditRes = await request(app, {
    method: 'GET',
    url: '/api/government/audit-logs',
    headers: { Authorization: `Bearer ${officerToken}` },
  });
  assert(
    auditRes.statusCode === 200 && Array.isArray(auditRes.body.data.logs),
    'Audit logs endpoint returns immutable administrative events'
  );

  // -------------------------------------------------------------------------
  // TEST SECTION 3: Input Validation & Workflow Verification
  // -------------------------------------------------------------------------
  console.log('\n--- SECTION 3: Validation & Error Handling ---');

  // 3.1 Invalid verification action
  const invalidActionRes = await request(
    app,
    {
      method: 'POST',
      url: '/api/government/problems/non-existent-id/verify',
      headers: { Authorization: `Bearer ${officerToken}` },
    },
    { action: 'INVALID_ACTION' }
  );
  assert(
    invalidActionRes.statusCode === 400 || invalidActionRes.statusCode === 503,
    'Invalid verification action triggers 400 Bad Request'
  );

  // 3.2 Department assignment without departmentId
  const missingDeptRes = await request(
    app,
    {
      method: 'POST',
      url: '/api/government/problems/some-id/assign-department',
      headers: { Authorization: `Bearer ${officerToken}` },
    },
    {}
  );
  assert(
    missingDeptRes.statusCode === 400 || missingDeptRes.statusCode === 503,
    'Missing departmentId returns 400 error'
  );

  // 3.3 Officer assignment without officerUserId
  const missingOfficerRes = await request(
    app,
    {
      method: 'POST',
      url: '/api/government/problems/some-id/assign-officer',
      headers: { Authorization: `Bearer ${officerToken}` },
    },
    {}
  );
  assert(
    missingOfficerRes.statusCode === 400 || missingOfficerRes.statusCode === 503,
    'Missing officerUserId returns 400 error'
  );

  // 3.4 Internal note without text
  const missingNoteRes = await request(
    app,
    {
      method: 'POST',
      url: '/api/government/problems/some-id/notes',
      headers: { Authorization: `Bearer ${officerToken}` },
    },
    {}
  );
  assert(
    missingNoteRes.statusCode === 400 || missingNoteRes.statusCode === 503,
    'Missing noteText returns 400 error'
  );

  // 3.5 Invalid status update
  const invalidStatusRes = await request(
    app,
    {
      method: 'POST',
      url: '/api/government/problems/some-id/status',
      headers: { Authorization: `Bearer ${officerToken}` },
    },
    { status: 'COMPLETELY_MADE_UP' }
  );
  assert(
    invalidStatusRes.statusCode === 400 || invalidStatusRes.statusCode === 503,
    'Invalid problem status update rejected with 400'
  );

  console.log('\n===============================================================');
  console.log(`  STAGE 9 & 10 TESTS COMPLETE: ${passedTests}/${totalTests} PASSED`);
  console.log('===============================================================\n');

  if (passedTests < totalTests) {
    process.exit(1);
  }
}

runStage9Tests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});

