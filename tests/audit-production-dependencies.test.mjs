import assert from 'node:assert/strict';
import test from 'node:test';

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

test('clean high/critical report passes', () => {
  assert.deepEqual(
    evaluateAuditReport({ metadata: { vulnerabilities: { low: 3, moderate: 1, high: 0, critical: 0 } } }),
    { ok: true, retryable: false, reason: 'no high or critical production vulnerabilities' },
  );
});

test('high and critical findings fail closed without retry classification', () => {
  assert.deepEqual(
    evaluateAuditReport({ metadata: { vulnerabilities: { high: 1, critical: 0 } } }),
    { ok: false, retryable: false, reason: '1 high production vulnerabilities' },
  );
  assert.deepEqual(
    evaluateAuditReport({ metadata: { vulnerabilities: { high: 0, critical: 2 } } }),
    { ok: false, retryable: false, reason: '2 critical production vulnerabilities' },
  );
});

test('missing or invalid vulnerability metadata cannot pass', () => {
  assert.equal(evaluateAuditReport({}).ok, false);
  assert.equal(evaluateAuditReport({ metadata: { vulnerabilities: [] } }).ok, false);
  assert.equal(evaluateAuditReport({ metadata: { vulnerabilities: { high: -1, critical: 0 } } }).ok, false);
  assert.equal(evaluateAuditReport({ metadata: { vulnerabilities: { high: 0, critical: 'unknown' } } }).ok, false);
});

test('invalid audit JSON is surfaced instead of treated as a clean report', () => {
  const parsed = parseAuditReport('not-json');
  assert.equal(parsed.report, null);
  assert.match(parsed.error, /Unexpected token|JSON/);
});
