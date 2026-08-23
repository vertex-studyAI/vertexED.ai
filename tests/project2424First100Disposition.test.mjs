import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const queuePath = path.join(root, 'portfolio/project2424/FIRST_100_QUEUE.ndjson');
const policyPath = path.join(root, 'portfolio/project2424/FIRST_100_DISPOSITION_POLICY_20260823.json');
const resolverPath = path.join(root, 'portfolio/project2424/tools/resolve-first-100.mjs');

function queueRows() {
  return fs.readFileSync(queuePath, 'utf8').split(/\r?\n/).filter(Boolean).map(JSON.parse);
}

function resolvedRows() {
  return execFileSync(process.execPath, [resolverPath], { encoding: 'utf8' })
    .split(/\r?\n/).filter(Boolean).map(JSON.parse);
}

test('First-100 disposition resolver classifies exactly 100 unique frozen identities', () => {
  const queue = queueRows();
  const resolved = resolvedRows();
  assert.equal(queue.length, 100);
  assert.equal(resolved.length, 100);
  assert.equal(new Set(resolved.map((row) => row.id)).size, 100);
  assert.deepEqual(resolved.map((row) => row.id), queue.map((row) => row.id));
  assert.deepEqual(resolved.map((row) => row.rank), Array.from({ length: 100 }, (_, index) => index + 1));
});

test('every First-100 row resolves to an allowed terminal/action disposition with a reason', () => {
  const policy = JSON.parse(fs.readFileSync(policyPath, 'utf8'));
  const allowed = new Set(policy.allowed_dispositions);
  for (const row of resolvedRows()) {
    assert.ok(allowed.has(row.disposition), `${row.id} has invalid disposition ${row.disposition}`);
    assert.ok(row.reason_code, `${row.id} is missing a reason_code`);
    assert.ok(row.note, `${row.id} is missing an evidence/blocker note`);
  }
});

test('unrecovered First-100 rows fail closed instead of inheriting evidence from numeric suffixes', () => {
  const policy = JSON.parse(fs.readFileSync(policyPath, 'utf8'));
  const rows = resolvedRows();
  for (const row of rows.filter((candidate) => !candidate.evidence_specific_override)) {
    assert.equal(row.disposition, 'BLOCKED');
    assert.equal(row.reason_code, 'SOURCE_NOT_RECOVERED');
    assert.equal(row.note, policy.default.rule);
  }
});

test('FI-JEPA resolves from its verified retained patch rather than the generic missing-source default', () => {
  const row = resolvedRows().find((candidate) => candidate.id === 'T2424-0031');
  assert.ok(row);
  assert.equal(row.disposition, 'MERGE');
  assert.equal(row.reason_code, 'VERIFIED_PATCH_TARGET_REF_CREATION_BLOCKED');
  assert.equal(row.evidence_specific_override, true);
});
