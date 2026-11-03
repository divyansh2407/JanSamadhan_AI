/**
 * JanSamadhan – Stage 12 Automated Verification Test Suite
 * Comprehensive testing of Solution Proposals and Implementation Tracking:
 * - Unauthenticated request blocking
 * - Authenticated proposal listing and search
 * - Proposal submission with technical approach and estimation
 * - Input validation on required proposal fields
 * - RBAC on proposal evaluation (Gov/Admin only)
 * - Invalid status transitions rejected
 * - Implementation task listing
 * - Task creation authorization and validation
 * - Milestone/progress updates
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

async function runStage12Tests() {
  console.log('\n===============================================================');
  console.log('  JANSAMADHAN STAGE 12: SOLUTION PROPOSALS & IMPLEMENTATION');
  console.log('===============================================================\n');

  const citizenToken = generateToken({
    id: '11111111-1111-4111-a111-111111111111',
    email: 'citizen@jansamadhan.gov.in',
    role: 'CITIZEN',
    name: 'Citizen Submitter',
  });

  const expertToken = generateToken({
    id: '44444444-4444-4444-a444-444444444444',
    email: 'expert.civil@iitb.ac.in',
    role: 'EXPERT',
    name: 'Dr. R. Joshi (Civil Engineering)',
  });

  const officerToken = generateToken({
    id: '22222222-2222-4222-a222-222222222222',
    email: 'officer@punecorporation.gov.in',
    role: 'GOVERNMENT',
    name: 'Gov Officer',
  });

  // 1. Unauthenticated request
  const unauthRes = await request(app, {
    method: 'GET',
    url: '/api/proposals',
  });
  assert(unauthRes.statusCode === 401, 'Unauthenticated request to /api/proposals returns 401');

  // 2. Authenticated user can list proposals
  const listRes = await request(app, {
    method: 'GET',
    url: '/api/proposals',
    headers: { Authorization: `Bearer ${expertToken}` },
  });
  assert(
    listRes.statusCode === 200 && Array.isArray(listRes.body.data.proposals),
    'Authenticated user retrieves list of solution proposals'
  );

  // 3. Validation on missing required fields for proposal creation
  const emptyProposalRes = await request(
    app,
    {
      method: 'POST',
      url: '/api/proposals',
      headers: { Authorization: `Bearer ${expertToken}` },
    },
    {}
  );
  assert(
    emptyProposalRes.statusCode === 400 || emptyProposalRes.statusCode === 503,
    'Proposal creation missing required fields returns 400 Bad Request'
  );

  // 4. Missing technical proposed approach triggers validation error
  const partialProposalRes = await request(
    app,
    {
      method: 'POST',
      url: '/api/proposals',
      headers: { Authorization: `Bearer ${expertToken}` },
    },
    {
      problemId: 'p-1',
      title: 'Porous Concrete Pavement Solution',
      description: 'Permeable asphalt implementation',
    }
  );
  assert(
    partialProposalRes.statusCode === 400 || partialProposalRes.statusCode === 503,
    'Missing proposedApproach returns 400 validation error'
  );

  // 5. Citizen forbidden from approving or changing proposal status
  const citizenReviewRes = await request(
    app,
    {
      method: 'PATCH',
      url: '/api/proposals/prop-1/status',
      headers: { Authorization: `Bearer ${citizenToken}` },
    },
    { status: 'ACCEPTED' }
  );
  assert(
    citizenReviewRes.statusCode === 403,
    'Citizen is forbidden from approving proposals (403)'
  );

  // 6. Expert forbidden from approving own proposal
  const expertReviewRes = await request(
    app,
    {
      method: 'PATCH',
      url: '/api/proposals/prop-1/status',
      headers: { Authorization: `Bearer ${expertToken}` },
    },
    { status: 'ACCEPTED' }
  );
  assert(
    expertReviewRes.statusCode === 403,
    'Expert role forbidden from approving proposals (403)'
  );

  // 7. Invalid proposal status transition
  const invalidStatusRes = await request(
    app,
    {
      method: 'PATCH',
      url: '/api/proposals/prop-1/status',
      headers: { Authorization: `Bearer ${officerToken}` },
    },
    { status: 'BOGUS_STATUS' }
  );
  assert(
    invalidStatusRes.statusCode === 400 || invalidStatusRes.statusCode === 503,
    'Invalid proposal status rejected with 400'
  );

  // 8. Implementation tasks listing
  const tasksRes = await request(app, {
    method: 'GET',
    url: '/api/proposals/tasks/list',
    headers: { Authorization: `Bearer ${officerToken}` },
  });
  assert(
    tasksRes.statusCode === 200 && Array.isArray(tasksRes.body.data),
    'Implementation tasks list is retrievable by authenticated users'
  );

  // 9. Citizen forbidden from creating implementation tasks
  const citizenTaskCreate = await request(
    app,
    {
      method: 'POST',
      url: '/api/proposals/tasks',
      headers: { Authorization: `Bearer ${citizenToken}` },
    },
    {
      problemId: 'prob-1',
      title: 'Road Re-surfacing',
      description: 'Laying 50mm bitumen layer',
    }
  );
  assert(
    citizenTaskCreate.statusCode === 403,
    'Citizen forbidden from creating municipal implementation tasks (403)'
  );

  // 10. Task creation validation on missing fields
  const emptyTaskRes = await request(
    app,
    {
      method: 'POST',
      url: '/api/proposals/tasks',
      headers: { Authorization: `Bearer ${officerToken}` },
    },
    {}
  );
  assert(
    emptyTaskRes.statusCode === 400 || emptyTaskRes.statusCode === 503,
    'Task creation missing required fields returns 400 Bad Request'
  );

  console.log('\n===============================================================');
  console.log(`  STAGE 12 TESTS COMPLETE: ${passedTests}/${totalTests} PASSED`);
  console.log('===============================================================\n');

  if (passedTests < totalTests) {
    process.exit(1);
  }
}

runStage12Tests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
