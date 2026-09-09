import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAuditArgs,
  evaluateAuditReport,
  parseAuditReport,
} from '../scripts/audit-production-dependencies.mjs';

test('production audit is lockfile-only and keeps the high-severity production boundary', () => {
  const args = buildAuditArgs();
  assert.deepEqual(args.slice(0, 5), [
    'audit',
    '--omit=dev',
    '--package-lock-only',
    '--audit-level=high',
    '--json',
  ]);
});

test('production audit accepts a structurally valid report with zero high and critical findings', () => {
  const result = evaluateAuditReport({
    metadata: { vulnerabilities: { info: 0, low: 1, moderate: 2, high: 0, critical: 0, total: 3 } },
  });
  assert.deepEqual(result, {
    ok: true,
    retryable: false,
    reason: 'no high or critical production vulnerabilities',
  });
});

test('production audit fails closed and never retries a valid high-severity report', () => {
  const result = evaluateAuditReport({ metadata: { vulnerabilities: { high: 1, critical: 0 } } });
  assert.deepEqual(result, {
    ok: false,
    retryable: false,
    reason: '1 high production vulnerabilities',
  });
});

test('production audit fails closed and never retries a valid critical-severity report', () => {
  const result = evaluateAuditReport({ metadata: { vulnerabilities: { high: 0, critical: 2 } } });
  assert.deepEqual(result, {
    ok: false,
    retryable: false,
    reason: '2 critical production vulnerabilities',
  });
});

test('production audit treats missing or invalid vulnerability schema as retryable transport/schema failure', () => {
  assert.deepEqual(evaluateAuditReport({}), {
    ok: false,
    retryable: true,
    reason: 'missing metadata.vulnerabilities',
  });
  assert.deepEqual(evaluateAuditReport({ metadata: { vulnerabilities: [] } }), {
    ok: false,
    retryable: true,
    reason: 'missing metadata.vulnerabilities',
  });
  assert.deepEqual(evaluateAuditReport({ metadata: { vulnerabilities: { high: -1, critical: 0 } } }), {
    ok: false,
    retryable: true,
    reason: 'invalid high vulnerability count',
  });
  assert.deepEqual(evaluateAuditReport({ metadata: { vulnerabilities: { high: 0, critical: 'not-a-number' } } }), {
    ok: false,
    retryable: true,
    reason: 'invalid critical vulnerability count',
  });
});

test('production audit JSON parser rejects malformed endpoint responses', () => {
  const parsed = parseAuditReport('{not-json');
  assert.equal(parsed.report, null);
  assert.equal(typeof parsed.error, 'string');
  assert.ok(parsed.error.length > 0);
});
