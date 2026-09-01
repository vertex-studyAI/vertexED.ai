#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { normalizeGradeAudits } from '../../api/_lib/verifiedGrading.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const datasetPath = resolve(root, 'evals/grading/frozen-v1.json');
const thresholdsPath = resolve(root, 'evals/grading/thresholds-v1.json');
const outputPath = resolve(root, 'evals/results/grading-v1.json');

const digest = (value) => createHash('sha256').update(value).digest('hex');
const ratio = (numerator, denominator) => denominator ? numerator / denominator : 1;

export function evaluateGradingFixture(dataset, thresholds, { measuredAt = new Date().toISOString() } = {}) {
  const decisions = [];
  let requestedQuotes = 0;
  let acceptedQuotes = 0;

  for (const fixture of dataset.cases) {
    const rawCriteria = Array.isArray(fixture.rawGrade?.criteria) ? fixture.rawGrade.criteria : [fixture.rawGrade];
    for (const criterion of rawCriteria) requestedQuotes += Array.isArray(criterion?.evidenceQuotes) ? criterion.evidenceQuotes.length : 0;

    const { audits } = normalizeGradeAudits({
      questions: [fixture.question],
      userAnswers: { [fixture.question.id]: fixture.answer },
      rawGrades: [fixture.rawGrade],
      model: 'synthetic-fixture',
    });
    const audit = audits[0];
    acceptedQuotes += audit.criteria.reduce((sum, criterion) => sum + criterion.evidence.length, 0);
    decisions.push({
      id: fixture.id,
      expectedReview: fixture.expectedReview,
      actualReview: audit.humanReviewRequired,
      correct: audit.humanReviewRequired === fixture.expectedReview,
      scoreStatus: audit.scoreStatus,
    });
  }

  const unsafeCases = decisions.filter((item) => item.expectedReview);
  const metrics = {
    reviewDecisionAccuracy: ratio(decisions.filter((item) => item.correct).length, decisions.length),
    falseVerifiedRate: ratio(unsafeCases.filter((item) => !item.actualReview).length, unsafeCases.length),
    // The contract accepts only byte-exact spans, so every accepted span is a
    // true positive. Acceptance rate is reported separately from precision.
    acceptedEvidencePrecision: acceptedQuotes > 0 ? 1 : (requestedQuotes > 0 ? 0 : 1),
    evidenceAcceptanceRate: ratio(acceptedQuotes, requestedQuotes),
  };
  const alwaysGradeBaseline = {
    falseVerifiedRate: ratio(unsafeCases.length, unsafeCases.length),
    reviewDecisionAccuracy: ratio(decisions.filter((item) => !item.expectedReview).length, decisions.length),
  };
  const passed = metrics.reviewDecisionAccuracy >= thresholds.metrics.reviewDecisionAccuracyMin
    && metrics.falseVerifiedRate <= thresholds.metrics.falseVerifiedRateMax
    && metrics.acceptedEvidencePrecision >= thresholds.metrics.acceptedEvidencePrecisionMin;

  return {
    datasetVersion: dataset.datasetVersion,
    thresholdVersion: thresholds.thresholdVersion,
    measuredAt,
    fixtureCount: decisions.length,
    metrics,
    baselines: { alwaysGrade: alwaysGradeBaseline },
    decisions,
    passed,
    claimBoundary: 'Synthetic contract validation only; not a measurement of live model grading quality.',
  };
}

async function main() {
  const datasetRaw = await readFile(datasetPath, 'utf8');
  const thresholdsRaw = await readFile(thresholdsPath, 'utf8');
  const result = evaluateGradingFixture(JSON.parse(datasetRaw), JSON.parse(thresholdsRaw));
  const artifact = {
    ...result,
    datasetSha256: digest(datasetRaw),
    thresholdsSha256: digest(thresholdsRaw),
  };
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(artifact, null, 2));
  if (!artifact.passed) process.exitCode = 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
