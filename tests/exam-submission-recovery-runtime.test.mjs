import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import { setUserContentStorageScope, userContentStorageKeys } from '../src/lib/userContentStorageScope.mjs';

const encode = code => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
const dependencies = encode(`
  export const boardToApiLabel = board => board;
  export const queueLearnerStateWrite = (...args) => {
    if (globalThis.__examSubmission.queueThrows) throw new Error('Recovery queue unavailable');
    globalThis.__examSubmission.queue.push(args);
  };
`);
let code = ts.transpileModule(fs.readFileSync(process.env.VERTEXED_EXAM_FLOW_SOURCE || 'src/lib/examFlow.ts', 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText;
code = code.replace(/(['"])@\/lib\/([^'"]+)\1/g, (_, quote, file) => JSON.stringify(
  ['curriculum', 'learnerStateSync'].includes(file) ? dependencies : pathToFileURL(`${process.cwd()}/src/lib/${file}`).href,
));
const flow = await import(encode(code));
const scope = 'exam-submission-owner';
const timestamp = '2026-10-16T00:00:00.000Z';
const handoff = {
  paperTitle: 'Original practice', board: 'IB_DP', subject: 'Biology', grade: 11,
  questions: [{ id: 'q1', question: 'Explain diffusion.' }], answers: { q1: 'Particles move down a concentration gradient.' },
  rubricNotes: ['Identify the gradient.'],
};
const active = {
  paper: { title: handoff.paperTitle, sections: [{ questions: handoff.questions }] },
  paperTitle: handoff.paperTitle, answers: { q1: 'Partial draft' }, answered: 1, total: 1,
  currentIndex: 0, deadlineAt: '2026-10-16T01:00:00.000Z', cramMode: false,
  status: 'in_progress', savedAt: timestamp, updatedAt: timestamp,
};

function harness(t) {
  setUserContentStorageScope(scope);
  const keys = userContentStorageKeys(scope);
  const local = new Map([[keys.mockExamDraft, JSON.stringify(active)]]);
  const session = new Map();
  const state = { local, session, queue: [], keys };
  const storage = (map, area) => ({
    getItem: key => map.get(key) ?? null,
    setItem: (key, value) => {
      if (state[`${area}Blocked`]) throw new Error('Storage blocked');
      map.set(key, value);
    },
    removeItem: key => map.delete(key),
  });
  globalThis.window = { localStorage: storage(local, 'local'), sessionStorage: storage(session, 'session') };
  globalThis.__examSubmission = state;
  t.after(() => {
    setUserContentStorageScope(null);
    delete globalThis.window;
    delete globalThis.__examSubmission;
  });
  return state;
}

test('submitted answers survive lost session storage, repeated reviewer refresh and are queued without a deletion tombstone', t => {
  const state = harness(t);
  assert.equal(flow.saveMockExamAnswersHandoff(handoff), true);
  state.session.clear();
  assert.deepEqual(flow.consumeMockExamAnswers(), handoff);
  assert.deepEqual(flow.consumeMockExamAnswers(), handoff);
  const saved = JSON.parse(state.local.get(state.keys.mockExamDraft));
  assert.equal(saved.status, 'awaiting_review');
  assert.deepEqual(saved.answers, handoff.answers);
  assert.deepEqual(saved.submittedAnswers, handoff);
  assert.equal(flow.loadMockExamDraft(), null, 'submitted work must not resume as an active timed attempt');
  assert.equal(state.queue.length, 1);
  assert.equal(state.queue[0][2].deleted, undefined);
  assert.equal(state.queue[0][2].status, 'awaiting_review');
});

test('temporary storage failure does not block a durably saved submission', t => {
  const state = harness(t);
  state.sessionBlocked = true;
  assert.equal(flow.saveMockExamAnswersHandoff(handoff), true);
  assert.deepEqual(flow.consumeMockExamAnswers(), handoff);
  assert.equal(flow.getPendingMockReview().status, 'awaiting_review');
});

test('failed durable acknowledgement retains the active draft and does not create a success handoff', t => {
  const state = harness(t);
  state.localBlocked = true;
  const original = state.local.get(state.keys.mockExamDraft);
  assert.equal(flow.saveMockExamAnswersHandoff(handoff), false);
  assert.equal(state.local.get(state.keys.mockExamDraft), original);
  assert.equal(state.session.size, 0);
  assert.equal(state.queue.length, 0);
});

test('submitted state restored by learner-state hydration supplies the reviewer even without local handoff keys', t => {
  const state = harness(t);
  state.local.set(state.keys.mockExamDraft, JSON.stringify({ ...active, status: 'awaiting_review', submittedAnswers: handoff, answers: handoff.answers }));
  assert.deepEqual(flow.consumeMockExamAnswers(), handoff);
  assert.equal(flow.getPendingMockReview().status, 'awaiting_review');
});

test('account switching never imports another account submission', t => {
  harness(t);
  assert.equal(flow.saveMockExamAnswersHandoff(handoff), true);
  setUserContentStorageScope('exam-different-owner');
  assert.equal(flow.consumeMockExamAnswers(), null);
  assert.equal(flow.getPendingMockReview(), null);
  setUserContentStorageScope(scope);
  assert.deepEqual(flow.consumeMockExamAnswers(), handoff);
});

for (const bytes of ['{damaged', '[null]', JSON.stringify({ ...active, answers: { q1: null } })]) {
  test(`damaged active exam bytes are preserved through draft saving and submission (${bytes.slice(0, 16)})`, t => {
    const state = harness(t);
    state.local.set(state.keys.mockExamDraft, bytes);
    assert.equal(flow.saveMockExamDraft(active), false);
    assert.equal(flow.saveMockExamAnswersHandoff(handoff), false);
    assert.equal(state.local.get(state.keys.mockExamDraft), bytes);
    assert.equal(state.queue.length, 0);
  });
}

test('malformed answer submissions cannot replace an existing recoverable draft', t => {
  const state = harness(t);
  assert.equal(flow.saveMockExamAnswersHandoff({ ...handoff, answers: { q1: null } }), false);
  assert.deepEqual(JSON.parse(state.local.get(state.keys.mockExamDraft)), active);
});

test('the last submitted copy remains recoverable while a later exam is active', t => {
  harness(t);
  flow.saveMockExamAnswersHandoff(handoff);
  assert.equal(flow.saveMockExamDraft({ ...active, paperTitle: 'Next practice' }), true);
  assert.equal(flow.loadMockExamDraft().paperTitle, 'Next practice');
  assert.deepEqual(flow.consumeMockExamAnswers(), handoff);
});

test('cloud queue failure does not discard a confirmed device submission or throw from the submit control', t => {
  const state = harness(t);
  state.queueThrows = true;
  assert.equal(flow.saveMockExamDraft(active), true);
  assert.equal(flow.saveMockExamAnswersHandoff(handoff), true);
  state.session.clear();
  assert.deepEqual(flow.consumeMockExamAnswers(), handoff);
});
