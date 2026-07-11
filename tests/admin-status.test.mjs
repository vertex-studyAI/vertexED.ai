import { test } from 'node:test';
import assert from 'node:assert/strict';
import adminStatusHandler from '../api/_handlers/admin-status.js';
import { createMocks } from './helpers/mock-http.mjs';

test('admin-status rejects unauthenticated requests', async () => {
  const { req, res, getStatus } = createMocks({ method: 'GET' });
  await adminStatusHandler(req, res);
  assert.equal(getStatus(), 401);
});

test('admin-status rejects non-GET methods', async () => {
  const { req, res, getStatus } = createMocks({ method: 'POST' });
  await adminStatusHandler(req, res);
  assert.equal(getStatus(), 405);
});
