import { test } from 'node:test';
import assert from 'node:assert/strict';
import waitlistAdminHandler from '../api/waitlist-admin.js';
import healthHandler from '../api/health.js';
import { createMocks } from './helpers/mock-http.mjs';

test('health handler returns ok', async () => {
  const { req, res, getStatus, getJson } = createMocks({ method: 'GET' });

  await healthHandler(req, res);

  assert.equal(getStatus(), 200);
  assert.equal(getJson().ok, true);
  assert.equal(getJson().service, 'vertexed');
});

test('waitlist admin rejects unauthenticated requests', async () => {
  const { req, res, getStatus, getJson } = createMocks({
    method: 'POST',
    body: { action: 'list' },
  });

  await waitlistAdminHandler(req, res);

  assert.equal(getStatus(), 401);
  assert.match(getJson().error, /log in/i);
});
