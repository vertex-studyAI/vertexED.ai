import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const evidenceUrl = new URL("../portfolio/project2424/projects/T2424-0024/evidence/results.json", import.meta.url);

function independentBrier(outcomes, correctConfidence, errorConfidence) {
  return outcomes.reduce((sum, correct) => {
    const confidence = correct ? correctConfidence : errorConfidence;
    const target = correct ? 1 : 0;
    return sum + (confidence - target) ** 2;
  }, 0) / outcomes.length;
}

function independentEce(outcomes, correctConfidence, errorConfidence, binCount) {
  const rows = outcomes.map((correct) => ({ correct, confidence: correct ? correctConfidence : errorConfidence }));
  let ece = 0;
  for (let index = 0; index < binCount; index += 1) {
    const rowsInBin = rows.filter((row) => Math.min(Math.floor(row.confidence * binCount), binCount - 1) === index);
    if (rowsInBin.length === 0) continue;
    const accuracy = rowsInBin.filter((row) => row.correct).length / rowsInBin.length;
    const meanConfidence = rowsInBin.reduce((sum, row) => sum + row.confidence, 0) / rowsInBin.length;
    ece += (rowsInBin.length / rows.length) * Math.abs(accuracy - meanConfidence);
  }
  return ece;
}

function independentSelectiveRisks(outcomes, correctConfidence, errorConfidence, coverages) {
  const rows = outcomes
    .map((correct, index) => ({ correct, confidence: correct ? correctConfidence : errorConfidence, index }))
    .sort((left, right) => right.confidence - left.confidence || left.index - right.index);
  return coverages.map((coverage) => {
    const accepted = Math.ceil(coverage * rows.length);
    const slice = rows.slice(0, accepted);
    const errors = slice.filter((row) => !row.correct).length;
    return { coverage: accepted / rows.length, risk: errors / accepted };
  });
}

test("retained evidence independently reproduces claim metrics and verdict", async () => {
  const evidence = JSON.parse(await readFile(evidenceUrl, "utf8"));
  assert.equal(evidence.project, "T2424-0024");
  assert.equal(evidence.rawOutcomes.length, 20);

  for (const name of ["moderate", "overconfident"]) {
    const policy = evidence.policies[name];
    const observed = evidence.metrics[name];
    const brier = independentBrier(evidence.rawOutcomes, policy.correctConfidence, policy.errorConfidence);
    const ece = independentEce(evidence.rawOutcomes, policy.correctConfidence, policy.errorConfidence, 5);
    const selectiveRisk = independentSelectiveRisks(
      evidence.rawOutcomes,
      policy.correctConfidence,
      policy.errorConfidence,
      [0.25, 0.5, 0.75, 1]
    );
    assert.ok(Math.abs(brier - observed.brierScore) < 1e-12);
    assert.ok(Math.abs(ece - observed.expectedCalibrationError5Bins) < 1e-12);
    observed.selectiveRisk.forEach((point, index) => {
      assert.ok(Math.abs(point.coverage - selectiveRisk[index].coverage) < 1e-12);
      assert.ok(Math.abs(point.risk - selectiveRisk[index].risk) < 1e-12);
    });
  }

  assert.ok(evidence.metrics.moderate.brierScore < evidence.metrics.overconfident.brierScore);
  assert.ok(evidence.metrics.moderate.expectedCalibrationError5Bins < evidence.metrics.overconfident.expectedCalibrationError5Bins);
  assert.deepEqual(evidence.metrics.moderate.selectiveRisk, evidence.metrics.overconfident.selectiveRisk);
  assert.deepEqual(evidence.gates, {
    moderateBrierLower: true,
    moderateEceLower: true,
    rankingOnlySelectiveRiskUnchanged: true
  });
  assert.equal(evidence.verdict, "GO_EVALUATOR_MECHANICS_ONLY");
  assert.match(evidence.claimBoundary, /synthetic evaluator mechanics only/);
});
