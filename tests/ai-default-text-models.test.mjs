import test from 'node:test';
import assert from 'node:assert/strict';
import { createMocks } from './helpers/mock-http.mjs';
import { AI_USER, paidResponse, usageFixture } from './helpers/ai-usage-fixture.mjs';

function setup(t, output, responses) {
  const keys = ['NOTE_MODEL', 'NOTE_FALLBACK_MODEL', 'OPENAI_MODEL', 'OPENAI_API_KEY', 'ChatbotKey', 'SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SECRET_KEY', 'NODE_ENV', 'VERCEL_ENV', 'AI_OPENAI_NOTE_MODEL', 'AI_OPENAI_PAPER_GENERATOR_MODEL', 'AI_OPENAI_ADVANCED_MODEL', 'AI_OPENAI_ECONOMY_MODEL'];
  const previous = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  for (const key of keys) delete process.env[key];
  Object.assign(process.env, { OPENAI_API_KEY: 'fixture', SUPABASE_URL: 'https://default-model.supabase.co', SUPABASE_ANON_KEY: 'fixture', NODE_ENV: 'test' });
  t.after(() => { for (const key of keys) { if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key]; } });
  const paid = [];
  t.mock.method(globalThis, 'fetch', async (url, options = {}) => {
    if (String(url).includes('/auth/v1/user')) return Response.json({ id: AI_USER, aud: 'authenticated', role: 'authenticated' });
    assert.match(String(url), /^https:\/\/api\.openai\.com\/v1\/(responses|chat\/completions)$/);
    const payload = JSON.parse(options.body); paid.push(payload);
    return paidResponse({ ...output, model: payload.model }, responses);
  });
  return paid;
}

test('default note handler uses reviewed text model and settles its generated notes', async t => {
  const paid = setup(t, { output_text: '## Cells\nCells are the study topic.\nFLASHCARDS_JSON: {"flashcards":[{"front":"Topic?","back":"Cells"}]}' }, true);
  const { default: handler } = await import('../api/_handlers/note.js?reviewed-default-test');
  const http = createMocks({ headers: { authorization: 'Bearer fixture' }, body: { topic: 'Cells', additionalInfo: 'Study supplied cell notes.', flashCount: 1 } });
  const fixture = usageFixture();
  await fixture.run(() => handler(http.req, http.res));
  assert.equal(http.getStatus(), 200); assert.equal(http.getJson().generation.mode, 'model');
  assert.equal(paid.length, 1); assert.equal(paid[0].model, 'gpt-4.1-mini-2025-04-14');
  assert.equal(fixture.calls.at(-1).args.p_outcome, 'succeeded');
});

test('default paper handler uses reviewed text model while retaining question/mark validation', async t => {
  const paper = { title: 'Fixture paper', metadata: {}, sections: [{ questions: [{ question: 'Explain force.', marks: 4 }, { question: 'Apply force.', marks: 6 }] }], rubricNotes: ['Review against current source.'], images: [] };
  const paid = setup(t, { choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(paper) } }] }, false);
  const { default: handler } = await import('../api/_handlers/paper-generator.js?reviewed-default-test');
  const http = createMocks({ headers: { authorization: 'Bearer fixture' }, body: { board: 'IGCSE', grade: 10, subject: 'Physics', topics: ['Forces'], marks: 10, numQuestions: 2, images: [] } });
  const fixture = usageFixture();
  await fixture.run(() => handler(http.req, http.res));
  assert.equal(http.getStatus(), 200); assert.equal(http.getJson().generation.mode, 'model');
  assert.equal(http.getJson().paper.metadata.totalMarks, 10); assert.equal(http.getJson().paper.sections[0].questions.length, 2);
  assert.equal(paid.length, 1); assert.equal(paid[0].model, 'gpt-4.1-mini-2025-04-14');
  assert.equal(fixture.calls.at(-1).args.p_outcome, 'succeeded');
});
