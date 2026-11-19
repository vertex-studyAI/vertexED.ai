import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_APP_ORIGIN, normalizeAppOrigin, resolveAppOrigin, appAllowedOrigins } from '../contracts/appOrigin.js';
import { enforceSameOriginCors } from '../api/_lib/security.js';

test('origin resolver ignores expired settings and uses platform deployment identity', () => {
  assert.equal(resolveAppOrigin({ APP_URL: 'https://www.vertexed.app', SITE_URL: 'https://vertexed.ai', VERCEL_PROJECT_PRODUCTION_URL: 'vertex-ed-ai.vercel.app' }), DEFAULT_APP_ORIGIN);
  assert.equal(resolveAppOrigin({ APP_URL: 'https://configured.vercel.app/' }), 'https://configured.vercel.app');
  assert.equal(resolveAppOrigin({ VERCEL_URL: 'candidate-team.vercel.app' }), 'https://candidate-team.vercel.app');
});

test('origin validation excludes credentials, paths, query, insecure and expired hosts', () => {
  for (const value of ['https://vertexed.app', 'https://www.vertexed.ai', 'https://user:pass@example.com', 'https://app.vercel.app/path', 'https://app.vercel.app?x=1', 'javascript:alert(1)', 'http://app.vercel.app', 'https://app.vercel.app/#token']) assert.equal(normalizeAppOrigin(value), null, value);
  assert.equal(normalizeAppOrigin('http://localhost:8080'), 'http://localhost:8080');
});

test('CORS adds only exact configured deployment origins and excludes expired allowlist entries', () => {
  const origins = appAllowedOrigins({ VERCEL_URL: 'candidate-team.vercel.app', ALLOWED_ORIGINS: 'https://www.vertexed.app, https://trusted.vercel.app, https://*.vercel.app' });
  assert.ok(origins.includes(DEFAULT_APP_ORIGIN));
  assert.ok(origins.includes('https://candidate-team.vercel.app'));
  assert.ok(!origins.includes('https://www.vertexed.app'));
  const response = () => ({ headers: {}, statusCode: 200, setHeader(k, v) { this.headers[k] = v; }, status(code) { this.statusCode = code; return this; }, json() {} });
  const allowed = response();
  assert.equal(enforceSameOriginCors({ headers: { origin: DEFAULT_APP_ORIGIN } }, allowed), true);
  assert.equal(allowed.headers['Access-Control-Allow-Origin'], DEFAULT_APP_ORIGIN);
  for (const origin of ['https://attacker.vercel.app', 'https://vertex-ed-ai.vercel.app.evil.test', 'https://www.vertexed.app']) {
    const blocked = response();
    assert.equal(enforceSameOriginCors({ headers: { origin } }, blocked), false);
    assert.equal(blocked.statusCode, 403);
  }
});
