import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = 'portfolio/project2424/projects/T2424-0025';

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));

function close(actual, expected, tolerance = 1e-15) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);
}

test('T2424-0025 current-main paper is bound to retained frozen evidence without outcome execution', async () => {
  const [metrics, figureData, reconciliation, results, manuscript] = await Promise.all([
    readJson(`${root}/raw_metrics/repro-wave-20260812.json`),
    readJson(`${root}/figures/FIGURE_DATA.json`),
    readJson(`${root}/CURRENT_MAIN_RECONCILIATION.json`),
    readFile(`${root}/RESULTS.md`, 'utf8'),
    readFile(`${root}/MANUSCRIPT.md`, 'utf8'),
  ]);

  assert.equal(reconciliation.current_main_base, 'f4dbbb4bc9d0942332b03b32d65e3e39f1052382');
  assert.equal(reconciliation.historical_paper_head, '5ba11a2a921df5b27556c31013f09ed66595b588');
  assert.equal(reconciliation.frozen_experiment_source, metrics.source_commit);
  assert.equal(reconciliation.retained_screen_verdict, metrics.screen.verdict);
  assert.equal(reconciliation.scientific_execution_performed, false);
  assert.equal(reconciliation.outcome_reexecution_performed, false);
  assert.equal(reconciliation.seed_policy_changed, false);
  assert.equal(reconciliation.split_policy_changed, false);
  assert.equal(reconciliation.threshold_changed, false);
  assert.equal(reconciliation.claim_boundary_changed, false);
  assert.equal(reconciliation.release_authorized, false);

  assert.equal(metrics.screen.seeds, 30);
  assert.equal(metrics.ablation.seeds_per_condition, 50);
  assert.deepEqual(metrics.ablation.summary.map((row) => row.contamination), [0, 0.05, 0.1, 0.18, 0.25, 0.35]);

  close(metrics.screen.heavy_tail.baseline_mae, 0.36152678546712497);
  close(metrics.screen.heavy_tail.robust_mae, 0.016560942261867797);
  close(metrics.screen.clean.baseline_mae, 0.024354967043193555);
  close(metrics.screen.clean.robust_mae, 0.012593962713833545);

  const zero = metrics.ablation.summary[0];
  close(zero.mean.mae, 0.02464691771133496);
  close(zero.median.mae, 0.012569888975136025);
  const zeroReduction = (zero.mean.mae - zero.median.mae) / zero.mean.mae;
  close(figureData.derived[0].median_relative_improvement_vs_mean, zeroReduction);
  assert.ok(zeroReduction > 0.48 && zeroReduction < 0.50);

  for (const required of [
    'does not isolate a uniquely non-Gaussian-memory mechanism',
    'No significance claim is made',
    '0.0246469',
    '0.0125699',
  ]) assert.ok(results.includes(required), `RESULTS.md missing retained boundary: ${required}`);

  for (const required of [
    'does not establish a Transformer result',
    'does not establish a Transformer result, a learned-memory advantage, or a uniquely non-Gaussian memory mechanism',
    'The contamination sweep was conducted as a mechanism-oriented follow-up rather than as a preregistered confirmatory study.',
    '0.0246469',
    '0.0125699',
    '49.00%',
  ]) assert.ok(manuscript.includes(required), `MANUSCRIPT.md missing claim/evidence binding: ${required}`);

  for (const forbidden of [
    /statistically significant/i,
    /state[- ]of[- ]the[- ]art/i,
    /establishes? (?:a |the )?Transformer/i,
    /proves? (?:a |the )?(?:uniquely )?non-Gaussian/i,
    /external validation (?:was|is) established/i,
  ]) assert.equal(forbidden.test(manuscript), false, `Unsupported positive claim matched ${forbidden}`);
});
