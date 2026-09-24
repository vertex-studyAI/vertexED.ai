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

test('CORS permits the exact fallback and deployment but rejects sibling and spoofed hosts', () => {
  const previous = process.env.VERCEL_URL;
  try {
    process.env.VERCEL_URL = 'vertexed-test-abc.vercel.app';
    for (const origin of ['https://vertex-ed-ai.vercel.app', 'https://vertexed-test-abc.vercel.app']) {
      const {req,res}=createMocks({headers:{origin}});
      assert.equal(enforceSameOriginCors(req,res),true);
    }
    for (const origin of ['https://other.vercel.app','https://vertexed-test-abc.vercel.app.evil.test','null']) {
      const {req,res}=createMocks({headers:{origin,host:'vertexed-test-abc.vercel.app'}});
      assert.equal(enforceSameOriginCors(req,res),false);
    }
  } finally { if(previous===undefined)delete process.env.VERCEL_URL;else process.env.VERCEL_URL=previous; }
});

test('getClientIp prefers platform headers over client X-Forwarded-For', () => {
  assert.equal(
    getClientIp({
      headers: {
        'x-forwarded-for': '198.51.100.1, 10.0.0.1',
        'x-real-ip': '203.0.113.9',
      },
      socket: { remoteAddress: '127.0.0.1' },
    }),
    '203.0.113.9',
  );
  assert.equal(
    getClientIp({
      headers: { 'x-vercel-forwarded-for': '203.0.113.50' },
      socket: { remoteAddress: '127.0.0.1' },
    }),
    '203.0.113.50',
  );
});

test('getClientIp ignores untrusted X-Forwarded-For unless opted in', () => {
  assert.equal(
    getClientIp({
      headers: { 'x-forwarded-for': '198.51.100.1' },
      socket: { remoteAddress: '127.0.0.1' },
    }),
    '127.0.0.1',
  );
  const previous = process.env.TRUST_X_FORWARDED_FOR;
  process.env.TRUST_X_FORWARDED_FOR = '1';
  try {
    assert.equal(
      getClientIp({
        headers: { 'x-forwarded-for': '198.51.100.1, 10.0.0.1' },
        socket: { remoteAddress: '127.0.0.1' },
      }),
      '198.51.100.1',
    );
  } finally {
    if (previous === undefined) delete process.env.TRUST_X_FORWARDED_FOR;
    else process.env.TRUST_X_FORWARDED_FOR = previous;
  }
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

test('validateReviewImages accepts supported base64 image payloads', () => {
  for (const mime of ['png', 'jpeg', 'jpg', 'webp', 'gif']) {
    const result = validateReviewImages([`data:image/${mime};base64,AAAA`]);
    assert.equal(result.ok, true, mime);
    assert.equal(result.images.length, 1);
  }
});

test('validateReviewImages rejects unsupported or malformed payloads', () => {
  const tiny = 'data:image/png;base64,AAAA';

  assert.equal(validateReviewImages(['https://example.com/a.png']).ok, false);
  assert.equal(validateReviewImages(['data:image/svg+xml;base64,PHN2Zz4=']).ok, false);
  assert.equal(validateReviewImages(['data:image/png,AAAA']).ok, false);
  assert.equal(validateReviewImages(['data:image/png;base64,not_base64']).ok, false);
  assert.equal(validateReviewImages(['data:image/png;base64,AAA']).ok, false);

  const tooMany = validateReviewImages(Array.from({ length: MAX_REVIEW_IMAGES + 1 }, () => tiny));
  assert.equal(tooMany.ok, false);
});
