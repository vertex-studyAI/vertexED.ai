import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
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

test("retained evidence hash and claimed metrics reproduce from frozen outcomes", () => {
  const rawUrl = new URL("../portfolio/project2424/projects/T2424-0024/evidence/raw/results.json", import.meta.url);
  const rawText = fs.readFileSync(rawUrl, "utf8");
  assert.equal(
    crypto.createHash("sha256").update(rawText).digest("hex"),
    "8e5b49bff8cd47cb0b20266b34aa55533823dda5c4855dd7da49365925f7fa39"
  );
  const raw = JSON.parse(rawText);
  const variants = pairedConfidenceVariants(raw.protocol.outcomes);
  const moderate = summarizeTrust(variants.moderate, { binCount: raw.protocol.binCount });
  const overconfident = summarizeTrust(variants.overconfident, { binCount: raw.protocol.binCount });
  assert.equal(raw.moderate.brierScore, moderate.brierScore);
  assert.equal(raw.overconfident.brierScore, overconfident.brierScore);
  assert.equal(raw.moderate.expectedCalibrationError, moderate.expectedCalibrationError);
  assert.equal(raw.overconfident.expectedCalibrationError, overconfident.expectedCalibrationError);
  assert.deepEqual(raw.moderate.selectiveRisk, moderate.selectiveRisk);
  assert.deepEqual(raw.overconfident.selectiveRisk, overconfident.selectiveRisk);
  assert.equal(raw.verdict, "GO");
});
