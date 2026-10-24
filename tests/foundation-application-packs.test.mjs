import assert from 'node:assert/strict';
import test from 'node:test';
import { readLearningLibrary } from '../scripts/generate-learning-library.mjs';
import { checkFoundationAnswer } from '../src/lib/foundationLibrary.mjs';

const lessons = await readLearningLibrary({ includeSubjectExpansion: false });
const get = id => lessons.find(lesson => lesson.id === id);
const answer = (id, question = 'application-check') => get(id).questions.find(q => q.id === question).answer;

test('every shared lesson has a connected application pack without inventing syllabus credit', () => {
  assert.equal(lessons.length, 42);
  for (const lesson of lessons) {
    assert.equal(lesson.revision, '2026-10-21.3');
    assert.ok(lesson.diagrams.some(d => d.id === 'application-trace'), lesson.id);
    const linked = new Set(lesson.teachingSequence.flatMap(step => step.questionIds));
    assert.deepEqual(linked, new Set(lesson.questions.map(q => q.id)), lesson.id);
    for (const id of ['application-check', 'error-analysis']) {
      const question = lesson.questions.find(q => q.id === id);
      assert.ok(question, `${lesson.id}/${id}`);
      assert.ok(lesson.revisionGuide.practiceQuestionIds.includes(id));
      assert.ok(!(lesson.syllabusMappings ?? []).some(m => m.questionIds.includes(id)), 'new practice is not silently assigned an old source link');
      assert.equal(checkFoundationAnswer(question, question.answer).status, 'review', 'multi-part reasoning is not awarded automatic marks');
    }
  }
});

test('every shared lesson has explicit depth practice linked to the new teaching section', () => {
  for (const lesson of lessons) {
    const depth = lesson.questions.filter(question => question.id.startsWith('depth-'));
    assert.equal(depth.length, 3, lesson.id);
    for (const question of depth) {
      assert.equal(question.type, 'extended');
      assert.equal(checkFoundationAnswer(question, question.answer).status, 'review');
      assert.ok(!lesson.flashcards.some(card => question.answer === card.back), question.id);
      assert.ok(lesson.revisionGuide.practiceQuestionIds.includes(question.id));
      assert.ok(!(lesson.syllabusMappings ?? []).some(mapping => mapping.questionIds.includes(question.id)));
    }
    const depthStage = lesson.teachingSequence.find(step => step.title === 'Apply and test the limits');
    assert.deepEqual(depthStage?.questionIds, depth.map(question => question.id), lesson.id);
    assert.deepEqual(depthStage?.noteHeadings, [lesson.notes.at(-1).heading]);
  }
});

test('new quantitative answers agree with separately expressed calculations', () => {
  const includes = (id, values, question) => {
    const text = answer(id, question).replaceAll(',', '');
    const numbers = (text.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
    for (const value of values) assert.ok(numbers.includes(Number(value)), `${id}: expected numeric value ${value} in ${text}`);
  };
  includes('accounting-equation', [9000 - 900, 2400 - 900, 9000 - 900 + 2400]);
  includes('arithmetic-sequences', [Array.from({ length: 8 }, (_, i) => 12 + 3 * i).at(-1), Array.from({ length: 8 }, (_, i) => 12 + 3 * i).reduce((a, b) => a + b)]);
  includes('atomic-models', [13, 13 + 14, 13 - 10]);
  includes('business-costs', [1200 / (18 - 10), 1200 - 120 * (18 - 10)]);
  assert.match(answer('business-costs'), /loss/);
  includes('cell-transport', [Math.round((2.20 / 2 - 1) * 100), Math.round((4.24 / 4 - 1) * 100)]);
  includes('chemical-amounts', [Math.min(5 / 2, 2) * 2, 5 - 2 * Math.min(5 / 2, 2)]);
  includes('data-representation', [80 * 50 * 12, 80 * 50 * 12 / 8, 80 * 50 * 12 / 8192]);
  includes('demand-and-supply', [(100 - 10) / 3, (130 - 10) / 3, 10 + (130 - 10) / 3]);
  includes('derivative-definition', [3 * 2 ** 2, Number(((2.1 ** 3 - 2 ** 3) / 0.1).toFixed(2))]);
  includes('ecosystem-energy', [18000 - 7500, 840 / (18000 - 7500) * 100]);
  includes('electric-circuits', [6 / (4 + 8), 6 ** 2 / (4 + 8)]);
  includes('exponential-change', [250 * 0.8 * 1.2, Math.round((1 - 0.8 * 1.2) * 100)]);
  includes('geometric-sequences', [[6, -3, 1.5, -0.75].reduce((a, b) => a + b)]);
  includes('linear-equations', [Math.floor((70 - 17) / 6), 17 + 8 * 6, 17 + 9 * 6]);
  includes('mass-conservation', [(4 - 2.4).toFixed(2), (4 - 2.4) / 4 * 100]);
  includes('motion-and-forces', [6 / 3, (6 / 2) * (6 / 3), 2 * -3]);
  includes('photosynthesis-limits', [(9 - 4) * 6]);
  includes('respiration-metabolism', [(30 - 12) / 12 * 100, 18 - 12]);
  includes('sampling-and-uncertainty', [12 / Math.sqrt(36), 12 / Math.sqrt(144)]);
  includes('scientific-investigation', [(8 + 9 + 9 + 18) / 4, (9 + 9) / 2]);
  includes('wave-superposition', [90 / (2 * 1.5 / 3), 1.5 / 3]);
});

test('probability, algorithm and polynomial explanations survive independent enumerations', () => {
  const counters = ['R1', 'R2', 'B1', 'B2', 'B3'];
  const outcomes = counters.flatMap(a => counters.filter(b => b !== a).map(b => [a, b]));
  assert.equal(outcomes.filter(pair => pair.some(x => x.startsWith('R'))).length / outcomes.length, 7 / 10);
  assert.match(answer('probability-trees'), /7\/10/);
  const gametes = ['A', 'a'];
  const triples = gametes.flatMap(a => gametes.flatMap(b => gametes.map(c => [a, b, c])));
  assert.equal(triples.filter(t => t.every(g => g === 'A')).length / triples.length, 1 / 8);
  assert.match(answer('inheritance-probability'), /1\/8/);
  assert.equal(Math.max(-8, -3, -11, -4), -3);
  assert.match(answer('algorithms-and-invariants'), /maximum is -3/);
  const list = [1, 4, 4, 4, 9], visited = [];
  let low = 0, high = list.length - 1, candidate = -1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2); visited.push(mid);
    if (list[mid] < 4) low = mid + 1;
    else { if (list[mid] === 4) candidate = mid; high = mid - 1; }
  }
  assert.deepEqual(visited, [2, 0, 1]); assert.equal(candidate, list.indexOf(4));
  assert.match(answer('searching-algorithms'), /indices are 2, 0, 1/);
  for (const t of [-2, 6]) assert.equal(12 + 4 * t - t * t, 0);
  assert.match(answer('quadratic-models'), /landing time is 6/);
  for (let x = -12; x <= 12; x += 0.5) assert.equal(4 * x * x - 12 * x + 9, (2 * x - 3) ** 2);
  assert.match(answer('quadratic-structure'), /3\/2/);
  for (let t = -10; t <= 10; t++) { const x = 7 - 2 * t; assert.equal(x + 2 * t, 7); assert.equal(3 * x + 6 * t, 21); }
  assert.match(answer('simultaneous-systems', 'error-analysis'), /no solutions/);
});
