import assert from 'node:assert/strict';
import test from 'node:test';
import {
  LANDING_EXAMPLE_KEY,
  landingExampleForVisit,
  nextLandingExampleIndex,
  rememberLandingExample,
  resetLandingExampleVisitForTests,
} from '../src/lib/landingExampleRotation.mjs';

test('landing examples rotate predictably across visits and recover from invalid storage', () => {
  assert.equal(nextLandingExampleIndex(null, 6), 0);
  assert.equal(nextLandingExampleIndex('0', 6), 1);
  assert.equal(nextLandingExampleIndex('5', 6), 0);
  assert.equal(nextLandingExampleIndex('not-a-number', 6), 0);
});

test('one page visit keeps a stable question while explicit changes are remembered', () => {
  const values = new Map([[LANDING_EXAMPLE_KEY, '2']]);
  const owner = { localStorage: { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) } };
  resetLandingExampleVisitForTests();
  assert.equal(landingExampleForVisit(owner, 6), 3);
  assert.equal(landingExampleForVisit(owner, 6), 3);
  assert.equal(rememberLandingExample(owner, 5, 6), true);
  assert.equal(values.get(LANDING_EXAMPLE_KEY), '5');
});

test('blocked browser storage never blocks a landing example', () => {
  const owner = { get localStorage() { throw new Error('blocked'); } };
  resetLandingExampleVisitForTests();
  assert.equal(landingExampleForVisit(owner, 6), 0);
});
