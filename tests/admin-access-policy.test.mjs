import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { resolveAdminAccess } from '../src/lib/adminAccessPolicy.mjs';

const hookSource = fs.readFileSync('src/hooks/useIsAdmin.ts', 'utf8');

test('production admin UI fails closed when admin-status is unavailable', () => {
  assert.match(hookSource, /resolveAdminAccess\(\{/);
  assert.doesNotMatch(hookSource, /setIsAdmin\(isAdminUser\(user\)\)/);
});

test('server admin decision remains authoritative', () => {
  assert.equal(resolveAdminAccess({
    apiDecision: true,
    isDevelopment: false,
    clientAllowlistMatch: false,
  }), true);
  assert.equal(resolveAdminAccess({
    apiDecision: false,
    isDevelopment: true,
    clientAllowlistMatch: true,
  }), false);
});

test('production denies fallback while development may use it', () => {
  assert.equal(resolveAdminAccess({
    apiDecision: null,
    isDevelopment: false,
    clientAllowlistMatch: true,
  }), false);
  assert.equal(resolveAdminAccess({
    apiDecision: null,
    isDevelopment: true,
    clientAllowlistMatch: true,
  }), true);
  assert.equal(resolveAdminAccess({
    apiDecision: null,
    isDevelopment: true,
    clientAllowlistMatch: false,
  }), false);
});
