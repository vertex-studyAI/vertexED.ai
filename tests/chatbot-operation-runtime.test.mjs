import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const moduleUrl = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const transport = moduleUrl('export const authFetch = (...args) => globalThis.__vertexChatFallback.fetch(...args);');
let code = ts.transpileModule(fs.readFileSync('src/lib/chatbotApi.ts', 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText;
code = code.replaceAll("'@/lib/apiAuth'", JSON.stringify(transport))
  .replaceAll("'@/lib/sameOriginApi.mjs'", JSON.stringify(pathToFileURL(`${process.cwd()}/src/lib/sameOriginApi.mjs`).href))
  .replaceAll('import.meta.env?.VITE_CHATBOT_API_URL', "'/api/alternate-ask'");
const { fetchChatbotAnswer } = await import(moduleUrl(code));
const originalWindow = globalThis.window;
test.beforeEach(() => { globalThis.window = { location: { origin: 'https://www.vertexed.app' } }; });
test.after(() => { globalThis.window = originalWindow; delete globalThis.__vertexChatFallback; });

test('a routing-only fallback reuses the original operation identity', async () => {
  const calls = [];
  globalThis.__vertexChatFallback = { fetch: async (endpoint, init) => {
    calls.push({ endpoint, headers: new Headers(init.headers) });
    return new Response(JSON.stringify(calls.length === 1 ? { error: 'Not found' } : { answer: 'Synthetic fixture' }), { status: calls.length === 1 ? 404 : 200 });
  } };
  assert.equal((await fetchChatbotAnswer('Synthetic question')).answer, 'Synthetic fixture');
  assert.equal(calls.length, 2);
  assert.match(calls[0].headers.get('Idempotency-Key') ?? '', /^[0-9a-f-]{36}$/i);
  assert.equal(calls[0].headers.get('Idempotency-Key'), calls[1].headers.get('Idempotency-Key'));
});

for (const status of [401, 403, 409, 429, 500, 503]) test(`HTTP ${status} cannot trigger another potentially paid endpoint`, async () => {
  let calls = 0;
  globalThis.__vertexChatFallback = { fetch: async () => {
    calls++;
    return new Response(JSON.stringify(calls === 1 ? { error: 'Synthetic admission failure' } : { answer: 'Unexpected second dispatch' }), { status: calls === 1 ? status : 200 });
  } };
  await assert.rejects(fetchChatbotAnswer('Synthetic question'), error => error.status === status);
  assert.equal(calls, 1);
});

for (const error of [new TypeError('Synthetic network loss'), new DOMException('Cancelled', 'AbortError')]) test(`${error.name} stops without a second dispatch`, async () => {
  let calls = 0;
  globalThis.__vertexChatFallback = { fetch: async () => { calls++; if (calls === 1) throw error; return new Response('{"answer":"Unexpected second dispatch"}'); } };
  await assert.rejects(fetchChatbotAnswer('Synthetic question'), actual => actual === error);
  assert.equal(calls, 1);
});

test('an empty or malformed successful response cannot trigger another paid call', async () => {
  for (const body of ['', '<html>wrong upstream</html>']) {
    let calls = 0;
    globalThis.__vertexChatFallback = { fetch: async () => { calls++; return new Response(calls === 1 ? body : '{"answer":"Unexpected second dispatch"}'); } };
    await assert.rejects(fetchChatbotAnswer('Synthetic question'));
    assert.equal(calls, 1);
  }
});
