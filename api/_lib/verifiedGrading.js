import { createHash } from 'node:crypto';

export const GRADING_CONTRACT_VERSION = 'vertexed.grading.v1';
export const HUMAN_REVIEW_CONFIDENCE_THRESHOLD = 0.7;

const ERROR_TAXONOMY = Object.freeze({
  CONCEPT_GAP: { label: 'Concept gap', remediation: 'review-concept' },
  EVIDENCE_GAP: { label: 'Missing evidence', remediation: 'evidence-drill' },
  REASONING_GAP: { label: 'Reasoning gap', remediation: 'worked-example' },
  COMMAND_TERM: { label: 'Command-term mismatch', remediation: 'command-term-practice' },
  CALCULATION: { label: 'Calculation error', remediation: 'calculation-retry' },
  COMMUNICATION: { label: 'Communication issue', remediation: 'structured-rewrite' },
  INCOMPLETE: { label: 'Incomplete response', remediation: 'targeted-retry' },
});

function boundedNumber(value, min, max, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
}

function cleanText(value, limit = 500) {
  return typeof value === 'string' ? value.trim().slice(0, limit) : '';
}

function stableId(value) {
  return createHash('sha256').update(String(value)).digest('hex').slice(0, 16);
}

function objectiveIds(question) {
  const values = Array.isArray(question?.objectiveIds)
    ? question.objectiveIds
    : question?.objectiveId
      ? [question.objectiveId]
      : [];
  return [...new Set(values.map((value) => cleanText(value, 80)).filter(Boolean))].slice(0, 12);
}

export function normalizeEvidenceSpans(answer, requestedQuotes) {
  const source = cleanText(answer, 20_000);
  if (!source || !Array.isArray(requestedQuotes)) return [];

  const spans = [];
  const seen = new Set();
  for (const candidate of requestedQuotes) {
    const quote = cleanText(typeof candidate === 'string' ? candidate : candidate?.quote, 500);
    if (!quote || seen.has(quote)) continue;
    const start = source.indexOf(quote);
    if (start < 0) continue;
    seen.add(quote);
    spans.push({ quote, start, end: start + quote.length });
  }
  return spans.slice(0, 12);
}

function normalizeErrors(rawCodes, answer) {
  const codes = Array.isArray(rawCodes)
    ? rawCodes.map((code) => String(code).trim().toUpperCase()).filter((code) => ERROR_TAXONOMY[code])
    : [];
  if (!cleanText(answer, 20_000) && !codes.includes('INCOMPLETE')) codes.unshift('INCOMPLETE');
  return [...new Set(codes)].slice(0, 5).map((code) => ({ code, ...ERROR_TAXONOMY[code] }));
}

function normalizeCriteria(rawGrade, answer, maxScore) {
  const source = Array.isArray(rawGrade?.criteria) && rawGrade.criteria.length
    ? rawGrade.criteria
    : [{
        id: 'overall',
        label: 'Overall response',
        score: rawGrade?.score,
        maxScore: rawGrade?.maxScore ?? maxScore,
        evidenceQuotes: rawGrade?.evidenceQuotes,
        feedback: rawGrade?.feedback,
      }];

  return source.slice(0, 12).map((criterion, index) => {
    const criterionMax = boundedNumber(criterion?.maxScore, 1, maxScore, maxScore);
    const score = boundedNumber(criterion?.score, 0, criterionMax, 0);
    const evidence = normalizeEvidenceSpans(answer, criterion?.evidenceQuotes);
    return {
      id: cleanText(criterion?.id, 80) || `criterion-${index + 1}`,
      label: cleanText(criterion?.label, 160) || `Criterion ${index + 1}`,
      score,
      maxScore: criterionMax,
      evidence,
      feedback: cleanText(criterion?.feedback, 1_000),
      evidenceVerified: score === 0 || evidence.length > 0,
    };
  });
}

export function buildCoverageMap(questions, gradeAudits) {
  const coverage = new Map();
  for (const question of questions) {
    const grade = gradeAudits.find((item) => item.id === String(question?.id));
    for (const objectiveId of objectiveIds(question)) {
      const current = coverage.get(objectiveId) ?? {
        objectiveId,
        attempted: 0,
        verified: 0,
        score: 0,
        maxScore: 0,
      };
      current.attempted += 1;
      if (grade && !grade.humanReviewRequired) {
        current.verified += 1;
        current.score += grade.score;
        current.maxScore += grade.maxScore;
      }
      coverage.set(objectiveId, current);
    }
  }

  return [...coverage.values()].map((item) => ({
    ...item,
    masteryPercent: item.maxScore > 0 ? Math.round((item.score / item.maxScore) * 100) : null,
  }));
}

export function normalizeGradeAudits({ questions = [], userAnswers = {}, rawGrades = [], model = 'unknown' }) {
  const rawById = new Map(rawGrades.map((grade) => [String(grade?.id), grade]));
  const audits = questions.map((question) => {
    const id = String(question?.id ?? '');
    const answer = cleanText(userAnswers?.[id], 20_000);
    const raw = rawById.get(id) ?? {};
    const maxScore = boundedNumber(raw?.maxScore ?? question?.maxScore, 1, 100, 5);
    const criteria = normalizeCriteria(raw, answer, maxScore);
    const computedScore = criteria.reduce((sum, criterion) => sum + criterion.score, 0);
    const computedMax = criteria.reduce((sum, criterion) => sum + criterion.maxScore, 0);
    const score = boundedNumber(raw?.score, 0, maxScore, Math.min(maxScore, computedScore));
    const confidence = boundedNumber(raw?.confidence, 0, 1, 0);
    const evidenceVerified = criteria.every((criterion) => criterion.evidenceVerified);
    const errors = normalizeErrors(raw?.errorCodes, answer);
    const humanReviewRequired = !answer || !evidenceVerified || confidence < HUMAN_REVIEW_CONFIDENCE_THRESHOLD;

    return {
      contractVersion: GRADING_CONTRACT_VERSION,
      auditId: stableId(`${id}:${answer}:${JSON.stringify(raw)}`),
      id,
      score,
      maxScore,
      scoreStatus: humanReviewRequired ? 'PROVISIONAL' : 'VERIFIED',
      confidence,
      humanReviewRequired,
      escalationReason: !answer
        ? 'No student answer was supplied.'
        : !evidenceVerified
          ? 'Awarded credit is not backed by an exact span from the student answer.'
          : confidence < HUMAN_REVIEW_CONFIDENCE_THRESHOLD
            ? 'Model confidence is below the human-review threshold.'
            : null,
      feedback: cleanText(raw?.feedback, 2_000) || 'No model feedback was returned.',
      includes: cleanText(raw?.includes ?? raw?.whatIncluded, 1_000),
      criteria,
      errors,
      remediation: errors.map((error) => error.remediation),
      objectiveIds: objectiveIds(question),
      model: cleanText(model, 160) || 'unknown',
      computedCriterionScore: computedScore,
      computedCriterionMaxScore: computedMax,
    };
  });

  return { audits, coverage: buildCoverageMap(questions, audits) };
}

function noteSegments(notes) {
  return cleanText(notes, 12_000)
    .split(/(?<=[.!?])\s+|\n+/)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length >= 20)
    .slice(0, 8);
}

export function buildDeterministicQuizFallback({ notes, board = 'Generic', subjects = [] }) {
  const segments = noteSegments(notes);
  if (!segments.length) return [];
  const subject = cleanText(subjects?.[0], 80) || 'General';
  const provenance = {
    source: 'learner-notes',
    sourceDigest: createHash('sha256').update(cleanText(notes, 12_000)).digest('hex'),
    generator: 'deterministic-retrieval-fallback',
    generatorVersion: '1.0.0',
    board: cleanText(board, 80) || 'Generic',
    subject,
  };

  return segments.slice(0, 3).map((segment, index) => ({
    id: `fallback-${stableId(`${index}:${segment}`)}`,
    type: 'frq',
    prompt: `Explain this idea from your notes in your own words, then give one implication: “${segment.slice(0, 220)}”`,
    answer: segment,
    maxScore: 4,
    objectiveIds: [`${subject.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'general'}:retrieval:${index + 1}`],
    criteria: [
      { id: 'accuracy', label: 'Accurate retrieval', maxScore: 2 },
      { id: 'reasoning', label: 'Reasoned implication', maxScore: 2 },
    ],
    provenance,
  }));
}
