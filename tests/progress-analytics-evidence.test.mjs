import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const analyticsSource = fs.readFileSync('src/lib/progressAnalytics.ts', 'utf8');
const cardSource = fs.readFileSync('src/components/ProgressAnalyticsCard.tsx', 'utf8');
const readinessSource = fs.readFileSync('src/lib/examReadiness.ts', 'utf8');
const readinessRingSource = fs.readFileSync('src/components/dashboard/ExamReadinessRing.tsx', 'utf8');

test('progress analytics records whether mastery is backed by tracked topic data', () => {
  assert.match(analyticsSource, /masterySampleCount\?: number/);
  assert.match(analyticsSource, /masterySampleCount = heatmap\.length/);
  assert.match(analyticsSource, /hasMasteryData: boolean/);
  assert.match(analyticsSource, /const hasMasteryData = masterySnapshots\.length > 0/);
});

test('legacy or empty mastery history is not converted into a synthetic 50 percent score', () => {
  assert.doesNotMatch(analyticsSource, /:\s*50;/);
  assert.match(analyticsSource, /masterySampleCount \?\? 0/);
  assert.match(analyticsSource, /:\s*0;/);
});

test('progress card renders an unavailable state instead of a fake mastery percentage', () => {
  assert.match(cardSource, /trend\.hasMasteryData \? `\$\{trend\.avgMastery\}%` : '—'/);
  assert.match(cardSource, /No tracked mastery yet/);
  assert.match(cardSource, /trend\.hasMasteryData && trend\.masteryTrend/);
});

test('heuristic study time is explicitly documented as an estimate in analytics source', () => {
  assert.match(analyticsSource, /heuristic convenience estimate, not measured study time/);
  assert.match(analyticsSource, /studyMinutesEstimate/);
});

test('exam readiness requires scored assessment evidence instead of a synthetic mastery prior', () => {
  assert.match(readinessSource, /const hasAssessmentEvidence = heatmap\.length > 0/);
  assert.doesNotMatch(readinessSource, /:\s*55;/);
  assert.match(readinessSource, /const score = hasAssessmentEvidence \? Math\.min\(100, Math\.max\(0, raw\)\) : 0/);
  assert.match(readinessSource, /const band: ReadinessBand = hasAssessmentEvidence \? bandForScore\(score\) : 'unknown'/);
  assert.match(readinessSource, /Complete a scored review to calibrate/);
});

test('exam readiness ring renders unavailable when readiness has not been calibrated', () => {
  assert.match(readinessRingSource, /const hasReadinessEvidence = readiness\.band !== 'unknown'/);
  assert.match(readinessRingSource, /hasReadinessEvidence \? readiness\.score : '—'/);
  assert.match(readinessRingSource, /hasReadinessEvidence \? c - \(readiness\.score \/ 100\) \* c : c/);
});
