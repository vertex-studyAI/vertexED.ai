import test from "node:test";
import assert from "node:assert/strict";
import {
  analyzeGrokking,
  generateMatchedControlCurve,
  generateSyntheticCurve,
  movingAverage,
  validateLearningCurve
} from "../portfolio/project2424/projects/T2424-0035/src/core.mjs";

test("detector identifies delayed generalization on the synthetic positive control", () => {
  const result = analyzeGrokking(generateSyntheticCurve());
  assert.equal(result.verdict, "DELAYED_GENERALIZATION_DETECTED");
  assert.equal(result.grokkingDetected, true);
  assert.ok(result.memorizationStep < result.generalizationStep);
  assert.ok(result.delaySteps >= result.thresholds.minDelaySteps);
  assert.ok(result.evalAtMemorization <= result.thresholds.maxEvalAtMemorization);
});

test("matched train/eval transition does not trigger grokking classification", () => {
  const result = analyzeGrokking(generateMatchedControlCurve());
  assert.equal(result.grokkingDetected, false);
  assert.equal(result.verdict, "NO_DELAYED_GENERALIZATION");
});

test("persistent threshold rejects a one-row eval spike", () => {
  const curve = generateSyntheticCurve();
  const early = curve.map((row) => ({ ...row, evalAccuracy: Math.min(row.evalAccuracy, 0.4) }));
  early[20] = { ...early[20], evalAccuracy: 0.99 };
  const result = analyzeGrokking(early, { smoothingWindow: 1, persistence: 3 });
  assert.equal(result.generalizationStep, null);
  assert.equal(result.verdict, "NO_GENERALIZATION_THRESHOLD");
});

test("moving average is causal and uses no future rows", () => {
  assert.deepEqual(movingAverage([1, 2, 3, 100], 3), [1, 1.5, 2, 35]);
});

test("curve validation fails closed on malformed metrics and step ordering", () => {
  const valid = generateSyntheticCurve({ rows: 10 });
  assert.equal(validateLearningCurve(valid).length, 10);
  assert.throws(() => validateLearningCurve(valid.slice(0, 4)), /at least 8/);
  assert.throws(() => validateLearningCurve(valid.map((row, index) => index === 5 ? { ...row, trainAccuracy: 1.2 } : row)), /\[0, 1\]/);
  assert.throws(() => validateLearningCurve(valid.map((row, index) => index === 5 ? { ...row, step: valid[4].step } : row)), /strictly increasing/);
});
