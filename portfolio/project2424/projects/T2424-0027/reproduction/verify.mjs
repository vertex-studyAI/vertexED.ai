import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const manifest = JSON.parse(await readFile(resolve(root, 'evidence/manifest.json'), 'utf8'));
const rawBytes = await readFile(resolve(root, manifest.rawResult));
const rawSha256 = createHash('sha256').update(rawBytes).digest('hex');
if (rawSha256 !== manifest.rawResultSha256) {
  throw new Error(`raw result hash mismatch: expected ${manifest.rawResultSha256}, got ${rawSha256}`);
}
const retained = JSON.parse(rawBytes.toString('utf8'));

// Independent reconstruction: this verifier intentionally does not import src/core.mjs.
const concepts = ['motion', 'energy', 'probability', 'growth'];
const languages = ['en', 'es', 'fr'];
const samplesPerCell = 6;
const conceptStrength = 3;
const languageStrength = 2;
const noiseScale = 0.12;
const dimension = concepts.length + languages.length;

function deterministicNoise(conceptIndex, sampleIndex, dimensionIndex) {
  const phase = (conceptIndex + 1) * 17 + (sampleIndex + 1) * 31 + (dimensionIndex + 1) * 13;
  return noiseScale * (Math.sin(phase * 0.73) + 0.5 * Math.cos(phase * 1.17));
}

function generateRecords() {
  const records = [];
  for (let conceptIndex = 0; conceptIndex < concepts.length; conceptIndex += 1) {
    for (let languageIndex = 0; languageIndex < languages.length; languageIndex += 1) {
      for (let sampleIndex = 0; sampleIndex < samplesPerCell; sampleIndex += 1) {
        const vector = Array.from({ length: dimension }, (_, dimensionIndex) =>
          deterministicNoise(conceptIndex, sampleIndex, dimensionIndex));
        vector[conceptIndex] += conceptStrength;
        vector[concepts.length + languageIndex] += languageStrength;
        records.push({ concept: concepts[conceptIndex], language: languages[languageIndex], sampleIndex, vector });
      }
    }
  }
  return records;
}

function meanVector(vectors) {
  return Array.from({ length: vectors[0].length }, (_, index) =>
    vectors.reduce((sum, vector) => sum + vector[index], 0) / vectors.length);
}

function centroids(records, key) {
  const labels = [...new Set(records.map((record) => record[key]))].sort();
  return new Map(labels.map((label) => [label, meanVector(records.filter((record) => record[key] === label).map((record) => record.vector))]));
}

function squaredDistance(left, right) {
  return left.reduce((sum, value, index) => sum + (value - right[index]) ** 2, 0);
}

function split(records) {
  return {
    train: records.filter((record) => record.sampleIndex < samplesPerCell / 2),
    test: records.filter((record) => record.sampleIndex >= samplesPerCell / 2),
  };
}

function nearestCentroidAccuracy(records, key) {
  const { train, test } = split(records);
  const model = centroids(train, key);
  const labels = [...model.keys()].sort();
  let correct = 0;
  for (const record of test) {
    const prediction = labels
      .map((label) => ({ label, distance: squaredDistance(record.vector, model.get(label)) }))
      .sort((left, right) => left.distance - right.distance || left.label.localeCompare(right.label))[0].label;
    if (prediction === record[key]) correct += 1;
  }
  return correct / test.length;
}

function centerByLanguage(records) {
  const { train } = split(records);
  const languageMeans = centroids(train, 'language');
  return records.map((record) => ({
    ...record,
    vector: record.vector.map((value, index) => value - languageMeans.get(record.language)[index]),
  }));
}

function globallyCenter(records) {
  const { train } = split(records);
  const globalMean = meanVector(train.map((record) => record.vector));
  return records.map((record) => ({
    ...record,
    vector: record.vector.map((value, index) => value - globalMean[index]),
  }));
}

const records = generateRecords();
const rawConceptAccuracy = nearestCentroidAccuracy(records, 'concept');
const rawLanguageAccuracy = nearestCentroidAccuracy(records, 'language');
const centered = centerByLanguage(records);
const centeredConceptAccuracy = nearestCentroidAccuracy(centered, 'concept');
const centeredLanguageAccuracy = nearestCentroidAccuracy(centered, 'language');
const globalCenteredLanguageAccuracy = nearestCentroidAccuracy(globallyCenter(records), 'language');
const languageChance = 1 / languages.length;
const rawExcess = Math.max(0, rawLanguageAccuracy - languageChance);
const centeredExcess = Math.max(0, centeredLanguageAccuracy - languageChance);
const normalizedLanguageLeakageReduction = rawExcess > 0 ? 1 - centeredExcess / rawExcess : 0;

const metrics = {
  rawConceptAccuracy,
  rawLanguageAccuracy,
  centeredConceptAccuracy,
  centeredLanguageAccuracy,
  globalCenteredLanguageAccuracy,
  languageChance,
  normalizedLanguageLeakageReduction,
};
const gates = {
  rawConceptAccuracyAtLeast95Percent: rawConceptAccuracy >= 0.95,
  rawLanguageLeakageDetectableAtLeast95Percent: rawLanguageAccuracy >= 0.95,
  centeredConceptAccuracyWithin2PointsOfRaw: centeredConceptAccuracy >= rawConceptAccuracy - 0.02,
  normalizedLanguageLeakageReductionAtLeast90Percent: normalizedLanguageLeakageReduction >= 0.90,
  globalCenteringNegativeControlRetainsLanguageLeakage: globalCenteredLanguageAccuracy >= 0.95,
};
const verdict = Object.values(gates).every(Boolean)
  ? 'PASS_CONTROLLED_LANGUAGE_LEAKAGE_MECHANICS'
  : 'NEGATIVE_OR_INCONCLUSIVE_AGAINST_PREDECLARED_GATES';

function assertEqual(actual, expected, label) {
  if (actual !== expected) throw new Error(`${label} mismatch: expected ${expected}, got ${actual}`);
}
function assertNear(actual, expected, label, tolerance = 1e-12) {
  if (!Number.isFinite(actual) || !Number.isFinite(expected) || Math.abs(actual - expected) > tolerance) {
    throw new Error(`${label} mismatch: expected ${expected}, got ${actual}`);
  }
}

assertEqual(retained.project, 'T2424-0027', 'project identity');
assertEqual(retained.name, 'Sapir–Whorf Latent Tongue', 'project name');
assertEqual(manifest.claimStatus, 'CONTROLLED_SYNTHETIC_MECHANICS_PASS', 'manifest claim status');
assertEqual(manifest.certificationStatus, 'CERTIFICATION_PENDING', 'manifest certification status');
assertEqual(retained.verdict, verdict, 'retained verdict');
assertEqual(retained.protocol.records, records.length, 'record count');
assertEqual(retained.protocol.concepts, concepts.length, 'concept count');
assertEqual(retained.protocol.languages, languages.length, 'language count');
assertEqual(retained.protocol.trainSamplesPerConceptLanguage, samplesPerCell / 2, 'train samples per cell');

for (const [metric, expected] of Object.entries(retained.metrics)) assertNear(metrics[metric], expected, `metric ${metric}`);
for (const [gate, expected] of Object.entries(retained.gates)) assertEqual(gates[gate], expected, `gate ${gate}`);
if (!Object.values(retained.gates).every(Boolean)) throw new Error('retained PASS verdict is inconsistent with a failed gate');
if (retained.claimBoundary !== 'controlled synthetic latent diagnostic only; no evidence for linguistic relativity, real multilingual model behavior, semantic universals, or language-agnostic representation learning') {
  throw new Error('retained claim boundary drifted beyond the frozen implementation boundary');
}

console.log(JSON.stringify({
  project: retained.project,
  rawResultSha256: rawSha256,
  evidenceConsistency: 'PASS',
  verifierDependency: 'independent-no-core-import',
  centeredLanguageAccuracy,
  normalizedLanguageLeakageReduction,
  verdict,
  certificationStatus: manifest.certificationStatus,
}, null, 2));
