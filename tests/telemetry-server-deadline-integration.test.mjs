import assert from 'node:assert/strict';
import test from 'node:test';
import { persistObservabilityEvent } from '../api/_lib/observabilityStore.js';
import { createServerSupabaseClient } from '../api/_lib/serverSupabase.js';

test('telemetry deadline cancels a stalled body through the actual server SDK client', { timeout: 5000 }, async (t) => {
  let upstreamSignal;
  let streamController;
  let cancellation;
  const response = new Response(new ReadableStream({
    start(controller) {
      streamController = controller;
      controller.enqueue(new TextEncoder().encode('{"partial":'));
    },
    cancel(reason) { cancellation = reason; },
  }), { status: 201, headers: { 'content-type': 'application/json' } });
  t.after(() => {
    try { streamController.close(); } catch { /* The timeout already cancelled it. */ }
  });
  t.mock.method(globalThis, 'fetch', async (input, options) => {
    assert.equal(new URL(input).hostname, 'telemetry-fixture.example');
    assert.equal(new URL(input).pathname, '/rest/v1/observability_events');
    upstreamSignal = options.signal;
    return response;
  });

  // Exercise the real locked SDK, server response buffer and telemetry store
  // together. Only the final transport is constructed; no remote call is made.
  const client = createServerSupabaseClient('https://telemetry-fixture.example', 'fixture-public-key');
  const event = {
    schema: 'vertexed.ai_provider.v1', event: 'provider_run',
    capability: 'fixture', provider: 'fixture', model: 'fixture',
    outcome: 'success', status: 200, durationMs: 1,
    recordedAt: '2026-10-11T00:00:00.000Z',
  };
  let watchdog;
  try {
    const result = await Promise.race([
      persistObservabilityEvent(event, client),
      new Promise((_, reject) => {
        watchdog = setTimeout(() => reject(new Error('Telemetry waited for the longer server deadline.')), 3000);
      }),
    ]);
    assert.equal(result.ok, false);
    assert.equal(result.error.code, 'OBSERVABILITY_TIMEOUT');
    assert.equal(upstreamSignal.aborted, true);
    assert.equal(upstreamSignal.reason, result.error);
    await new Promise(resolve => setImmediate(resolve));
    assert.ok(cancellation, 'The underlying response stream must be released.');
  } finally {
    clearTimeout(watchdog);
  }
});
