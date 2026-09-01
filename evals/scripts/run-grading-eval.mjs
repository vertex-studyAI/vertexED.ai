#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';

import { normalizeGradeAudits } from '../../api/_lib/verifiedGrading.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const datasetPath = resolve(root, 'evals/grading/frozen-v2.json');
const thresholdsPath = resolve(root, 'evals/grading/thresholds-v2.json');
const implementationPath = resolve(root, 'api/_lib/verifiedGrading.js');
const outputPath = resolve(root, 'evals/results/grading-v2.json');

const digest = (value) => createHash('sha256').update(value).digest('hex');
const ratio = (numerator, denominator) => denominator ? numerator / denominator : 1;

export function evaluateGradingFixture(dataset, thresholds, { measuredAt = new Date().toISOString() } = {}) {
  const decisions = [];
  let requestedQuotes = 0;
  let acceptedQuotes = 0;
  let normalizationFailures = 0;
  const startedAt = performance.now();

  for (const fixture of dataset.cases) {
    const rawCriteria = Array.isArray(fixture.rawGrade?.criteria) ? fixture.rawGrade.criteria : [fixture.rawGrade];
    for (const criterion of rawCriteria) requestedQuotes += Array.isArray(criterion?.evidenceQuotes) ? criterion.evidenceQuotes.length : 0;

    let audits;
    try {
      ({ audits } = normalizeGradeAudits({
        questions: [fixture.question],
        userAnswers: { [fixture.question.id]: fixture.answer },
        rawGrades: [fixture.rawGrade],
        model: 'synthetic-fixture',
      }));
    } catch {
      normalizationFailures += 1;
      decisions.push({ id: fixture.id, normalizationFailed: true, correct: false });
      continue;
    }
    const audit = audits[0];
    acceptedQuotes += audit.criteria.reduce((sum, criterion) => sum + criterion.evidence.length, 0);
    const actualErrorCodes = audit.errors.map((error) => error.code).sort();
    const expectedErrorCodes = [...(fixture.expectedErrorCodes || [])].sort();
    decisions.push({
      id: fixture.id,
      expectedReview: fixture.expectedReview,
      actualReview: audit.humanReviewRequired,
      correct: audit.humanReviewRequired === fixture.expectedReview,
      scoreStatus: audit.scoreStatus,
      severity: fixture.severity,
      actualErrorCodes,
      expectedErrorCodes,
      remediationCorrect: JSON.stringify(actualErrorCodes) === JSON.stringify(expectedErrorCodes),
    });
  }

  const unsafeCases = decisions.filter((item) => item.expectedReview);
  const severeCases = decisions.filter((item) => item.expectedReview && item.severity === 'severe');
  const groundingFailures = dataset.cases.filter((fixture) => {
    const criteria = Array.isArray(fixture.rawGrade?.criteria) ? fixture.rawGrade.criteria : [fixture.rawGrade];
    return criteria.some((criterion) => (criterion.evidenceQuotes || []).some((quote) => !fixture.answer.includes(quote)));
  });
  const groundingFailureIds = new Set(groundingFailures.map((fixture) => fixture.id));
  const remediationCases = decisions.filter((item) => item.expectedErrorCodes?.length);
  const metrics = {
    reviewDecisionAccuracy: ratio(decisions.filter((item) => item.correct).length, decisions.length),
    falseVerifiedRate: ratio(unsafeCases.filter((item) => !item.actualReview).length, unsafeCases.length),
    // The contract accepts only byte-exact spans, so every accepted span is a
    // true positive. Acceptance rate is reported separately from precision.
    acceptedEvidencePrecision: acceptedQuotes > 0 ? 1 : (requestedQuotes > 0 ? 0 : 1),
    evidenceAcceptanceRate: ratio(acceptedQuotes, requestedQuotes),
    severeFalseVerifiedRate: ratio(severeCases.filter((item) => !item.actualReview).length, severeCases.length),
    groundingFailureCaptureRate: ratio(
      decisions.filter((item) => groundingFailureIds.has(item.id) && item.actualReview).length,
      groundingFailures.length,
    ),
    remediationChoiceAccuracy: ratio(remediationCases.filter((item) => item.remediationCorrect).length, remediationCases.length),
    normalizationFailureRate: ratio(normalizationFailures, dataset.cases.length),
    normalizationLatencyMs: Number((performance.now() - startedAt).toFixed(3)),
  };
  const alwaysGradeBaseline = {
    falseVerifiedRate: ratio(unsafeCases.length, unsafeCases.length),
    reviewDecisionAccuracy: ratio(decisions.filter((item) => !item.expectedReview).length, decisions.length),
  };
  const baselineDecision = (predicate) => ({
    reviewDecisionAccuracy: ratio(dataset.cases.filter((fixture) => predicate(fixture) === fixture.expectedReview).length, dataset.cases.length),
    falseVerifiedRate: ratio(dataset.cases.filter((fixture) => fixture.expectedReview && !predicate(fixture)).length, unsafeCases.length),
  });
  const simpleRulesBaseline = baselineDecision((fixture) => !fixture.answer.trim() || Number(fixture.rawGrade?.confidence) < 0.7);
  const retrievalRulesBaseline = baselineDecision((fixture) => {
    if (!fixture.answer.trim()) return true;
    const criteria = Array.isArray(fixture.rawGrade?.criteria) ? fixture.rawGrade.criteria : [fixture.rawGrade];
    return criteria.some((criterion) => Number(criterion.score ?? fixture.rawGrade?.score) > 0
      && (!(criterion.evidenceQuotes || []).length
        || criterion.evidenceQuotes.some((quote) => !fixture.answer.includes(quote))));
  });
  const passed = metrics.reviewDecisionAccuracy >= thresholds.metrics.reviewDecisionAccuracyMin
    && metrics.falseVerifiedRate <= thresholds.metrics.falseVerifiedRateMax
    && metrics.severeFalseVerifiedRate <= thresholds.metrics.severeFalseVerifiedRateMax
    && metrics.acceptedEvidencePrecision >= thresholds.metrics.acceptedEvidencePrecisionMin
    && metrics.groundingFailureCaptureRate >= thresholds.metrics.groundingFailureCaptureRateMin
    && metrics.remediationChoiceAccuracy >= thresholds.metrics.remediationChoiceAccuracyMin
    && metrics.normalizationFailureRate <= thresholds.metrics.normalizationFailureRateMax;

  return {
    datasetVersion: dataset.datasetVersion,
    thresholdVersion: thresholds.thresholdVersion,
    measuredAt,
    fixtureCount: decisions.length,
    metrics,
    baselines: {
      alwaysGrade: alwaysGradeBaseline,
      simpleRules: simpleRulesBaseline,
      retrievalRules: retrievalRulesBaseline,
      currentLiveModel: { status: 'NOT_RUN', reason: 'No authorized isolated provider evaluation environment.' },
    },
    decisions,
    passed,
    claimBoundary: 'Synthetic contract validation only; latency covers local normalization, not provider latency. Live model quality and failure rate were not measured.',
  };
}

async function main() {
  const datasetRaw = await readFile(datasetPath, 'utf8');
  const thresholdsRaw = await readFile(thresholdsPath, 'utf8');
  const implementationRaw = await readFile(implementationPath, 'utf8');
  const result = evaluateGradingFixture(JSON.parse(datasetRaw), JSON.parse(thresholdsRaw));
  const artifact = {
    ...result,
    datasetSha256: digest(datasetRaw),
    thresholdsSha256: digest(thresholdsRaw),
    graderImplementationSha256: digest(implementationRaw),
  };
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(artifact, null, 2));
  if (!artifact.passed) process.exitCode = 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
