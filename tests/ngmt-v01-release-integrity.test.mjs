import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { buildManifest, ROOT } from '../scripts/generate-ngmt-v01-release-manifest.mjs';

test('NGMT v0.1 manifest deterministically binds frozen repository evidence', async () => {
  const checked = JSON.parse(await readFile(`${ROOT}/NGMT_V01_RELEASE_MANIFEST.json`, 'utf8'));
  assert.deepEqual(await buildManifest(), checked);
  assert.equal(checked.files.length, 14);
  assert.equal(checked.verdict, 'NEGATIVE_OR_INCONCLUSIVE_NGMT_V01');
  assert.equal(checked.hypothesis_supported, false);
  assert.equal(checked.mechanism_advantage_supported, false);
  assert.equal(checked.preprint_ready, false);
});

test('NGMT v0.1 paired effects recompute to the frozen failed gates', async () => {
  const metadata = JSON.parse(await readFile(`${ROOT}/ngmt_v01_experiment_metadata.json`, 'utf8'));
  const rows = metadata.paired_seed_effects;
  assert.deepEqual(rows.map((row) => row.seed), [11, 23, 37]);
  const mean = (key) => rows.reduce((sum, row) => sum + row[key], 0) / rows.length;
  assert.ok(Math.abs(mean('relative_b3_over_b2') - 0.004945732296129727) < 1e-15);
  assert.ok(Math.abs(mean('relative_b3_over_b1') - 0.004392875989642753) < 1e-15);
  assert.ok(Math.abs(mean('gaussian_clean_relative_regression_b3_vs_b2') - 0.009600300111813348) < 1e-15);
  assert.equal(metadata.criteria_passed.b3_over_b2_adverse_improvement, false);
  assert.equal(metadata.criteria_passed.b3_over_b1_adverse_improvement, false);
  assert.equal(metadata.criteria_passed.clean_regression_guardrail, true);
  assert.equal(metadata.verdict, 'NEGATIVE_OR_INCONCLUSIVE_NGMT_V01');
});

test('NGMT v0.1 fairness and exact-replay boundaries fail closed', async () => {
  const [metadata, replay, manifest] = await Promise.all([
    readFile(`${ROOT}/ngmt_v01_experiment_metadata.json`, 'utf8').then(JSON.parse),
    readFile(`${ROOT}/ngmt_v01_replay_verification.json`, 'utf8').then(JSON.parse),
    readFile(`${ROOT}/NGMT_V01_RELEASE_MANIFEST.json`, 'utf8').then(JSON.parse),
  ]);
  assert.deepEqual(Object.values(metadata.arms).map((arm) => arm.trainable_parameters), [6049, 6049, 6049, 6049]);
  assert.deepEqual([metadata.arms.B1.runtime_memory_scalars, metadata.arms.B2.runtime_memory_scalars, metadata.arms.B3.runtime_memory_scalars], [18, 18, 18]);
  assert.equal(metadata.valid_execution.run_count, 12);
  for (const value of Object.values(replay.exact_matches)) assert.equal(value, true);
  assert.deepEqual(Object.keys(replay.expected_nonmatches).sort(), ['artifact_zip_sha256', 'full_results_json_sha256', 'runtime_seconds']);
  assert.match(manifest.relationship_to_t2424_0025, /distinct learned B0-B3 experiment/);
  assert.deepEqual(manifest.stop_rules, [
    'no_rescue_tuning','no_seed_expansion','no_condition_dropping','no_threshold_movement','no_positive_result_ablations','new_versioned_protocol_required_for_successor',
  ]);
});

test('NGMT v0.1 reports no significance or unsupported superiority', async () => {
  const results = await readFile(`${ROOT}/RESULTS.md`, 'utf8');
  assert.match(results, /negative\/inconclusive/);
  assert.match(results, /Do not claim NGMT superiority/);
  assert.match(results, /no statistical-significance claim/i);
  assert.match(results, /Do not rescue v0\.1/);
});
