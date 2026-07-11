import { test } from 'node:test';
import assert from 'node:assert/strict';
import userContentHandler from '../api/_handlers/user-content.js';
import { createMocks } from './helpers/mock-http.mjs';

test('user-content rejects unauthenticated DELETE requests', async () => {
  const { req, res, getStatus } = createMocks({
    method: 'DELETE',
    body: { id: '550e8400-e29b-41d4-a716-446655440000' },
  });

  await userContentHandler(req, res);
  assert.equal(getStatus(), 401);
});

test('user-content rejects unauthenticated PUT requests', async () => {
  const { req, res, getStatus } = createMocks({
    method: 'PUT',
    body: { id: '550e8400-e29b-41d4-a716-446655440000', title: 'Updated' },
  });

  await userContentHandler(req, res);
  assert.equal(getStatus(), 401);
});
