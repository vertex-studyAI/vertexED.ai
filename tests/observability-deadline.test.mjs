import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import test from 'node:test';
import { createClient } from '@supabase/supabase-js';

// Use the installed SDK with an in-process transport. No database, credentials,
// provider endpoint or production identity is contacted by these fixtures.
const clientUrl = `data:text/javascript,${encodeURIComponent('export let client; export function setClient(value) { client = value; } export function getSupabaseAdmin() { return client; }')}`;
const clientFixture = await import(clientUrl);
const adminUrl = new URL('../api/_lib/supabaseAdmin.js', import.meta.url).href;
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    const resolved = nextResolve(specifier, context);
    return resolved.url === adminUrl ? { ...resolved, url: clientUrl, shortCircuit: true } : resolved;
  },
});
let persistObservabilityEvent;
let fetchProvider;
try {
  ({ persistObservabilityEvent } = await import('../api/_lib/observabilityStore.js'));
  ({ fetchProvider } = await import('../api/_lib/providerRequest.js'));
} finally {
  hooks.deregister();
}

const event = {
  schema: 'vertexed.ai_provider.v1', event: 'provider_run',
  capability: 'fixture', provider: 'fixture', model: 'fixture',
  outcome: 'success', status: 200, durationMs: 1,
  recordedAt: '2026-10-10T00:00:00.000Z',
};
const options = { concurrency: false, timeout: 5000 };
function store(fetchImpl) {
  const client = createClient('https://telemetry-fixture.example', 'fixture-public-key', {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: fetchImpl },
  });
  clientFixture.setClient(client);
  return client;
}
async function withinFixtureDeadline(task) {
  let timer;
  try {
    return await Promise.race([task, new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('Fixture watchdog: telemetry prevented request completion.')), 2500);
    })]);
  } finally {
    clearTimeout(timer);
  }
}
function request() {
  return fetchProvider({ capability: 'fixture', provider: 'fixture', model: 'fixture',
    url: 'https://provider.invalid/fixture', options: {}, timeoutMs: 40 });
}

test('a stalled observability request fails within its bound and aborts the SDK transport', options, async () => {
  let signal;
  const client = store((_input, init) => new Promise((_resolve, reject) => {
    signal = init.signal;
    signal?.addEventListener('abort', () => reject(signal.reason), { once: true });
  }));
  const result = await withinFixtureDeadline(persistObservabilityEvent(event, client));
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'OBSERVABILITY_TIMEOUT');
  assert.equal(signal.aborted, true);
});

test('an abort-ignoring transport cannot delay failure or produce an unhandled late rejection', options, async () => {
  let rejectFetch;
  let signal;
  const client = store((_input, init) => new Promise((_resolve, reject) => {
    signal = init.signal;
    rejectFetch = reject;
  }));
  const result = await withinFixtureDeadline(persistObservabilityEvent(event, client));
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'OBSERVABILITY_TIMEOUT');
  assert.equal(signal.aborted, true);
  rejectFetch(new Error('Late transport rejection'));
  await new Promise(resolve => setImmediate(resolve));
});

test('a completed provider response is returned when telemetry storage stalls', options, async t => {
  t.mock.method(console, 'error', () => {});
  store(() => new Promise(() => {}));
  t.mock.method(globalThis, 'fetch', async () => new Response('{"answer":"ready"}', { status: 200 }));
  const response = await withinFixtureDeadline(request());
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { answer: 'ready' });
});

test('a provider failure keeps its original error when telemetry storage stalls', options, async t => {
  t.mock.method(console, 'error', () => {});
  store(() => new Promise(() => {}));
  const providerError = new Error('Original fixture failure');
  t.mock.method(globalThis, 'fetch', async () => { throw providerError; });
  await assert.rejects(withinFixtureDeadline(request()), error => error === providerError);
});

test('confirmed persistence retains the fixed-field row and normal return contract', options, async () => {
  let row;
  const client = store(async (_input, init) => {
    row = JSON.parse(init.body);
    return new Response(null, { status: 201 });
  });
  assert.deepEqual(await persistObservabilityEvent({ ...event, prompt: 'private input' }, client), { ok: true, error: null });
  assert.equal(row.capability, 'fixture');
  assert.equal('prompt' in row, false);
});

test('a database rejection stays a failure rather than a successful telemetry receipt', options, async () => {
  const databaseError = { code: '42P01', message: 'Fixture unavailable' };
  const client = store(async () => new Response(JSON.stringify(databaseError), {
    status: 400, headers: { 'content-type': 'application/json' },
  }));
  const result = await persistObservabilityEvent(event, client);
  assert.equal(result.ok, false);
  assert.equal(result.error.code, databaseError.code);
});
