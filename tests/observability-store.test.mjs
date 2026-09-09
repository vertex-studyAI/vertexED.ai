import assert from 'node:assert/strict';
import test from 'node:test';

import { persistObservabilityEvent, toObservabilityRow } from '../api/_lib/observabilityStore.js';

const event = {
  schema: 'vertexed.ai_provider.v1',
  event: 'provider_run',
  capability: 'answer_review',
  provider: 'openai',
  model: 'gpt-4o-mini',
  outcome: 'success',
  status: 200,
  durationMs: 321,
  recordedAt: '2026-09-06T00:00:00.000Z',
};

test('observability rows contain only the fixed privacy-safe schema', () => {
  assert.deepEqual(toObservabilityRow({ ...event, prompt: 'secret', answer: 'secret' }), {
    schema_version: 'vertexed.ai_provider.v1',
    event_type: 'provider_run',
    route: 'unknown',
    capability: 'answer_review',
    provider: 'openai',
    model: 'gpt-4o-mini',
    error_class: 'none',
    outcome: 'success',
    status: 200,
    duration_ms: 321,
    feedback: null,
    reason: null,
    recorded_at: '2026-09-06T00:00:00.000Z',
  });
});

test('observability persistence reports database failures instead of acknowledging them', async () => {
  const inserted = [];
  const success = {
    from(table) {
      assert.equal(table, 'observability_events');
      return { insert: async (row) => { inserted.push(row); return { error: null }; } };
    },
  };
  assert.deepEqual(await persistObservabilityEvent(event, success), { ok: true, error: null });
  assert.equal(inserted.length, 1);

  const databaseError = { code: '42P01' };
  const failure = { from: () => ({ insert: async () => ({ error: databaseError }) }) };
  assert.deepEqual(await persistObservabilityEvent(event, failure), { ok: false, error: databaseError });
});
