import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  applyApiSecurityHeaders,
  enforceSameOriginCors,
  getClientIp,
  isValidUuid,
  normalizeEmail,
  validatePassword,
  validateReviewImages,
  MAX_REVIEW_IMAGES,
} from '../api/_lib/security.js';
import { createMocks } from './helpers/mock-http.mjs';

test('applyApiSecurityHeaders sets hardening headers', () => {
  const { res, getHeaders } = createMocks();
  applyApiSecurityHeaders(res);
  const headers = getHeaders();

  assert.equal(headers['X-Content-Type-Options'], 'nosniff');
  assert.equal(headers['X-Frame-Options'], 'DENY');
  assert.equal(headers['Referrer-Policy'], 'strict-origin-when-cross-origin');
  assert.equal(headers['Cache-Control'], 'no-store');
  assert.equal(headers['X-Robots-Tag'], 'noindex, nofollow');
});

test('enforceSameOriginCors allows requests without Origin header', () => {
  const { req, res, getStatus } = createMocks({ headers: {} });
  assert.equal(enforceSameOriginCors(req, res), true);
  assert.equal(getStatus(), 200);
});

test('enforceSameOriginCors allows production origin', () => {
  const { req, res, getHeaders, getStatus } = createMocks({
    headers: { origin: 'https://www.vertexed.app' },
  });

  assert.equal(enforceSameOriginCors(req, res), true);
  assert.equal(getHeaders()['Access-Control-Allow-Origin'], 'https://www.vertexed.app');
  assert.equal(getStatus(), 200);
});

test('enforceSameOriginCors blocks untrusted origins', () => {
  const { req, res, getStatus, getJson } = createMocks({
    headers: { origin: 'https://evil.example' },
  });

  assert.equal(enforceSameOriginCors(req, res), false);
  assert.equal(getStatus(), 403);
  assert.match(getJson().error, /cross-origin/i);
});

test('getClientIp prefers x-forwarded-for', () => {
  const ip = getClientIp({
    headers: { 'x-forwarded-for': '203.0.113.1, 10.0.0.1' },
    socket: { remoteAddress: '127.0.0.1' },
  });
  assert.equal(ip, '203.0.113.1');
});

test('isValidUuid accepts RFC4122 ids', () => {
  assert.equal(isValidUuid('550e8400-e29b-41d4-a716-446655440000'), true);
  assert.equal(isValidUuid('not-a-uuid'), false);
  assert.equal(isValidUuid(''), false);
});

test('normalizeEmail trims and lowercases valid addresses', () => {
  assert.equal(normalizeEmail('  Admin@Example.COM '), 'admin@example.com');
  assert.equal(normalizeEmail('bad-email'), null);
});

test('validatePassword enforces complexity rules', () => {
  assert.equal(validatePassword('short1A').ok, false);
  assert.equal(validatePassword('alllowercase1').ok, false);
  assert.equal(validatePassword('ALLUPPERCASE1').ok, false);
  assert.equal(validatePassword('NoDigitsHere').ok, false);
  assert.equal(validatePassword('StrongPass1').ok, true);
});

test('validateReviewImages rejects oversized and invalid payloads', () => {
  const tiny = 'data:image/png;base64,AAAA';
  const ok = validateReviewImages([tiny]);
  assert.equal(ok.ok, true);
  assert.equal(ok.images.length, 1);

  const badType = validateReviewImages(['https://example.com/a.png']);
  assert.equal(badType.ok, false);

  const tooMany = validateReviewImages(Array.from({ length: MAX_REVIEW_IMAGES + 1 }, () => tiny));
  assert.equal(tooMany.ok, false);
});
