import assert from 'node:assert/strict';
import test from 'node:test';
import { fetchWithTimeout, fetchBufferedResponseWithTimeout, ProviderTimeoutError, ProviderResponseLimitError } from '../api/_lib/fetchWithTimeout.js';
import { callChatProvider } from '../api/_lib/aiProviders.js';
import { fetchProvider } from '../api/_lib/providerRequest.js';
import { usageFixture } from './helpers/ai-usage-fixture.mjs';

async function withinTestDeadline(task) {
  let timer;
  try {
    return await Promise.race([task, new Promise((_resolve, reject) => { timer = setTimeout(() => reject(new Error('Body outlived test deadline')), 150); })]);
  } finally { clearTimeout(timer); }
}

function stalledBody() {
  let cancelled = 0;
  const response = new Response(new ReadableStream({ cancel() { cancelled += 1; return new Promise(() => {}); } }), { status: 200 });
  return { response, cancelled: () => cancelled };
}

test('provider fetch aborts at its deadline with a stable error class', { concurrency: false }, async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => reject(signal.reason), { once: true });
  });
  try {
    await assert.rejects(() => fetchWithTimeout('https://provider.invalid', {}, 5), ProviderTimeoutError);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('provider fetch clears its deadline after a completed response', { concurrency: false }, async () => {
  const originalFetch = globalThis.fetch;
  const response = new Response('{}', { status: 200 });
  globalThis.fetch = async () => response;
  try {
    assert.equal(await fetchWithTimeout('https://provider.invalid', {}, 50), response);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('chat provider bounds a stalled response body even when injected fetch ignores abort', async () => {
  const stalled = stalledBody();
  await assert.rejects(withinTestDeadline(usageFixture().run(() => callChatProvider({
    config: { name: 'openai', baseUrl: 'https://api.openai.com/v1', apiKey: 'fixture' },
    model: 'gpt-4.1-mini', messages: [{ role: 'user', content: 'Question' }], timeoutMs: 10,
    fetchImpl: async () => stalled.response,
  }))), ProviderTimeoutError);
  assert.equal(stalled.cancelled(), 1);
});

test('fetchProvider does not report completion at headers while its body stalls', async () => {
  const originalFetch = globalThis.fetch;
  const stalled = stalledBody();
  globalThis.fetch = async () => stalled.response;
  try {
    await assert.rejects(withinTestDeadline(usageFixture().run(() => fetchProvider({
      capability: 'fixture', provider: 'openai', model: 'gpt-4.1-mini', url: 'https://api.openai.com/v1/responses', timeoutMs: 10,
      options: { method: 'POST', body: JSON.stringify({ model: 'gpt-4.1-mini', input: 'Question', max_output_tokens: 1200 }) },
    })).then(response => response.text())), ProviderTimeoutError);
    assert.equal(stalled.cancelled(), 1);
  } finally { globalThis.fetch = originalFetch; }
});

test('buffered fetch caps bytes and cancels a continuously supplied response', async () => {
  let cancelled = 0;
  const response = new Response(new ReadableStream({ pull(controller) { controller.enqueue(new Uint8Array(8)); }, cancel() { cancelled++; } }));
  await assert.rejects(fetchBufferedResponseWithTimeout('https://fixture.invalid', {}, 100, async () => response, 16), ProviderResponseLimitError);
  assert.equal(cancelled, 1);
});

test('caller cancellation during body consumption retains its exact reason', async () => {
  const controller = new AbortController(); const reason = new Error('caller cancelled'); const stalled = stalledBody();
  const promise = fetchBufferedResponseWithTimeout('https://fixture.invalid', { signal: controller.signal }, 100, async () => stalled.response);
  setTimeout(() => controller.abort(reason), 5);
  await assert.rejects(withinTestDeadline(promise), error => error === reason);
  assert.equal(stalled.cancelled(), 1);
});

test('non-success bodies and ignored header aborts are bounded by the same deadline', async () => {
  const errorResponse = new Response(new ReadableStream(), { status: 503 });
  await assert.rejects(withinTestDeadline(fetchBufferedResponseWithTimeout('https://fixture.invalid', {}, 5, async () => errorResponse)), ProviderTimeoutError);
  await assert.rejects(withinTestDeadline(fetchBufferedResponseWithTimeout('https://fixture.invalid', {}, 5, () => new Promise(() => {}))), ProviderTimeoutError);
});

test('buffered response retains json/text/empty status, headers and URL metadata', async () => {
  const original = Response.json({ answer: 42 }, { headers: { 'x-fixture': 'yes' } });
  Object.defineProperty(original, 'url', { value: 'https://fixture.invalid/final' });
  Object.defineProperty(original, 'redirected', { value: true });
  const response = await fetchBufferedResponseWithTimeout('https://fixture.invalid', {}, 100, async () => original);
  assert.deepEqual(await response.clone().json(), { answer: 42 });
  assert.equal(await response.text(), '{"answer":42}');
  assert.equal(response.headers.get('x-fixture'), 'yes');
  assert.equal(response.url, original.url); assert.equal(response.redirected, true);
  const empty = await fetchBufferedResponseWithTimeout('https://fixture.invalid', {}, 100, async () => new Response(null, { status: 204 }));
  assert.equal(empty.status, 204); assert.equal(await empty.text(), '');
});

test('completed operation removes caller abort listener and clears deadline', async () => {
  const controller = new AbortController(); let added = 0; let removed = 0;
  const add = controller.signal.addEventListener.bind(controller.signal); const remove = controller.signal.removeEventListener.bind(controller.signal);
  controller.signal.addEventListener = (...args) => { added++; return add(...args); };
  controller.signal.removeEventListener = (...args) => { removed++; return remove(...args); };
  let observedSignal;
  await fetchBufferedResponseWithTimeout('https://fixture.invalid', { signal: controller.signal }, 5, async (_url, { signal }) => { observedSignal = signal; return new Response('ok'); });
  await new Promise(resolve => setTimeout(resolve, 15));
  assert.equal(added, 1); assert.equal(removed, 1); assert.equal(observedSignal.aborted, false);
});
