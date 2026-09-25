import assert from 'node:assert/strict';
import test from 'node:test';

import { analyzeCalibration } from '../evals/research/calibration-analysis.mjs';
import { generateBalancedAssignments } from '../evals/research/trial-protocol.mjs';

test('confidence outcome density preserves observation counts by outcome', () => {
  const result = analyzeCalibration([
    { participant_id: 'p1', item_id: 'a', confidence: 0.91, correct: true, support_present: true },
    { participant_id: 'p1', item_id: 'b', confidence: 0.92, correct: false, support_present: false },
    { participant_id: 'p2', item_id: 'a', confidence: 0.15, correct: false, support_present: true },
  ], { bins: 10 });
  const high = result.confidence_outcome_density_bins[9];
  assert.equal(high.n, 2);
  assert.equal(high.correct, 1);
  assert.equal(high.incorrect, 1);
  assert.equal(high.with_support, 1);
  assert.equal(high.without_support, 1);
  assert.equal(result.confidence_outcome_density_bins.reduce((sum, bin) => sum + bin.n, 0), 3);
});

test('balanced assignment is reproducible and arm counts differ by at most one', () => {
  const participants = Array.from({ length: 11 }, (_, index) => `p-${index}`);
  const first = generateBalancedAssignments(participants, { seed: 'frozen-seed-2026-09-14' });
  const second = generateBalancedAssignments(participants, { seed: 'frozen-seed-2026-09-14' });
  assert.deepEqual(first, second);
  const counts = Object.values(first.arm_counts);
  assert.ok(Math.max(...counts) - Math.min(...counts) <= 1);
  assert.equal(first.assignments.length, participants.length);
});

test('changing randomization seed changes assignment artifact', () => {
  const participants = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const first = generateBalancedAssignments(participants, { seed: 'seed-a' });
  const second = generateBalancedAssignments(participants, { seed: 'seed-b' });
  assert.notEqual(first.seed_commitment_sha256, second.seed_commitment_sha256);
  assert.notDeepEqual(first.assignments, second.assignments);
});

test('assignment generator rejects duplicate participants and conditions', () => {
  assert.throws(
    () => generateBalancedAssignments(['p1', 'p1'], { seed: 'seed' }),
    /participantIds must be unique/,
  );
  assert.throws(
    () => generateBalancedAssignments(['p1', 'p2'], { seed: 'seed', conditions: ['x', 'x'] }),
    /conditions must be unique/,
  );
});
