import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
  assessHistoricalEvalReadiness,
  assertHistoricalEvalAuthorized,
} from '../portfolio/project2424/projects/T2424-0038/src/historical-eval-preflight.mjs';

const freezeUrl = new URL(
  '../portfolio/project2424/projects/T2424-0038/historical-eval-freeze.json',
  import.meta.url,
);

async function currentFreeze() {
  return JSON.parse(await readFile(freezeUrl, 'utf8'));
}

test('current Obscured historical evaluation remains fail-closed before corpus/label freeze', async () => {
  const assessment = assessHistoricalEvalReadiness(await currentFreeze());
  assert.equal(assessment.ready_for_evaluation, false);
  assert.equal(assessment.prerequisites_closed, false);
  assert.equal(assessment.evaluation_authorized, false);

  const blockerIds = assessment.blockers.map(({ id }) => id);
  for (const expected of [
    'candidate_repository_revision',
    'data_manifest_sha256',
    'sealed_label_manifest_sha256',
    'baseline_implementation_sha256',
    'selection_rule_record_sha256',
    'editor_blinding_record_sha256',
    'publisher_independence_review_sha256',
    'environment_lock_sha256',
    'evaluation_script_sha256',
    'bootstrap_spec_sha256',
    'evaluation_authorization_flag',
  ]) {
    assert.ok(blockerIds.includes(expected), `missing expected blocker ${expected}`);
  }

  for (const closed of [
    'protocol_identity',
    'pre_outcome_state',
    'candidate_blob',
    'baseline_set',
    'primary_metric_set',
    'primary_gate_thresholds',
  ]) {
    assert.ok(!blockerIds.includes(closed), `unexpected blocker ${closed}`);
  }
});

test('authorization assertion refuses the current pre-outcome freeze', async () => {
  const config = await currentFreeze();
  assert.throws(
    () => assertHistoricalEvalAuthorized(config),
    /OBSCURED_HISTORICAL_EVAL_BLOCKED/,
  );
});

test('malformed freeze objects fail closed', () => {
  assert.throws(() => assessHistoricalEvalReadiness(null), TypeError);
  const assessment = assessHistoricalEvalReadiness({});
  assert.equal(assessment.ready_for_evaluation, false);
  assert.ok(assessment.blocker_count > 0);
});

test('synthetic fully frozen control object closes all gates without loading outcomes', async () => {
  const config = structuredClone(await currentFreeze());
  const revision = '1234567890abcdef1234567890abcdef12345678';
  const hashes = {
    data_manifest_sha256: '1'.repeat(64),
    sealed_label_manifest_sha256: '2'.repeat(64),
    baseline_implementation_sha256: '3'.repeat(64),
    selection_rule_record_sha256: '4'.repeat(64),
    editor_blinding_record_sha256: '5'.repeat(64),
    publisher_independence_review_sha256: '6'.repeat(64),
    environment_lock_sha256: '7'.repeat(64),
    evaluation_script_sha256: '8'.repeat(64),
    bootstrap_spec_sha256: '9'.repeat(64),
  };
  config.candidate.repository_revision = revision;
  config.unresolved_pre_evaluation.candidate_repository_revision = revision;
  Object.assign(config.unresolved_pre_evaluation, hashes);
  config.evaluation_authorized = true;

  const assessment = assessHistoricalEvalReadiness(config);
  assert.equal(assessment.prerequisites_closed, true);
  assert.equal(assessment.evaluation_authorized, true);
  assert.equal(assessment.ready_for_evaluation, true);
  assert.equal(assessment.blocker_count, 0);
  assert.doesNotThrow(() => assertHistoricalEvalAuthorized(config));
});
