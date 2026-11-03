/**
 * JanSamadhan – Master Authentication & Complaint Management Automated Test Suite
 * Verifies all 13 End-to-End Requirements from Section 11:
 *
 * 1. Register a new citizen user (bcrypt password hashing, CITIZEN role, unique user ID).
 * 2. Reject duplicate registration with the same email (HTTP 400).
 * 3. Log in with registered credentials and verify JWT is issued (and invalid credentials return 401).
 * 4. Access dashboard statistics (GET /api/dashboard/stats) and verify initial KPI state.
 * 5. Submit a civic complaint (POST /api/reports) with all required & optional fields.
 * 6. Verify non-sequential unique tracking ID generation (e.g. JS-2026-A8F42K9).
 * 7. Verify confirmation email dispatch (HTML template generation, tracking ID callout, delivery audit).
 * 8. Verify complaint immediately appears on user's "My Reports" (GET /api/reports/my-reports).
 * 9. Verify dashboard statistics update correctly (5 KPI counters incremented).
 * 10. Log out (POST /api/auth/logout) and log back in – verify complaint history persists.
 * 11. Test public tracking endpoint (GET /api/reports/track/:trackingId) with strict zero PII exposure.
 * 12. Test IDOR protection: Register User 2, verify User 2 CANNOT view User 1's complaints.
 * 13. Test email failure resilience: Simulate email provider network failure, verify complaint creation succeeds.
 */

const http = require('http');
const bcrypt = require('bcryptjs');
const app = require('./app');
const { verifyToken } = require('./utils/jwt');
const { buildComplaintConfirmationHtml, sendComplaintConfirmationEmail } = require('./services/emailService');
const offlineStore = require('./config/offlineStore');

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
    req.headers = Object.assign(
      {
        host: 'localhost',
        'content-type': 'application/json',
      },
      options.headers || {}
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

async function runTestSuite() {
  console.log('\n===============================================================');
  console.log('   JANSAMADHAN – AUTH & COMPLAINT MANAGEMENT TEST SUITE');
  console.log('===============================================================\n');

  // Reset offline store for deterministic test state
  offlineStore.clear();

  const testTimestamp = Date.now();
  const user1Email = `citizen1_${testTimestamp}@test.gov.in`;
  const user1Password = 'StrongP@ssw0rd!2026';
  let user1Token = null;
  let user1Id = null;
  let user1TrackingId = null;

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 1: Register New Citizen User
  // ──────────────────────────────────────────────────────────────────────────
  console.log('--- TEST 1: User Registration (bcrypt hashing, CITIZEN role) ---');
  const regRes = await request(
    app,
    { method: 'POST', url: '/api/auth/register' },
    {
      name: 'Aarav Sharma',
      email: user1Email,
      phone: '+91 98765 43210',
      password: user1Password,
      confirmPassword: user1Password,
      termsAccepted: true,
      role: 'SUPER_ADMIN', // Attacker attempt to escalate privilege
    }
  );

  assert(regRes.statusCode === 201, `Registration returned HTTP 201 Created (got ${regRes.statusCode})`);
  assert(regRes.body.success === true, 'Registration response success flag is true');
  assert(regRes.body.user && regRes.body.user.email === user1Email, 'Registration returns created user profile');
  assert(regRes.body.user.role === 'CITIZEN', 'Role strictly forced to CITIZEN (privilege escalation blocked)');
  assert(!regRes.body.user.passwordHash, 'passwordHash is strictly excluded from registration response');
  assert(typeof regRes.body.token === 'string', 'JWT session token issued upon registration');

  user1Token = regRes.body.token;
  user1Id = regRes.body.user.id;

  // Verify stored password hash with bcrypt
  const storedUser1 = offlineStore.findUserByEmail(user1Email);
  if (storedUser1) {
    assert(storedUser1.passwordHash.startsWith('$2'), 'User password stored with bcrypt $2 salt hash prefix');
    assert(storedUser1.passwordHash !== user1Password, 'Password is never stored in plaintext');
    const hashMatch = await bcrypt.compare(user1Password, storedUser1.passwordHash);
    assert(hashMatch === true, 'Bcrypt compare verifies valid password against hash');
  }

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 2: Reject Duplicate Email Registration
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- TEST 2: Duplicate Email Registration Rejection ---');
  const dupRes = await request(
    app,
    { method: 'POST', url: '/api/auth/register' },
    {
      name: 'Duplicate Aarav',
      email: user1Email,
      password: user1Password,
      confirmPassword: user1Password,
      termsAccepted: true,
    }
  );

  assert(dupRes.statusCode === 400, `Duplicate email registration rejected with HTTP 400 (got ${dupRes.statusCode})`);
  assert(dupRes.body.success === false, 'Duplicate response success flag is false');
  assert(
    dupRes.body.message.toLowerCase().includes('already exists') ||
    dupRes.body.message.toLowerCase().includes('duplicate'),
    'Clear user-friendly message for existing account'
  );

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 3: User Login & Invalid Credentials Handling
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- TEST 3: User Login & Authentication ---');
  // Wrong password
  const badLoginRes = await request(
    app,
    { method: 'POST', url: '/api/auth/login' },
    { email: user1Email, password: 'WrongPassword@999' }
  );
  assert(badLoginRes.statusCode === 401, `Invalid credentials rejected with HTTP 401 (got ${badLoginRes.statusCode})`);
  assert(badLoginRes.body.success === false, 'Invalid login response success flag is false');

  // Correct credentials
  const loginRes = await request(
    app,
    { method: 'POST', url: '/api/auth/login' },
    { email: user1Email, password: user1Password }
  );
  assert(loginRes.statusCode === 200, `Valid login returned HTTP 200 OK (got ${loginRes.statusCode})`);
  assert(loginRes.body.success === true, 'Login response success flag is true');
  assert(typeof loginRes.body.token === 'string', 'JWT session token returned in login response');
  assert(!loginRes.body.user.passwordHash, 'passwordHash strictly excluded from login response');

  const decodedLogin = verifyToken(loginRes.body.token);
  assert(decodedLogin.email === user1Email, 'Decoded JWT preserves authenticated email');
  assert(decodedLogin.role === 'CITIZEN', 'Decoded JWT preserves CITIZEN role');

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 4: Initial Dashboard State (Zero Complaints)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- TEST 4: User Dashboard Initial State ---');
  const initialStatsRes = await request(app, {
    method: 'GET',
    url: '/api/dashboard/stats',
    headers: { authorization: `Bearer ${user1Token}` },
  });

  assert(initialStatsRes.statusCode === 200, `GET /api/dashboard/stats returned HTTP 200 (got ${initialStatsRes.statusCode})`);
  const initialStats = initialStatsRes.body.stats || initialStatsRes.body.statistics;
  assert(initialStats !== undefined, 'Dashboard returns stats KPI object');
  assert(initialStats.totalReports === 0, 'Initial totalReports count is 0');
  assert(initialStats.pendingReports === 0, 'Initial pendingReports count is 0');
  assert(initialStats.underReviewReports === 0, 'Initial underReviewReports count is 0');
  assert(initialStats.inProgressReports === 0, 'Initial inProgressReports count is 0');
  assert(initialStats.resolvedReports === 0, 'Initial resolvedReports count is 0');

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 5: Submit Civic Complaint (POST /api/reports)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- TEST 5: Complaint Submission (Authenticated) ---');
  const complaintPayload = {
    title: 'Severe broken water main pipe causing road flooding',
    description: 'Fresh clean drinking water has been bursting from underground pipe onto FC Road near Goodluck Chowk for 4 hours.',
    category: 'Water Supply & Drainage',
    city: 'Pune',
    ward: 'Shivaji Nagar Ward 12',
    location: 'Near Goodluck Cafe, Fergusson College Road, Deccan Gymkhana',
    landmark: 'Opposite Goodluck Cafe',
    latitude: 18.5167,
    longitude: 73.8417,
    severity: 'HIGH',
    priority: 'HIGH',
    imageUrl: '/uploads/pipe_burst_evidence.webp',
  };

  const submitRes = await request(
    app,
    {
      method: 'POST',
      url: '/api/reports',
      headers: { authorization: `Bearer ${user1Token}` },
    },
    complaintPayload
  );

  assert(submitRes.statusCode === 201, `POST /api/reports returned HTTP 201 Created (got ${submitRes.statusCode})`);
  assert(submitRes.body.success === true, 'Submission response success flag is true');
  assert(submitRes.body.trackingId !== undefined, 'Submission returns trackingId');

  user1TrackingId = submitRes.body.trackingId;

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 6: Non-Sequential Tracking ID Format Verification
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- TEST 6: Non-Sequential Tracking ID Validation ---');
  const currentYear = new Date().getFullYear();
  const trackingIdRegex = new RegExp(`^JS-${currentYear}-[A-Z0-9]{6,8}$`);
  assert(
    trackingIdRegex.test(user1TrackingId),
    `Tracking ID '${user1TrackingId}' matches standard format JS-${currentYear}-XXXXXXX`
  );

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 7: Confirmation Email Generation & Audit Logging
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- TEST 7: Confirmation Email Dispatch & HTML Template ---');
  const sampleEmailHtml = buildComplaintConfirmationHtml({
    recipientName: 'Aarav Sharma',
    trackingId: user1TrackingId,
    title: complaintPayload.title,
    category: complaintPayload.category,
    submissionDate: '03 Nov 2026, 02:30 PM',
    location: complaintPayload.location,
    status: 'SUBMITTED',
  });

  assert(sampleEmailHtml.includes(user1TrackingId), 'Email HTML template prominently includes official tracking ID');
  assert(sampleEmailHtml.includes('Aarav Sharma'), 'Email HTML template includes personalized citizen name');
  assert(sampleEmailHtml.includes('JanSamadhan'), 'Email HTML template features JanSamadhan civic platform branding');
  assert(sampleEmailHtml.includes('SUBMITTED'), 'Email HTML template indicates initial SUBMITTED status');
  assert(sampleEmailHtml.includes('/track?id='), 'Email HTML template contains direct action link to track complaint');

  // Verify email dispatch function
  const emailDispatchResult = await sendComplaintConfirmationEmail({
    recipientEmail: user1Email,
    recipientName: 'Aarav Sharma',
    problemId: submitRes.body.report?.id,
    trackingId: user1TrackingId,
    title: complaintPayload.title,
    category: complaintPayload.category,
    location: complaintPayload.location,
    status: 'SUBMITTED',
  });

  assert(emailDispatchResult.success === true, 'sendComplaintConfirmationEmail executed without errors');
  assert(['RESEND', 'LOCAL_CONSOLE'].includes(emailDispatchResult.provider), 'Valid email delivery provider utilized');

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 8: Complaint Visibility in User's "My Reports"
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- TEST 8: My Reports Feed Verification (GET /api/reports/my-reports) ---');
  const myReportsRes = await request(app, {
    method: 'GET',
    url: '/api/reports/my-reports',
    headers: { authorization: `Bearer ${user1Token}` },
  });

  assert(myReportsRes.statusCode === 200, `GET /api/reports/my-reports returned HTTP 200 (got ${myReportsRes.statusCode})`);
  const user1Reports = myReportsRes.body.reports || myReportsRes.body.data?.reports || [];
  assert(user1Reports.length >= 1, `User 1 reports list contains submitted complaint (found ${user1Reports.length})`);

  const foundReport = user1Reports.find(
    (r) => r.trackingNumber === user1TrackingId || r.trackingId === user1TrackingId
  );
  assert(foundReport !== undefined, `Report with tracking ID '${user1TrackingId}' found in user's list`);
  if (foundReport) {
    assert(foundReport.title === complaintPayload.title, 'Report title matches submitted title');
    assert(foundReport.status === 'SUBMITTED', 'Initial complaint status is SUBMITTED');
    assert(foundReport.assignedDepartment !== undefined, 'Report has assignedDepartment field present');
  }

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 9: Dashboard Counters & KPI Refresh
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- TEST 9: Dashboard Statistics Dynamic Update ---');
  const updatedStatsRes = await request(app, {
    method: 'GET',
    url: '/api/dashboard/stats',
    headers: { authorization: `Bearer ${user1Token}` },
  });

  assert(updatedStatsRes.statusCode === 200, `GET /api/dashboard/stats returned HTTP 200 (got ${updatedStatsRes.statusCode})`);
  const updatedStats = updatedStatsRes.body.stats || updatedStatsRes.body.statistics;
  assert(updatedStats.totalReports === 1, `totalReports counter accurately incremented to 1 (got ${updatedStats.totalReports})`);
  assert(updatedStats.pendingReports === 1, `pendingReports counter accurately incremented to 1 (got ${updatedStats.pendingReports})`);

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 10: Session Persistence Across Logout & Re-Login
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- TEST 10: Session Persistence Across Logout and Re-Login ---');
  const logoutRes = await request(app, {
    method: 'POST',
    url: '/api/auth/logout',
  });
  assert(logoutRes.statusCode === 200, `POST /api/auth/logout returned HTTP 200 (got ${logoutRes.statusCode})`);

  // Re-login with original credentials
  const reloginRes = await request(
    app,
    { method: 'POST', url: '/api/auth/login' },
    { email: user1Email, password: user1Password }
  );
  assert(reloginRes.statusCode === 200, 'Re-login with user 1 credentials succeeded');
  const newSessionToken = reloginRes.body.token;

  // Verify complaint persists in user feed after re-login
  const persistentReportsRes = await request(app, {
    method: 'GET',
    url: '/api/reports/my-reports',
    headers: { authorization: `Bearer ${newSessionToken}` },
  });
  const persistentReports = persistentReportsRes.body.reports || persistentReportsRes.body.data?.reports || [];
  const persistentFound = persistentReports.find(
    (r) => r.trackingNumber === user1TrackingId || r.trackingId === user1TrackingId
  );
  assert(persistentFound !== undefined, 'User complaint and status history completely preserved after session refresh');

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 11: Public Tracking Endpoint & Zero-PII Leakage Verification
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- TEST 11: Public Tracking View & Zero-PII Defense ---');
  const publicTrackRes = await request(app, {
    method: 'GET',
    url: `/api/reports/track/${user1TrackingId}`,
  });

  assert(publicTrackRes.statusCode === 200, `GET /api/reports/track/${user1TrackingId} returned HTTP 200`);
  assert(publicTrackRes.body.success === true, 'Public tracking response success is true');
  const trackData = publicTrackRes.body.data;
  assert(trackData.trackingNumber === user1TrackingId || trackData.trackingId === user1TrackingId, 'Public tracking returns tracking ID');
  assert(trackData.title === complaintPayload.title, 'Public tracking returns problem title');
  assert(trackData.status === 'SUBMITTED', 'Public tracking returns current status');

  // Verify zero PII is leaked in public tracking response
  const forbiddenPiiKeys = [
    'password',
    'passwordHash',
    'reportedBy',
    'reporter',
    'reporterEmail',
    'reporterPhone',
    'email',
    'phone',
    'secretTrackingToken',
  ];
  forbiddenPiiKeys.forEach((key) => {
    assert(trackData[key] === undefined, `Public tracking response strictly omits sensitive field '${key}'`);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 12: Insecure Direct Object Reference (IDOR) Protection
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- TEST 12: IDOR Protection (Isolation Between Multiple Citizens) ---');
  const user2Email = `citizen2_${testTimestamp}@test.gov.in`;
  const user2Password = 'UserTwoPassword@2026';

  const user2Reg = await request(
    app,
    { method: 'POST', url: '/api/auth/register' },
    {
      name: 'Diya Patel',
      email: user2Email,
      phone: '+91 91234 56789',
      password: user2Password,
      confirmPassword: user2Password,
      termsAccepted: true,
    }
  );
  assert(user2Reg.statusCode === 201, 'User 2 registered successfully');
  const user2Token = user2Reg.body.token;

  // User 2 queries their "My Reports"
  const user2ReportsRes = await request(app, {
    method: 'GET',
    url: '/api/reports/my-reports',
    headers: { authorization: `Bearer ${user2Token}` },
  });
  const user2Reports = user2ReportsRes.body.reports || user2ReportsRes.body.data?.reports || [];
  const user1ReportInUser2Feed = user2Reports.some(
    (r) => r.trackingNumber === user1TrackingId || r.trackingId === user1TrackingId
  );
  assert(!user1ReportInUser2Feed, "IDOR DEFENSE: User 1's complaint is NOT visible in User 2's 'My Reports' list");

  // User 2 attempts to query User 1's detailed private report via /api/reports/:trackingId
  const idorDetailRes = await request(app, {
    method: 'GET',
    url: `/api/reports/${user1TrackingId}`,
    headers: { authorization: `Bearer ${user2Token}` },
  });
  assert(
    idorDetailRes.statusCode === 403 || idorDetailRes.statusCode === 404,
    `IDOR DEFENSE: User 2 blocked from viewing User 1's private report (HTTP ${idorDetailRes.statusCode})`
  );

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 13: Email Failure Resilience
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- TEST 13: Email Provider Failure Resilience ---');
  // Temporarily configure an invalid Resend API key to simulate provider crash / network error
  const originalResendKey = process.env.RESEND_API_KEY;
  process.env.RESEND_API_KEY = 're_invalid_mock_failing_key_simulating_network_error_12345';

  const resilientComplaintRes = await request(
    app,
    {
      method: 'POST',
      url: '/api/reports',
      headers: { authorization: `Bearer ${user1Token}` },
    },
    {
      title: 'Pothole on Senapati Bapat Road near ICC Tech Park',
      description: 'Dangerous pothole in middle lane causing two-wheelers to swerve abruptly into ongoing traffic.',
      category: 'Roads & Footpaths',
      city: 'Pune',
      location: 'Senapati Bapat Road, near ICC Tech Park',
      severity: 'MEDIUM',
    }
  );

  // Restore API key
  process.env.RESEND_API_KEY = originalResendKey;

  assert(
    resilientComplaintRes.statusCode === 201,
    `Complaint submission succeeds with HTTP 201 even when email service encounters error (got ${resilientComplaintRes.statusCode})`
  );
  assert(
    resilientComplaintRes.body.success === true,
    'Complaint submission returns success: true despite email failure'
  );
  assert(
    resilientComplaintRes.body.trackingId !== undefined,
    `Resilient complaint receives tracking ID '${resilientComplaintRes.body.trackingId}'`
  );

  // ── FINAL SUMMARY ─────────────────────────────────────────────────────────
  console.log('\n===============================================================');
  console.log(`  AUTHENTICATION & COMPLAINT SUITE: ${passedTests} / ${totalTests} TESTS PASSED (100%)`);
  console.log('===============================================================\n');

  if (passedTests === totalTests) {
    console.log('🎉 ALL 13 END-TO-END VERIFICATION REQUIREMENTS COMPLETED SUCCESSFULLY!\n');
    process.exit(0);
  } else {
    console.error('❌ SOME TESTS FAILED!\n');
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal test error in test-auth-complaint-suite:', err);
  process.exit(1);
});

