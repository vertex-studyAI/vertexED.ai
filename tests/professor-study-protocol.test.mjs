import assert from 'node:assert/strict';
import test from 'node:test';

import { analyzeCalibration } from '../evals/research/calibration-analysis.mjs';
import { validateTrialManifest } from '../evals/research/trial-protocol.mjs';

test('calibration analysis computes reliability bins, ECE and support strata', () => {
  const result = analyzeCalibration([
    { participant_id: 'p1', item_id: 'a', confidence: 0.9, correct: true, support_present: true },
    { participant_id: 'p1', item_id: 'b', confidence: 0.8, correct: false, support_present: false },
    { participant_id: 'p2', item_id: 'a', confidence: 0.2, correct: false, support_present: true },
    { participant_id: 'p2', item_id: 'b', confidence: 0.6, correct: true, support_present: false },
  ], { bins: 5 });
  assert.equal(result.overall.n, 4);
  assert.equal(result.overall.accuracy, 0.5);
  assert.equal(result.support_strata.with_support.n, 2);
  assert.equal(result.support_strata.without_support.n, 2);
  assert.equal(result.reliability_bins.reduce((sum, bin) => sum + bin.n, 0), 4);
  assert.equal(result.evidence_status, 'EXPLORATORY_OR_INCOMPLETE');
});

test('calibration analysis rejects duplicate participant-item rows', () => {
  const row = { participant_id: 'p1', item_id: 'a', confidence: 0.7, correct: true, support_present: true };
  assert.throws(() => analyzeCalibration([row, row]), /duplicate participant\/item/);
});

test('calibration analysis rejects invalid confidence and inferred support', () => {
  assert.throws(() => analyzeCalibration([
    { participant_id: 'p1', item_id: 'a', confidence: 1.2, correct: true, support_present: true },
  ]), /probability/);
  assert.throws(() => analyzeCalibration([
    { participant_id: 'p1', item_id: 'a', confidence: 0.9, correct: true, support_present: 1 },
  ]), /support_present must be boolean/);
});

test('trial manifest validates frozen assignment, duration, headroom and IDs', () => {
  const result = validateTrialManifest([
    {
      participant_id: 'p1', assignment_token: 'r001', condition: 'vertexed', planned_condition: 'vertexed',
      duration_minutes: 60, topic_id: 'topic-a', assessment_form_id: 'form-a', pre_percent: 50,
    },
    {
      participant_id: 'p2', assignment_token: 'r002', condition: 'control', planned_condition: 'control',
      duration_minutes: 60, topic_id: 'topic-a', assessment_form_id: 'form-b', pre_percent: 45,
    },
  ], { maxHeadroomPrePercent: 70 });
  assert.equal(result.participants, 2);
  assert.deepEqual(result.arm_counts, { vertexed: 1, control: 1 });
  assert.equal(result.required_minutes, 60);
});

test('trial manifest rejects malformed allowed-condition configuration', () => {
  const rows = [{
    participant_id: 'p1', assignment_token: 'r001', condition: 'vertexed', planned_condition: 'vertexed',
    duration_minutes: 60, topic_id: 'topic-a', assessment_form_id: 'form-a', pre_percent: 50,
  }];
  assert.throws(
    () => validateTrialManifest(rows, { allowedConditions: ['vertexed', 'vertexed'] }),
    /allowedConditions must be unique/,
  );
  assert.throws(
    () => validateTrialManifest(rows, { allowedConditions: ['vertexed', '   '] }),
    /allowed_condition must be a non-empty bounded string/,
  );
  assert.throws(
    () => validateTrialManifest(rows, { allowedConditions: ['vertexed', 42] }),
    /allowed_condition must be a non-empty bounded string/,
  );
});

test('trial manifest rejects assignment drift', () => {
  assert.throws(() => validateTrialManifest([
    {
      participant_id: 'p1', assignment_token: 'r001', condition: 'control', planned_condition: 'vertexed',
      duration_minutes: 60, topic_id: 'topic-a', assessment_form_id: 'form-a', pre_percent: 50,
    },
  ]), /assignment mismatch/);
});

test('trial manifest rejects duration and headroom drift', () => {
  assert.throws(() => validateTrialManifest([
    {
      participant_id: 'p1', assignment_token: 'r001', condition: 'vertexed', planned_condition: 'vertexed',
      duration_minutes: 55, topic_id: 'topic-a', assessment_form_id: 'form-a', pre_percent: 50,
    },
  ]), /duration mismatch/);

  assert.throws(() => validateTrialManifest([
    {
      participant_id: 'p1', assignment_token: 'r001', condition: 'vertexed', planned_condition: 'vertexed',
      duration_minutes: 60, topic_id: 'topic-a', assessment_form_id: 'form-a', pre_percent: 85,
    },
  ], { maxHeadroomPrePercent: 70 }), /headroom rule violated/);
});

test('trial manifest rejects duplicate assignment tokens', () => {
  assert.throws(() => validateTrialManifest([
    {
      participant_id: 'p1', assignment_token: 'same', condition: 'vertexed', planned_condition: 'vertexed',
      duration_minutes: 60, topic_id: 'topic-a', assessment_form_id: 'form-a', pre_percent: 50,
    },
    {
      participant_id: 'p2', assignment_token: 'same', condition: 'control', planned_condition: 'control',
      duration_minutes: 60, topic_id: 'topic-a', assessment_form_id: 'form-b', pre_percent: 50,
    },
  ]), /duplicate assignment_token/);
});
