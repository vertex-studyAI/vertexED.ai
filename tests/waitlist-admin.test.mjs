import { test } from 'node:test';
import assert from 'node:assert/strict';
import waitlistAdminHandler from '../api/_handlers/waitlist-admin.js';
import healthHandler from '../api/_handlers/health.js';
import { createMocks } from './helpers/mock-http.mjs';
import fs from 'node:fs';

const adminSource = fs.readFileSync('api/_handlers/waitlist-admin.js', 'utf8');
const adminUiSource = fs.readFileSync('src/pages/admin/WaitlistAdmin.tsx', 'utf8');
const notifySource = fs.readFileSync('api/_lib/notify.js', 'utf8');

test('health handler returns ok', async () => {
  const { req, res, getStatus, getJson } = createMocks({ method: 'GET' });

  await healthHandler(req, res);

  assert.equal(getStatus(), 200);
  assert.equal(getJson().ok, true);
  assert.equal(getJson().service, 'vertexed');
  assert.equal(getJson().apiVersion, '1');
  if (getJson().routes !== undefined) {
    assert.ok(getJson().routes >= 10);
  }
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

test('waitlist responses never select stored invite credentials', () => {
  const listBlock = adminSource.slice(
    adminSource.indexOf("if (action === 'list')"),
    adminSource.indexOf("if (action === 'update')"),
  );
  assert.doesNotMatch(listBlock, /\.select\([^\n]*invite_token/);
  assert.doesNotMatch(adminSource, /\.select\([^\n]*(invite_token|invite_token_hash)/);
  assert.match(adminSource, /updates\.invite_token_hash = hashInviteToken\(inviteToken\)/);
  assert.match(adminSource, /updates\.invite_expires_at = getInviteExpiry\(issuedAt\)/);
  assert.doesNotMatch(adminUiSource, /entry\.invite_token/);
});

test('waitlist administration has a durable per-admin request limit', () => {
  assert.match(adminSource, /rateLimitUserEndpoint\(user\.id, 'waitlist-admin', res/);
});

test('notification fallback logs neither recipient email nor one-time invite link', () => {
  const fallbackLog = notifySource.match(/console\.info\([^\n]+/)?.[0] ?? '';
  assert.doesNotMatch(fallbackLog, /,\s*email\b/);
  assert.doesNotMatch(fallbackLog, /,\s*signupUrl\b/);
});
