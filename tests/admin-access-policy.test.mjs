import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveAdminAccess } from '../src/lib/adminAccessPolicy.mjs';

test('server admin decision is authoritative', () => {
  assert.equal(
    resolveAdminAccess({ apiDecision: true, isDevelopment: false, clientAllowlistMatch: false }),
    true,
  );
  assert.equal(
    resolveAdminAccess({ apiDecision: false, isDevelopment: true, clientAllowlistMatch: true }),
    false,
  );
});

test('production fails closed when admin-status is unavailable', () => {
  assert.equal(
    resolveAdminAccess({ apiDecision: null, isDevelopment: false, clientAllowlistMatch: true }),
    false,
  );
});

test('development may use the client allowlist fallback', () => {
  assert.equal(
    resolveAdminAccess({ apiDecision: null, isDevelopment: true, clientAllowlistMatch: true }),
    true,
  );
  assert.equal(
    resolveAdminAccess({ apiDecision: null, isDevelopment: true, clientAllowlistMatch: false }),
    false,
  );
});
