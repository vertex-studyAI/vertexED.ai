import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildEvidenceLedger,
  compileDependencyWaves,
  selectWithinCpuBudget,
  verifyTaskEvidence,
} from '../portfolio/project2424/projects/T2424-0046/src/core.mjs';

const manifests = [
  {
    id: 'baseline',
    project: 'demo',
    claim: 'Establish a reproducible baseline.',
    command: 'node baseline.mjs',
    priority: 'P1',
    dependencies: [],
    expectedArtifacts: ['results/baseline.json'],
    estimatedCpuMinutes: 4,
  },
  {
    id: 'ablation',
    project: 'demo',
    claim: 'Measure one ablation against the baseline.',
    command: 'node ablation.mjs',
    priority: 'P2',
    dependencies: ['baseline'],
    expectedArtifacts: ['results/ablation.json'],
    estimatedCpuMinutes: 5,
  },
  {
    id: 'report',
    project: 'demo',
    claim: 'Package verified results without inventing evidence.',
    command: 'node report.mjs',
    priority: 'P3',
    dependencies: ['baseline', 'ablation'],
    expectedArtifacts: ['REPORT.md'],
    estimatedCpuMinutes: 2,
  },
];

test('dependency compiler emits deterministic executable waves', () => {
  const waves = compileDependencyWaves(manifests);
  assert.deepEqual(waves.map((wave) => wave.map((task) => task.id)), [
    ['baseline'],
    ['ablation'],
    ['report'],
  ]);
});

test('missing dependencies and cycles fail closed', () => {
  assert.throws(() => compileDependencyWaves([
    { ...manifests[0], dependencies: ['missing'] },
  ]), /depends on missing manifest/);

  assert.throws(() => compileDependencyWaves([
    { ...manifests[0], id: 'a', dependencies: ['b'] },
    { ...manifests[1], id: 'b', dependencies: ['a'] },
  ]), /dependency cycle detected/);
});

test('CPU budget selection never schedules a dependent task without its prerequisite', () => {
  const selection = selectWithinCpuBudget(manifests, 8);
  assert.deepEqual(selection.selected.map((task) => task.id), ['baseline']);
  assert.deepEqual(selection.deferred.map((task) => [task.id, task.reason]), [
    ['ablation', 'CPU_BUDGET_EXHAUSTED'],
    ['report', 'DEPENDENCY_NOT_SELECTED'],
  ]);
  assert.equal(selection.usedCpuMinutes, 4);
});

test('task evidence cannot become DONE without exit success, artifacts, and verification checks', () => {
  const success = verifyTaskEvidence(manifests[0], {
    exitCode: 0,
    artifacts: ['results/baseline.json'],
    checks: [{ name: 'schema', passed: true }, { name: 'reproduction', passed: true }],
  });
  assert.equal(success.state, 'DONE');
  assert.deepEqual(success.blockers, []);

  const missing = verifyTaskEvidence(manifests[0], {
    exitCode: 0,
    artifacts: [],
    checks: [{ name: 'schema', passed: true }],
  });
  assert.equal(missing.state, 'FAILED');
  assert.ok(missing.blockers.includes('EXPECTED_ARTIFACTS_MISSING'));

  const failedCommand = verifyTaskEvidence(manifests[0], {
    exitCode: 1,
    artifacts: ['results/baseline.json'],
    checks: [{ name: 'schema', passed: true }],
  });
  assert.ok(failedCommand.blockers.includes('COMMAND_DID_NOT_EXIT_ZERO'));
});

test('evidence ledger reports state counts deterministically', () => {
  const ledger = buildEvidenceLedger([
    { id: 'z', state: 'FAILED' },
    { id: 'a', state: 'DONE' },
    { id: 'm', state: 'DONE' },
  ]);
  assert.deepEqual(ledger.counts, { FAILED: 1, DONE: 2 });
  assert.deepEqual(ledger.entries.map((entry) => entry.id), ['a', 'm', 'z']);
});

test('manifest validation rejects empty artifacts and invalid priority', () => {
  assert.throws(() => compileDependencyWaves([
    { ...manifests[0], expectedArtifacts: [] },
  ]), /expectedArtifacts must contain at least one path/);
  assert.throws(() => compileDependencyWaves([
    { ...manifests[0], priority: 'URGENT' },
  ]), /priority must be P0, P1, P2, or P3/);
});
