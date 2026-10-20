import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import { buildAdminAnalytics, normaliseAnalyticsDays } from '../api/_lib/adminAnalytics.js';

test('admin analytics accepts only bounded date ranges and returns aggregate privacy-safe metrics', () => {
  assert.equal(normaliseAnalyticsDays('7'), 7);
  assert.equal(normaliseAnalyticsDays('365'), 30);
  const report = buildAdminAnalytics([
    { event_type: 'provider_run', capability: 'chatbot', outcome: 'success', recorded_at: '2026-10-20T10:00:00.000Z', prompt: 'private' },
    { event_type: 'ai_feedback', capability: 'chatbot', outcome: 'failed', feedback: 'incorrect', recorded_at: '2026-10-20T11:00:00.000Z', answer: 'private' },
  ], { days: 7, generatedAt: '2026-10-20T12:00:00.000Z' });
  assert.deepEqual(report.metrics, { providerRuns: 1, providerSuccesses: 1, feedback: 1, negativeFeedback: 1, incorrectFeedback: 1, failedEvents: 1 });
  assert.equal(report.capabilities[0].capability, 'chatbot');
  assert.match(report.privacy, /excludes learner identities, prompts, answers/);
  assert.doesNotMatch(JSON.stringify(report), /private/);
});

test('admin analytics endpoint and route require admin access and select no learner content', () => {
  const handler = fs.readFileSync('api/_handlers/admin-analytics.js', 'utf8');
  const app = fs.readFileSync('src/app/App.tsx', 'utf8');
  assert.match(handler, /requireAdmin\(user, res\)/);
  assert.match(handler, /rateLimitUserEndpoint\(user\.id, 'admin-analytics'/);
  assert.match(handler, /select\('event_type, capability, outcome, feedback, recorded_at'\)/);
  assert.doesNotMatch(handler, /prompt|answer|user_id/);
  assert.match(app, /path="admin\/analytics" element=\{<AdminRoute><AnalyticsAdmin \/><\/AdminRoute>\}/);
});
