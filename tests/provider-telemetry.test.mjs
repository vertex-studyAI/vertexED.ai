import assert from 'node:assert/strict';
import test from 'node:test';

import { createProviderRunEvent } from '../api/_lib/providerTelemetry.js';

test('provider telemetry exposes quality signals without accepting content fields', () => {
  const event = createProviderRunEvent({
    capability: 'answer_review',
    provider: 'OpenAI',
    model: 'gpt-4o-mini',
    status: 200,
    durationMs: 1234.6,
    prompt: 'private prompt',
    answer: 'private answer',
  }, new Date('2026-09-06T00:00:00Z'));

  assert.deepEqual(event, {
    schema: 'vertexed.ai_provider.v1',
    event: 'provider_run',
    capability: 'answer_review',
    provider: 'openai',
    model: 'gpt-4o-mini',
    outcome: 'success',
    status: 200,
    durationMs: 1235,
    recordedAt: '2026-09-06T00:00:00.000Z',
  });
});
