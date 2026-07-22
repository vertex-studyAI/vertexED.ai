import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scoreResponse, _internal } from '../scripts/score.mjs';

test('scoreResponse: full marks for clean Socratic response with citation', () => {
  const rubric = {
    mustContainAny: [['6']],
    mustNotContain: ['I don\'t know'],
    minLength: 40,
    maxLength: 1000,
    mustCiteSources: true,
    encourages: [{ regex: '\\btry\\b', label: 'invites engagement' }],
  };
  const result = scoreResponse(
    'Let\'s try this together. The answer is 6. [Source: Algebra textbook]',
    rubric,
  );
  assert.ok(result.score >= 4, `expected >=4 got ${result.score}`);
  assert.equal(result.breakdown.mustContainAnyPassed, true);
  assert.equal(result.breakdown.mustNotContainHits, 0);
  assert.equal(result.breakdown.cited, true);
});

test('scoreResponse: heavy penalty for banned phrase', () => {
  const rubric = {
    mustNotContain: ['I don\'t know', 'as an AI'],
  };
  const result = scoreResponse("I don't know, but as an AI I think...", rubric);
  assert.equal(result.score, 1);
  assert.equal(result.breakdown.mustNotContainHits, 2);
});

test('scoreResponse: penalty when mustContainAny group fully missing', () => {
  const rubric = {
    mustContainAny: [['42'], ['forty-two']],
  };
  const result = scoreResponse('The answer is 41.', rubric);
  assert.equal(result.breakdown.mustContainAnyPassed, false);
  assert.ok(result.score <= 3, `expected <=3 got ${result.score}`);
});

test('scoreResponse: mustContainAny passes if any group fully matches', () => {
  const rubric = {
    mustContainAny: [['42'], ['forty-two']],
  };
  const result = scoreResponse('It is forty-two.', rubric);
  assert.equal(result.breakdown.mustContainAnyPassed, true);
  assert.ok(result.score >= 4);
});

test('scoreResponse: enforces minLength', () => {
  const rubric = { minLength: 100 };
  const result = scoreResponse('Too short.', rubric);
  assert.equal(result.score, 4);
  assert.ok(result.breakdown.adjustments.some((a) => a.startsWith('minLength')));
});

test('scoreResponse: enforces maxLength', () => {
  const rubric = { maxLength: 10 };
  const result = scoreResponse('This response is far too long for the budget.', rubric);
  assert.equal(result.score, 4);
  assert.ok(result.breakdown.adjustments.some((a) => a.startsWith('maxLength')));
});

test('scoreResponse: encourage matches add up to 0.25 each, clamped at 5', () => {
  const rubric = {
    encourages: [
      { regex: '\\bthink\\b', label: 'thinks' },
      { regex: '\\btry\\b', label: 'tries' },
    ],
  };
  const result = scoreResponse('think try think try think try think try think try', rubric);
  assert.equal(result.breakdown.encourageMatches[0].count, 5);
  assert.equal(result.breakdown.encourageMatches[1].count, 5);
  assert.equal(result.score, 5, 'should be clamped at 5');
});

test('scoreResponse: discourage matches subtract 0.5 each', () => {
  const rubric = {
    discourages: [
      { regex: '\\bof course\\b', label: 'lecturing' },
    ],
  };
  const result = scoreResponse('Of course, of course, of course.', rubric);
  assert.equal(result.breakdown.discourageMatches[0].count, 3);
  assert.equal(result.score, 4, '5 - (3 * 0.5 = 1.5) = 3.5 -> rounds to 4');
});

test('scoreResponse: mustCiteSources subtracts 2 and reports the reason', () => {
  const rubric = { mustCiteSources: true };
  const result = scoreResponse('A response without any source marker.', rubric);
  assert.equal(result.breakdown.cited, false);
  assert.ok(result.breakdown.adjustments.some((a) => a.includes('mustCiteSources')));
  assert.ok(result.score <= 3);
});

test('scoreResponse: handles non-string response gracefully', () => {
  const rubric = { minLength: 10 };
  const result = scoreResponse(null, rubric);
  assert.equal(result.breakdown.length, 0);
  assert.ok(result.score >= 1);
});

test('scoreResponse: empty rubric returns 5', () => {
  const result = scoreResponse('A perfectly reasonable response.', {});
  assert.equal(result.score, 5);
});

test('scoreResponse: invalid regex in encourages does not throw', () => {
  const rubric = {
    encourages: [{ regex: '[invalid(', label: 'broken' }],
  };
  const result = scoreResponse('A response.', rubric);
  assert.equal(result.breakdown.encourageMatches[0].count, 0);
  assert.equal(result.score, 5);
});

test('internal helpers: clamp bounds correctly', () => {
  assert.equal(_internal.clamp(5, 1, 5), 5);
  assert.equal(_internal.clamp(0, 1, 5), 1);
  assert.equal(_internal.clamp(3, 1, 5), 3);
});

test('internal helpers: findSourceCitation accepts varied formatting', () => {
  assert.equal(_internal.findSourceCitation('See [Source: Title]'), true);
  assert.equal(_internal.findSourceCitation('see [source: another]'), true);
  assert.equal(_internal.findSourceCitation('no citation here'), false);
});

test('internal helpers: groupContainsAny requires ALL strings in a group to match', () => {
  assert.equal(_internal.groupContainsAny('foo bar baz', [['foo', 'baz']]), true);
  assert.equal(_internal.groupContainsAny('foo bar', [['foo', 'baz']]), false);
  assert.equal(_internal.groupContainsAny('foo bar', [['foo'], ['baz']]), true, 'any group can match');
  assert.equal(_internal.groupContainsAny('anything', []), true, 'empty groups always pass');
});