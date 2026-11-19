import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { LEARNING_QUESTIONS, conceptId, selectLearningQuestion } from '../src/lib/learningModel.mjs';

// Synthetic exact-revision fixtures exercise recommendation boundaries only.
// They grant no publication approval to the authoring bank.
const NOW = Date.parse('2026-11-14T06:00:00Z');
const template = LEARNING_QUESTIONS.find(q => q.id === 'physics-forces-01');
function question(id, difficulty, patch = {}) {
  const q = { ...template, id, difficulty, subject: 'Physics', topic: 'Forces',
    curriculum: ['IB DP'], concepts: ['Newton second law'],
    conceptIds: [conceptId('Physics', 'Newton second law')], ...patch };
  return { ...q, contentRevision: `sha256:${createHash('sha256').update(JSON.stringify(q)).digest('hex')}` };
}
const levels = ['foundation', 'intermediate', 'advanced', 'very-hard'];
const physics = levels.map((level, index) => question(`physics-scope-${index}`, level));
const unrelated = question('other-scope-1', 'very-hard', {
  subject: 'Computer Science', topic: 'Graphs', concepts: ['shortest paths'],
  conceptIds: [conceptId('Computer Science', 'shortest paths')],
});
const attempt = (q, patch = {}) => ({ id: 'attempt:scope-isolation-001', questionId: q.id,
  contentRevision: q.contentRevision, answer: String(q.answer.value), confidence: null,
  hinted: false, seconds: 30, at: '2026-11-13T12:00:00Z', mode: 'mixed', ...patch });
const choose = (questions, attempts = [], filters = {}) => selectLearningQuestion({
  questions, attempts, mode: 'mixed', now: NOW, ...filters,
});

test('success, error and assisted answers in another subject cannot raise Physics difficulty', () => {
  const questions = [...physics, unrelated];
  const filters = { subject: 'Physics' };
  const expected = choose(questions, [], filters);
  assert.equal(expected.difficulty, 'foundation');
  for (const patch of [{}, { answer: '-123456' }, { hinted: true }]) {
    assert.equal(choose(questions, [attempt(unrelated, patch)], filters).id, expected.id);
  }
});

test('a later unrelated subject cannot replace the selected subject’s latest difficulty evidence', () => {
  const questions = [...physics, unrelated];
  const filters = { subject: 'Physics' };
  const own = attempt(physics[1], { id: 'attempt:own-subject-001', at: '2026-11-12T12:00:00Z' });
  const other = attempt(unrelated);
  const expected = choose(questions, [own], filters);
  assert.equal(expected.difficulty, 'advanced');
  for (const rows of [[own, other], [other, own]]) {
    assert.equal(choose(questions, rows, filters).id, expected.id);
  }
});

test('a topic filter excludes unrelated topics from difficulty progression', () => {
  const fields = question('physics-fields-fixture', 'very-hard', {
    topic: 'Electric fields', concepts: ['electric potential'],
    conceptIds: [conceptId('Physics', 'electric potential')],
  });
  const questions = [...physics, fields];
  const filters = { subject: 'Physics', topic: 'Forces' };
  assert.equal(choose(questions, [attempt(fields)], filters).id, choose(questions, [], filters).id);
});

test('a curriculum filter excludes answers that are outside that curriculum', () => {
  const ap = levels.map((level, index) => question(`ap-scope-${index}`, level, { curriculum: ['AP'] }));
  const ib = question('ib-only-fixture', 'very-hard', { concepts: ['other skill'],
    conceptIds: [conceptId('Physics', 'other skill')] });
  const questions = [...ap, ib];
  const filters = { subject: 'Physics', curriculum: 'AP' };
  assert.equal(choose(questions, [attempt(ib)], filters).id, choose(questions, [], filters).id);
});

test('a concept filter excludes unrelated concept answers from progression', () => {
  const other = question('physics-other-concept', 'very-hard', { concepts: ['other skill'],
    conceptIds: [conceptId('Physics', 'other skill')] });
  const questions = [...physics, other];
  const filters = { concept: physics[0].conceptIds[0] };
  assert.equal(choose(questions, [attempt(other)], filters).id, choose(questions, [], filters).id);
});

test('excluding an already shown question does not discard its relevant progression evidence', () => {
  const questions = [...physics, unrelated];
  const row = attempt(physics[1]);
  const selected = choose(questions, [row], { subject: 'Physics', exclude: [physics[1].id] });
  assert.equal(selected.difficulty, 'advanced');
  assert.notEqual(selected.id, physics[1].id);
});

test('prerequisite practice keeps relevant prerequisite evidence within the selected concept scope', () => {
  const modulus = levels.map((level, index) => question(`modulus-scope-${index}`, level, {
    subject: 'Mathematics', concepts: ['modulus'], conceptIds: [conceptId('Mathematics', 'modulus')],
  }));
  const polar = question('polar-scope-fixture', 'advanced', {
    subject: 'Mathematics', concepts: ['polar form'], conceptIds: [conceptId('Mathematics', 'polar form')],
  });
  const questions = [...modulus, polar, unrelated];
  const own = attempt(modulus[1], { id: 'attempt:own-prerequisite-001', at: '2026-11-12T12:00:00Z' });
  const filters = { mode: 'prerequisites', concept: polar.conceptIds[0], exclude: [modulus[1].id] };
  const expected = choose(questions, [own], filters);
  assert.equal(expected.id, modulus[2].id);
  assert.equal(choose(questions, [own, attempt(unrelated)], filters).id, expected.id);
});

test('unfiltered progression, explicit target and caller-owned history remain intact', () => {
  const questions = [...physics, unrelated];
  const rows = [attempt(unrelated)];
  const before = JSON.stringify(rows);
  assert.equal(choose(questions, rows).difficulty, 'very-hard');
  assert.equal(choose(questions, rows, { subject: 'Physics', targetId: physics[3].id }).id, physics[3].id);
  assert.equal(choose(questions, rows, { subject: 'Biology' }), null);
  assert.equal(JSON.stringify(rows), before);
});
