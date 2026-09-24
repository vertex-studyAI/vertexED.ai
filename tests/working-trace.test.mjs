import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verifyTransition, checkWorkingTrace, checkDimensions, parseExpression } from '../src/lib/workingTrace.mjs';

const cases = [
  ['2(x + 3)', '2x + 6', 'verified'], ['2(x + 3)', '2x + 3', 'incorrect'],
  ['(x+1)^2', 'x^2+2x+1', 'verified'], ['(x+1)^2', 'x^2+1', 'incorrect'],
  ['0.1x+0.2x', '0.3x', 'verified'], ['-x^2', '(-x)^2', 'incorrect'],
  ['2x+3=11', '2x=8', 'verified'], ['2x=8', 'x=5', 'incorrect'],
  ['2x=8', 'x=4', 'verified'], ['x=x', '0=0', 'verified'],
  ['x=x', 'x=0', 'incorrect'], ['x+1=x', '0=1', 'verified'],
  ['x/x', '1', 'unverified'], ['x^2=4', 'x=2', 'unverified'],
  ['sqrt(x)', 'x', 'unverified'], ['1/0', '0', 'unverified'],
  ['x', 'y', 'unverified'], ['sin(x)', 'x', 'unverified'],
  ['x^7', 'x', 'unverified'], ['x;alert(1)', 'x', 'unverified'],
  ['0^0', '1', 'unverified'], ['x^0', '1', 'unverified'], ['3^0', '1', 'verified'],
];
for (const [a,b,status] of cases) test(`${a} -> ${b}: ${status}`, () => assert.equal(verifyTransition(a,b).status,status));
test('reports first invalid transition with its original line', () => {
  const result=checkWorkingTrace('2(x+3)=14\n2x+3=14\n2x=11\nx=5.5');
  assert.equal(result.firstIncorrect,2); assert.equal(result.steps[1].status,'verified');
});
test('does not localise first error across unverified transitions', () => assert.equal(checkWorkingTrace('x/x\n1\n2').firstIncorrect,null));
test('bounds traces and exposes a serializable AST', () => {
  assert.equal(checkWorkingTrace('x').steps.length,0);
  assert.equal(checkWorkingTrace(Array(21).fill('x').join('\n')).steps.length,0);
  assert.doesNotThrow(()=>JSON.stringify(parseExpression('2(x+1)').ast));
});
test('dimensions support derived units and reject invalid syntax', () => {
  assert.equal(checkDimensions('N','kg*m/s^2').status,'verified');
  assert.equal(checkDimensions('J','kg*m^2/s^2').status,'verified');
  assert.equal(checkDimensions('m/s','m/s^2').status,'incorrect');
  assert.equal(checkDimensions('N/','kg').status,'unverified');
  assert.equal(checkDimensions('m','cm').status,'verified');
  assert.match(checkDimensions('m','cm').explanation,/does not check/);
});
test('bounded integer linear equations preserve the exact root and detect a changed root', () => {
  for (let a = 1; a <= 10; a++) for (let root = -10; root <= 10; root++) {
    const equation = `${a}x+3=${a * root + 3}`;
    assert.equal(verifyTransition(equation, `x=${root}`).status, 'verified');
    assert.equal(verifyTransition(equation, `x=${root + 1}`).status, 'incorrect');
  }
});
test('nested constant powers cannot grow unbounded integers', () => {
  let expression = '9';
  for (let i = 0; i < 12; i++) expression = `(${expression})^6`;
  assert.equal(verifyTransition(expression, '1').status, 'unverified');
  assert.match(verifyTransition(expression, '1').explanation, /size limit/);
});
