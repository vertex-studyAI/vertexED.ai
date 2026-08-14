import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
  DARCY_V2_PRIMARY_BLOCKS,
  DARCY_V2_SPLITS,
  buildV2SplitManifest,
  evaluateV2DeterministicControls,
  generateV2Permeability,
  hashV2Manifest,
  resolveV2CaseSpec,
} from '../portfolio/project2424/projects/T2424-0050/src/v2.mjs';

const configUrl = new URL('../portfolio/project2424/projects/T2424-0050/v2-freeze-config.json', import.meta.url);
const frozenSplitManifestSha256 = '4211d11da7d40f0991bd963c04fb118f34d9fe923e7664da301122b29b0bef85';

test('Darcy v2 split manifest is complete, outcome-free and hash-stable', (t) => {
  const manifest = buildV2SplitManifest();
  assert.equal(manifest.outcomeEvaluated, false);
  assert.equal(manifest.cases.length, 8192);
  assert.equal(manifest.cases[0].seed, 0);
  assert.equal(manifest.cases.at(-1).seed, 340511);

  const expectedCounts = Object.fromEntries(Object.keys(DARCY_V2_SPLITS).map((key) => [key, 0]));
  for (const row of manifest.cases) expectedCounts[row.split] += 1;
  for (const [split, spec] of Object.entries(DARCY_V2_SPLITS)) {
    assert.equal(expectedCounts[split], spec.count);
  }

  const first = hashV2Manifest(manifest);
  const second = hashV2Manifest(buildV2SplitManifest());
  assert.match(first, /^[0-9a-f]{64}$/);
  assert.equal(first, second);
  assert.equal(first, frozenSplitManifestSha256);
  t.diagnostic(`darcy-v2-split-manifest-sha256=${first}`);
});

test('misaligned piecewise split specs never place interfaces on primary coarse boundaries', () => {
  // This validates pre-outcome manifest construction only. It does not solve a frozen test case or compute a metric.
  for (const seed of [320000, 320001, 320127, 320511, 340000, 340127, 340511]) {
    const split = seed < 330000 ? 'ood_c' : 'ood_e';
    const spec = resolveV2CaseSpec(split, seed);
    const blockSize = spec.cellCount / DARCY_V2_PRIMARY_BLOCKS;
    assert.equal(spec.boundaries.length, spec.segmentCount - 1);
    assert.deepEqual([...spec.boundaries].sort((a, b) => a - b), spec.boundaries);
    for (const boundary of spec.boundaries) {
      assert.ok(boundary > 0 && boundary < spec.cellCount);
      assert.notEqual(boundary % blockSize, 0);
    }
  }
});

test('v2 generator implementation is deterministic and strictly positive without evaluating scientific metrics', () => {
  // Generator correctness may be checked before training, but no reference-solver error metric is computed here.
  for (const [split, seed] of [['train', 0], ['ood_a', 300000], ['ood_c', 320000], ['ood_d', 330000], ['ood_e', 340000]]) {
    const first = generateV2Permeability(split, seed);
    const second = generateV2Permeability(split, seed);
    assert.deepEqual(first, second);
    assert.equal(first.permeability.length, 128);
    assert.ok(first.permeability.every((value) => Number.isFinite(value) && value > 0));
  }
});

test('harmonic M1 resistance/flux unit property uses a non-protocol fixture, not a frozen ID/OOD case', () => {
  // IMPORTANT: never use a frozen train/validation/ID-test/OOD seed in this solver-metric unit test.
  // This hand-constructed positive field is outside the scientific generator and therefore cannot leak a v2 outcome.
  const permeability = Array.from({ length: 128 }, (_, index) => {
    const block = Math.floor(index / 16);
    const within = index % 16;
    return 0.35 + 0.11 * block + 0.017 * within + 0.03 * ((index * 7) % 5);
  });
  const result = evaluateV2DeterministicControls(permeability);
  assert.ok(result.report.M1.fluxRelativeError < 1e-12);
  assert.ok(result.report.M1.leftBoundaryError < 1e-12);
  assert.ok(result.report.M1.rightBoundaryError < 1e-12);
});

test('machine-readable freeze keeps outcome work locked while allowing pre-outcome comparator materialization', async () => {
  const config = JSON.parse(await readFile(configUrl, 'utf8'));
  assert.equal(config.outcome_state, 'EXPERIMENT_NOT_YET_RUN');
  assert.equal(config.training_authorized, false);
  assert.equal(config.systems.M1.state, 'IMPLEMENTED');
  assert.equal(config.systems.A1.state, 'IMPLEMENTED');
  assert.equal(config.systems.A2.state, 'IMPLEMENTED');
  assert.equal(config.systems.B1.state, 'IMPLEMENTED');
  assert.match(config.systems.B2.state, /^IMPLEMENTED_PREOUTCOME_(CI_PENDING|UNIT_VERIFIED)$/);
  assert.match(config.systems.B2.implementation_git_blob_sha, /^[0-9a-f]{40}$/);
  assert.equal(config.systems.B2.test_or_ood_for_selection, false);
  assert.equal(config.systems.B3.state, 'BLOCKED_IMPLEMENTATION');
  assert.equal(config.systems.B4.state, 'BLOCKED_IMPLEMENTATION');
  assert.match(config.generator.implementation_git_blob_sha, /^[0-9a-f]{40}$/);
  assert.equal(config.unresolved_pretraining_blockers.hardware_identity, null);
  assert.equal(config.unresolved_pretraining_blockers.learned_environment_lock, null);
  assert.equal(config.unresolved_pretraining_blockers.B2_implementation_sha, config.systems.B2.implementation_git_blob_sha);
  assert.equal(config.unresolved_pretraining_blockers.B3_implementation_sha, null);
  assert.equal(config.unresolved_pretraining_blockers.B4_implementation_sha, null);
  assert.equal(config.unresolved_pretraining_blockers.split_manifest_sha256, frozenSplitManifestSha256);
});
