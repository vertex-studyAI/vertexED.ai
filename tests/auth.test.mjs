import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getBearerToken,
  readJsonBody,
  rejectOversizedJsonBody,
  verifyAuthUser,
} from '../api/_lib/auth.js';
import { createMocks } from './helpers/mock-http.mjs';

test('getBearerToken returns null when header is missing', () => {
  assert.equal(getBearerToken({ headers: {} }), null);
});

test('getBearerToken extracts bearer token', () => {
  const token = getBearerToken({ headers: { authorization: 'Bearer test-token-123' } });
  assert.equal(token, 'test-token-123');
});

test('readJsonBody parses string bodies', () => {
  const body = readJsonBody({ body: '{"question":"hello"}' });
  assert.deepEqual(body, { question: 'hello' });
});

test('readJsonBody returns object bodies as-is', () => {
  const input = { action: 'generate' };
  assert.deepEqual(readJsonBody({ body: input }), input);
});

test('rejectOversizedJsonBody blocks large payloads', () => {
  const { req, res, getStatus } = createMocks({
    headers: { 'content-length': String(3 * 1024 * 1024) },
  });

  const rejected = rejectOversizedJsonBody(req, res);
  assert.equal(rejected, true);
  assert.equal(getStatus(), 413);
});

test('verifyAuthUser returns 401 without a token', async () => {
  const { req, res, getStatus, getJson } = createMocks({ method: 'POST' });
  const user = await verifyAuthUser(req, res);

  assert.equal(user, null);
  assert.equal(getStatus(), 401);
  assert.match(getJson().error, /log in/i);
});
