#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(here, '..');
const queuePath = path.join(projectDir, 'FIRST_100_QUEUE.ndjson');
const policyPath = path.join(projectDir, 'FIRST_100_DISPOSITION_POLICY_20260823.json');

const queue = fs.readFileSync(queuePath, 'utf8')
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line) => JSON.parse(line));
const policy = JSON.parse(fs.readFileSync(policyPath, 'utf8'));
const allowed = new Set(policy.allowed_dispositions);

if (queue.length !== 100) {
  throw new Error(`Expected frozen First-100 queue to contain 100 rows; found ${queue.length}`);
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

  const override = policy.overrides[row.id];
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
    evidence_specific_override: Boolean(override),
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
