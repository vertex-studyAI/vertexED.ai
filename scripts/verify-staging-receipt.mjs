#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import process from 'node:process';

export const REQUIRED_SCENARIOS = [
  'authenticated_lifecycle',
  'provider_failure',
  'rate_limit',
  'bounded_retry',
  'rollback_restore',
];

export function verifyStagingReceipt(receipt, { expectedSha } = {}) {
  const errors = [];
  if (receipt?.schema_version !== 1) errors.push('schema_version must be 1');
  if (receipt?.environment !== 'staging') errors.push('environment must be staging');
  if (!/^[0-9a-f]{40}$/i.test(receipt?.source_sha ?? '')) errors.push('source_sha must be a full commit');
  if (expectedSha && receipt?.source_sha?.toLowerCase() !== expectedSha.toLowerCase()) errors.push('source_sha does not match expected revision');
  if (receipt?.sanitized_data !== true) errors.push('sanitized_data must be true');
  if (!Number.isFinite(Date.parse(receipt?.executed_at ?? ''))) errors.push('executed_at must be an ISO timestamp');
  if (typeof receipt?.operator !== 'string' || receipt.operator.trim().length < 3) errors.push('operator identity is required');
  if (!/^https:\/\//.test(receipt?.attestation_url ?? '')) errors.push('immutable attestation_url is required');

  const scenarios = new Map((receipt?.scenarios ?? []).map((row) => [row?.id, row]));
  for (const id of REQUIRED_SCENARIOS) {
    const row = scenarios.get(id);
    if (!row) errors.push(`missing scenario: ${id}`);
    else {
      if (row.passed !== true) errors.push(`scenario did not pass: ${id}`);
      if (!/^[0-9a-f]{64}$/i.test(row.evidence_sha256 ?? '')) errors.push(`scenario evidence hash invalid: ${id}`);
    }
  }
  if (scenarios.size !== REQUIRED_SCENARIOS.length) errors.push('receipt contains undeclared or duplicate scenarios');
  return { valid: errors.length === 0, errors };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const path = process.argv[2];
  if (!path) {
    console.error('Usage: node scripts/verify-staging-receipt.mjs RECEIPT.json [EXPECTED_SHA]');
    process.exitCode = 2;
  } else {
    readFile(path, 'utf8').then((raw) => {
      const result = verifyStagingReceipt(JSON.parse(raw), { expectedSha: process.argv[3] });
      if (!result.valid) {
        for (const error of result.errors) console.error(error);
        process.exitCode = 1;
      } else console.log('Staging receipt satisfies the release evidence contract.');
    }, (error) => { console.error(error.message); process.exitCode = 1; });
  }
}
