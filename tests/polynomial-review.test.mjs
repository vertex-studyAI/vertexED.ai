import test from 'node:test';
import assert from 'node:assert/strict';
import { reviewPolynomialDerivative as review, parsePolynomial, polynomialText } from '../src/lib/polynomialReview.mjs';

test('finds missing exponent reduction and reports first supplied error', () => {
  const result = review('3x^4-2x+7', '12x^3-2\n12x^4-2x\n0');
  assert.equal(result.status, 'different'); assert.equal(result.line, 2);
  assert.equal(result.category, 'power-rule'); assert.equal(result.expected, '12x^3 -2');
});
test('accepts factored chain-rule and expanded alternatives exactly', () => {
  assert.equal(review('(3x^2+1)^3', '18x(3x^2+1)^2\n162x^5+108x^3+18x').status, 'verified');
  assert.equal(review('x^2/3+0.5x', '2x/3+1/2').status, 'verified');
});
test('chain rule omission is a mismatch without inventing a cause', () => {
  const result = review('(3x^2+1)^3', '3(3x^2+1)^2');
  assert.equal(result.status, 'different'); assert.equal(result.category, 'expression-mismatch');
});
test('unparseable earlier lines prevent claims about a later first error', () => {
  const result = review('x^2', 'Apply the rule\n3x');
  assert.equal(result.status, 'unsupported'); assert.equal(result.line, 1);
});
test('constants, signs, powers and zero polynomials preserve exact semantics', () => {
  assert.equal(review('-x^2', '-2x').status, 'verified');
  assert.equal(review('(-x)^2', '2x').status, 'verified');
  assert.equal(review('7', '0').status, 'verified');
  assert.equal(review('x-x', '0').status, 'verified');
  assert.equal(polynomialText(parsePolynomial('(x+1)(x-1)')), 'x^2 -1');
});
test('never accepts unsupported domains, functions or malformed notation', () => {
  for (const expression of ['x/x', 'sin(x)', 'x^-1', 'x^13', '1/0', 'x^2^3', '2 3', 'x = 2', 'Math.random()', '('.repeat(25)+'x'+')'.repeat(25)]) assert.equal(review(expression, '0').status, 'unsupported', expression);
});
test('incomplete work has no grade and does not become a verified result', () => {
  assert.equal(review('x^2', '').status, 'incomplete');
  assert.equal(review('x^2', '3x').measurementEligible, undefined);
});
