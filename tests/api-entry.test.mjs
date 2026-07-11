import { test } from 'node:test';
import assert from 'node:assert/strict';
import apiHandler from '../api/[[...path]].js';
import { createMocks } from './helpers/mock-http.mjs';

test('api entry applies security headers', async () => {
  const { req, res, getHeaders } = createMocks({ method: 'GET' });
  req.query = { path: ['health'] };

  await apiHandler(req, res);

  const headers = getHeaders();
  assert.equal(headers['X-Content-Type-Options'], 'nosniff');
  assert.equal(headers['X-Frame-Options'], 'DENY');
  assert.equal(headers['X-Vertex-API'], '1');
});

test('api entry blocks untrusted cross-origin requests', async () => {
  const { req, res, getStatus, getJson } = createMocks({
    method: 'GET',
    headers: { origin: 'https://attacker.example' },
  });
  req.query = { path: ['health'] };

  await apiHandler(req, res);

  assert.equal(getStatus(), 403);
  assert.match(getJson().error, /cross-origin/i);
});

test('api entry registers admin-status route', async () => {
  const { req, res, getStatus } = createMocks({
    method: 'GET',
    headers: {},
  });
  req.query = { path: ['admin-status'] };

  await apiHandler(req, res);
  assert.notEqual(getStatus(), 404);
  assert.ok([401, 500].includes(getStatus()));
});
