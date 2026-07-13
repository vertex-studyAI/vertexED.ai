import test from 'node:test';
import assert from 'node:assert/strict';
import { applyEvidenceToState, masteryPercent, nextReviewAt } from '../api/_lib/mastery.js';

test('applyEvidenceToState updates beta mastery state from evidence', () => {
  const updated = applyEvidenceToState(
    { alpha: 2, beta: 2, evidence_count: 3 },
    { evidence_type: 'deterministic_correct', score_normalized: 1, observed_at: '2026-07-12T00:00:00.000Z' },
  );

  assert.equal(updated.evidence_count, 4);
  assert.ok(updated.alpha > 2);
  assert.equal(masteryPercent(updated), 60);
});

test('nextReviewAt schedules weaker outcomes sooner than stronger ones', () => {
  const weak = nextReviewAt(
    { alpha: 2, beta: 4, evidence_count: 2 },
    { score_normalized: 0, observed_at: '2026-07-12T00:00:00.000Z' },
  );
  const strong = nextReviewAt(
    { alpha: 8, beta: 2, evidence_count: 5 },
    { score_normalized: 1, observed_at: '2026-07-12T00:00:00.000Z' },
  );

  assert.ok(new Date(weak).getTime() < new Date(strong).getTime());
});
