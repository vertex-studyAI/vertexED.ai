import assert from 'node:assert/strict';
import test from 'node:test';

import { buildQualityReport } from '../api/_lib/qualityReport.js';

const gates = {
  gateVersion: 'test.v1',
  minimumProviderRuns: 2,
  minimumFeedbackEvents: 2,
  providerSuccessRateMin: 0.5,
  incorrectFeedbackRateMax: 0.5,
  negativeFeedbackRateMax: 0.5,
};

test('pilot quality remains insufficient until frozen sample minima are met', () => {
  const report = buildQualityReport([{ event_type: 'provider_run', capability: 'quiz', outcome: 'success' }], gates, {
    generatedAt: '2026-09-06T00:00:00.000Z',
  });
  assert.equal(report.status, 'INSUFFICIENT_EVIDENCE');
  assert.equal(report.metrics.providerSuccessRate, 1);
  assert.match(report.claimBoundary, /does not establish learning efficacy/);
});

test('pilot quality computes fixed pass/fail rates without exposing event content', () => {
  const rows = [
    { event_type: 'provider_run', capability: 'quiz', outcome: 'success' },
    { event_type: 'provider_run', capability: 'quiz', outcome: 'failed' },
    { event_type: 'ai_feedback', capability: 'quiz', feedback: 'helpful' },
    { event_type: 'ai_feedback', capability: 'quiz', feedback: 'incorrect' },
  ];
  const report = buildQualityReport(rows, gates, { generatedAt: '2026-09-06T00:00:00.000Z' });
  assert.equal(report.status, 'PASS');
  assert.deepEqual(report.metrics, {
    eventCount: 4,
    providerRunCount: 2,
    feedbackCount: 2,
    providerSuccessRate: 0.5,
    incorrectFeedbackRate: 0.5,
    negativeFeedbackRate: 0.5,
  });
  assert.deepEqual(report.byCapability.quiz, {
    events: 4,
    providerRuns: 2,
    providerFailures: 1,
    feedback: 2,
    incorrect: 1,
  });
  assert.equal(JSON.stringify(report).includes('prompt'), false);
});

test('a truncated telemetry window can never satisfy the evidence gate', () => {
  const rows = [
    { event_type: 'provider_run', capability: 'quiz', outcome: 'success' },
    { event_type: 'provider_run', capability: 'quiz', outcome: 'success' },
    { event_type: 'ai_feedback', capability: 'quiz', feedback: 'helpful' },
    { event_type: 'ai_feedback', capability: 'quiz', feedback: 'helpful' },
  ];
  assert.equal(buildQualityReport(rows, gates, { truncated: true }).status, 'INSUFFICIENT_EVIDENCE');
});
