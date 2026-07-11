import test from 'node:test';
import assert from 'node:assert/strict';
import { getQueryNumber, getQueryParam } from '../api/_lib/query.js';
import { createMocks } from './helpers/mock-http.mjs';
import { dispatchRoute, resolveRouteKey, ROUTES, ensureJsonBody } from '../api/_lib/routes.js';

test('resolveRouteKey normalizes empty and slashy paths', () => {
  assert.equal(resolveRouteKey({ query: { path: ['health'] } }), 'health');
  assert.equal(resolveRouteKey({ query: { path: ['', 'paper-generator', ''] } }), 'paper-generator');
  assert.equal(resolveRouteKey({ query: {} }), 'health');
});

test('resolveRouteKey falls back to req.url on Vercel when query.path is absent', () => {
  assert.equal(resolveRouteKey({ query: {}, url: '/api/waitlist' }), 'waitlist');
  assert.equal(resolveRouteKey({ query: {}, url: '/api/ask' }), 'ask');
  assert.equal(resolveRouteKey({ query: {}, url: '/api/user-content?kind=note' }), 'user-content');
  assert.equal(resolveRouteKey({ query: {}, url: 'https://www.vertexed.app/api/planner' }), 'planner');
});

test('getQueryParam reads from req.query on Vercel-style requests', () => {
  const { req } = createMocks({
    method: 'GET',
    body: {},
  });
  req.query = { path: ['user-content'], kind: 'note', limit: '15' };
  req.url = '/api/user-content';

  assert.equal(getQueryParam(req, 'kind'), 'note');
  assert.equal(getQueryNumber(req, 'limit', 20, 50), 15);
});

test('getQueryParam falls back to req.url search string', () => {
  const { req } = createMocks({ method: 'GET' });
  req.url = '/api/user-content?kind=paper&limit=5';

  assert.equal(getQueryParam(req, 'kind'), 'paper');
  assert.equal(getQueryNumber(req, 'limit', 20, 50), 5);
});

test('ensureJsonBody parses JSON for DELETE requests', async () => {
  const req = {
    method: 'DELETE',
    headers: { 'content-type': 'application/json' },
    body: undefined,
    on(event, cb) {
      if (event === 'data') cb(Buffer.from(JSON.stringify({ id: 'abc-123' })));
      if (event === 'end') cb();
    },
  };

  await ensureJsonBody(req);
  assert.equal(req.body.id, 'abc-123');
});

test('dispatchRoute returns 404 for unknown routes', async () => {
  const { req, res, getStatus, getJson } = createMocks({
    method: 'GET',
    query: { path: ['does-not-exist'] },
  });

  await dispatchRoute('does-not-exist', req, res);

  assert.equal(getStatus(), 404);
  assert.match(getJson().error, /not found/i);
});

test('route registry stays within hobby serverless limits', () => {
  assert.ok(Object.keys(ROUTES).length >= 10);
  assert.ok(Object.keys(ROUTES).length <= 20);
});
