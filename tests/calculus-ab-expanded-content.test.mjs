import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { isApCourse } from '../contracts/apContent.js';

const course = JSON.parse(await readFile(new URL('../src/content/ap/calculus-ab.json', import.meta.url), 'utf8'));
const questions = new Map(course.modules.flatMap(unit => unit.questions.map(question => [question.id, question])));
const derivative = (f, x, h = 1e-5) => (f(x + h) - f(x - h)) / (2 * h);
const integrate = (f, a, b, n = 1000) => {
  const h = (b - a) / n;
  let sum = f(a) + f(b);
  for (let i = 1; i < n; i++) sum += (i % 2 ? 4 : 2) * f(a + i * h);
  return sum * h / 3;
};
const near = (a, b, tolerance = 1e-7) => assert.ok(Math.abs(a - b) < tolerance, `${a} != ${b}`);

test('all eight lessons preserve the original thirty-five questions and add sixteen extension questions', () => {
  assert.ok(isApCourse(course));
  assert.equal(course.modules.length, 8);
  assert.equal(course.modules.reduce((sum, unit) => sum + unit.questions.length, 0), 51);
  assert.equal(course.modules.reduce((sum, unit) => sum + unit.reviewCards.length, 0), 31);
  for (const unit of course.modules) {
    assert.ok(unit.explanation.length >= 5, unit.id);
    assert.ok(unit.objectives.length >= 3, unit.id);
    assert.ok(unit.prerequisites.length >= 2, unit.id);
    for (const question of unit.questions.filter(question => !question.id.startsWith('extension-'))) {
      assert.equal(question.hints.length, 3, question.id);
      assert.equal(question.marks, question.checkpoints.length);
      assert.ok(question.difficulty && question.calculatorPolicy);
    }
  }
  assert.match(course.frameworkNote, /partial preparation/);
  assert.match(course.frameworkNote, /Independent subject review.*pending/);
  assert.match(course.modules[6].workedExample.steps.join(' '), /ln\|y\|/);
});

test('every numeric answer key matches an independently expressed calculation', () => {
  const expected = {
    'unit-1-q1': 4 + 4,
    'unit-1-q3': 5 + 5,
    'unit-1-q4': 3 * 2 - 1 - 2 ** 2,
    'unit-1-q5': 1 + 1,
    'unit-1-q6': 1 / (Math.sqrt(4) + 2),
    'unit-2-q3': derivative(x => (x * x + 1) * (x - 2), 3),
    'unit-3-q2': 1 / 4,
    'unit-3-q3': -(2 * 1 + 2) / (1 + 2 * 2),
    'unit-3-q4': ((0.001 ** 2 + 1) ** 3 - 2 + ((-0.001) ** 2 + 1) ** 3) / 0.001 ** 2,
    'unit-4-q1': 4 * Math.PI * 2 ** 2 * -0.5,
    'unit-4-q2': 3 + 0.3 / 6,
    'unit-4-q3': -6 * 2 / Math.sqrt(100 - 6 ** 2),
    'unit-5-q1': 5 * (10 - 5),
    'unit-5-q4': 10 * (40 - 2 * 10),
    'unit-6-q2': 2 ** 3 - 2 * 2,
    'unit-6-q3': (1 - 0) * (2 + 4) / 2 + (3 - 1) * (4 + 8) / 2,
    'unit-6-q4': integrate(x => 2 * x * (x * x + 1) ** 2, 0, 1),
    'unit-7-q2': 3 ** 2 + 4,
    'unit-7-q3': 1 + 0.5 * 1 + 0.5 * (0.5 + 1.5),
    'unit-8-q1': integrate(x => 4 - x * x, -2, 2),
    'unit-8-q2': integrate(x => x * x, 0, 3) / 3,
    'unit-8-q3': integrate(t => 1 - t, 0, 1) + integrate(t => t - 1, 1, 3),
  };
  for (const [id, value] of Object.entries(expected)) near(questions.get(id).numericAnswer.value, value, 1e-5);
  assert.deepEqual(new Set([...questions].filter(([, question]) => question.numericAnswer).map(([id]) => id)), new Set(Object.keys(expected)));
  // A sampled objective check supports this specific maximum, not arbitrary optimisation keys.
  for (let x = 0; x <= 20; x += 0.1) assert.ok(x * (40 - 2 * x) <= expected['unit-5-q4'] + 1e-8);
});

test('additional symbolic and geometric examples satisfy their defining relationships', () => {
  for (const x of [-1, 0, 0.5, 1]) {
    const y = t => 1 + 2 * Math.exp(t * t);
    near(derivative(y, x), 2 * x * (y(x) - 1));
  }
  near(1 + 2 * Math.exp(0), 3);
  near(integrate(x => Math.PI * (4 - x * x), 0, 2), 16 * Math.PI / 3);
  const f = x => x ** 3 - 3 * x;
  assert.deepEqual([-2, -1, 1, 2].map(f), [-2, 2, -2, 2]);
  near(derivative(x => (x + 1) / (x - 1), 2), -2);
  assert.equal(7 - 2 * 2, (2 + 1) / (2 - 1));
  // These numerical/structural checks are not independent editorial approval.
});
