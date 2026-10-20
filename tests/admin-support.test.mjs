import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import { normaliseSupportQuery, toSupportCase } from '../api/_lib/adminSupport.js';

test('support query accepts only bounded pagination, categories and a generated request id', () => {
  const validId = 'd9428888-122b-11e1-b85c-61cd3cbb3210';
  assert.deepEqual(normaliseSupportQuery({ category: 'bug', requestId: validId, page: '3', pageSize: '100' }), {
    category: 'bug', requestId: validId, hasInvalidRequestId: false, page: 3, pageSize: 100,
  });
  assert.deepEqual(normaliseSupportQuery({ category: 'unknown', requestId: 'student@example.test', page: '-1', pageSize: '999' }), {
    category: 'all', requestId: null, hasInvalidRequestId: true, page: 1, pageSize: 25,
  });
});

test('support cases expose only submitted feedback metadata', () => {
  assert.deepEqual(toSupportCase({ id: 'case-1', category: 'bug', rating: 2, feedback: 'Save failed.', page_path: '/notes', created_at: '2026-10-20T10:00:00.000Z', ignored: 'private' }), {
    id: 'case-1', category: 'bug', rating: 2, feedback: 'Save failed.', pagePath: '/notes', createdAt: '2026-10-20T10:00:00.000Z',
  });
});

test('support endpoint and route require admin access and use a minimised feedback projection', () => {
  const handler = fs.readFileSync('api/_handlers/admin-support.js', 'utf8');
  const routes = fs.readFileSync('api/_lib/routes.js', 'utf8');
  const app = fs.readFileSync('src/app/App.tsx', 'utf8');
  assert.match(handler, /requireAdmin\(user, res\)/);
  assert.match(handler, /rateLimitUserEndpoint\(user\.id, 'admin-support'/);
  assert.match(handler, /select\('id, category, rating, feedback, page_path, created_at'/);
  assert.doesNotMatch(handler, /user_id|prompt|answer|artifact/);
  assert.match(routes, /'admin-support': \{[\s\S]*access: 'admin'/);
  assert.match(app, /path="admin\/support" element=\{<AdminRoute><SupportAdmin \/><\/AdminRoute>\}/);
});
