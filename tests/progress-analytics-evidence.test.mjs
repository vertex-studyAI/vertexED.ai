import assert from 'node:assert/strict';
import test from 'node:test';

import {
  estimateStudyMinutes,
  formatMeasuredMastery,
  summarizeHeatmapMastery,
  summarizeSnapshotMastery,
} from '../src/lib/progressAnalyticsCore.mjs';

test('empty learner history reports no measured mastery', () => {
  assert.deepEqual(summarizeHeatmapMastery([]), {
    reviewsCompleted: 0,
    avgMastery: null,
  });

  assert.deepEqual(summarizeSnapshotMastery([]), {
    avgMastery: null,
    masteryTrend: 'flat',
    measuredCount: 0,
  });
});

test('mastery display never turns missing evidence into a percentage', () => {
  assert.equal(formatMeasuredMastery(null), 'No data');
  assert.equal(formatMeasuredMastery(Number.NaN), 'No data');
  assert.equal(formatMeasuredMastery(84), '84%');
});

test('one recorded assessment reports measured mastery without inventing a trend', () => {
  const summary = summarizeSnapshotMastery([
    {
      reviewsCompleted: 1,
      avgMastery: 72,
    },
  ]);

  assert.deepEqual(summary, {
    avgMastery: 72,
    masteryTrend: 'flat',
    measuredCount: 1,
  });
});

test('multiple recorded assessments compute measured average and trend', () => {
  const summary = summarizeSnapshotMastery([
    { reviewsCompleted: 1, avgMastery: 60 },
    { reviewsCompleted: 2, avgMastery: 70 },
    { reviewsCompleted: 1, avgMastery: 80 },
  ]);

  assert.deepEqual(summary, {
    avgMastery: 70,
    masteryTrend: 'up',
    measuredCount: 3,
  });
});

test('legacy synthetic 50 with zero reviews is excluded from evidence', () => {
  const summary = summarizeSnapshotMastery([
    { reviewsCompleted: 0, avgMastery: 50 },
    { reviewsCompleted: 1, avgMastery: 84 },
  ]);

  assert.deepEqual(summary, {
    avgMastery: 84,
    masteryTrend: 'flat',
    measuredCount: 1,
  });
});

test('heatmap mastery requires actual attempts', () => {
  assert.deepEqual(
    summarizeHeatmapMastery([{ attempts: 0, avgPercent: 91 }]),
    { reviewsCompleted: 0, avgMastery: null },
  );

  assert.deepEqual(
    summarizeHeatmapMastery([
      { attempts: 1, avgPercent: 80 },
      { attempts: 2, avgPercent: 90 },
    ]),
    { reviewsCompleted: 3, avgMastery: 85 },
  );
});

test('study minutes remain explicitly heuristic input-derived output', () => {
  assert.equal(estimateStudyMinutes({ studyStreak: 3, habitsDoneToday: 2 }), 105);
});
