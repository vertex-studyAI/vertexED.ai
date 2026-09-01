import assert from 'node:assert/strict';
import test from 'node:test';

import {
  MEASURED_WEAKNESS_EVIDENCE,
  normalizeMeasuredWeaknessEntry,
  summarizeMeasuredWeakness,
} from '../src/lib/weaknessEvidenceCore.mjs';

const measured = (overrides = {}) => ({
  topic: 'Quadratics',
  subject: 'Mathematics',
  score: 14,
  maxScore: 20,
  source: 'review',
  evidence: MEASURED_WEAKNESS_EVIDENCE,
  recordedAt: '2026-09-02T00:00:00.000Z',
  ...overrides,
});

test('legacy and heuristic-looking records are not treated as measured evidence', () => {
  assert.equal(normalizeMeasuredWeaknessEntry({ ...measured(), evidence: undefined }), null);
  assert.equal(normalizeMeasuredWeaknessEntry({ ...measured(), evidence: 'heuristic' }), null);

  assert.deepEqual(
    summarizeMeasuredWeakness([
      {
        topic: 'Legacy review fallback',
        subject: 'Mathematics',
        score: 6,
        maxScore: 10,
        source: 'review',
        recordedAt: '2026-09-01T00:00:00.000Z',
      },
      {
        topic: 'Mock completion proxy',
        subject: 'Physics',
        score: 7,
        maxScore: 10,
        source: 'mock',
        recordedAt: '2026-09-01T00:00:00.000Z',
      },
    ]),
    [],
  );
});

test('only valid measured-v1 scores enter mastery summaries', () => {
  const normalized = normalizeMeasuredWeaknessEntry(measured());
  assert.equal(normalized?.score, 14);
  assert.equal(normalized?.maxScore, 20);
  assert.equal(normalized?.evidence, MEASURED_WEAKNESS_EVIDENCE);

  assert.equal(normalizeMeasuredWeaknessEntry(measured({ score: 21 })), null);
  assert.equal(normalizeMeasuredWeaknessEntry(measured({ score: -1 })), null);
  assert.equal(normalizeMeasuredWeaknessEntry(measured({ maxScore: 0 })), null);
  assert.equal(normalizeMeasuredWeaknessEntry(measured({ score: Number.NaN })), null);
});

test('measured summaries average attempts and ignore untrusted records', () => {
  const summary = summarizeMeasuredWeakness([
    measured({ score: 12, recordedAt: '2026-09-01T00:00:00.000Z' }),
    measured({ score: 16, recordedAt: '2026-09-02T00:00:00.000Z' }),
    { ...measured({ score: 20 }), evidence: undefined },
  ]);

  assert.deepEqual(summary, [
    {
      topic: 'Quadratics',
      subject: 'Mathematics',
      attempts: 2,
      avgPercent: 70,
      lastSeen: '2026-09-02T00:00:00.000Z',
    },
  ]);
});

test('weakest-topic ordering remains deterministic for trusted measurements', () => {
  const summary = summarizeMeasuredWeakness(
    [
      measured({ topic: 'Vectors', score: 18 }),
      measured({ topic: 'Functions', score: 10 }),
      measured({ topic: 'Probability', score: 15 }),
    ],
    2,
  );

  assert.deepEqual(
    summary.map((entry) => entry.topic),
    ['Functions', 'Probability'],
  );
});
