/**
 * JanSamadhan – Category & Search Verification Script
 */

const http = require('http');
const app = require('./app');

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

// Client search matcher logic (matches ReportProblemForm.jsx)
function filterCategories(categories, query) {
  return categories.filter((cat) => {
    const rawSearch = query.toLowerCase().trim();
    if (!rawSearch) return true;

    const name = (cat.name || '').toLowerCase();
    const desc = (cat.description || '').toLowerCase();

    // 1. Direct substring match on name or description
    if (name.includes(rawSearch) || desc.includes(rawSearch)) {
      return true;
    }

    // 2. Whitespace-removed match (e.g. "street light" matches "Electricity and Streetlights")
    const collapsedSearch = rawSearch.replace(/[\s\-_]+/g, '');
    const collapsedName = name.replace(/[\s\-_]+/g, '');
    const collapsedDesc = desc.replace(/[\s\-_]+/g, '');
    if (collapsedName.includes(collapsedSearch) || collapsedDesc.includes(collapsedSearch)) {
      return true;
    }

    // 3. Multi-word match: every word in the search query appears in name or description
    const words = rawSearch.split(/[\s\-_]+/).filter((w) => w.length > 1);
    if (words.length > 0) {
      const allWordsMatch = words.every(
        (word) => name.includes(word) || desc.includes(word) || collapsedName.includes(word)
      );
      if (allWordsMatch) return true;
    }

    // 4. Common civic synonyms / aliases
    const aliases = {
      'street light': ['electricity', 'light', 'lamp', 'pole'],
      'streetlight': ['electricity', 'light', 'lamp', 'pole'],
      'light': ['electricity', 'streetlight'],
      'pothole': ['road', 'pavement', 'asphalt'],
      'road': ['pothole', 'footpath', 'traffic'],
      'garbage': ['waste', 'trash', 'dumpster', 'sanitation'],
      'waste': ['garbage', 'trash', 'sanitation'],
      'water': ['pipeline', 'leakage', 'tap', 'drainage'],
      'drain': ['sewage', 'manhole', 'water', 'drainage'],
      'sewage': ['drainage', 'manhole', 'waste'],
    };

    for (const [key, related] of Object.entries(aliases)) {
      if (rawSearch.includes(key) || key.includes(rawSearch)) {
        if (
          related.some((r) => name.includes(r) || desc.includes(r)) ||
          name.includes(key) ||
          desc.includes(key)
        ) {
          return true;
        }
      }
    }

    return false;
  });
}

async function runTests() {
  console.log('=====================================================');
  console.log('  JanSamadhan – Category & Smart Search Verification ');
  console.log('=====================================================\n');

  const res = await request(app, { url: '/api/categories', method: 'GET' });
  assert(res.statusCode === 200, `GET /api/categories returned HTTP ${res.statusCode} (Expected 200)`);

  const body = res.body;
  assert(body && body.success === true, 'Response body has success: true');
  assert(Array.isArray(body.categories), 'Response body has categories array');
  assert(Array.isArray(body.data), 'Response body has data array');
  assert(body.categories.length >= 12, `Categories count is ${body.categories.length} (Expected >= 12)`);

  const categories = body.categories;

  console.log('\n--- Verifying Search Matches ---');
  const testQueries = [
    { query: 'street light', expectedName: 'Electricity and Streetlights' },
    { query: 'streetlight', expectedName: 'Electricity and Streetlights' },
    { query: 'street', expectedName: 'Electricity and Streetlights' },
    { query: 'light', expectedName: 'Electricity and Streetlights' },
    { query: 'pothole', expectedName: 'Roads and Potholes' },
    { query: 'road', expectedName: 'Roads and Potholes' },
    { query: 'garbage', expectedName: 'Garbage and Waste Management' },
    { query: 'waste', expectedName: 'Garbage and Waste Management' },
    { query: 'drainage', expectedName: 'Drainage and Sewage' },
    { query: 'water', expectedName: 'Water Supply and Leakage' },
  ];

  for (const { query, expectedName } of testQueries) {
    const matches = filterCategories(categories, query);
    const found = matches.some((m) => m.name === expectedName);
    assert(found, `Search query "${query}" matches "${expectedName}" (${matches.length} result(s))`);
  }

  console.log('\n=====================================================');
  console.log(`  Results: ${passedTests} / ${totalTests} assertions passed (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('=====================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTests();
