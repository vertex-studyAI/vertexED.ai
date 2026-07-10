import test from 'node:test';
import assert from 'node:assert/strict';
import { createMocks } from './helpers/mock-http.mjs';
import { dispatchRoute, resolveRouteKey, ROUTES } from '../api/_lib/routes.js';

test('resolveRouteKey maps nested api paths', () => {
  assert.equal(resolveRouteKey({ query: { path: ['paper-generator'] } }), 'paper-generator');
  assert.equal(resolveRouteKey({ query: { path: 'health' } }), 'health');
  assert.equal(resolveRouteKey({ query: {} }), 'health');
});

test('dispatchRoute returns 404 for unknown routes', async () => {
  const { req, res, getStatus, getJson } = createMocks({
    method: 'GET',
    query: { path: ['does-not-exist'] },
  });

  await dispatchRoute('does-not-exist', req, res);

  assert.equal(getStatus(), 404);
  assert.match(getJson().error, /not found/i);
  assert.ok(Array.isArray(getJson().available));
});

test('route registry stays within hobby serverless limits', () => {
  // Vercel Hobby allows 12 functions per deployment; we deploy exactly one catch-all.
  assert.ok(Object.keys(ROUTES).length >= 10);
  assert.ok(Object.keys(ROUTES).length <= 20);
});
