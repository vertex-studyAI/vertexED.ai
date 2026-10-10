import assert from 'node:assert/strict';
import test from 'node:test';

import { GLOBAL_SEARCH_INDEX, searchVertex } from '../src/lib/globalSearchIndex.ts';

test('signed-out search hides account-scoped study tools', () => {
  const accountTitles = GLOBAL_SEARCH_INDEX.filter((entry) => entry.account).map((entry) => entry.title);
  assert.ok(accountTitles.length > 0, 'expected account-scoped tools in the index');

  const signedOut = searchVertex('planner', { includeAccount: false });
  assert.equal(signedOut.every((entry) => !entry.account), true);
  assert.equal(signedOut.some((entry) => entry.title === 'Study planner'), false);

  const signedIn = searchVertex('planner', { includeAccount: true });
  assert.ok(signedIn.some((entry) => entry.title === 'Study planner'));
});

test('public pages remain searchable without an account', () => {
  const results = searchVertex('privacy', { includeAccount: false });
  assert.ok(results.some((entry) => entry.to === '/privacy'));
});

test('numeric limit arity remains supported', () => {
  const results = searchVertex('myp', 3);
  assert.ok(results.length <= 3);
});

test('search tolerates missing letters and transpositions without losing exact ranking', () => {
  assert.ok(searchVertex('plnner').some(entry => entry.title === 'Study planner'));
  assert.ok(searchVertex('bioloyg').some(entry => /biology/i.test(entry.title)));
  assert.equal(searchVertex('Privacy')[0].title, 'Privacy');
  assert.deepEqual(searchVertex('zzzz-no-such-subject'), []);
});

test('private saved work is ranked with the catalogue but filtered when signed out', () => {
  const entry = { title: 'My integral methods', description: 'note', keywords: 'integration by parts', to: '/saved-work?item=1', area: 'Saved work', account: true };
  assert.equal(searchVertex('integral methods', { entries: [entry] })[0], entry);
  assert.ok(!searchVertex('integral methods', { entries: [entry], includeAccount: false }).includes(entry));
});
