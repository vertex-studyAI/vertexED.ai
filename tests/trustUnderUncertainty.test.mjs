import test from "node:test";
import assert from "node:assert/strict";
import {
  abstentionReport,
  brierScore,
  expectedCalibrationError,
  pairedConfidenceVariants,
  selectiveRiskAtCoverage,
  selectiveRiskCurve,
  summarizeTrust
} from "../portfolio/project2424/projects/T2424-0024/src/core.mjs";

const outcomes = [true, true, false, true, false, true, true, false, true, true];

test("overconfidence is penalized on the same correctness outcomes", () => {
  const variants = pairedConfidenceVariants(outcomes);
  assert.ok(brierScore(variants.moderate) < brierScore(variants.overconfident));
  assert.ok(expectedCalibrationError(variants.moderate, 5) < expectedCalibrationError(variants.overconfident, 5));
});

test("selective risk curve orders acceptance by confidence", () => {
  const records = [
    { id: "low-wrong", confidence: 0.2, correct: false },
    { id: "high-right", confidence: 0.95, correct: true },
    { id: "mid-right", confidence: 0.7, correct: true },
    { id: "mid-wrong", confidence: 0.6, correct: false }
  ];
  const curve = selectiveRiskCurve(records);
  assert.equal(curve[0].confidenceThreshold, 0.95);
  assert.equal(curve[0].risk, 0);
  assert.equal(curve.at(-1).coverage, 1);
  assert.equal(curve.at(-1).risk, 0.5);
});

test("coverage lookup uses the smallest accepted prefix meeting the target", () => {
  const variants = pairedConfidenceVariants(outcomes);
  const point = selectiveRiskAtCoverage(variants.moderate, 0.5);
  assert.equal(point.accepted, 5);
  assert.equal(point.coverage, 0.5);
});

test("abstention reports null risk when every prediction is rejected", () => {
  const records = [
    { confidence: 0.2, correct: true },
    { confidence: 0.3, correct: false }
  ];
  const report = abstentionReport(records, 0.9);
  assert.equal(report.accepted, 0);
  assert.equal(report.coverage, 0);
  assert.equal(report.acceptedRisk, null);
  assert.equal(report.acceptedAccuracy, null);
});

test("summary metrics are bounded and malformed confidence fails closed", () => {
  const variants = pairedConfidenceVariants(outcomes);
  const summary = summarizeTrust(variants.moderate, { binCount: 5, coverages: [0.5, 1] });
  assert.ok(summary.accuracy >= 0 && summary.accuracy <= 1);
  assert.ok(summary.brierScore >= 0 && summary.brierScore <= 1);
  assert.ok(summary.expectedCalibrationError >= 0 && summary.expectedCalibrationError <= 1);
  assert.equal(summary.selectiveRisk.length, 2);
  assert.throws(() => brierScore([{ confidence: 1.2, correct: true }, { confidence: 0.5, correct: false }]), /\[0, 1\]/);
});
