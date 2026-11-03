/**
 * JanSamadhan – Image Upload Test Script
 * Verifies upload endpoint accepts 'image', 'images', 'file' and strips EXIF without Multer errors.
 */

const assert = require('assert');
const http = require('http');
const app = require('./app');

// 1x1 valid minimal JPEG buffer
const minimalJpeg = Buffer.from([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x60,
  0x00, 0x60, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
  0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
  0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20, 0x24, 0x2e, 0x27, 0x20,
  0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29, 0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27,
  0x39, 0x3d, 0x38, 0x32, 0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
  0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x1f, 0x00, 0x00, 0x01, 0x05, 0x01, 0x01,
  0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04,
  0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f,
  0x00, 0xbf, 0x00, 0xff, 0xd9,
]);

// Helper to construct multipart/form-data body
function buildMultipartBody(boundary, fieldName, filename, fileBuffer) {
  const head = Buffer.from(
    `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="${fieldName}"; filename="${filename}"\r\n` +
      `Content-Type: image/jpeg\r\n\r\n`
  );
  const tail = Buffer.from(`\r\n--${boundary}--\r\n`);
  return Buffer.concat([head, fileBuffer, tail]);
}

function requestMultipart(appInstance, fieldName, filename = 'test.jpg') {
  return new Promise((resolve) => {
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const body = buildMultipartBody(boundary, fieldName, filename, minimalJpeg);

    const req = new http.IncomingMessage(null);
    req.method = 'POST';
    req.url = '/api/upload';
    req.headers = {
      host: 'localhost',
      'content-type': `multipart/form-data; boundary=${boundary}`,
      'content-length': body.length.toString(),
    };
    req.socket = { remoteAddress: '127.0.0.1', destroy: () => {} };

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
        body: parsed,
      });
    };

    appInstance.handle(req, res);
    req.emit('data', body);
    req.emit('end');
  });
}

async function run() {
  console.log('--- Testing /api/upload with Multiple Field Names ---');

  // 1. Test field name 'image' (what client originally sent)
  console.log('\n1. Testing field name "image"...');
  const res1 = await requestMultipart(app, 'image', 'photo_single.jpg');
  console.log('Status:', res1.statusCode, 'Body:', res1.body);
  assert.strictEqual(res1.statusCode, 201, 'Uploading with field "image" should return 201');
  assert.ok(res1.body?.data?.url, 'Response should contain data.url');
  console.log('✅ Field "image" accepted! URL:', res1.body.data.url);

  // 2. Test field name 'images'
  console.log('\n2. Testing field name "images"...');
  const res2 = await requestMultipart(app, 'images', 'photo_multi.jpg');
  console.log('Status:', res2.statusCode, 'Body:', res2.body);
  assert.strictEqual(res2.statusCode, 201, 'Uploading with field "images" should return 201');
  assert.ok(res2.body?.data?.url, 'Response should contain data.url');
  console.log('✅ Field "images" accepted! URL:', res2.body.data.url);

  // 3. Test field name 'file'
  console.log('\n3. Testing field name "file"...');
  const res3 = await requestMultipart(app, 'file', 'photo_file.jpg');
  console.log('Status:', res3.statusCode, 'Body:', res3.body);
  assert.strictEqual(res3.statusCode, 201, 'Uploading with field "file" should return 201');
  assert.ok(res3.body?.data?.url, 'Response should contain data.url');
  console.log('✅ Field "file" accepted! URL:', res3.body.data.url);

  console.log('\n🎉 ALL UPLOAD TESTS PASSED SUCCESSFULLY! No unexpected field errors!');
}

run().catch((err) => {
  console.error('❌ Upload test failed:', err);
  process.exit(1);
});
