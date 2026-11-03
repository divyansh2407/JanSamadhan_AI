/**
 * JanSamadhan – Stage 13 Automated Verification Test Suite
 * Comprehensive testing of City Analytics & Civic Impact Measurement:
 * - Unauthenticated request blocking
 * - City-wide aggregate overview metrics
 * - Civic issues category distribution
 * - Civic issues status distribution
 * - Department resolution workload and task capacity
 * - Multi-stakeholder collaboration progression statistics
 * - Proposal workflow metrics
 * - Environmental & civic engagement impact indicators
 * - Numerical data validity verification
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

async function runStage13Tests() {
  console.log('\n===============================================================');
  console.log('  JANSAMADHAN STAGE 13: CIVIC ANALYTICS & IMPACT MEASUREMENT');
  console.log('===============================================================\n');

  const officerToken = generateToken({
    id: '22222222-2222-4222-a222-222222222222',
    email: 'officer@punecorporation.gov.in',
    role: 'GOVERNMENT',
    name: 'Municipal Commissioner',
  });

  // 1. Unauthenticated request to overview
  const unauthRes = await request(app, {
    method: 'GET',
    url: '/api/analytics/overview',
  });
  assert(unauthRes.statusCode === 401, 'Unauthenticated request to /api/analytics/overview returns 401');

  // 2. Overview metrics
  const overviewRes = await request(app, {
    method: 'GET',
    url: '/api/analytics/overview',
    headers: { Authorization: `Bearer ${officerToken}` },
  });
  assert(
    overviewRes.statusCode === 200 && overviewRes.body.success === true,
    'City-wide overview analytics endpoint returns 200 OK'
  );
  assert(
    typeof overviewRes.body.data.totalProblems === 'number' &&
      typeof overviewRes.body.data.resolutionRate === 'number' &&
      typeof overviewRes.body.data.resolved === 'number',
    'Overview metrics include valid quantitative totals and resolution rate percentage'
  );

  // 3. Category distribution
  const categoryRes = await request(app, {
    method: 'GET',
    url: '/api/analytics/issues/by-category',
    headers: { Authorization: `Bearer ${officerToken}` },
  });
  assert(
    categoryRes.statusCode === 200 && Array.isArray(categoryRes.body.data),
    'Issues by category endpoint returns structured distribution array'
  );

  // 4. Status distribution
  const statusRes = await request(app, {
    method: 'GET',
    url: '/api/analytics/issues/by-status',
    headers: { Authorization: `Bearer ${officerToken}` },
  });
  assert(
    statusRes.statusCode === 200 && Array.isArray(statusRes.body.data),
    'Issues by status returns distribution breakdown'
  );

  // 5. Department performance
  const deptPerfRes = await request(app, {
    method: 'GET',
    url: '/api/analytics/departments/performance',
    headers: { Authorization: `Bearer ${officerToken}` },
  });
  assert(
    deptPerfRes.statusCode === 200 && Array.isArray(deptPerfRes.body.data),
    'Department workload and task capacity endpoint returns structured metrics'
  );

  // 6. Collaboration metrics
  const collabRes = await request(app, {
    method: 'GET',
    url: '/api/analytics/collaborations',
    headers: { Authorization: `Bearer ${officerToken}` },
  });
  assert(
    collabRes.statusCode === 200 && Array.isArray(collabRes.body.data),
    'Collaboration status analytics returns array'
  );

  // 7. Proposal metrics
  const proposalRes = await request(app, {
    method: 'GET',
    url: '/api/analytics/proposals',
    headers: { Authorization: `Bearer ${officerToken}` },
  });
  assert(
    proposalRes.statusCode === 200 && Array.isArray(proposalRes.body.data),
    'Solution proposal status analytics returns array'
  );

  // 8. Impact & citizen satisfaction indicators
  const impactRes = await request(app, {
    method: 'GET',
    url: '/api/analytics/impact',
    headers: { Authorization: `Bearer ${officerToken}` },
  });
  assert(
    impactRes.statusCode === 200 && impactRes.body.success === true,
    'Civic impact indicators and satisfaction score endpoint returns 200'
  );
  assert(
    typeof impactRes.body.data.verifiedResolvedIssues === 'number' &&
      typeof impactRes.body.data.citizenSatisfactionAvg === 'number',
    'Impact metrics include verified resolution volume and citizen satisfaction index'
  );

  console.log('\n===============================================================');
  console.log(`  STAGE 13 TESTS COMPLETE: ${passedTests}/${totalTests} PASSED`);
  console.log('===============================================================\n');

  if (passedTests < totalTests) {
    process.exit(1);
  }
}

runStage13Tests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});

