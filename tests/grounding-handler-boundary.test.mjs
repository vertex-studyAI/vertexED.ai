import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { createMocks } from './helpers/mock-http.mjs';

const encodeModule = (code) => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
let fixtureNumber = 0;

// Execute the actual handlers and grounding/output validators. Only session,
// provider, telemetry and retrieval boundaries use constructed fixtures.
async function runHandler(name, { body, output, passages = [] }) {
  const key = `__vertexGroundingBoundary${++fixtureNumber}`;
  const calls = [];
  globalThis[key] = { output, passages, calls };
  const environmentKeys = ['OPENAI_API_KEY', 'ChatbotKey', 'CHATBOT_KEY', 'GEMINI_API_KEY', 'GOOGLE_API_KEY'];
  const originalEnvironment = new Map(environmentKeys.map((name) => [name, process.env[name]]));
  for (const name of environmentKeys) delete process.env[name];
  process.env.OPENAI_API_KEY = 'synthetic-unused-key';
  const handlerUrl = new URL(`../api/_handlers/${name}.js`, import.meta.url);
  const providersUrl = new URL('../api/_lib/aiProviders.js', import.meta.url).href;
  const mockedBoundary = encodeModule(`
    import { extractChatAnswer, createSafetyIdentifier } from ${JSON.stringify(providersUrl)};
    export { extractChatAnswer, createSafetyIdentifier };
    const fixture = globalThis[${JSON.stringify(key)}];
    export const verifyAuthUser = async () => ({ id: 'synthetic-learner' });
    export const readJsonBody = (req) => req.body;
    export const rejectOversizedJsonBody = () => false;
    export const rateLimitUserEndpoint = async () => true;
    export const logProviderRun = async () => true;
    export const resolveChatProvider = () => ({ name: 'openai', primaryModel: 'synthetic-model' });
    export const routeAiRequest = () => ({ model: 'synthetic-model', tier: 'test', maxTokens: 1200 });
    export const retrieveStudyGuideContext = async () => fixture.passages;
    export async function callChatProvider(request) {
      fixture.calls.push(request);
      return { response: { ok: true, status: 200 }, raw: JSON.stringify({ choices: [{ message: { content: fixture.output } }] }), provider: 'openai', model: 'synthetic-model' };
    }
    export async function fetchProvider(request) {
      fixture.calls.push(JSON.parse(request.options.body));
      return new Response(JSON.stringify({ choices: [{ message: { content: fixture.output } }] }), { status: 200 });
    }
  `);
  const mocks = new Set(['auth.js', 'rateLimit.js', 'aiProviders.js', 'aiRouting.js', 'providerRequest.js', 'providerTelemetry.js', 'studyGuideRetrieval.js']);
  const source = await readFile(handlerUrl, 'utf8');
  const code = source.replace(/from\s+(['"])(\.[^'"]+)\1/g, (_match, _quote, path) => {
    const target = mocks.has(path.split('/').at(-1)) ? mockedBoundary : new URL(path, handlerUrl).href;
    return `from ${JSON.stringify(target)}`;
  });
  try {
    const { default: handler } = await import(encodeModule(code));
    const http = createMocks({ method: 'POST', body });
    await handler(http.req, http.res);
    return { status: http.getStatus(), body: http.getJson(), calls };
  } finally {
    delete globalThis[key];
    for (const [name, value] of originalEnvironment) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
}

const largeSources = [
  { id: 'included', content: 'a'.repeat(80_000) },
  { id: 'omitted', content: 'Unseen biological claim.' },
];

for (const name of ['ask', 'notebook']) {
  test(`${name} rejects inline citations to a source absent from its provider request`, async () => {
    const result = await runHandler(name, {
      body: { question: 'Explain cells.', mode: 'study-guide', sources: largeSources },
      output: 'Cells divide [Source: omitted].',
    });
    assert.equal(result.calls.length, 1);
    assert.doesNotMatch(JSON.stringify(result.calls), /SOURCE \[omitted\]/);
    assert.equal(result.status, 502);
    assert.equal(result.body.citations, undefined);
  });

  test(`${name} rejects punctuation that previously aliased the fallback source ID`, async () => {
    const result = await runHandler(name, {
      body: { question: 'Explain cells.', mode: 'study-guide', sources: [{ content: 'Cells divide.' }] },
      output: 'Claim [Source: !!!].',
    });
    assert.equal(result.calls.length, 1);
    assert.equal(result.status, 502);
  });

  test(`${name} keeps valid citations and returns only sources the provider received`, async () => {
    const result = await runHandler(name, {
      body: { question: 'Explain the passage.', mode: 'study-guide', sources: largeSources },
      output: 'Supplied passage [Source: included].',
    });
    assert.equal(result.status, 200);
    assert.deepEqual(result.body.citations.map(({ id }) => id), ['included']);
    assert.deepEqual(result.body.sources.map(({ id }) => id), ['included']);
  });
}

for (const mode of ['quiz', 'flashcards']) {
  for (const sourceId of ['omitted', 'included']) {
    test(`notebook ${mode} validates the exact source context for ${sourceId}`, async () => {
      const item = mode === 'quiz'
        ? { questions: [{ question: 'What is in the passage?', type: 'short', answer: 'Supplied text.', sourceIds: [sourceId] }] }
        : { flashcards: [{ front: 'What is in the passage?', back: 'Supplied text.', sourceIds: [sourceId] }] };
      const result = await runHandler('notebook', { body: { mode, sources: largeSources }, output: JSON.stringify(item) });
      assert.equal(result.calls.length, 1);
      assert.doesNotMatch(JSON.stringify(result.calls), /SOURCE \[omitted\]/);
      assert.equal(result.status, sourceId === 'included' ? 200 : 502);
    });
  }
}

test('study-guide handler uses its 48,000-character bound for validation', async () => {
  const result = await runHandler('study-guide-chat', {
    body: { question: 'Explain the second passage.' },
    output: 'Claim [Source: guide-2].',
    passages: [
      { label: 'First guide', text: 'a'.repeat(48_000), path: 'first.md' },
      { label: 'Second guide', text: 'Unseen passage.', path: 'second.md' },
    ],
  });
  assert.equal(result.calls.length, 1);
  assert.doesNotMatch(JSON.stringify(result.calls), /SOURCE \[guide-2\]/);
  assert.equal(result.status, 502);
});

test('study-guide response preserves its path but limits previews to the actual passage', async () => {
  const result = await runHandler('study-guide-chat', {
    body: { question: 'Explain the second passage.' },
    output: 'Claim [Source: guide-2].',
    passages: [
      { label: 'First guide', text: 'a'.repeat(47_700), path: 'first.md' },
      { label: 'Second guide', text: 'b'.repeat(250) + 'UNSEEN-TAIL'.repeat(20), path: 'second.md' },
    ],
  });
  assert.equal(result.calls.length, 1);
  assert.match(JSON.stringify(result.calls), /SOURCE \[guide-2\]/);
  assert.doesNotMatch(JSON.stringify(result.calls), /UNSEEN-TAIL/);
  assert.equal(result.status, 200);
  assert.equal(result.body.sources[0].path, 'second.md');
  assert.equal(result.body.sources[0].excerpt, result.body.citations[0].excerpt);
  assert.doesNotMatch(result.body.sources[0].excerpt, /UNSEEN-TAIL/);
});
