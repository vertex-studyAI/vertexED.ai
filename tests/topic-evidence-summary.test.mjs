import assert from 'node:assert/strict';
import test from 'node:test';

import { summarizeTopicEvidence } from '../src/lib/topicEvidenceSummary.mjs';

const verified = (id, topic, score, recordedAt, extra = {}) => ({
  id,
  topic,
  subject: 'Physics',
  score,
  maxScore: 10,
  source: 'review',
  evidence: 'measured-v2',
  recordedAt,
  verification: {
    method: 'official-mark-scheme',
    confirmedAt: recordedAt,
  },
  ...extra,
});

test('topic evidence stays subject-scoped, verified-only, and deduplicated', () => {
  const one = verified('a', 'Forces', 4, '2026-09-01T00:00:00Z');
  const result = summarizeTopicEvidence([
    one,
    one,
    verified('b', 'Forces', 7, '2026-09-03T00:00:00Z'),
    { ...verified('c', 'Energy', 8, '2026-09-02T00:00:00Z'), evidence: undefined },
    { ...verified('d', 'Forces', 10, '2026-09-04T00:00:00Z'), subject: 'Mathematics' },
  ], 'Physics');

  assert.equal(result.length, 1);
  assert.equal(result[0].topic, 'Forces');
  assert.equal(result[0].attempts, 2);
  assert.equal(result[0].averagePercent, 55);
  assert.equal(result[0].latestPercent, 70);
  assert.equal(result[0].changePercentPoints, 30);
  assert.equal(result[0].entries[0].id, 'b');
});

test('same-time or single observations do not invent a repeated-topic change', () => {
  const sameTime = summarizeTopicEvidence([
    verified('a', 'Momentum', 4, '2026-09-01T00:00:00Z'),
    verified('b', 'Momentum', 8, '2026-09-01T00:00:00Z'),
  ], 'Physics');
  assert.equal(sameTime[0].changePercentPoints, null);

  const single = summarizeTopicEvidence([
    verified('c', 'Energy', 6, '2026-09-02T00:00:00Z'),
  ], 'Physics');
  assert.equal(single[0].changePercentPoints, null);
});

test('topics sort weakest verified average first rather than implying syllabus order', () => {
  const result = summarizeTopicEvidence([
    verified('a', 'Energy', 9, '2026-09-01T00:00:00Z'),
    verified('b', 'Forces', 3, '2026-09-02T00:00:00Z'),
    verified('c', 'Momentum', 6, '2026-09-03T00:00:00Z'),
  ], 'Physics');
  assert.deepEqual(result.map((row) => row.topic), ['Forces', 'Momentum', 'Energy']);
});
