import assert from 'assert';
import request from 'supertest';
import { app } from '../server.js';

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}:`, err.message);
    failed++;
  }
}

console.log('\n=== Backend REST API Integration Smoke Suite ===\n');

// 1. Health Endpoints
await test('GET /api/health returns 200, valid structure, and system status', async () => {
  const res = await request(app).get('/api/health');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.ok, true);
  assert.strictEqual(res.body.message, 'ResearchVault AI API is running');
  assert.ok(typeof res.body.database === 'object');
  assert.ok(typeof res.body.ai === 'object');
});

await test('GET /api/health/ready handles database connection reporting appropriately', async () => {
  const res = await request(app).get('/api/health/ready');
  assert.ok([200, 503].includes(res.status));
  assert.ok(typeof res.body.ready === 'boolean');
});

// 2. Error & Validation Handling
await test('GET /api/papers/:id returns 400 on invalid ObjectId', async () => {
  const res = await request(app).get('/api/papers/invalid-id-123');
  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.success, false);
});

await test('GET /api/collections/:id returns 400 on invalid ObjectId', async () => {
  const res = await request(app).get('/api/collections/not-a-mongo-id');
  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.success, false);
});

await test('GET /api/search/semantic requires query parameter q', async () => {
  const res = await request(app).get('/api/search/semantic');
  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.success, false);
});

await test('Unknown route returns 404 with structured JSON message', async () => {
  const res = await request(app).get('/api/non-existent-endpoint');
  assert.strictEqual(res.status, 404);
  assert.strictEqual(res.body.success, false);
});

console.log(`\nResults: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('All API smoke tests passed successfully!\n');
  process.exit(0);
}
