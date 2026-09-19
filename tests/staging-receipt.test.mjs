import assert from 'node:assert/strict';
import test from 'node:test';

import { REQUIRED_SCENARIOS, verifyStagingReceipt } from '../scripts/verify-staging-receipt.mjs';

const receipt = () => ({
  schema_version: 1,
  environment: 'staging',
  source_sha: '1'.repeat(40),
  sanitized_data: true,
  executed_at: '2026-09-13T00:00:00Z',
  operator: 'release-owner@example.test',
  attestation_url: 'https://github.com/owner/repo/attestations/123',
  scenarios: REQUIRED_SCENARIOS.map((id) => ({ id, passed: true, evidence_sha256: 'a'.repeat(64) })),
});

test('complete staging receipt passes and binds the expected source', () => {
  assert.deepEqual(verifyStagingReceipt(receipt(), { expectedSha: '1'.repeat(40) }), { valid: true, errors: [] });
});

test('missing, failed, unhashed, or revision-mismatched evidence fails closed', () => {
  const value = receipt();
  value.scenarios[1].passed = false;
  value.scenarios[2].evidence_sha256 = 'not-a-hash';
  value.scenarios.pop();
  const result = verifyStagingReceipt(value, { expectedSha: '2'.repeat(40) });
  assert.equal(result.valid, false);
  assert.match(result.errors.join('\n'), /source_sha does not match|did not pass|hash invalid|missing scenario/);
});
