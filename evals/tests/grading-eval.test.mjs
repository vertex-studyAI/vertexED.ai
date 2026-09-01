import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { evaluateGradingFixture } from '../scripts/run-grading-eval.mjs';

const dataset = JSON.parse(await readFile(new URL('../grading/frozen-v2.json', import.meta.url), 'utf8'));
const thresholds = JSON.parse(await readFile(new URL('../grading/thresholds-v2.json', import.meta.url), 'utf8'));

test('frozen grading fixture contains only declared synthetic data', () => {
  assert.equal(dataset.consentClass, 'synthetic-no-personal-data');
  assert.equal(dataset.cases.length, 6);
  assert.equal(thresholds.frozenBeforeEvaluation, true);
});

test('verified grading gate passes frozen review and evidence thresholds', () => {
  const result = evaluateGradingFixture(dataset, thresholds, { measuredAt: '2026-09-01T00:00:00Z' });
  assert.equal(result.passed, true);
  assert.equal(result.metrics.reviewDecisionAccuracy, 1);
  assert.equal(result.metrics.falseVerifiedRate, 0);
  assert.equal(result.metrics.acceptedEvidencePrecision, 1);
  assert.equal(result.metrics.severeFalseVerifiedRate, 0);
  assert.equal(result.metrics.groundingFailureCaptureRate, 1);
  assert.equal(result.metrics.remediationChoiceAccuracy, 1);
  assert.equal(result.metrics.normalizationFailureRate, 0);
});

test('rules and retrieval baselines remain weaker than the current grading contract', () => {
  const result = evaluateGradingFixture(dataset, thresholds);
  assert.ok(result.baselines.simpleRules.reviewDecisionAccuracy < result.metrics.reviewDecisionAccuracy);
  assert.ok(result.baselines.retrievalRules.reviewDecisionAccuracy < result.metrics.reviewDecisionAccuracy);
  assert.equal(result.baselines.currentLiveModel.status, 'NOT_RUN');
});

test('always-grade baseline is unsafe on the frozen escalation cases', () => {
  const result = evaluateGradingFixture(dataset, thresholds);
  assert.equal(result.baselines.alwaysGrade.falseVerifiedRate, 1);
  assert.ok(result.baselines.alwaysGrade.reviewDecisionAccuracy < result.metrics.reviewDecisionAccuracy);
});

test('grading eval claim boundary forbids live-model quality claims', () => {
  const result = evaluateGradingFixture(dataset, thresholds);
  assert.match(result.claimBoundary, /Live model quality.*not measured/i);
});
