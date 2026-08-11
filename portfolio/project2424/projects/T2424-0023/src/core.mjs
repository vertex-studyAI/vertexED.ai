function finiteNumber(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new TypeError(`${label} must be finite`);
  return number;
}

function probability(value, label) {
  const number = finiteNumber(value, label);
  if (number < 0 || number > 1) throw new RangeError(`${label} must be in [0, 1]`);
  return number;
}

function nonEmptyString(value, label) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new TypeError(`${label} must be a non-empty string`);
  }
  return value.trim();
}

export function validateResponses(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new TypeError('rows must be a non-empty array');
  }

  const seen = new Set();
  const normalized = rows.map((row, index) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) {
      throw new TypeError(`rows[${index}] must be an object`);
    }

    const conceptId = nonEmptyString(row.conceptId, `rows[${index}].conceptId`);
    const language = nonEmptyString(row.language, `rows[${index}].language`).toLowerCase();
    if (typeof row.correct !== 'boolean') {
      throw new TypeError(`rows[${index}].correct must be boolean`);
    }
    const confidence = probability(row.confidence, `rows[${index}].confidence`);
    const abstained = row.abstained === undefined ? false : row.abstained;
    if (typeof abstained !== 'boolean') {
      throw new TypeError(`rows[${index}].abstained must be boolean`);
    }
    if (abstained && row.correct) {
      throw new RangeError(`rows[${index}] cannot be both abstained and correct`);
    }

    const key = `${conceptId}::${language}`;
    if (seen.has(key)) throw new RangeError(`duplicate concept/language pair: ${key}`);
    seen.add(key);

    return { conceptId, language, correct: row.correct, confidence, abstained };
  });

  const languages = new Set(normalized.map((row) => row.language));
  if (languages.size < 2) throw new RangeError('at least two languages are required');

  const concepts = new Map();
  for (const row of normalized) {
    if (!concepts.has(row.conceptId)) concepts.set(row.conceptId, new Set());
    concepts.get(row.conceptId).add(row.language);
  }
  for (const [conceptId, conceptLanguages] of concepts) {
    if (conceptLanguages.size < 2) {
      throw new RangeError(`concept ${conceptId} must have responses in at least two languages`);
    }
  }

  return normalized;
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function summarizeLanguages(rows, { highConfidence = 0.8 } = {}) {
  const threshold = probability(highConfidence, 'highConfidence');
  const normalized = validateResponses(rows);
  const groups = new Map();
  for (const row of normalized) {
    if (!groups.has(row.language)) groups.set(row.language, []);
    groups.get(row.language).push(row);
  }

  return [...groups.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([language, items]) => {
      const accuracy = mean(items.map((item) => Number(item.correct)));
      const meanConfidence = mean(items.map((item) => item.confidence));
      const brier = mean(items.map((item) => (item.confidence - Number(item.correct)) ** 2));
      const abstentionRate = mean(items.map((item) => Number(item.abstained)));
      const overconfidentWrong = items.filter(
        (item) => !item.correct && !item.abstained && item.confidence >= threshold,
      ).length;
      return {
        language,
        count: items.length,
        accuracy,
        meanConfidence,
        brier,
        calibrationGap: Math.abs(meanConfidence - accuracy),
        abstentionRate,
        overconfidentWrong,
      };
    });
}

export function findCrossLanguageBlindSpots(rows, { highConfidence = 0.8 } = {}) {
  const threshold = probability(highConfidence, 'highConfidence');
  const normalized = validateResponses(rows);
  const concepts = new Map();
  for (const row of normalized) {
    if (!concepts.has(row.conceptId)) concepts.set(row.conceptId, []);
    concepts.get(row.conceptId).push(row);
  }

  const blindSpots = [];
  const mismatchConcepts = [];

  for (const [conceptId, items] of concepts) {
    const hasCorrect = items.some((item) => item.correct);
    const hasWrong = items.some((item) => !item.correct && !item.abstained);
    if (hasCorrect && hasWrong) mismatchConcepts.push(conceptId);

    const highConfidenceCorrect = items.filter(
      (item) => item.correct && !item.abstained && item.confidence >= threshold,
    );
    const highConfidenceWrong = items.filter(
      (item) => !item.correct && !item.abstained && item.confidence >= threshold,
    );

    if (highConfidenceCorrect.length > 0 && highConfidenceWrong.length > 0) {
      blindSpots.push({
        conceptId,
        wrongLanguages: highConfidenceWrong.map((item) => item.language).sort(),
        referenceLanguages: highConfidenceCorrect.map((item) => item.language).sort(),
        maxWrongConfidence: Math.max(...highConfidenceWrong.map((item) => item.confidence)),
        maxCorrectConfidence: Math.max(...highConfidenceCorrect.map((item) => item.confidence)),
        confidenceSpread:
          Math.max(...items.map((item) => item.confidence)) -
          Math.min(...items.map((item) => item.confidence)),
      });
    }
  }

  return {
    mismatchConcepts: mismatchConcepts.sort(),
    blindSpots: blindSpots.sort((left, right) => left.conceptId.localeCompare(right.conceptId)),
  };
}

export function evaluateBlindSpotBenchmark(rows, { highConfidence = 0.8 } = {}) {
  const normalized = validateResponses(rows);
  const conceptIds = [...new Set(normalized.map((row) => row.conceptId))].sort();
  const languages = [...new Set(normalized.map((row) => row.language))].sort();
  const languageSummaries = summarizeLanguages(normalized, { highConfidence });
  const crossLanguage = findCrossLanguageBlindSpots(normalized, { highConfidence });

  return {
    concepts: conceptIds.length,
    languages,
    responses: normalized.length,
    highConfidence,
    languageSummaries,
    mismatchConcepts: crossLanguage.mismatchConcepts,
    mismatchRate: crossLanguage.mismatchConcepts.length / conceptIds.length,
    blindSpots: crossLanguage.blindSpots,
    blindSpotRate: crossLanguage.blindSpots.length / conceptIds.length,
    totalOverconfidentWrong: languageSummaries.reduce(
      (sum, language) => sum + language.overconfidentWrong,
      0,
    ),
  };
}

export function buildSyntheticBlindSpotFixture() {
  return [
    { conceptId: 'c1', language: 'en', correct: true, confidence: 0.95 },
    { conceptId: 'c1', language: 'es', correct: true, confidence: 0.94 },
    { conceptId: 'c1', language: 'fr', correct: true, confidence: 0.93 },

    { conceptId: 'c2', language: 'en', correct: true, confidence: 0.90 },
    { conceptId: 'c2', language: 'es', correct: false, confidence: 0.92 },
    { conceptId: 'c2', language: 'fr', correct: true, confidence: 0.88 },

    { conceptId: 'c3', language: 'en', correct: false, confidence: 0.86 },
    { conceptId: 'c3', language: 'es', correct: true, confidence: 0.91 },
    { conceptId: 'c3', language: 'fr', correct: true, confidence: 0.90 },

    { conceptId: 'c4', language: 'en', correct: false, confidence: 0.25, abstained: true },
    { conceptId: 'c4', language: 'es', correct: false, confidence: 0.20, abstained: true },
    { conceptId: 'c4', language: 'fr', correct: false, confidence: 0.22, abstained: true },

    { conceptId: 'c5', language: 'en', correct: true, confidence: 0.90 },
    { conceptId: 'c5', language: 'es', correct: true, confidence: 0.89 },
    { conceptId: 'c5', language: 'fr', correct: true, confidence: 0.90 },

    { conceptId: 'c6', language: 'en', correct: true, confidence: 0.88 },
    { conceptId: 'c6', language: 'es', correct: false, confidence: 0.65 },
    { conceptId: 'c6', language: 'fr', correct: true, confidence: 0.90 },
  ];
}
