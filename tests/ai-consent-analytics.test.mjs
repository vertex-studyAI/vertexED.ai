import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAiRequestAnalyticsProperties } from '../src/lib/aiRequestAnalytics.mjs';
import { notetakerError } from '../src/lib/notetakerError.mjs';

test('HTTP 200 fallback is degraded, not successful AI', () => {
  const properties = buildAiRequestAnalyticsProperties({ feature: 'notes', status: 200, durationMs: 500, degraded: true });
  assert.equal(properties.outcome, 'degraded');
  assert.deepEqual(Object.keys(properties).sort(), ['duration_bucket','feature','outcome','status_class']);
});
test('declining processing is actionable consent copy, not a provider failure', () => {
  const error = new Error('sensitive detail must not be reflected');
  error.name = 'AiConsentDeclinedError';
  assert.match(notetakerError(error), /AI processing was not allowed/);
  assert.doesNotMatch(notetakerError(error), /sensitive/);
});
