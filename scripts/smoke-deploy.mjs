#!/usr/bin/env node
/**
 * Live deployment smoke tests.
 * Usage: node scripts/smoke-deploy.mjs
 *        SMOKE_BASE_URL=https://www.vertexed.app node scripts/smoke-deploy.mjs
 */

const BASE_URL = (process.env.SMOKE_BASE_URL || 'https://www.vertexed.app').replace(/\/$/, '');
const TIMEOUT_MS = Number(process.env.SMOKE_TIMEOUT_MS || 20_000);

function fail(message) {
  console.error(`[smoke] FAIL: ${message}`);
  process.exitCode = 1;
}

function pass(message) {
  console.log(`[smoke] OK: ${message}`);
}

async function request(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        ...(options.headers || {}),
      },
    });

    let body = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      body = await response.json();
    } else {
      body = await response.text();
    }

    return { status: response.status, body };
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  console.log(`[smoke] Target: ${BASE_URL}`);

  try {
    const health = await request('/api/health', { method: 'GET', headers: {} });
    if (health.status !== 200 || !health.body?.ok) {
      fail(`/api/health returned ${health.status}`);
    } else {
      pass('/api/health returns ok');
    }
  } catch (error) {
    fail(`/api/health check failed: ${error.message}`);
  }

  try {
    const home = await request('/', { method: 'GET', headers: {} });
    if (home.status !== 200) {
      fail(`GET / returned ${home.status}`);
    } else {
      pass('GET / returns 200');
    }
  } catch (error) {
    fail(`GET / failed: ${error.message}`);
  }

  try {
    const waitlist = await request('/api/waitlist', {
      method: 'POST',
      body: JSON.stringify({ email: 'not-an-email' }),
    });

    if (waitlist.status !== 400) {
      fail(`/api/waitlist invalid email returned ${waitlist.status}`);
    } else {
      pass('/api/waitlist rejects invalid email with 400');
    }
  } catch (error) {
    fail(`/api/waitlist check failed: ${error.message}`);
  }

  try {
    const ask = await request('/api/ask', {
      method: 'POST',
      body: JSON.stringify({ question: 'ping' }),
    });

    if (ask.status !== 401) {
      fail(`/api/ask without auth returned ${ask.status}`);
    } else {
      pass('/api/ask requires authentication (401)');
    }
  } catch (error) {
    fail(`/api/ask check failed: ${error.message}`);
  }

  if (process.exitCode) {
    console.error('[smoke] Deployment smoke tests failed.');
    process.exit(process.exitCode);
  }

  console.log('[smoke] All deployment smoke tests passed.');
}

main().catch((error) => {
  console.error('[smoke] Unexpected error:', error);
  process.exit(1);
});
