import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  centerByLanguage,
  generateControlledLatents,
  globallyCenter,
  nearestCentroidAccuracy,
  runLatentLanguageAudit,
  validateLatentRecords,
} from '../portfolio/project2424/projects/T2424-0027/src/core.mjs';

const projectRoot = new URL('../portfolio/project2424/projects/T2424-0027/', import.meta.url);

test('controlled generator is balanced across concepts, languages and train/test samples', () => {
  const records = generateControlledLatents();
  assert.equal(records.length, 72);
  assert.equal(new Set(records.map((record) => record.concept)).size, 4);
  assert.equal(new Set(records.map((record) => record.language)).size, 3);
  for (const concept of new Set(records.map((record) => record.concept))) {
    for (const language of new Set(records.map((record) => record.language))) {
      const cell = records.filter((record) => record.concept === concept && record.language === language);
      assert.deepEqual(cell.map((record) => record.sampleIndex), [0, 1, 2, 3, 4, 5]);
    }
  }
});

test('raw synthetic latents expose both concept signal and injected language leakage', () => {
  const records = generateControlledLatents();
  assert.equal(nearestCentroidAccuracy(records, 'concept'), 1);
  assert.equal(nearestCentroidAccuracy(records, 'language'), 1);
});

test('language centering removes excess language predictability while preserving concept signal', () => {
  const records = generateControlledLatents();
  const centered = centerByLanguage(records);
  assert.equal(nearestCentroidAccuracy(centered, 'concept'), 1);
  assert.ok(Math.abs(nearestCentroidAccuracy(centered, 'language') - 1 / 3) < 1e-12);
});

test('global centering negative control does not remove the injected language coordinates', () => {
  const records = generateControlledLatents();
  assert.equal(nearestCentroidAccuracy(globallyCenter(records), 'language'), 1);
});

test('frozen screen clears every predeclared mechanics gate without claim escalation', () => {
  const result = runLatentLanguageAudit();
  assert.equal(result.verdict, 'PASS_CONTROLLED_LANGUAGE_LEAKAGE_MECHANICS');
  assert.ok(Object.values(result.gates).every(Boolean));
  assert.equal(result.metrics.normalizedLanguageLeakageReduction, 1);
  assert.match(result.claimBoundary, /no evidence for linguistic relativity/);
});

test('retained raw evidence is hash-bound and matches recomputed metrics', async () => {
  const manifestBytes = await readFile(new URL('evidence/manifest.json', projectRoot));
  const manifest = JSON.parse(manifestBytes.toString('utf8'));
  const rawBytes = await readFile(new URL(manifest.rawResult, projectRoot));
  const sha = createHash('sha256').update(rawBytes).digest('hex');
  assert.equal(sha, manifest.rawResultSha256);

  const retained = JSON.parse(rawBytes.toString('utf8'));
  const recomputed = runLatentLanguageAudit();
  assert.deepEqual(recomputed.metrics, retained.metrics);
  assert.deepEqual(recomputed.gates, retained.gates);
  assert.equal(manifest.certificationStatus, 'CERTIFICATION_PENDING');
});

test('malformed records and invalid generator configuration fail closed', () => {
  assert.throws(() => validateLatentRecords([]), /non-empty array/);
  assert.throws(() => validateLatentRecords([
    { id: 'a', concept: 'x', language: 'en', sampleIndex: 0, vector: [1, 2] },
    { id: 'a', concept: 'y', language: 'es', sampleIndex: 1, vector: [2, 3] },
  ]), /duplicate record id/);
  assert.throws(() => generateControlledLatents({ samplesPerCell: 3 }), /even integer >= 4/);
  assert.throws(() => generateControlledLatents({ languages: ['en', 'en'] }), /unique labels/);
});
