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
  t.diagnostic(`darcy-v2-split-manifest-sha256=${first}`);
});

test('misaligned piecewise splits never place interfaces on primary coarse boundaries', () => {
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

test('v2 case generation is deterministic and strictly positive', () => {
  for (const [split, seed] of [['train', 0], ['ood_a', 300000], ['ood_c', 320000], ['ood_d', 330000], ['ood_e', 340000]]) {
    const first = generateV2Permeability(split, seed);
    const second = generateV2Permeability(split, seed);
    assert.deepEqual(first, second);
    assert.equal(first.permeability.length, 128);
    assert.ok(first.permeability.every((value) => Number.isFinite(value) && value > 0));
  }
});

test('harmonic M1 preserves discrete total resistance and therefore exact flux at fixed blocks', () => {
  const { permeability } = generateV2Permeability('ood_c', 320007);
  const result = evaluateV2DeterministicControls(permeability);
  assert.ok(result.report.M1.fluxRelativeError < 1e-12);
  assert.ok(result.report.M1.leftBoundaryError < 1e-12);
  assert.ok(result.report.M1.rightBoundaryError < 1e-12);
  assert.ok(result.report.A1.pressureMae >= 0);
  assert.ok(result.report.A2.pressureMae >= 0);
  assert.ok(result.report.B1.pressureMae >= 0);
});

test('machine-readable freeze keeps all learned/outcome work locked', async () => {
  const config = JSON.parse(await readFile(configUrl, 'utf8'));
  assert.equal(config.outcome_state, 'EXPERIMENT_NOT_YET_RUN');
  assert.equal(config.training_authorized, false);
  assert.equal(config.systems.M1.state, 'IMPLEMENTED');
  assert.equal(config.systems.A1.state, 'IMPLEMENTED');
  assert.equal(config.systems.A2.state, 'IMPLEMENTED');
  assert.equal(config.systems.B1.state, 'IMPLEMENTED');
  assert.equal(config.systems.B2.state, 'BLOCKED_IMPLEMENTATION');
  assert.equal(config.systems.B3.state, 'BLOCKED_IMPLEMENTATION');
  assert.equal(config.systems.B4.state, 'BLOCKED_IMPLEMENTATION');
  assert.equal(config.unresolved_pretraining_blockers.hardware_identity, null);
  assert.equal(config.unresolved_pretraining_blockers.learned_environment_lock, null);
  assert.equal(config.unresolved_pretraining_blockers.split_manifest_sha256, null);
});
