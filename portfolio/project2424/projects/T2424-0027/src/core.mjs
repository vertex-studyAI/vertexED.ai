function finiteNumber(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new TypeError(`${label} must be finite`);
  return number;
}

function positiveInteger(value, label) {
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) throw new RangeError(`${label} must be a positive integer`);
  return number;
}

function nonEmptyString(value, label) {
  const normalized = String(value ?? '').trim();
  if (!normalized) throw new TypeError(`${label} must be a non-empty string`);
  return normalized;
}

function validateLabelList(values, label) {
  if (!Array.isArray(values) || values.length < 2) throw new TypeError(`${label} must contain at least two labels`);
  const normalized = values.map((value, index) => nonEmptyString(value, `${label}[${index}]`));
  if (new Set(normalized).size !== normalized.length) throw new RangeError(`${label} must contain unique labels`);
  return normalized;
}

function validateVector(vector, expectedDimension, label) {
  if (!Array.isArray(vector) || vector.length !== expectedDimension) {
    throw new TypeError(`${label} must be a ${expectedDimension}-dimensional array`);
  }
  return vector.map((value, index) => finiteNumber(value, `${label}[${index}]`));
}

export function validateLatentRecords(records) {
  if (!Array.isArray(records) || records.length === 0) throw new TypeError('records must be a non-empty array');
  const dimension = Array.isArray(records[0]?.vector) ? records[0].vector.length : 0;
  if (dimension < 2) throw new TypeError('latent vectors must have at least two dimensions');
  const ids = new Set();
  return records.map((record, index) => {
    if (!record || typeof record !== 'object') throw new TypeError(`records[${index}] must be an object`);
    const id = nonEmptyString(record.id, `records[${index}].id`);
    if (ids.has(id)) throw new RangeError(`duplicate record id: ${id}`);
    ids.add(id);
    const sampleIndex = Number(record.sampleIndex);
    if (!Number.isInteger(sampleIndex) || sampleIndex < 0) {
      throw new RangeError(`records[${index}].sampleIndex must be a non-negative integer`);
    }
    return {
      id,
      concept: nonEmptyString(record.concept, `records[${index}].concept`),
      language: nonEmptyString(record.language, `records[${index}].language`),
      sampleIndex,
      vector: validateVector(record.vector, dimension, `records[${index}].vector`),
    };
  });
}

function deterministicNoise(conceptIndex, sampleIndex, dimensionIndex, scale) {
  const phase = (conceptIndex + 1) * 17 + (sampleIndex + 1) * 31 + (dimensionIndex + 1) * 13;
  return scale * (Math.sin(phase * 0.73) + 0.5 * Math.cos(phase * 1.17));
}

export function generateControlledLatents({
  concepts = ['motion', 'energy', 'probability', 'growth'],
  languages = ['en', 'es', 'fr'],
  samplesPerCell = 6,
  conceptStrength = 3,
  languageStrength = 2,
  noiseScale = 0.12,
} = {}) {
  const conceptLabels = validateLabelList(concepts, 'concepts');
  const languageLabels = validateLabelList(languages, 'languages');
  const samples = positiveInteger(samplesPerCell, 'samplesPerCell');
  if (samples < 4 || samples % 2 !== 0) throw new RangeError('samplesPerCell must be an even integer >= 4');
  const conceptSignal = finiteNumber(conceptStrength, 'conceptStrength');
  const languageSignal = finiteNumber(languageStrength, 'languageStrength');
  const noise = finiteNumber(noiseScale, 'noiseScale');
  if (conceptSignal <= 0 || languageSignal <= 0 || noise < 0) {
    throw new RangeError('conceptStrength and languageStrength must be > 0; noiseScale must be >= 0');
  }

  const dimension = conceptLabels.length + languageLabels.length;
  const records = [];
  for (let conceptIndex = 0; conceptIndex < conceptLabels.length; conceptIndex += 1) {
    for (let languageIndex = 0; languageIndex < languageLabels.length; languageIndex += 1) {
      for (let sampleIndex = 0; sampleIndex < samples; sampleIndex += 1) {
        const vector = Array.from({ length: dimension }, (_, dimensionIndex) =>
          deterministicNoise(conceptIndex, sampleIndex, dimensionIndex, noise));
        vector[conceptIndex] += conceptSignal;
        vector[conceptLabels.length + languageIndex] += languageSignal;
        records.push({
          id: `c${conceptIndex}-l${languageIndex}-s${sampleIndex}`,
          concept: conceptLabels[conceptIndex],
          language: languageLabels[languageIndex],
          sampleIndex,
          vector,
        });
      }
    }
  }
  return validateLatentRecords(records);
}

function meanVector(vectors) {
  if (!Array.isArray(vectors) || vectors.length === 0) throw new TypeError('vectors must be non-empty');
  const dimension = vectors[0].length;
  const sums = Array(dimension).fill(0);
  for (const vector of vectors) {
    validateVector(vector, dimension, 'vector');
    for (let index = 0; index < dimension; index += 1) sums[index] += vector[index];
  }
  return sums.map((sum) => sum / vectors.length);
}

function subtract(left, right) {
  return left.map((value, index) => value - right[index]);
}

function squaredDistance(left, right) {
  return left.reduce((sum, value, index) => sum + (value - right[index]) ** 2, 0);
}

function splitRecords(records) {
  const clean = validateLatentRecords(records);
  const maxSample = Math.max(...clean.map((record) => record.sampleIndex));
  const sampleCount = maxSample + 1;
  if (sampleCount < 4 || sampleCount % 2 !== 0) throw new RangeError('records require an even number of sample indices >= 4');
  const split = sampleCount / 2;
  return {
    train: clean.filter((record) => record.sampleIndex < split),
    test: clean.filter((record) => record.sampleIndex >= split),
    sampleCount,
  };
}

function centroids(records, labelKey) {
  const groups = new Map();
  for (const record of records) {
    const label = record[labelKey];
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label).push(record.vector);
  }
  return new Map(
    [...groups.entries()].map(([label, vectors]) => [label, meanVector(vectors)]),
  );
}

export function nearestCentroidAccuracy(records, labelKey) {
  if (labelKey !== 'concept' && labelKey !== 'language') throw new TypeError('labelKey must be concept or language');
  const { train, test } = splitRecords(records);
  const model = centroids(train, labelKey);
  const orderedLabels = [...model.keys()].sort();
  let correct = 0;
  for (const record of test) {
    const prediction = orderedLabels
      .map((label) => ({ label, distance: squaredDistance(record.vector, model.get(label)) }))
      .sort((left, right) => left.distance - right.distance || left.label.localeCompare(right.label))[0].label;
    if (prediction === record[labelKey]) correct += 1;
  }
  return correct / test.length;
}

export function centerByLanguage(records) {
  const clean = validateLatentRecords(records);
  const { train } = splitRecords(clean);
  const languageMeans = centroids(train, 'language');
  return clean.map((record) => ({
    ...record,
    vector: subtract(record.vector, languageMeans.get(record.language)),
  }));
}

export function globallyCenter(records) {
  const clean = validateLatentRecords(records);
  const { train } = splitRecords(clean);
  const globalMean = meanVector(train.map((record) => record.vector));
  return clean.map((record) => ({ ...record, vector: subtract(record.vector, globalMean) }));
}

export function runLatentLanguageAudit(options = {}) {
  const records = generateControlledLatents(options);
  const languages = [...new Set(records.map((record) => record.language))].sort();
  const concepts = [...new Set(records.map((record) => record.concept))].sort();
  const { sampleCount } = splitRecords(records);
  const rawConceptAccuracy = nearestCentroidAccuracy(records, 'concept');
  const rawLanguageAccuracy = nearestCentroidAccuracy(records, 'language');
  const languageCentered = centerByLanguage(records);
  const centeredConceptAccuracy = nearestCentroidAccuracy(languageCentered, 'concept');
  const centeredLanguageAccuracy = nearestCentroidAccuracy(languageCentered, 'language');
  const globalCenteredLanguageAccuracy = nearestCentroidAccuracy(globallyCenter(records), 'language');
  const languageChance = 1 / languages.length;
  const rawExcess = Math.max(0, rawLanguageAccuracy - languageChance);
  const centeredExcess = Math.max(0, centeredLanguageAccuracy - languageChance);
  const normalizedLanguageLeakageReduction = rawExcess > 0 ? 1 - centeredExcess / rawExcess : 0;

  const gates = {
    rawConceptAccuracyAtLeast95Percent: rawConceptAccuracy >= 0.95,
    rawLanguageLeakageDetectableAtLeast95Percent: rawLanguageAccuracy >= 0.95,
    centeredConceptAccuracyWithin2PointsOfRaw: centeredConceptAccuracy >= rawConceptAccuracy - 0.02,
    normalizedLanguageLeakageReductionAtLeast90Percent: normalizedLanguageLeakageReduction >= 0.90,
    globalCenteringNegativeControlRetainsLanguageLeakage: globalCenteredLanguageAccuracy >= 0.95,
  };

  return {
    project: 'T2424-0027',
    name: 'Sapir–Whorf Latent Tongue',
    protocol: {
      records: records.length,
      concepts: concepts.length,
      languages: languages.length,
      trainSamplesPerConceptLanguage: sampleCount / 2,
      transform: 'subtract training-set language centroid from each record of that language',
      baseline: 'raw latent vectors',
      negativeControl: 'subtract one global training centroid',
    },
    metrics: {
      rawConceptAccuracy,
      rawLanguageAccuracy,
      centeredConceptAccuracy,
      centeredLanguageAccuracy,
      globalCenteredLanguageAccuracy,
      languageChance,
      normalizedLanguageLeakageReduction,
    },
    gates,
    verdict: Object.values(gates).every(Boolean)
      ? 'PASS_CONTROLLED_LANGUAGE_LEAKAGE_MECHANICS'
      : 'NEGATIVE_OR_INCONCLUSIVE_AGAINST_PREDECLARED_GATES',
    claimBoundary: 'controlled synthetic latent diagnostic only; no evidence for linguistic relativity, real multilingual model behavior, semantic universals, or language-agnostic representation learning',
  };
}
