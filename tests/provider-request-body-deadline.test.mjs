import assert from 'node:assert/strict';
import { setImmediate as nextTurn } from 'node:timers/promises';
import { createServer } from 'node:http';
import { registerHooks } from 'node:module';
import test from 'node:test';

import { ProviderTimeoutError } from '../api/_lib/fetchWithTimeout.js';
import { MAX_PROVIDER_TEXT_BYTES, ProviderResponseSizeError } from '../api/_lib/providerTextRequest.js';

// Exercise the real wrapper and bounded reader without telemetry persistence,
// credentials, SDK dependencies, or a live provider.
const telemetryUrl = `data:text/javascript,${encodeURIComponent('export const events = []; export async function logProviderRun(event) { events.push(event); }')}`;
const telemetry = await import(telemetryUrl);
const realTelemetryUrl = new URL('../api/_lib/providerTelemetry.js', import.meta.url).href;
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    const resolved = nextResolve(specifier, context);
    return resolved.url === realTelemetryUrl
      ? { ...resolved, url: telemetryUrl, shortCircuit: true }
      : resolved;
  },
});
let fetchProvider;
try {
  ({ fetchProvider } = await import('../api/_lib/providerRequest.js'));
} finally {
  hooks.deregister();
}

const fixtureOptions = { concurrency: false, timeout: 2000 };
function stubFetch(t, implementation) {
  telemetry.events.length = 0;
  t.mock.method(globalThis, 'fetch', implementation);
}
function request({ timeoutMs = 40, options = {}, url = 'https://provider.invalid/fixture' } = {}) {
  return fetchProvider({
    capability: 'fixture', provider: 'fixture', model: 'fixture', url,
    options: { method: 'POST', ...options }, timeoutMs,
  });
}
async function withinFixtureDeadline(task) {
  let timer;
  const watchdog = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('Fixture watchdog: provider body outlived its deadline.')), 350);
  });
  try {
    return await Promise.race([task, watchdog]);
  } finally {
    clearTimeout(timer);
  }
}

test('a stalled body after headers rejects the actual JSON consumer at the provider deadline', fixtureOptions, async (t) => {
  let bodyController;
  let cancelled = false;
  let providerSignal;
  const upstream = new Response(new ReadableStream({
    start(controller) { bodyController = controller; },
    cancel() { cancelled = true; },
  }));
  stubFetch(t, async (_url, options) => {
    providerSignal = options.signal;
    return upstream;
  });
  const consumer = request().then(response => response.json());
  try {
    await assert.rejects(withinFixtureDeadline(consumer), ProviderTimeoutError);
    assert.equal(providerSignal.aborted, true);
    assert.equal(cancelled, true);
    assert.equal(telemetry.events.at(-1).error, true);
  } finally {
    bodyController.error(new Error('Fixture cleanup'));
    await consumer.catch(() => {});
  }
});

test('an oversized response is rejected and its unread body is cancelled', fixtureOptions, async (t) => {
  let cancelled = false;
  const upstream = new Response(new ReadableStream({ cancel() { cancelled = true; } }), {
    headers: { 'content-length': String(MAX_PROVIDER_TEXT_BYTES + 1) },
  });
  stubFetch(t, async () => upstream);
  try {
    await assert.rejects(request(), ProviderResponseSizeError);
    assert.equal(cancelled, true);
    assert.equal(telemetry.events.at(-1).error, true);
  } finally {
    await upstream.body.cancel().catch(() => {});
  }
});

test('an oversized stream without a declared length cancels both retained branches', fixtureOptions, async (t) => {
  let cancelled = false;
  const upstream = new Response(new ReadableStream({
    start(controller) { controller.enqueue(new Uint8Array(MAX_PROVIDER_TEXT_BYTES + 1)); },
    cancel() { cancelled = true; },
  }));
  stubFetch(t, async () => upstream);
  await assert.rejects(request(), ProviderResponseSizeError);
  assert.equal(cancelled, true);
  assert.equal(telemetry.events.at(-1).error, true);
});

test('success telemetry waits for the complete UTF-8 body and the returned body remains readable', fixtureOptions, async (t) => {
  let bodyController;
  const upstream = new Response(new ReadableStream({ start(controller) { bodyController = controller; } }), {
    status: 201, statusText: 'Created', headers: { 'content-type': 'application/json', 'x-request-id': 'fixture-id' },
  });
  stubFetch(t, async () => upstream);
  const pending = request({ timeoutMs: 1000 });
  let closed = false;
  try {
    await nextTurn();
    assert.equal(telemetry.events.length, 0);
    const bytes = new TextEncoder().encode('{"text":"π🙂"}');
    bodyController.enqueue(bytes.subarray(0, 10));
    await nextTurn();
    assert.equal(telemetry.events.length, 0);
    bodyController.enqueue(bytes.subarray(10));
    bodyController.close();
    closed = true;
    const response = await pending;
    assert.equal(response.bodyUsed, false);
    assert.equal(response.status, 201);
    assert.equal(response.statusText, 'Created');
    assert.equal(response.headers.get('x-request-id'), 'fixture-id');
    assert.equal(response.headers.get('content-type'), 'application/json');
    assert.equal(await response.clone().text(), '{"text":"π🙂"}');
    assert.deepEqual(await response.json(), { text: 'π🙂' });
    assert.equal(response.bodyUsed, true);
    assert.equal(telemetry.events.length, 1);
    assert.equal(telemetry.events[0].status, 201);
  } finally {
    if (!closed) bodyController.close();
    await pending.catch(() => {});
  }
});

test('a caller abort during body consumption preserves its reason and cancels the body', fixtureOptions, async (t) => {
  let bodyController;
  let cancelled = false;
  const upstream = new Response(new ReadableStream({
    start(controller) { bodyController = controller; },
    cancel() { cancelled = true; },
  }));
  stubFetch(t, async () => upstream);
  const caller = new AbortController();
  const reason = new Error('Caller stopped the fixture');
  const consumer = request({ timeoutMs: 1000, options: { signal: caller.signal } }).then(response => response.json());
  try {
    await nextTurn();
    caller.abort(reason);
    await assert.rejects(withinFixtureDeadline(consumer), error => error === reason);
    assert.equal(cancelled, true);
  } finally {
    bodyController.error(new Error('Fixture cleanup'));
    await consumer.catch(() => {});
  }
});

test('a late response from an abort-ignoring transport is discarded and cancelled', fixtureOptions, async (t) => {
  let resolveFetch;
  let cancelled = false;
  stubFetch(t, () => new Promise(resolve => { resolveFetch = resolve; }));
  await assert.rejects(request(), ProviderTimeoutError);
  const upstream = new Response(new ReadableStream({ cancel() { cancelled = true; } }));
  resolveFetch(upstream);
  await nextTurn();
  assert.equal(cancelled, true);
  assert.equal(telemetry.events.length, 1);
  assert.equal(telemetry.events[0].error, true);
});

test('transport and body-read errors preserve their original identity', fixtureOptions, async (t) => {
  const transportError = new Error('Fixture transport failure');
  stubFetch(t, async () => { throw transportError; });
  await assert.rejects(request(), error => error === transportError);
  assert.equal(telemetry.events.at(-1).error, true);

  const bodyError = new Error('Fixture body failure');
  const upstream = new Response(new ReadableStream({ start(controller) { controller.error(bodyError); } }));
  t.mock.restoreAll();
  stubFetch(t, async () => upstream);
  await assert.rejects(request().then(response => response.json()), error => error === bodyError);
  assert.equal(telemetry.events.at(-1).error, true);
});

test('non-2xx response status, headers and JSON remain available to callers', fixtureOptions, async (t) => {
  const upstream = new Response('{"error":"retry later"}', {
    status: 429, statusText: 'Too Many Requests', headers: { 'retry-after': '5' },
  });
  stubFetch(t, async () => upstream);
  const response = await request();
  assert.equal(response.ok, false);
  assert.equal(response.status, 429);
  assert.equal(response.statusText, 'Too Many Requests');
  assert.equal(response.headers.get('retry-after'), '5');
  assert.deepEqual(await response.json(), { error: 'retry later' });
  assert.equal(telemetry.events.at(-1).status, 429);
});

for (const status of [204, 205, 304]) {
  test(`bodyless HTTP ${status} retains its native null-body behavior`, fixtureOptions, async (t) => {
    const upstream = new Response(null, { status });
    stubFetch(t, async () => upstream);
    const response = await request();
    assert.equal(response.status, status);
    assert.equal(response.body, null);
    assert.equal(response.bodyUsed, false);
    assert.equal(await response.text(), '');
    assert.equal(response.bodyUsed, false);
    await assert.rejects(response.json(), SyntaxError);
  });
}

test('native error responses retain status zero, error type and a null body', fixtureOptions, async (t) => {
  stubFetch(t, async () => Response.error());
  const response = await request();
  assert.equal(response.status, 0);
  assert.equal(response.type, 'error');
  assert.equal(response.ok, false);
  assert.equal(response.body, null);
  assert.equal(await response.text(), '');
});

test('native redirect URL, redirect flag and response type survive bounded buffering', fixtureOptions, async () => {
  telemetry.events.length = 0;
  const server = createServer((req, res) => {
    if (req.url === '/redirect') {
      res.writeHead(302, { location: '/final' }).end();
    } else {
      res.writeHead(200, { 'content-type': 'application/json' }).end('{"fixture":true}');
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  try {
    const url = `http://127.0.0.1:${server.address().port}/redirect`;
    const native = await fetch(url);
    await native.text();
    const response = await request({ url, timeoutMs: 1000 });
    assert.equal(response.url, native.url);
    assert.equal(response.redirected, native.redirected);
    assert.equal(response.type, native.type);
    assert.equal(response.clone().url, native.url);
    assert.deepEqual(await response.json(), { fixture: true });
  } finally {
    await new Promise(resolve => {
      server.close(resolve);
      server.closeAllConnections();
    });
  }
});
