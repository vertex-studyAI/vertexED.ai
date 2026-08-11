import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildSyntheticBlindSpotFixture,
  evaluateBlindSpotBenchmark,
  findCrossLanguageBlindSpots,
  summarizeLanguages,
  validateResponses,
} from '../portfolio/project2424/projects/T2424-0023/src/core.mjs';

test('rejects duplicate concept/language pairs', () => {
  assert.throws(
    () =>
      validateResponses([
        { conceptId: 'x', language: 'en', correct: true, confidence: 0.8 },
        { conceptId: 'x', language: 'en', correct: false, confidence: 0.7 },
      ]),
    /duplicate concept\/language pair/,
  );
});

test('synthetic fixture isolates exactly two high-confidence multilingual blind spots', () => {
  const result = evaluateBlindSpotBenchmark(buildSyntheticBlindSpotFixture());
  assert.equal(result.concepts, 6);
  assert.deepEqual(result.languages, ['en', 'es', 'fr']);
  assert.deepEqual(result.mismatchConcepts, ['c2', 'c3', 'c6']);
  assert.deepEqual(
    result.blindSpots.map((item) => item.conceptId),
    ['c2', 'c3'],
  );
  assert.equal(result.blindSpotRate, 2 / 6);
  assert.equal(result.totalOverconfidentWrong, 2);
});

test('blind-spot language attribution is explicit', () => {
  const { blindSpots } = findCrossLanguageBlindSpots(buildSyntheticBlindSpotFixture());
  const c2 = blindSpots.find((item) => item.conceptId === 'c2');
  const c3 = blindSpots.find((item) => item.conceptId === 'c3');
  assert.deepEqual(c2.wrongLanguages, ['es']);
  assert.deepEqual(c2.referenceLanguages, ['en', 'fr']);
  assert.deepEqual(c3.wrongLanguages, ['en']);
  assert.deepEqual(c3.referenceLanguages, ['es', 'fr']);
});

test('raising the confidence threshold removes the synthetic unsafe cases', () => {
  const result = evaluateBlindSpotBenchmark(buildSyntheticBlindSpotFixture(), {
    highConfidence: 0.96,
  });
  assert.equal(result.blindSpots.length, 0);
  assert.equal(result.totalOverconfidentWrong, 0);
  assert.deepEqual(result.mismatchConcepts, ['c2', 'c3', 'c6']);
});

test('language summaries preserve expected accuracy ordering', () => {
  const summaries = summarizeLanguages(buildSyntheticBlindSpotFixture());
  const byLanguage = Object.fromEntries(summaries.map((item) => [item.language, item]));
  assert.equal(byLanguage.en.accuracy, 4 / 6);
  assert.equal(byLanguage.es.accuracy, 3 / 6);
  assert.equal(byLanguage.fr.accuracy, 5 / 6);
  assert.equal(byLanguage.en.overconfidentWrong, 1);
  assert.equal(byLanguage.es.overconfidentWrong, 1);
  assert.equal(byLanguage.fr.overconfidentWrong, 0);
});

test('evaluation is invariant to row ordering', () => {
  const fixture = buildSyntheticBlindSpotFixture();
  const forward = evaluateBlindSpotBenchmark(fixture);
  const reverse = evaluateBlindSpotBenchmark([...fixture].reverse());
  assert.deepEqual(reverse, forward);
});

test('low-confidence cross-language errors are mismatches but not unsafe blind spots', () => {
  const result = evaluateBlindSpotBenchmark(buildSyntheticBlindSpotFixture());
  assert.ok(result.mismatchConcepts.includes('c6'));
  assert.ok(!result.blindSpots.some((item) => item.conceptId === 'c6'));
});
