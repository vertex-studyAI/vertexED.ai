import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const moduleUrl = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const stub = moduleUrl(`
export const getUserContentStorageScope = () => globalThis.__vertexOperation.scope;
export const isAccountDeletionRequest = () => false;
export const trackAccountDeletion = () => {};
export const reportAiRun = () => {};
export const supabase = { auth: {
  getSession: async () => ({data:{session:{access_token:'first-token'}}}),
  refreshSession: async () => { globalThis.__vertexOperation.refreshes++; return {data:{session:{access_token:'refreshed-token'}}}; },
  signOut: async () => {},
}};
`);
let code = ts.transpileModule(fs.readFileSync('src/lib/apiAuth.ts', 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText;
code = code.replace(/(['"])@\/lib\/([^'"]+)\1/g, (_, quote, name) => JSON.stringify(
  ['userContentStorageScope.mjs', 'accountLifecycleAnalytics.mjs', 'supabaseClient', 'monitoring'].includes(name)
    ? stub : pathToFileURL(`${process.cwd()}/src/lib/${name}`).href,
));
const { authFetch, setAuthAccessToken } = await import(moduleUrl(code));
const originalFetch = globalThis.fetch;
test.after(() => { globalThis.fetch = originalFetch; delete globalThis.__vertexOperation; });
test.beforeEach(() => {
  globalThis.__vertexOperation = { scope: 'account-a', refreshes: 0 };
  setAuthAccessToken('first-token');
});

test('one AI operation keeps its idempotency key through a token refresh', async () => {
  const attempts = [];
  globalThis.fetch = async (_input, init) => {
    attempts.push(new Headers(init.headers));
    return new Response('{}', { status: attempts.length === 1 ? 401 : 200 });
  };
  await authFetch('/api/ask', { method: 'POST', body: JSON.stringify({ question: 'A synthetic question' }) });
  assert.equal(attempts.length, 2);
  assert.match(attempts[0].get('Idempotency-Key') ?? '', /^[0-9a-f-]{36}$/i);
  assert.equal(attempts[0].get('Idempotency-Key'), attempts[1].get('Idempotency-Key'));
  assert.equal(attempts[1].get('Authorization'), 'Bearer refreshed-token');
  assert.equal(globalThis.__vertexOperation.refreshes, 1);
});

test('independent AI submissions get different keys and explicit operation keys survive', async () => {
  const keys = [];
  globalThis.fetch = async (_input, init) => { keys.push(new Headers(init.headers).get('Idempotency-Key')); return new Response('{}'); };
  await authFetch('/api/notebook', { method: 'POST', body: '{}' });
  await authFetch('/api/notebook', { method: 'POST', body: '{}' });
  await authFetch('/api/review', { method: 'POST', headers: { 'Idempotency-Key': 'owned-operation-123' }, body: '{}' });
  assert.ok(keys[0]);
  assert.notEqual(keys[0], keys[1]);
  assert.equal(keys[2], 'owned-operation-123');
});

test('non-AI requests and read requests do not acquire paid-operation keys', async () => {
  const keys = [];
  globalThis.fetch = async (_input, init) => { keys.push(new Headers(init.headers).get('Idempotency-Key')); return new Response('{}'); };
  await authFetch('/api/user-content', { method: 'POST', body: '{}' });
  await authFetch('/api/ask');
  assert.deepEqual(keys, [null, null]);
});

test('Request input preserves the caller operation key across authorised retry', async () => {
  const keys = [];
  globalThis.fetch = async (_input, init) => { keys.push(new Headers(init.headers).get('Idempotency-Key')); return new Response('{}', { status: keys.length === 1 ? 401 : 200 }); };
  await authFetch(new Request('https://www.vertexed.app/api/quiz', { method: 'POST', headers: { 'Idempotency-Key': 'owned-request-123' }, body: '{}' }));
  assert.deepEqual(keys, ['owned-request-123', 'owned-request-123']);
});

for (const status of [200, 503]) test(`AI HTTP ${status} retains cancellation through its response body`, async () => {
  const caller = new AbortController();
  let abortTimer;
  globalThis.fetch = async (_input, init) => new Response(new ReadableStream({
    start(controller) {
      init.signal.addEventListener('abort', () => controller.error(new DOMException('Cancelled body', 'AbortError')), { once: true });
      abortTimer = setTimeout(() => caller.abort(), 15);
    },
  }), { status });
  try {
    await assert.rejects(authFetch('/api/ask', { method: 'POST', body: '{}', signal: caller.signal }), error => error.name === 'AbortError');
  } finally {
    clearTimeout(abortTimer);
  }
});
