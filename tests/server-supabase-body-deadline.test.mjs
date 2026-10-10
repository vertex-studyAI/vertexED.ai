import assert from 'node:assert/strict';
import test from 'node:test';
import { getEventListeners, once } from 'node:events';
import http from 'node:http';
import { createServerSupabaseClient } from '../api/_lib/serverSupabase.js';
import { isTransientAuthError } from '../api/_lib/auth.js';

const fixtureUrl = 'https://fixture.supabase.co';
const fixtureKey = 'fixture-key';
const timeoutMs = 40;
const encoder = new TextEncoder();

function clientFetch(requestTimeoutMs = timeoutMs) {
  return createServerSupabaseClient(fixtureUrl, fixtureKey, {
    timeoutMs: requestTimeoutMs,
    clientFactory: (_url, _key, options) => options.global.fetch,
  });
}

function stalledBody(t, status = 200) {
  let streamController;
  let cancellation;
  const response = new Response(new ReadableStream({
    start(controller) {
      streamController = controller;
      controller.enqueue(encoder.encode('{"partial":'));
    },
    cancel(reason) { cancellation = reason; },
  }), { status, headers: { 'content-type': 'application/json' } });
  t.after(() => {
    try { streamController.close(); } catch { /* Already cancelled. */ }
  });
  return { response, cancellation: () => cancellation };
}

async function beforeWatchdog(operation, watchdogMs = 500) {
  let watchdog;
  const deadline = new Promise((_, reject) => {
    watchdog = setTimeout(() => reject(new Error('Fixture watchdog: SDK outlived its request deadline')), watchdogMs);
  });
  try { return await Promise.race([operation, deadline]); }
  finally { clearTimeout(watchdog); }
}

for (const status of [200, 503]) {
  test(`actual PostgREST query exits when HTTP ${status} body stalls`, async (t) => {
    const body = stalledBody(t, status);
    let calls = 0;
    t.mock.method(globalThis, 'fetch', async () => { calls += 1; return body.response; });
    const client = createServerSupabaseClient(fixtureUrl, fixtureKey, { timeoutMs });
    const result = await beforeWatchdog(client.from('fixture').select('id'));
    assert.equal(result.data, null);
    assert.equal(result.status, 0);
    assert.equal(result.error.code, 'PROVIDER_TIMEOUT');
    assert.equal(calls, 1, 'The locked client must not retry a timed-out query');
    assert.ok(body.cancellation(), 'The underlying response stream must be cancelled');
  });
}

test('actual Auth lookup treats a stalled body as unavailable, not an expired session', async (t) => {
  const body = stalledBody(t);
  t.mock.method(globalThis, 'fetch', async () => body.response);
  t.mock.method(console, 'error', () => {});
  const client = createServerSupabaseClient(fixtureUrl, fixtureKey, { timeoutMs });
  const result = await beforeWatchdog(client.auth.getUser('fixture-token'));
  assert.equal(result.data.user, null);
  assert.equal(result.error.name, 'AuthRetryableFetchError');
  assert.equal(isTransientAuthError(result.error), true);
  assert.ok(body.cancellation());
});

test('actual PostgREST query retains rows, count and partial-content status', async (t) => {
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    assert.ok(options.headers.get('apikey'));
    return new Response('[{"id":7,"text":"π 📚"}]', {
      status: 206,
      headers: { 'content-type': 'application/json', 'content-range': '0-0/3' },
    });
  });
  const client = createServerSupabaseClient(fixtureUrl, fixtureKey, { timeoutMs });
  const result = await client.from('fixture').select('id,text', { count: 'exact' });
  assert.deepEqual(result.data, [{ id: 7, text: 'π 📚' }]);
  assert.equal(result.count, 3);
  assert.equal(result.status, 206);
  assert.equal(result.error, null);
});

test('actual PostgREST query preserves a completed database denial', async (t) => {
  const denial = { code: '42501', message: 'Permission denied', details: null, hint: null };
  t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify(denial), { status: 403 }));
  const client = createServerSupabaseClient(fixtureUrl, fixtureKey, { timeoutMs });
  const result = await client.from('fixture').select('id');
  assert.equal(result.data, null);
  assert.equal(result.status, 403);
  assert.deepEqual(result.error, denial);
});

test('actual Auth lookup preserves an invalid-session denial', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({ msg: 'Invalid JWT' }), { status: 401 }));
  const client = createServerSupabaseClient(fixtureUrl, fixtureKey, { timeoutMs });
  const result = await client.auth.getUser('invalid-fixture-token');
  assert.equal(result.data.user, null);
  assert.equal(result.error.status, 401);
  assert.equal(isTransientAuthError(result.error), false);
});

test('caller cancellation during body transfer preserves its reason and closes both branches', async (t) => {
  const body = stalledBody(t);
  const caller = new AbortController();
  const reason = new Error('Fixture caller cancelled');
  let sentSignal;
  t.mock.method(globalThis, 'fetch', async (_url, options) => { sentSignal = options.signal; return body.response; });
  const operation = clientFetch()(fixtureUrl, { signal: caller.signal });
  const cancellation = setTimeout(() => caller.abort(reason), 5);
  t.after(() => clearTimeout(cancellation));
  await assert.rejects(beforeWatchdog(operation), error => error === reason);
  assert.equal(sentSignal.reason, reason);
  assert.ok(body.cancellation());
  assert.equal(getEventListeners(caller.signal, 'abort').length, 0);
});

test('a pre-aborted Request input does not start the upstream request', async (t) => {
  const caller = new AbortController();
  const reason = new Error('Fixture request already cancelled');
  caller.abort(reason);
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async () => { calls += 1; return new Response('{}'); });
  const input = new Request(fixtureUrl, { signal: caller.signal });
  await assert.rejects(clientFetch()(input), error => error === reason);
  assert.equal(calls, 0);
});

test('an explicit null signal overrides the signal inherited from Request', async (t) => {
  const caller = new AbortController();
  caller.abort(new Error('Fixture request cancelled'));
  t.mock.method(globalThis, 'fetch', async () => new Response('{"ok":true}'));
  const input = new Request(fixtureUrl, { signal: caller.signal });
  const response = await clientFetch()(input, { signal: null });
  assert.deepEqual(await response.json(), { ok: true });
});

test('late abort-ignoring transport is bounded and its unused response is cancelled', async (t) => {
  const body = stalledBody(t);
  let resolveTransport;
  t.mock.method(globalThis, 'fetch', () => new Promise(resolve => { resolveTransport = resolve; }));
  await assert.rejects(beforeWatchdog(clientFetch()(fixtureUrl)), { code: 'PROVIDER_TIMEOUT' });
  resolveTransport(body.response);
  await new Promise(resolve => setImmediate(resolve));
  assert.ok(body.cancellation());
  assert.equal(body.response.bodyUsed, true);
});

test('ongoing body traffic does not restart the absolute deadline', async (t) => {
  let interval;
  let cancelled;
  const response = new Response(new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode('['));
      interval = setInterval(() => controller.enqueue(encoder.encode('1,')), 5);
    },
    cancel(reason) { cancelled = reason; clearInterval(interval); },
  }));
  t.after(() => clearInterval(interval));
  t.mock.method(globalThis, 'fetch', async () => response);
  await assert.rejects(beforeWatchdog(clientFetch()(fixtureUrl)), { code: 'PROVIDER_TIMEOUT' });
  assert.ok(cancelled);
});

test('success clears caller listeners and preserves readable native metadata', async (t) => {
  const caller = new AbortController();
  let sentSignal;
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    sentSignal = options.signal;
    return new Response('{"ok":true}', { status: 201, statusText: 'Created', headers: { 'x-fixture': 'retained' } });
  });
  const response = await clientFetch()(fixtureUrl, { signal: caller.signal });
  assert.ok(response instanceof Response);
  assert.equal(response.status, 201);
  assert.equal(response.statusText, 'Created');
  assert.equal(response.headers.get('x-fixture'), 'retained');
  assert.equal(getEventListeners(caller.signal, 'abort').length, 0);
  caller.abort(new Error('After completion'));
  assert.equal(sentSignal.aborted, false);
  assert.deepEqual(await response.json(), { ok: true });
});

for (const status of [204, 205, 304, 0]) {
  test(`bodyless native response ${status} remains valid`, async (t) => {
    const upstream = status === 0 ? Response.error() : new Response(null, { status });
    t.mock.method(globalThis, 'fetch', async () => upstream);
    const response = await clientFetch()(fixtureUrl);
    assert.equal(response.status, status);
    assert.equal(response.type, upstream.type);
    assert.equal(response.body, null);
  });
}

test('original transport and body errors retain their identities', async (t) => {
  const transportError = new Error('Fixture transport error');
  const mock = t.mock.method(globalThis, 'fetch', async () => { throw transportError; });
  await assert.rejects(clientFetch()(fixtureUrl), error => error === transportError);
  const bodyError = new Error('Fixture body error');
  mock.mock.mockImplementation(async () => new Response(new ReadableStream({
    start(controller) { controller.error(bodyError); },
  })));
  await assert.rejects(beforeWatchdog(clientFetch()(fixtureUrl)), error => error === bodyError);
});

async function localServer(t, handler) {
  const server = http.createServer(handler);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(async () => {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  });
  return `http://127.0.0.1:${server.address().port}`;
}

test('native HTTP redirect preserves final URL, redirect status and decoded body', async (t) => {
  const url = await localServer(t, (request, response) => {
    if (request.url === '/redirect') {
      response.writeHead(302, { location: '/rows' });
      response.end();
    } else {
      response.writeHead(200, { 'content-type': 'application/json' });
      response.end('{"text":"π 📚"}');
    }
  });
  const response = await clientFetch(2_000)(`${url}/redirect`);
  assert.equal(response.url, `${url}/rows`);
  assert.equal(response.redirected, true);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { text: 'π 📚' });
});

test('native HTTP stalled body is aborted and releases its connection', async (t) => {
  let closed;
  let reached = false;
  const url = await localServer(t, (_request, response) => {
    reached = true;
    closed = once(response, 'close');
    response.writeHead(200, { 'content-type': 'application/json' });
    response.write('{"partial":');
  });
  await assert.rejects(beforeWatchdog(clientFetch(200)(url), 1_500), { code: 'PROVIDER_TIMEOUT' });
  assert.equal(reached, true);
  await beforeWatchdog(closed, 1_500);
});
