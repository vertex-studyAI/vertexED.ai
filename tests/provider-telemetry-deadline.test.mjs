import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchProvider } from '../api/_lib/providerRequest.js';
import { paidResponse, usageFixture } from './helpers/ai-usage-fixture.mjs';

test('stalled telemetry body is cancelled after settlement without repeating provider work', async t => {
  for (const [key, value] of Object.entries({ SUPABASE_URL: 'https://telemetry-deadline.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'fixture' })) {
    const previous = process.env[key]; process.env[key] = value;
    t.after(() => { if (previous === undefined) delete process.env[key]; else process.env[key] = previous; });
  }
  const timer = globalThis.setTimeout;
  // Accelerate only the production telemetry deadline, preserving the outer
  // regression guardian so the old unbounded body implementation fails.
  t.mock.method(globalThis, 'setTimeout', (callback, ms, ...args) => timer(callback, ms === 3000 ? 5 : ms, ...args));
  let providers = 0; let telemetry = 0; let cancellations = 0; let streamController;
  t.mock.method(globalThis, 'fetch', async url => {
    if (String(url).startsWith('https://api.openai.com/')) { providers++; return paidResponse({ output_text: 'complete' }); }
    assert.match(String(url), /\/rest\/v1\/observability_events$/); telemetry++;
    return new Response(new ReadableStream({ start(controller) { streamController = controller; }, cancel() { cancellations++; return new Promise(() => {}); } }), { status: 201 });
  });
  const fixture = usageFixture(); let guardian;
  try {
    const response = await Promise.race([
      fixture.run(() => fetchProvider({ capability: 'fixture', provider: 'openai', model: 'gpt-4.1-mini', url: 'https://api.openai.com/v1/responses', options: { method: 'POST', body: JSON.stringify({ model: 'gpt-4.1-mini', input: 'question', max_output_tokens: 1200 }) } })),
      new Promise((_resolve, reject) => { guardian = timer(() => reject(new Error('Telemetry body blocked the paid response')), 150); }),
    ]);
    assert.equal(response.status, 200);
    assert.equal(providers, 1); assert.equal(telemetry, 1); assert.equal(cancellations, 1);
    assert.deepEqual(fixture.calls.filter(call => call.name === 'settle_ai_usage').map(call => call.args.p_outcome), ['succeeded']);
  } finally {
    clearTimeout(guardian);
    try { streamController?.close(); } catch { /* Already cancelled by the fixed implementation. */ }
  }
});
