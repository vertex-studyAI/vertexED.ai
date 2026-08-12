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

const outcomes = [true, true, false, true, false, true, true, true, false, true, true, false, true, true, true, false, true, false, true, true];

test("matched-outcome overconfidence is penalized by calibration-sensitive metrics", () => {
  const variants = pairedConfidenceVariants(outcomes);
  assert.ok(brierScore(variants.moderate) < brierScore(variants.overconfident));
  assert.ok(expectedCalibrationError(variants.moderate, 5) < expectedCalibrationError(variants.overconfident, 5));
});

test("ranking-only selective risk is identical for matched confidence ordering", () => {
  const variants = pairedConfidenceVariants(outcomes);
  const moderate = summarizeTrust(variants.moderate, { binCount: 5 });
  const overconfident = summarizeTrust(variants.overconfident, { binCount: 5 });
  assert.deepEqual(
    moderate.selectiveRisk.map(({ coverage, risk }) => ({ coverage, risk })),
    overconfident.selectiveRisk.map(({ coverage, risk }) => ({ coverage, risk }))
  );
});

test("selective risk orders acceptance by confidence and coverage lookup is exact", () => {
  const records = [
    { id: "low-wrong", confidence: 0.2, correct: false },
    { id: "high-right", confidence: 0.95, correct: true },
    { id: "mid-right", confidence: 0.7, correct: true },
    { id: "mid-wrong", confidence: 0.6, correct: false }
  ];
  const curve = selectiveRiskCurve(records);
  assert.equal(curve[0].confidenceThreshold, 0.95);
  assert.equal(curve[0].risk, 0);
  assert.equal(curve.at(-1).risk, 0.5);
  assert.equal(selectiveRiskAtCoverage(records, 0.5).accepted, 2);
});

test("frozen controls reproduce retained scalar metrics", () => {
  const variants = pairedConfidenceVariants(outcomes);
  const moderate = summarizeTrust(variants.moderate, { binCount: 5 });
  const overconfident = summarizeTrust(variants.overconfident, { binCount: 5 });
  assert.ok(Math.abs(moderate.brierScore - 0.04) < 1e-12);
  assert.ok(Math.abs(overconfident.brierScore - 0.2542) < 1e-12);
  assert.ok(Math.abs(moderate.expectedCalibrationError - 0.2) < 1e-12);
  assert.ok(Math.abs(overconfident.expectedCalibrationError - 0.262) < 1e-12);
  assert.equal(abstentionReport(variants.moderate, 0.7).acceptedRisk, 0);
  assert.equal(abstentionReport(variants.overconfident, 0.95).acceptedRisk, 0);
});

test("malformed confidence, coverage and records fail closed", () => {
  assert.throws(() => brierScore([{ confidence: 1.2, correct: true }, { confidence: 0.5, correct: false }]), /\[0, 1\]/);
  assert.throws(() => selectiveRiskAtCoverage([{ confidence: 0.5, correct: true }, { confidence: 0.4, correct: false }], 0), /> 0/);
  assert.throws(() => pairedConfidenceVariants([true, false]), /at least four/);
});
