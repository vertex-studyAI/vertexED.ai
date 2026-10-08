import assert from 'node:assert/strict';
import test from 'node:test';
import { callChatProvider } from '../api/_lib/aiProviders.js';
import { ProviderTimeoutError } from '../api/_lib/fetchWithTimeout.js';
import { fetchProviderText, ProviderResponseSizeError } from '../api/_lib/providerTextRequest.js';

const config = { name: 'openai', apiKey: 'test-only', baseUrl: 'https://provider.invalid/v1' };
const request = (overrides) => callChatProvider({
  config, model: 'test-model', messages: [{ role: 'user', content: 'hello' }], ...overrides,
});

async function observeWithin(promise, timeoutMs = 150) {
  let timer;
  try {
    return await Promise.race([
      promise.then((value) => ({ value }), (error) => ({ error })),
      new Promise((resolve) => { timer = setTimeout(() => resolve({ unbounded: true }), timeoutMs); }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

test('chat provider deadline covers a body that stalls after successful headers', async () => {
  let stream;
  let cancelled = false;
  const response = new Response(new ReadableStream({
    start(controller) {
      stream = controller;
      controller.enqueue(new TextEncoder().encode('{"output_text":"'));
    },
    cancel() { cancelled = true; },
  }));
  const pending = request({ timeoutMs: 15, fetchImpl: async () => response });
  let result;
  try {
    result = await observeWithin(pending);
  } finally {
    if (!cancelled) stream.close();
    await pending.catch(() => {});
  }
  assert.ok(result.error instanceof ProviderTimeoutError, 'body must settle at the provider deadline');
  assert.equal(cancelled, true, 'the abandoned response stream must be cancelled');
});

test('chat provider deadline also covers injected transports that ignore abort', async () => {
  let resolveHeaders;
  let cancelled = false;
  let stream;
  let signal;
  const pending = request({
    timeoutMs: 15,
    fetchImpl: (_url, options) => {
      signal = options.signal;
      return new Promise((resolve) => { resolveHeaders = resolve; });
    },
  });
  const result = await observeWithin(pending);
  resolveHeaders(new Response(new ReadableStream({
    start(controller) { stream = controller; },
    cancel() { cancelled = true; },
  })));
  await new Promise((resolve) => setTimeout(resolve, 0));
  if (!cancelled) stream.close();
  await pending.catch(() => {});
  assert.ok(result.error instanceof ProviderTimeoutError, 'headers must settle at the provider deadline');
  assert.equal(signal?.aborted, true);
  assert.equal(cancelled, true, 'a late response must be discarded and cancelled');
});

test('headers and body share one budget rather than receiving a fresh body timeout', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let resolveHeaders;
  let cancelled = false;
  const pending = request({ timeoutMs: 20, fetchImpl: () => new Promise((resolve) => { resolveHeaders = resolve; }) });
  const outcome = pending.then((value) => ({ value }), (error) => ({ error }));
  t.mock.timers.tick(12);
  resolveHeaders(new Response(new ReadableStream({ cancel() { cancelled = true; } })));
  await Promise.resolve();
  await Promise.resolve();
  t.mock.timers.tick(8);
  assert.ok((await outcome).error instanceof ProviderTimeoutError);
  assert.equal(cancelled, true);
});

test('completed responses preserve status, identity and split UTF-8 text, and clear their deadline', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const bytes = new TextEncoder().encode('{"output_text":"Español 🧠"}');
  const response = new Response(new ReadableStream({
    start(controller) {
      for (const byte of bytes) controller.enqueue(Uint8Array.of(byte));
      controller.close();
    },
  }), { status: 429, headers: { 'Retry-After': '12' } });
  let signal;
  const result = await request({ timeoutMs: 20, fetchImpl: async (_url, options) => { signal = options.signal; return response; } });
  assert.equal(result.response, response);
  assert.equal(result.response.status, 429);
  assert.equal(result.response.headers.get('retry-after'), '12');
  assert.equal(result.raw, new TextDecoder().decode(bytes));
  assert.equal(response.bodyUsed, true);
  assert.equal(response.body.locked, false);
  t.mock.timers.tick(30);
  assert.equal(signal.aborted, false);
});

test('the default native-fetch path also keeps its body deadline', async (t) => {
  let cancelled = false;
  t.mock.method(globalThis, 'fetch', async () => new Response(new ReadableStream({ cancel() { cancelled = true; } })));
  const result = await observeWithin(request({ timeoutMs: 15 }));
  assert.ok(result.error instanceof ProviderTimeoutError);
  assert.equal(cancelled, true);
});

test('text-only injected responses remain bounded when text never settles', async () => {
  const result = await observeWithin(request({
    timeoutMs: 15,
    fetchImpl: async () => ({ status: 200, text: () => new Promise(() => {}) }),
  }));
  assert.ok(result.error instanceof ProviderTimeoutError);
});

test('stream cancellation that rejects or stalls cannot delay the timeout', async () => {
  for (const cancel of [() => Promise.reject(new Error('cleanup failed')), () => new Promise(() => {})]) {
    const response = new Response(new ReadableStream({ cancel }));
    const result = await observeWithin(request({ timeoutMs: 15, fetchImpl: async () => response }));
    assert.ok(result.error instanceof ProviderTimeoutError);
  }
});

test('oversized declared and streamed bodies fail closed and cancel the stream', async () => {
  for (const declared of [true, false]) {
    let cancelled = false;
    const response = new Response(new ReadableStream({
      start(controller) { controller.enqueue(new TextEncoder().encode('more than eight bytes')); },
      cancel() { cancelled = true; },
    }), declared ? { headers: { 'Content-Length': '100' } } : {});
    await assert.rejects(fetchProviderText('https://provider.invalid', {}, {
      maxBytes: 8, timeoutMs: 100, fetchImpl: async () => response,
    }), ProviderResponseSizeError);
    assert.equal(cancelled, true);
    assert.equal(response.body.locked, false);
  }
});

test('size accounting uses encoded bytes, including text-only fallback responses', async () => {
  for (const response of [new Response('🧠'), { text: async () => '🧠' }]) {
    await assert.rejects(fetchProviderText('https://provider.invalid', {}, {
      maxBytes: 3, fetchImpl: async () => response,
    }), ProviderResponseSizeError);
  }
  const result = await fetchProviderText('https://provider.invalid', {}, { maxBytes: 4, fetchImpl: async () => new Response('🧠') });
  assert.equal(result.raw, '🧠');
});

test('caller cancellation is preserved before fetch and during body consumption', async () => {
  const cancelled = new Error('caller cancelled');
  const before = new AbortController();
  before.abort(cancelled);
  let fetches = 0;
  await assert.rejects(fetchProviderText('https://provider.invalid', { signal: before.signal }, {
    fetchImpl: async () => { fetches += 1; return new Response('unused'); },
  }), (error) => error === cancelled);
  assert.equal(fetches, 0);

  const during = new AbortController();
  let bodyCancelled = false;
  const pending = fetchProviderText('https://provider.invalid', { signal: during.signal }, {
    fetchImpl: async () => new Response(new ReadableStream({ cancel() { bodyCancelled = true; } })),
  });
  await Promise.resolve();
  during.abort(cancelled);
  await assert.rejects(pending, (error) => error === cancelled);
  assert.equal(bodyCancelled, true);
});

test('successful requests remove the caller abort listener', async (t) => {
  const upstream = new AbortController();
  const removeListener = t.mock.method(upstream.signal, 'removeEventListener');
  let signal;
  await fetchProviderText('https://provider.invalid', { signal: upstream.signal }, {
    fetchImpl: async (_url, options) => { signal = options.signal; return new Response('ok'); },
  });
  assert.equal(removeListener.mock.calls.length, 1);
  upstream.abort(new Error('later cancellation'));
  assert.equal(signal.aborted, false);
});

test('transport and body errors retain their identity without waiting for the deadline', async () => {
  const failure = new TypeError('upstream disconnected');
  for (const fetchImpl of [
    async () => { throw failure; },
    async () => new Response(new ReadableStream({ start(controller) { controller.error(failure); } })),
  ]) {
    await assert.rejects(request({ fetchImpl }), (error) => error === failure);
  }
});
