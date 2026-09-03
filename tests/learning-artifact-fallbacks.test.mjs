import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import noteHandler from '../api/_handlers/note.js';
import paperHandler from '../api/_handlers/paper-generator.js';
import {
  buildDeterministicFlashcards,
  buildDeterministicNoteFallback,
  buildDeterministicPaperFallback,
  isUsableGeneratedPaper,
  normalizeGeneratedPaper,
} from '../api/_lib/learningArtifactFallbacks.js';
import { createMocks } from './helpers/mock-http.mjs';

const noteClientSource = await readFile(new URL('../src/pages/NotetakerQuiz.tsx', import.meta.url), 'utf8');
const paperClientSource = await readFile(new URL('../src/pages/PaperMaker.tsx', import.meta.url), 'utf8');

const ENV_KEYS = [
  'SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY',
  'OPENAI_API_KEY', 'ChatbotKey', 'CHATBOT_KEY', 'NODE_ENV', 'VERCEL_ENV',
];

async function withEnvironment(values, fn) {
  const before = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));
  const previousFetch = global.fetch;
  for (const key of ENV_KEYS) delete process.env[key];
  Object.assign(process.env, {
    SUPABASE_URL: 'https://vertexed-test.supabase.co',
    SUPABASE_ANON_KEY: 'test-anon-key',
    NODE_ENV: 'test',
    ...values,
  });
  try {
    return await fn();
  } finally {
    global.fetch = previousFetch;
    for (const key of ENV_KEYS) {
      if (before[key] === undefined) delete process.env[key];
      else process.env[key] = before[key];
    }
  }
}

function authenticatedMocks(body) {
  return createMocks({
    method: 'POST',
    headers: { authorization: 'Bearer test-session' },
    body,
  });
}

function authResponse() {
  return new Response(JSON.stringify({
    id: '550e8400-e29b-41d4-a716-446655440000',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'synthetic@example.invalid',
  }), { status: 200, headers: { 'content-type': 'application/json' } });
}

test('deterministic note fallback extracts only supplied ideas and carries no factual invention', () => {
  const first = buildDeterministicNoteFallback({
    topic: 'Cell transport',
    additionalInfo: 'Diffusion moves particles down a concentration gradient. Osmosis concerns water.',
    flashCount: 4,
  });
  const second = buildDeterministicNoteFallback({
    topic: 'Cell transport',
    additionalInfo: 'Diffusion moves particles down a concentration gradient. Osmosis concerns water.',
    flashCount: 4,
  });
  assert.deepEqual(first, second);
  assert.match(first.result, /Offline study scaffold/);
  assert.equal(first.flashcards[0].back, 'Diffusion moves particles down a concentration gradient.');
});

test('deterministic flashcards are stable, bounded, and hash their exact source', () => {
  const cards = buildDeterministicFlashcards('First supplied idea is long enough. Second supplied idea is also long enough.', 99);
  assert.equal(cards.length, 2);
  assert.match(cards[0].provenance.sourceDigest, /^[0-9a-f]{64}$/);
  assert.equal(cards[0].provenance.sourceDigest, cards[1].provenance.sourceDigest);
});

test('deterministic paper preserves requested count and marks while requiring human verification', () => {
  const paper = buildDeterministicPaperFallback({
    board: 'IB MYP', grade: 10, subject: 'Biology', topics: ['Cells', 'Genetics'],
    format: 'Mixed Format', difficulty: 'Hard', numQuestions: 7, marks: 50,
    criteria: null, criteriaMode: false, images: [],
  });
  assert.equal(paper.metadata.numQuestions, 7);
  assert.equal(paper.metadata.totalMarks, 50);
  assert.equal(paper.sections[0].questions.reduce((sum, question) => sum + question.marks, 0), 50);
  assert.equal(isUsableGeneratedPaper(paper), true);
  assert.match(paper.sections[0].questions[0].modelAnswerOutline, /Human verification required/);
  assert.match(paper.provenance.sourceDigest, /^[0-9a-f]{64}$/);
});

test('paper usability validation rejects empty and malformed model structures', () => {
  assert.equal(isUsableGeneratedPaper(null), false);
  assert.equal(isUsableGeneratedPaper({ metadata: {}, sections: [] }), false);
  assert.equal(isUsableGeneratedPaper({ metadata: {}, sections: [{ questions: [{}] }] }), false);
});

test('paper normalization enforces requested question count and mark total', () => {
  const data = {
    board: 'IGCSE', grade: 10, subject: 'Physics', format: 'Mixed Format',
    difficulty: 'Medium', numQuestions: 2, marks: 10, criteriaMode: false,
  };
  const valid = normalizeGeneratedPaper({
    title: 'Forces',
    metadata: { untrusted: true },
    sections: [{ questions: [
      { question: 'Explain force.', marks: 4 },
      { question: 'Apply force.', marks: 6 },
    ] }],
    rubricNotes: ['Use the current mark scheme.'],
  }, data);
  assert.equal(valid.metadata.board, 'IGCSE');
  assert.equal(valid.metadata.totalMarks, 10);
  assert.equal(valid.sections[0].questions.length, 2);
  assert.equal(normalizeGeneratedPaper({
    metadata: {}, sections: [{ questions: [{ question: 'Only one', marks: 10 }] }],
  }, data), null);
  assert.equal(normalizeGeneratedPaper({
    metadata: {}, sections: [{ questions: [
      { question: 'One', marks: 2 }, { question: 'Two', marks: 2 },
    ] }],
  }, data), null);
});

test('note endpoint returns a provenance-bound scaffold when the provider is unconfigured', async () => {
  await withEnvironment({}, async () => {
    global.fetch = async (url) => {
      assert.match(String(url), /auth\/v1\/user/);
      return authResponse();
    };
    const { req, res, getStatus, getJson } = authenticatedMocks({
      topic: 'Photosynthesis',
      additionalInfo: 'Light-dependent reactions produce carriers for the Calvin cycle.',
      flashCount: 6,
      board: 'IB_MYP',
      subjects: ['Biology'],
    });
    await noteHandler(req, res);
    assert.equal(getStatus(), 200);
    assert.equal(getJson().generation.degraded, true);
    assert.equal(getJson().generation.failureClass, 'provider_unconfigured');
    assert.equal(getJson().provenance.board, 'IB_MYP');
    assert.match(getJson().generation.sourceDigest, /^[0-9a-f]{64}$/);
  });
});

test('paper endpoint returns a usable deterministic paper when the provider is unconfigured', async () => {
  await withEnvironment({}, async () => {
    global.fetch = async () => authResponse();
    const { req, res, getStatus, getJson } = authenticatedMocks({
      board: 'IB MYP', grade: 10, subject: 'History', topics: ['Source analysis'],
      marks: 40, numQuestions: 5, difficulty: 'medium', images: [],
    });
    await paperHandler(req, res);
    const body = getJson();
    assert.equal(getStatus(), 200);
    assert.equal(body.success, true);
    assert.equal(body.generation.failureClass, 'provider_unconfigured');
    assert.equal(body.paper.metadata.totalMarks, 40);
    assert.equal(body.paper.sections[0].questions.length, 5);
  });
});

test('malformed paper model output degrades without returning raw provider content', async () => {
  await withEnvironment({ OPENAI_API_KEY: 'synthetic-provider-key' }, async () => {
    global.fetch = async (url) => String(url).includes('auth/v1/user')
      ? authResponse()
      : new Response(JSON.stringify({ choices: [{ message: { content: 'PRIVATE malformed output' } }] }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });
    const { req, res, getStatus, getJson } = authenticatedMocks({
      board: 'IGCSE', grade: 10, subject: 'Physics', topics: ['Forces'],
      marks: 40, numQuestions: 4, difficulty: 'hard', images: [],
    });
    await paperHandler(req, res);
    const serialized = JSON.stringify(getJson());
    assert.equal(getStatus(), 200);
    assert.equal(getJson().generation.failureClass, 'malformed_model_output');
    assert.doesNotMatch(serialized, /PRIVATE malformed output/);
  });
});

test('note provider errors degrade without leaking provider response text', async () => {
  await withEnvironment({ OPENAI_API_KEY: 'synthetic-provider-key' }, async () => {
    global.fetch = async (url) => String(url).includes('auth/v1/user')
      ? authResponse()
      : new Response('PRIVATE provider diagnostic', { status: 500 });
    const { req, res, getStatus, getJson } = authenticatedMocks({
      topic: 'Kinematics', additionalInfo: 'Velocity is displacement per unit time.', flashCount: 4,
    });
    await noteHandler(req, res);
    const serialized = JSON.stringify(getJson());
    assert.equal(getStatus(), 200);
    assert.equal(getJson().generation.failureClass, 'provider_failure');
    assert.doesNotMatch(serialized, /PRIVATE provider diagnostic/);
  });
});

test('note client sends curriculum provenance and persists generation identity', () => {
  assert.match(noteClientSource, /board: learner\.curriculum\.board/);
  assert.match(noteClientSource, /subjects: learner\.curriculum\.subjects/);
  assert.match(noteClientSource, /provenance: data\?\.provenance \?\? null/);
  assert.match(noteClientSource, /generation: data\?\.generation \?\? null/);
  assert.match(noteClientSource, /Offline scaffold generated/);
});

test('paper client persists and visibly labels degraded generation state', () => {
  assert.match(paperClientSource, /paperData = \{ \.\.\.paperData, generation: data\?\.generation \?\? null \}/);
  assert.match(paperClientSource, /generation: data\?\.generation \?\? null/);
  assert.match(paperClientSource, /Deterministic fallback scaffold/);
  assert.match(paperClientSource, /role="status"/);
});
