import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = 'portfolio/project2424/projects/T2424-0025';
const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));

function close(actual, expected, tolerance = 1e-15) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);
}

test('current-main preprint receipt is bound to retained evidence and stays non-authorizing', async () => {
  const [receipt, reconciliation, metrics] = await Promise.all([
    readJson(`${root}/PREPRINT_READINESS.json`),
    readJson(`${root}/CURRENT_MAIN_RECONCILIATION.json`),
    readJson(`${root}/raw_metrics/repro-wave-20260812.json`),
  ]);

  assert.equal(receipt.project_id, 'T2424-0025');
  assert.equal(receipt.parent_pr, 764);
  assert.equal(receipt.parent_head, '33f475c300f6514354cc6cd7b6e344c7652cc46d');
  assert.equal(receipt.current_main_base, reconciliation.current_main_base);
  assert.equal(receipt.frozen_experiment_source, reconciliation.frozen_experiment_source);
  assert.equal(receipt.frozen_experiment_source, metrics.source_commit);
  assert.equal(receipt.scientific_execution_performed, false);
  assert.equal(receipt.outcome_reexecution_performed, false);
  assert.equal(receipt.outcome_access_changed, false);
  assert.equal(receipt.seed_policy_changed, false);
  assert.equal(receipt.split_policy_changed, false);
  assert.equal(receipt.threshold_changed, false);
  assert.equal(receipt.significance_procedure_added, false);
  assert.equal(receipt.external_validation_established, false);
  assert.equal(receipt.transformer_evidence, false);
  assert.equal(receipt.learned_memory_evidence, false);
  assert.equal(receipt.real_data_evidence, false);
  assert.equal(receipt.preprint_ready, false);
  assert.equal(receipt.release_authorized, false);
  assert.equal(receipt.open_release_blocks.length, 4);
});

test('readiness values reconcile exactly to the retained 30-seed screen and 50-seed sweep', async () => {
  const [receipt, metrics] = await Promise.all([
    readJson(`${root}/PREPRINT_READINESS.json`),
    readJson(`${root}/raw_metrics/repro-wave-20260812.json`),
  ]);

  assert.equal(receipt.retained_results.screen_seeds, metrics.screen.seeds);
  assert.equal(receipt.retained_results.ablation_seeds_per_condition, metrics.ablation.seeds_per_condition);
  close(receipt.retained_results.heavy_tail_mean_mae, metrics.screen.heavy_tail.baseline_mae);
  close(receipt.retained_results.heavy_tail_weighted_median_mae, metrics.screen.heavy_tail.robust_mae);
  close(receipt.retained_results.clean_mean_mae, metrics.screen.clean.baseline_mae);
  close(receipt.retained_results.clean_weighted_median_mae, metrics.screen.clean.robust_mae);

  const zero = metrics.ablation.summary.find((row) => row.contamination === 0);
  assert.ok(zero, 'missing retained zero-contamination row');
  close(receipt.retained_results.zero_contamination_mean_mae, zero.mean.mae);
  close(receipt.retained_results.zero_contamination_weighted_median_mae, zero.median.mae);
  close(
    receipt.retained_results.zero_contamination_median_relative_reduction,
    (zero.mean.mae - zero.median.mae) / zero.mean.mae,
  );
  assert.equal(receipt.retained_results.unique_heavy_tail_attribution, 'FALSIFIED_NOT_ISOLATED');
});

test('submission documents preserve bounded claims and human release blockers', async () => {
  const [manuscript, readiness, claimAudit, metadata, related] = await Promise.all([
    readFile(`${root}/MANUSCRIPT.md`, 'utf8'),
    readFile(`${root}/PREPRINT_READINESS.md`, 'utf8'),
    readFile(`${root}/CLAIM_AUDIT.md`, 'utf8'),
    readFile(`${root}/RELEASE_METADATA.md`, 'utf8'),
    readFile(`${root}/RELATED_WORK_AUDIT.md`, 'utf8'),
  ]);

  for (const phrase of [
    'does not establish a Transformer result',
    'The contamination sweep was conducted as a mechanism-oriented follow-up rather than as a preregistered confirmatory study.',
    '0.0246469',
    '0.0125699',
    '49.00%',
  ]) assert.ok(manuscript.includes(phrase), `MANUSCRIPT.md missing boundary: ${phrase}`);

  assert.match(readiness, /NO-GO \/ NOT PREPRINT_READY/);
  assert.match(readiness, /FALSIFIED \/ NOT ISOLATED/);
  assert.match(readiness, /authorized final authorship\/contribution statement/);
  assert.match(claimAudit, /RELEASE AUTHORITY OPEN/);
  assert.match(metadata, /No repository-root `LICENSE` file is present/);
  assert.match(metadata, /GitHub Actions artifact retention is not a permanent scientific archive/);

  for (const ref of [
    '10.1214/aoms/1177703732',
    '10.1214/11-AIHP454',
    '2010.15651',
    '2402.02032',
    '1410.3916',
    '1410.5401',
    '10.52202/079017-4370',
  ]) assert.ok(related.includes(ref), `RELATED_WORK_AUDIT.md missing retained source identity: ${ref}`);

  for (const forbidden of [
    /statistically significant/i,
    /state[- ]of[- ]the[- ]art/i,
    /establishes? (?:a |the )?Transformer/i,
    /proves? (?:a |the )?(?:uniquely )?non-Gaussian/i,
    /external validation (?:was|is) established/i,
  ]) assert.equal(forbidden.test(manuscript), false, `unsupported positive manuscript claim matched ${forbidden}`);
});

test('paper artifact receipt remains exact, temporary, and non-self-certifying', async () => {
  const receipt = await readJson(`${root}/PREPRINT_READINESS.json`);
  assert.equal(receipt.paper_artifact.workflow_run_id, 34040484292);
  assert.equal(receipt.paper_artifact.source_head, receipt.parent_head);
  assert.equal(receipt.paper_artifact.artifact_id, 9991520057);
  assert.equal(receipt.paper_artifact.artifact_digest, 'sha256:7b9f4bd4362a335f103ed8a07f1fa67a66395af492881007da6eb3b170943145');
  assert.equal(receipt.paper_artifact.pdf_sha256, '6cb16ac5662b7fadbf06c50e14174d190693fe22e56023cd8c0d106646b3722c');
  assert.equal(receipt.paper_artifact.pdf_pages, 7);
  assert.equal(receipt.paper_artifact.permanent_archive, false);
  assert.equal(receipt.paper_artifact.ci_self_certifies_visual_review, false);
  assert.equal(receipt.paper_artifact.page_by_page_visual_review_recorded_in_parent_pr, true);
});
