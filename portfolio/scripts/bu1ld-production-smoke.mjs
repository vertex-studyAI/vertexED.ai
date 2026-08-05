#!/usr/bin/env node

const baseUrl = new URL(process.env.BU1LD_BASE_URL || 'https://thebu1ld.com');
const timeoutMs = Number(process.env.BU1LD_SMOKE_TIMEOUT_MS || 12_000);

const checks = [
  { path: '/', label: 'landing', patterns: [/BU1LD|B\s*U\s*1\s*L\s*D/i, /member|research|building/i] },
  { path: '/signup', label: 'signup' },
  { path: '/login', label: 'login' },
  { path: '/projects', label: 'projects' },
  { path: '/programs-public', label: 'programs' },
  { path: '/evidence', label: 'evidence' },
  { path: '/privacy', label: 'privacy' },
  { path: '/terms', label: 'terms' },
];

function fail(message) {
  throw new Error(message);
}

async function fetchRoute(check) {
  const url = new URL(check.path, baseUrl);
  const startedAt = Date.now();
  const response = await fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      accept: 'text/html,application/xhtml+xml',
      'user-agent': 'Bu1LD-Portfolio-Smoke/1.0 (+https://github.com/vertex-studyAI/vertexED.ai)',
    },
  });
  const body = await response.text();
  const elapsedMs = Date.now() - startedAt;
  const contentType = response.headers.get('content-type') || '';

  if (response.status !== 200) {
    fail(`${check.label}: expected HTTP 200, received ${response.status} at ${response.url}`);
  }
  if (!contentType.toLowerCase().includes('text/html')) {
    fail(`${check.label}: expected an HTML response, received ${contentType || 'no content type'}`);
  }
  if (body.trim().length < 100) {
    fail(`${check.label}: response body was unexpectedly small (${body.length} bytes)`);
  }
  if (/internal server error|application error|runtime error|worker threw exception/i.test(body)) {
    fail(`${check.label}: response contained an application-error marker`);
  }
  for (const pattern of check.patterns || []) {
    if (!pattern.test(body)) {
      fail(`${check.label}: response did not match required content pattern ${pattern}`);
    }
  }

  return {
    label: check.label,
    path: check.path,
    finalUrl: response.url,
    status: response.status,
    elapsedMs,
    bytes: body.length,
    contentType,
  };
}

async function main() {
  const results = [];
  const failures = [];

  console.log(`[bu1ld-smoke] Base URL: ${baseUrl.origin}`);
  console.log(`[bu1ld-smoke] Timeout per request: ${timeoutMs}ms`);

  for (const check of checks) {
    try {
      const result = await fetchRoute(check);
      results.push(result);
      console.log(`[PASS] ${result.label.padEnd(9)} ${result.status} ${String(result.elapsedMs).padStart(5)}ms ${result.bytes} bytes ${result.finalUrl}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push({ label: check.label, path: check.path, message });
      console.error(`[FAIL] ${check.label.padEnd(9)} ${message}`);
    }
  }

  console.log(`\n[bu1ld-smoke] Passed: ${results.length}/${checks.length}`);

  if (failures.length) {
    console.error('[bu1ld-smoke] Failures:');
    for (const failure of failures) {
      console.error(`- ${failure.label} (${failure.path}): ${failure.message}`);
    }
    process.exit(1);
  }

  console.log('[bu1ld-smoke] Public route availability contract is healthy.');
}

main().catch((error) => {
  console.error(`[bu1ld-smoke] Fatal error: ${error instanceof Error ? error.stack || error.message : String(error)}`);
  process.exit(1);
});