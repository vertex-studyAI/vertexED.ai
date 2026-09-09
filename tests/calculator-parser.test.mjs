import assert from 'node:assert/strict';
import test from 'node:test';

import { evaluateExpression } from '../src/pages/study-zone/components/calculatorCore.mjs';

test('calculator evaluates arithmetic, constants, powers, and allowlisted functions without dynamic code', () => {
  assert.equal(evaluateExpression('2 + 3 * 4'), 14);
  assert.equal(evaluateExpression('(2 + 3) * 4'), 20);
  assert.equal(evaluateExpression('2^3^2'), 512);
  assert.equal(evaluateExpression('-2^2'), -4);
  assert.ok(Math.abs(evaluateExpression('sin(pi / 2)') - 1) < 1e-12);
  assert.equal(evaluateExpression('sqrt(81) + log10(100)'), 11);
});

test('calculator rejects code, unknown identifiers, malformed numbers, and non-finite results', () => {
  for (const expression of ['globalThis', 'constructor(1)', '1..2', '1/0', 'sqrt(-1)', '2(3)', '']) {
    assert.throws(() => evaluateExpression(expression));
  }
});

test('calculator implementation is compatible with a CSP that forbids unsafe-eval', async () => {
  const { readFile } = await import('node:fs/promises');
  const source = await readFile(new URL('../src/pages/study-zone/components/calculatorCore.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /new Function|\beval\s*\(/);
});
