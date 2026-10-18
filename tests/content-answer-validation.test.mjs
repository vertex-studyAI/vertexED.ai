import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { ADAPTIVE_QUESTION_BANK } from '../src/content/adaptiveQuestionBank.mjs';
import { classifyPracticeAnswer } from '../src/lib/adaptivePractice.mjs';
import { isApCourse } from '../contracts/apContent.js';

test('independent numerical solutions agree with every numerical adaptive key', () => {
  const calls = (n) => n <= 1 ? 1 : 1 + calls(n - 1) + calls(n - 2);
  const expected = {
    'math-modulus-01': Math.hypot(3, 4), 'math-modulus-02': Math.hypot(-5, 12),
    'math-argument-01': Math.atan2(1, 1) * 180 / Math.PI, 'math-argument-02': Math.atan2(1, -1) * 180 / Math.PI,
    'math-polar-01': 2 * Math.cos(Math.PI / 3), 'math-polar-02': 4 * Math.sin(Math.PI / 6),
    'math-demoivre-01': 2 ** 3, 'math-demoivre-02': 2 * 40, 'math-roots-01': 360 / 5, 'math-roots-02': 360 / 8,
    'math-functions-composite-01': 2 * (2 ** 2 + 1) - 3,
    'math-logarithms-01': 2 + Math.sqrt(9),
    'math-sequences-01': [6, 12, 24, 48, 96, 192].reduce((a, b) => a + b, 0),
    'math-vectors-01': (2 * 1 - 1 * 2 + 2 * 2) / Math.hypot(1, 2, 2),
    'math-probability-bayes-01': (0.92 * 0.02) / (0.92 * 0.02 + 0.05 * 0.98),
    'math-limits-01': 3 / 2,
    'math-integration-01': (Math.exp(2) + 1) / 4,
    'physics-forces-01': 18 / 6, 'physics-friction-01': (22 - 7) / 5,
    'physics-energy-01': Math.sqrt(2 * 40 * 0.8 / 0.5),
    'physics-momentum-01': (0.2 * 6 - 0.3 * 2) / (0.2 + 0.3),
    'physics-circular-01': 600 * (9.8 - 12 ** 2 / 40),
    'physics-circuits-01': 12 * 5.5 / (5.5 + 0.5),
    'physics-fields-01': Math.sqrt(2 * 1.60e-19 * 250 / 9.11e-31),
    'cs-recursion-01': calls(5),
  };
  const numeric = ADAPTIVE_QUESTION_BANK.filter((item) => item.type === 'numeric');
  assert.deepEqual(numeric.map((item) => item.id).sort(), Object.keys(expected).sort());
  for (const question of numeric) {
    assert.equal(classifyPracticeAnswer(question, String(expected[question.id])).correct, true, question.id);
    assert.ok(question.answer.tolerance >= 0);
    for (const mistake of question.mistakes) {
      if (mistake.value !== undefined) assert.equal(classifyPracticeAnswer(question, String(mistake.value)).correct, false, `${question.id}: distractor cannot also be correct`);
    }
  }
});

test('geometric-series omission feedback identifies the actual five-term sum', () => {
  const question = ADAPTIVE_QUESTION_BANK.find((item) => item.id === 'math-sequences-01');
  const fiveTerms = [6, 12, 24, 48, 96].reduce((a, b) => a + b, 0);
  const omission = question.mistakes.find((item) => item.subcategory === 'term_count');
  assert.equal(omission.value, fiveTerms);
  assert.equal(classifyPracticeAnswer(question, String(fiveTerms)).errorSubcategory, 'term_count');
  assert.equal(classifyPracticeAnswer(question, '192').errorSubcategory, 'term_not_sum');
});

test('AP limits revision pack has independently solved retry and transfer keys with matching marks', async () => {
  const course = JSON.parse(await readFile(new URL('../src/content/ap/calculus-ab.json', import.meta.url), 'utf8'));
  assert.equal(isApCourse(course), true);
  const unit = course.modules[0];
  const solved = { 'unit-1-q3': 5 + 5, 'unit-1-q4': 3 * 2 - 1 - 2 ** 2, 'unit-1-q5': 1 + 1 };
  assert.equal(unit.reviewCards.length, 3);
  assert.ok(unit.objectives.length >= 3 && unit.prerequisites.length >= 3);
  for (const [id, value] of Object.entries(solved)) {
    const question = unit.questions.find((entry) => entry.id === id);
    assert.equal(question.numericAnswer.value, value, id);
    assert.equal(question.numericAnswer.tolerance, 0);
    assert.equal(question.marks, question.checkpoints.length);
    assert.equal(question.calculatorPolicy, 'not-required');
  }
  assert.notEqual(unit.questions.find((q) => q.id === 'unit-1-q3').prompt, unit.questions.find((q) => q.id === 'unit-1-q1').prompt);
  for (const mutate of [
    (copy) => { copy.modules[0].questions[2].marks = 99; },
    (copy) => { copy.modules[0].questions[2].numericAnswer.tolerance = -1; },
    (copy) => { copy.modules[0].questions[2].retryOf = 'missing-question'; },
  ]) {
    const copy = structuredClone(course); mutate(copy); assert.equal(isApCourse(copy), false);
  }
});
