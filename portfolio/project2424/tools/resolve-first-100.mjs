#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(here, '..');
const queuePath = path.join(projectDir, 'FIRST_100_QUEUE.ndjson');
const policyPath = path.join(projectDir, 'FIRST_100_DISPOSITION_POLICY_20260823.json');
const recoveryOverridePath = path.join(projectDir, 'FIRST_100_RECOVERY_OVERRIDES_20260823.json');
const identityClosureOverridePath = path.join(projectDir, 'FIRST_100_IDENTITY_CLOSURE_OVERRIDES_20260829.json');

const queue = fs.readFileSync(queuePath, 'utf8')
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line) => JSON.parse(line));
const policy = JSON.parse(fs.readFileSync(policyPath, 'utf8'));
const recoveryOverrides = fs.existsSync(recoveryOverridePath)
  ? JSON.parse(fs.readFileSync(recoveryOverridePath, 'utf8'))
  : { overrides: {} };
const identityClosureOverrides = fs.existsSync(identityClosureOverridePath)
  ? JSON.parse(fs.readFileSync(identityClosureOverridePath, 'utf8'))
  : { overrides: {} };
const mergedOverrides = {
  ...policy.overrides,
  ...recoveryOverrides.overrides,
  ...identityClosureOverrides.overrides,
};
const allowed = new Set(policy.allowed_dispositions);

if (queue.length !== 100) {
  throw new Error(`Expected frozen First-100 queue to contain 100 rows; found ${queue.length}`);
}

for (const [label, overlay] of [
  ['recovery', recoveryOverrides],
  ['identity closure', identityClosureOverrides],
]) {
  for (const id of Object.keys(overlay.overrides)) {
    if (!queue.some((row) => row.id === id)) {
      throw new Error(`${label} override targets non-First-100 identity: ${id}`);
    }
  }
}

const ids = new Set();
const resolved = queue.map((row, index) => {
  if (row.rank !== index + 1) {
    throw new Error(`Queue rank mismatch at row ${index + 1}: got ${row.rank}`);
  }
  if (ids.has(row.id)) {
    throw new Error(`Duplicate First-100 identity: ${row.id}`);
  }
  ids.add(row.id);

  const override = mergedOverrides[row.id];
  const decision = override ?? policy.default;
  if (!allowed.has(decision.disposition)) {
    throw new Error(`Invalid disposition for ${row.id}: ${decision.disposition}`);
  }
  if (!decision.reason_code) {
    throw new Error(`Missing reason_code for ${row.id}`);
  }

  return {
    rank: row.rank,
    id: row.id,
    name: row.name,
    track: row.track,
    disposition: decision.disposition,
    reason_code: decision.reason_code,
    mapping_status: decision.mapping_status ?? null,
    evidence_specific_override: Boolean(override),
    incremental_recovery_override: Boolean(recoveryOverrides.overrides[row.id]),
    identity_closure_override: Boolean(identityClosureOverrides.overrides[row.id]),
    note: override?.note ?? policy.default.rule,
  };
});

const counts = resolved.reduce((acc, row) => {
  acc[row.disposition] = (acc[row.disposition] ?? 0) + 1;
  return acc;
}, {});

if (process.argv.includes('--summary')) {
  process.stdout.write(`${JSON.stringify({ total: resolved.length, counts })}\n`);
} else {
  for (const row of resolved) process.stdout.write(`${JSON.stringify(row)}\n`);
}
