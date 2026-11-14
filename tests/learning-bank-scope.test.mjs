import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { LEARNING_QUESTIONS, CONCEPT_GRAPH, PRACTICE_MODES, conceptId,
  buildKnowledgeModel, selectLearningQuestion, buildLearningPlan } from '../src/lib/learningModel.mjs';
import { sessionEvidenceChanges } from '../src/lib/learningJourney.mjs';

// Injected metadata fixtures verify the engine's existing questions parameter.
// Their revisions are synthetic; these are not newly approved course questions.
const NOW = Date.parse('2026-11-11T13:00:00Z');
const systemNow = Date.now;
Date.now = () => NOW;
after(() => { Date.now = systemNow; });
const template = LEARNING_QUESTIONS.find(q => q.id === 'math-modulus-01');
function fixture(id, labels = ['fixture concept'], ids, subject = 'Fixture subject') {
  const q = { ...template, id, subject, topic: 'Fixture unit', concepts: labels,
    conceptIds: ids || labels.map(label => conceptId(subject, label)) };
  return { ...q, contentRevision: `sha256:${createHash('sha256').update(JSON.stringify(q)).digest('hex')}` };
}
const attempt = (q, patch = {}) => ({ id: 'attempt:bank-scope-0001', questionId: q.id,
  contentRevision: q.contentRevision, answer: String(q.answer.value), confidence: null,
  hinted: false, seconds: 30, at: '2026-11-10T12:00:00Z', mode: 'diagnostic', ...patch });

test('each selection mode accepts a well-formed injected bank with a new concept', () => {
  for (const [index, label] of ['fixture concept', 'constructor', 'toString', '__proto__'].entries()) {
    const q = fixture(`fixture-only-0${index}`, [label]);
    for (const mode of PRACTICE_MODES) {
      assert.equal(selectLearningQuestion({ questions: [q], mode, now: NOW })?.id, q.id);
    }
  }
});

test('verified injected question evidence contributes to its supplied concept only', () => {
  const q = fixture('fixture-evidence-01');
  const model = buildKnowledgeModel([attempt(q)], NOW, [q]);
  assert.deepEqual(model.map(node => node.id), q.conceptIds);
  assert.equal(model[0].attempts, 1);
  assert.equal(model[0].independentCorrect, 1);
  assert.equal(model[0].status, 'developing');
});

test('reusing a catalog question identity does not leak the catalog concept mapping', () => {
  const q = fixture(template.id, ['replacement concept']);
  const model = buildKnowledgeModel([attempt(q)], NOW, [q]);
  assert.deepEqual(model.map(node => node.id), q.conceptIds);
  assert.equal(model[0].attempts, 1);
  assert.ok(!model.some(node => template.conceptIds.includes(node.id)));
});

test('a supplied subset or empty bank does not create unrelated catalog nodes', () => {
  const subset = LEARNING_QUESTIONS.filter(q => q.id === 'math-argument-01');
  const expected = [...new Set(subset.flatMap(q => q.conceptIds))];
  assert.deepEqual(buildKnowledgeModel([], NOW, subset).map(node => node.id), expected);
  assert.deepEqual(buildKnowledgeModel([], NOW, []), []);
  assert.equal(selectLearningQuestion({ questions: [], now: NOW }), null);
});

test('known prerequisite labels resolve to the injected bank concept identities', () => {
  const modulus = fixture('fixture-modulus-01', ['modulus'], ['fixture:modulus'], 'Mathematics');
  const argument = fixture('fixture-argument-01', ['argument'], ['fixture:argument'], 'Mathematics');
  const polar = fixture('fixture-polar-01', ['polar form'], ['fixture:polar'], 'Mathematics');
  const questions = [modulus, argument, polar];
  const node = buildKnowledgeModel([], NOW, questions).find(n => n.id === 'fixture:polar');
  assert.deepEqual(node.prerequisites, ['fixture:modulus', 'fixture:argument']);
  const selected = selectLearningQuestion({ questions, concept: node.id, mode: 'prerequisites', now: NOW });
  assert.ok([modulus.id, argument.id].includes(selected.id));
});

test('a multi-concept injected question counts once for each of its own concepts', () => {
  const q = fixture('fixture-multi-01', ['first concept', 'second concept']);
  const other = fixture('fixture-other-01', ['unrelated concept']);
  const model = buildKnowledgeModel([attempt(q)], NOW, [q, other]);
  assert.equal(model.length, 3);
  for (const id of q.conceptIds) assert.equal(model.find(node => node.id === id).attempts, 1);
  assert.equal(model.find(node => node.id === other.conceptIds[0]).attempts, 0);
});

test('custom-bank planning and session evidence use the same supplied concept model', () => {
  const q = fixture('fixture-plan-01');
  const row = attempt(q, { answer: '-123456' });
  const plan = buildLearningPlan({ questions: [q], attempts: [row], now: NOW });
  const action = plan.planned.find(item => item.kind === 'concept');
  assert.equal(action?.id, q.conceptIds[0]);
  assert.ok(action.to.includes(encodeURIComponent(q.conceptIds[0])));
  const session = { responses: { [q.id]: { submitted: row.id } }, startedAt: Date.parse('2026-11-10T11:00:00Z') };
  const changes = sessionEvidenceChanges(session, [row], [q]);
  assert.deepEqual(changes.map(node => node.id), q.conceptIds);
  assert.equal(changes[0].previousStatus, 'unassessed');
  assert.equal(changes[0].attempts, 1);
});

test('injected banks leave the default graph and known prerequisite edges unchanged', () => {
  const before = structuredClone(CONCEPT_GRAPH);
  const defaultModel = buildKnowledgeModel([], NOW);
  const q = fixture('fixture-isolated-01');
  buildKnowledgeModel([attempt(q)], NOW, [q]);
  assert.deepEqual(CONCEPT_GRAPH, before);
  assert.deepEqual(buildKnowledgeModel([], NOW), defaultModel);
  assert.deepEqual(CONCEPT_GRAPH.find(node => node.id === 'mathematics:polar-form').prerequisites,
    ['mathematics:modulus', 'mathematics:argument']);
  assert.deepEqual(CONCEPT_GRAPH.find(node => node.id === 'computer-science:dynamic-programming').prerequisites,
    ['computer-science:recursion', 'computer-science:state-design']);
});
