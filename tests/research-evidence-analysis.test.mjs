import assert from 'node:assert/strict';
import test from 'node:test';

import { analyzeGrading, analyzeLearning } from '../evals/research/evidence-analysis.mjs';

test('learning analysis preserves attrition and computes paired effects', () => {
  const rows = [
    { participant_id: 'p1', condition: 'vertexed', started: true, completed: true, pre_percent: 40, post_percent: 70, delayed_percent: 65 },
    { participant_id: 'p1', condition: 'control', started: true, completed: true, pre_percent: 45, post_percent: 55, delayed_percent: 50 },
    { participant_id: 'p2', condition: 'vertexed', started: true, completed: false, pre_percent: 50, post_percent: null, delayed_percent: null },
    { participant_id: 'p2', condition: 'control', started: true, completed: true, pre_percent: 50, post_percent: 60, delayed_percent: null },
  ];
  const result = analyzeLearning(rows, { resamples: 200 });
  assert.equal(result.complete_pairs, 1);
  assert.equal(result.primary.mean_percentage_points, 20);
  assert.equal(result.attrition.vertexed.fraction, 0.5);
  assert.deepEqual(result.missing_pair_participants, ['p2']);
  assert.equal(result.evidence_status, 'EXPLORATORY_OR_INCOMPLETE');
});

test('grading analysis reports overall and subgroup errors', () => {
  const result = analyzeGrading([
    { submission_id: 's1', human_scores: [70, 72], adjudicated_score: 71, provider_score: 68, confidence: 0.8, subgroup: 'a' },
    { submission_id: 's2', human_scores: [40, 44], adjudicated_score: 42, provider_score: 48, confidence: 0.3, subgroup: 'b' },
  ]);
  assert.equal(result.overall.n, 2);
  assert.equal(result.overall.provider_mae, 4.5);
  assert.equal(result.subgroup.a.n, 1);
  assert.equal(result.evidence_status, 'EXPLORATORY_OR_INCOMPLETE');
});

test('grading analysis rejects duplicate and single-rater records', () => {
  assert.throws(() => analyzeGrading([{ submission_id: 's1', human_scores: [1], adjudicated_score: 1, provider_score: 1, confidence: 1, subgroup: 'a' }]), /two blinded/);
});
