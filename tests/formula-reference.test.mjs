import test from 'node:test';
import assert from 'node:assert/strict';
import { FORMULA_REFERENCE, FORMULA_SUBJECTS } from '../src/content/formulaReference.ts';
import { checkReferenceAnswer, parseReferenceAnswer } from '../src/lib/referencePractice.ts';

test('numeric answer parsing accepts fractions and scientific notation without evaluating expressions', () => {
  for (const [input, expected] of [['0.5', .5], [' 1 / 2 ', .5], ['5e-1', .5], ['−.5', -.5], ['-1/-2', .5], ['+4', 4], ['0', 0]]) {
    assert.equal(parseReferenceAnswer(input), expected, input);
  }
  for (const invalid of ['', ' ', '1/0', '0/0', '1e999', 'Infinity', 'NaN', '0x10', '1,000', '2 kg', '1/2/3', '2+2', 'Math.sqrt(4)', '1 /', '/2']) {
    assert.equal(parseReferenceAnswer(invalid), null, invalid);
  }
});

test('answer feedback distinguishes malformed, incorrect and sufficiently precise values', () => {
  assert.equal(checkReferenceAnswer('', 0), 'invalid');
  assert.equal(checkReferenceAnswer('1/2', .5), 'correct');
  assert.equal(checkReferenceAnswer('0.05', .5), 'retry');
  assert.equal(checkReferenceAnswer('3.846153846', 3.85, .005), 'correct');
  assert.equal(checkReferenceAnswer('3.8', 3.85, .005), 'retry');
  assert.equal(checkReferenceAnswer('0.5', -.5), 'retry');
});

test('all 30 original answer keys agree with independent calculations', () => {
  const calculated = {
    quadratic: (7 + Math.sqrt(49 - 40)) / 2,
    'power-rule': 6 * 2 ** 2,
    'integration-parts': (Math.E - Math.E) - (0 - 1),
    pythagoras: Math.hypot(5, 12), arithmetic: 5 + 9 * 4, geometric: 5 * 3 ** 3,
    newton: (15 - 6) / 3, kinetic: .5 * 4 * 5 ** 2, potential: 5 * 9.8 * 2,
    ohm: 6 / 12, power: 3 ** 2 * 4, waves: 50 * 40 / 100,
    moles: 11 / 44, concentration: .05 / (250 / 1000), 'ideal-gas': 2 * 8.314 * 300 / .05,
    ph: -Math.log10(1e-5), yield: 9 / 12 * 100, avogadro: 2 * 6.02e23,
    photosynthesis: 3 * 6, respiration: .5 * 6, magnification: 30 * 1000 / 60,
    population: 200 * 1.1 ** 2, 'hardy-weinberg': 2 * Math.sqrt(.16) * (1 - Math.sqrt(.16)),
    'water-potential': -.9 + .4, elasticity: Math.abs(-15 / 5), gdp: 80 + 25 + 30 + 20 - 15,
    multiplier: 1 / (1 - .8), 'opportunity-cost': 20 / 5,
    'real-growth': (1.08 / 1.04 - 1) * 100, 'real-gdp': 660 / (110 / 100),
  };
  assert.equal(FORMULA_REFERENCE.length, 30);
  assert.equal(new Set(FORMULA_REFERENCE.map(({ id }) => id)).size, 30);
  assert.deepEqual(new Set(Object.keys(calculated)), new Set(FORMULA_REFERENCE.map(({ id }) => id)));
  for (const entry of FORMULA_REFERENCE) {
    assert.equal(checkReferenceAnswer(String(calculated[entry.id]), entry.practice.answer, entry.practice.tolerance), 'correct', entry.id);
    assert.equal(checkReferenceAnswer(String(entry.practice.answer + Math.max(1, Math.abs(entry.practice.answer))), entry.practice.answer, entry.practice.tolerance), 'retry', entry.id);
    assert.ok(entry.conditions && entry.mistake && entry.practice.unit && entry.practice.hint, entry.id);
    assert.ok(entry.example.length >= 2 && entry.practice.solution.length >= 2, entry.id);
  }
  for (const { id } of FORMULA_SUBJECTS) assert.equal(FORMULA_REFERENCE.filter((entry) => entry.subject === id).length, 6, id);
});
