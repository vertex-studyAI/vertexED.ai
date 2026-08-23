import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const REGISTRY = new URL('../portfolio/project2424/SCIENTIFIC_CLOSURE_REGISTRY_20260823.json', import.meta.url);
const FREEZE = new URL('../portfolio/project2424/TERMINAL_RESULT_FREEZE_20260823.json', import.meta.url);

async function load(url) {
  return JSON.parse(await readFile(url, 'utf8'));
}

test('Project2424 closure registry preserves the global truth boundary', async () => {
  const registry = await load(REGISTRY);
  assert.equal(registry.truth_boundary.historical_contract_identity_count, 2424);
  assert.equal(registry.truth_boundary.full_current_canonical_registry_recovered, false);
  assert.equal(registry.truth_boundary.first_100_registry_recovered, true);
  assert.equal(registry.truth_boundary.numeric_suffix_is_provenance_safe, false);
  assert.equal(registry.truth_boundary.directory_presence_implies_scientific_completion, false);
  assert.equal(registry.truth_boundary.ci_green_implies_scientific_success, false);
});

test('Project2424 closure registry retains hard integrity locks', async () => {
  const registry = await load(REGISTRY);
  const locks = new Set(registry.integrity_locks);
  assert.ok(locks.has('DO_NOT_SUFFIX_MATCH_P2424_TO_T2424'));
  assert.ok(locks.has('PRESERVE_NEGATIVE_MIXED_FAILED_FALSIFIED_RESULTS'));
  assert.ok(locks.has('NO_POST_RESULT_RETUNING_OF_FROZEN_PROTOCOLS'));
  assert.ok(locks.has('IRIS_SEEDS_1000_1029_PROHIBITED'));
  assert.ok(locks.has('T2424_0050_NO_AUTO_MERGE_OR_DEPLOY_BY_CLOSURE_AUTOMATION'));
});

test('terminal scientific outcomes cannot be represented as positive wins', async () => {
  const registry = await load(REGISTRY);
  const expected = new Map([
    ['NGMT-v0.1', 'NEGATIVE_OR_INCONCLUSIVE'],
    ['T2424-1863', 'NEGATIVE'],
    ['NeuroCAD-typed-parser-mechanism', 'FAILED_FALSIFIED'],
    ['Eigen-JEPA-primary', 'MIXED_NEGATIVE'],
    ['APEN-current', 'MIXED'],
    ['NPMS-current', 'INCONCLUSIVE_NON_UNIQUE'],
  ]);

  for (const [key, status] of expected) {
    const row = registry.records.find((record) => record.key === key);
    assert.ok(row, `missing closure record ${key}`);
    assert.equal(row.status, status);
    assert.equal(row.terminal, true);
    assert.equal(row.green, true, `${key} should be GREEN as a closed result`);
  }
});

test('IRIS confirmatory seeds remain quarantined', async () => {
  const registry = await load(REGISTRY);
  const iris = registry.records.find((record) => record.key === 'IRIS-v0.2');
  assert.ok(iris);
  assert.deepEqual(iris.prohibited_seeds, Array.from({ length: 30 }, (_, index) => 1000 + index));
  assert.equal(iris.green, false);
});

test('Darcy remains HOLD and cannot be promoted by bounded synthetic evidence', async () => {
  const registry = await load(REGISTRY);
  const darcy = registry.records.find((record) => record.key === 'Darcy-parent');
  assert.ok(darcy);
  assert.equal(darcy.status, 'HOLD_MIXED_ROBUSTNESS');
  assert.equal(darcy.green, false);
  assert.ok(darcy.unsupported.includes('learned neural operator superiority'));
  assert.ok(darcy.unsupported.includes('2D/3D Darcy validity'));
  assert.ok(darcy.unsupported.includes('SOTA'));
});

test('terminal freeze ledger matches the set of closed outcomes', async () => {
  const registry = await load(REGISTRY);
  const freeze = await load(FREEZE);
  const frozenKeys = new Set(freeze.frozen.map((entry) => entry.key));
  const terminalKeys = registry.records.filter((record) => record.terminal).map((record) => record.key);
  assert.deepEqual(new Set(terminalKeys), frozenKeys);
  for (const entry of freeze.frozen) {
    assert.ok(entry.verdict);
    assert.ok(entry.allowed_successor);
    assert.ok(Array.isArray(entry.forbidden) && entry.forbidden.length > 0);
  }
});
