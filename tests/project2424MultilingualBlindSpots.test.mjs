import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildBenchmarkReport,
  classifyRecord,
  compareLanguages,
  conceptBlindSpots,
  languageMetrics,
  validateRecords,
} from '../portfolio/project2424/projects/T2424-0023/src/core.mjs';

const records = [
  { itemId: 'c1-en', conceptId: 'c1', language: 'en', expected: 'yes', predicted: 'yes', confidence: 0.95 },
  { itemId: 'c1-es', conceptId: 'c1', language: 'es', expected: 'yes', predicted: 'no', confidence: 0.93 },
  { itemId: 'c1-fr', conceptId: 'c1', language: 'fr', expected: 'yes', predicted: 'yes', confidence: 0.88 },
  { itemId: 'c2-en', conceptId: 'c2', language: 'en', expected: 'blue', predicted: 'blue', confidence: 0.91 },
  { itemId: 'c2-es', conceptId: 'c2', language: 'es', expected: 'blue', predicted: 'green', confidence: 0.52 },
  { itemId: 'c2-fr', conceptId: 'c2', language: 'fr', expected: 'blue', predicted: '', confidence: 0.2, abstained: true },
  { itemId: 'c3-en', conceptId: 'c3', language: 'en', expected: '4', predicted: '4', confidence: 0.99 },
  { itemId: 'c3-es', conceptId: 'c3', language: 'es', expected: '4', predicted: '4', confidence: 0.97 },
  { itemId: 'c3-fr', conceptId: 'c3', language: 'fr', expected: '4', predicted: '4', confidence: 0.96 },
];

test('high-confidence wrong answers are blind spots while low-confidence errors are not', () => {
  assert.equal(classifyRecord(records[1]).highConfidenceWrong, true);
  assert.equal(classifyRecord(records[4]).highConfidenceWrong, false);
  assert.equal(classifyRecord(records[5]).highConfidenceWrong, false);
});

test('concept report identifies cross-language asymmetry only when another language is correct', () => {
  const concepts = conceptBlindSpots(records);
  const c1 = concepts.find((entry) => entry.conceptId === 'c1');
  const c2 = concepts.find((entry) => entry.conceptId === 'c2');
  assert.equal(c1.crossLanguageBlindSpot, true);
  assert.deepEqual(c1.blindSpotLanguages, ['es']);
  assert.equal(c2.crossLanguageBlindSpot, false);
});

test('language metrics separate coverage, selective accuracy, and blind-spot rate', () => {
  const metrics = Object.fromEntries(languageMetrics(records).map((entry) => [entry.language, entry]));
  assert.equal(metrics.en.selectiveAccuracy, 1);
  assert.equal(metrics.es.highConfidenceWrong, 1);
  assert.equal(metrics.fr.coverage, 2 / 3);
  assert.equal(metrics.fr.selectiveAccuracy, 1);
});

test('paired comparison reports directional blind-spot asymmetry', () => {
  const pair = compareLanguages(records, 'en', 'es');
  assert.equal(pair.matchedConcepts, 3);
  assert.equal(pair.blindSpotsAOnly, 0);
  assert.equal(pair.blindSpotsBOnly, 1);
  assert.ok(pair.accuracyGap > 0);
});

test('benchmark report preserves the bounded evaluation claim', () => {
  const report = buildBenchmarkReport(records);
  assert.equal(report.crossLanguageBlindSpotCount, 1);
  assert.equal(report.overall.total, 9);
  assert.match(report.claimBoundary, /supplied aligned records only/);
});

test('duplicate alignment keys and malformed confidences fail closed', () => {
  assert.throws(() => validateRecords([...records, { ...records[0], itemId: 'duplicate-key' }]), /duplicate concept\/language pair/);
  assert.throws(() => classifyRecord({ ...records[0], confidence: 1.1 }), /\[0, 1\]/);
  assert.throws(() => compareLanguages(records, 'en', 'en'), /must differ/);
});
