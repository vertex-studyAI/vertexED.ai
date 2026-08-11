function requiredText(value, label) {
  const text = String(value ?? '').trim();
  if (!text) throw new TypeError(`${label} is required`);
  return text;
}

function unitInterval(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > 1) {
    throw new RangeError(`${label} must be finite and in [0, 1]`);
  }
  return number;
}

function normalizedAnswer(value) {
  return String(value ?? '').trim().toLocaleLowerCase('en-US').replace(/\s+/g, ' ');
}

export function validateRecord(record, index = 0) {
  if (!record || typeof record !== 'object') throw new TypeError(`records[${index}] must be an object`);
  const itemId = requiredText(record.itemId, `records[${index}].itemId`);
  const conceptId = requiredText(record.conceptId, `records[${index}].conceptId`);
  const language = requiredText(record.language, `records[${index}].language`).toLowerCase();
  const expected = requiredText(record.expected, `records[${index}].expected`);
  const abstained = record.abstained === true;
  const predicted = abstained ? String(record.predicted ?? '').trim() : requiredText(record.predicted, `records[${index}].predicted`);
  const confidence = unitInterval(record.confidence, `records[${index}].confidence`);
  return { itemId, conceptId, language, expected, predicted, confidence, abstained };
}

export function validateRecords(records) {
  if (!Array.isArray(records) || records.length === 0) throw new TypeError('records must be a non-empty array');
  const normalized = records.map(validateRecord);
  const itemIds = new Set();
  const conceptLanguages = new Set();
  for (const record of normalized) {
    if (itemIds.has(record.itemId)) throw new RangeError(`duplicate itemId: ${record.itemId}`);
    itemIds.add(record.itemId);
    const key = `${record.conceptId}\u0000${record.language}`;
    if (conceptLanguages.has(key)) throw new RangeError(`duplicate concept/language pair: ${record.conceptId}/${record.language}`);
    conceptLanguages.add(key);
  }
  return normalized;
}

export function classifyRecord(recordInput, { blindSpotConfidence = 0.8 } = {}) {
  const record = validateRecord(recordInput);
  const threshold = unitInterval(blindSpotConfidence, 'blindSpotConfidence');
  const correct = !record.abstained && normalizedAnswer(record.predicted) === normalizedAnswer(record.expected);
  const highConfidenceWrong = !record.abstained && !correct && record.confidence >= threshold;
  return { ...record, correct, highConfidenceWrong };
}

function summarize(classified) {
  const total = classified.length;
  const answered = classified.filter((record) => !record.abstained).length;
  const correct = classified.filter((record) => record.correct).length;
  const highConfidenceWrong = classified.filter((record) => record.highConfidenceWrong).length;
  return {
    total,
    answered,
    correct,
    abstained: total - answered,
    coverage: answered / total,
    accuracy: correct / total,
    selectiveAccuracy: answered === 0 ? null : correct / answered,
    highConfidenceWrong,
    blindSpotRate: highConfidenceWrong / total,
  };
}

export function languageMetrics(records, options = {}) {
  const normalized = validateRecords(records);
  const groups = new Map();
  for (const record of normalized) {
    const classified = classifyRecord(record, options);
    if (!groups.has(record.language)) groups.set(record.language, []);
    groups.get(record.language).push(classified);
  }
  return [...groups.entries()]
    .map(([language, group]) => ({ language, ...summarize(group) }))
    .sort((left, right) => right.blindSpotRate - left.blindSpotRate || left.language.localeCompare(right.language));
}

export function conceptBlindSpots(records, options = {}) {
  const normalized = validateRecords(records);
  const groups = new Map();
  for (const record of normalized) {
    const classified = classifyRecord(record, options);
    if (!groups.has(record.conceptId)) groups.set(record.conceptId, []);
    groups.get(record.conceptId).push(classified);
  }
  return [...groups.entries()]
    .map(([conceptId, group]) => {
      const correctLanguages = group.filter((record) => record.correct).map((record) => record.language).sort();
      const blindSpotLanguages = group.filter((record) => record.highConfidenceWrong).map((record) => record.language).sort();
      const abstainedLanguages = group.filter((record) => record.abstained).map((record) => record.language).sort();
      return {
        conceptId,
        languages: group.map((record) => record.language).sort(),
        correctLanguages,
        blindSpotLanguages,
        abstainedLanguages,
        crossLanguageBlindSpot: correctLanguages.length > 0 && blindSpotLanguages.length > 0,
      };
    })
    .sort((left, right) => Number(right.crossLanguageBlindSpot) - Number(left.crossLanguageBlindSpot) || left.conceptId.localeCompare(right.conceptId));
}

export function compareLanguages(records, languageA, languageB, options = {}) {
  const normalized = validateRecords(records);
  const a = requiredText(languageA, 'languageA').toLowerCase();
  const b = requiredText(languageB, 'languageB').toLowerCase();
  if (a === b) throw new RangeError('languageA and languageB must differ');
  const byConcept = new Map();
  for (const record of normalized) {
    if (record.language !== a && record.language !== b) continue;
    if (!byConcept.has(record.conceptId)) byConcept.set(record.conceptId, {});
    byConcept.get(record.conceptId)[record.language] = classifyRecord(record, options);
  }
  const pairs = [...byConcept.entries()].filter(([, pair]) => pair[a] && pair[b]);
  if (pairs.length === 0) return { languageA: a, languageB: b, matchedConcepts: 0, accuracyA: null, accuracyB: null, accuracyGap: null, blindSpotsAOnly: 0, blindSpotsBOnly: 0 };
  let correctA = 0;
  let correctB = 0;
  let blindSpotsAOnly = 0;
  let blindSpotsBOnly = 0;
  for (const [, pair] of pairs) {
    if (pair[a].correct) correctA += 1;
    if (pair[b].correct) correctB += 1;
    if (pair[a].highConfidenceWrong && pair[b].correct) blindSpotsAOnly += 1;
    if (pair[b].highConfidenceWrong && pair[a].correct) blindSpotsBOnly += 1;
  }
  const accuracyA = correctA / pairs.length;
  const accuracyB = correctB / pairs.length;
  return { languageA: a, languageB: b, matchedConcepts: pairs.length, accuracyA, accuracyB, accuracyGap: accuracyA - accuracyB, blindSpotsAOnly, blindSpotsBOnly };
}

export function buildBenchmarkReport(records, options = {}) {
  const normalized = validateRecords(records);
  const classified = normalized.map((record) => classifyRecord(record, options));
  const languages = languageMetrics(normalized, options);
  const concepts = conceptBlindSpots(normalized, options);
  return {
    overall: summarize(classified),
    languages,
    concepts,
    crossLanguageBlindSpotCount: concepts.filter((entry) => entry.crossLanguageBlindSpot).length,
    claimBoundary: 'deterministic evaluation of supplied aligned records only; no translation-quality, semantic-equivalence, or real-model capability claim',
  };
}
