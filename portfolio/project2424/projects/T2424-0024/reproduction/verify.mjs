import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import {
  abstentionReport,
  pairedConfidenceVariants,
  summarizeTrust
} from "../src/core.mjs";

const rawUrl = new URL("../evidence/raw/results.json", import.meta.url);
const rawText = fs.readFileSync(rawUrl, "utf8");
const raw = JSON.parse(rawText);
const expectedSha256 = "8e5b49bff8cd47cb0b20266b34aa55533823dda5c4855dd7da49365925f7fa39";
assert.equal(
  crypto.createHash("sha256").update(rawText).digest("hex"),
  expectedSha256,
  "retained result hash mismatch"
);

assert.equal(raw.project, "T2424-0024");
assert.deepEqual(raw.protocol.moderateMapping, { correct: 0.8, incorrect: 0.2 });
assert.deepEqual(raw.protocol.overconfidentMapping, { correct: 0.98, incorrect: 0.92 });

const variants = pairedConfidenceVariants(raw.protocol.outcomes);
const moderate = summarizeTrust(variants.moderate, { binCount: raw.protocol.binCount });
const overconfident = summarizeTrust(variants.overconfident, { binCount: raw.protocol.binCount });

assert.equal(raw.moderate.accuracy, moderate.accuracy);
assert.equal(raw.overconfident.accuracy, overconfident.accuracy);
assert.equal(raw.moderate.brierScore, moderate.brierScore);
assert.equal(raw.overconfident.brierScore, overconfident.brierScore);
assert.equal(raw.moderate.expectedCalibrationError, moderate.expectedCalibrationError);
assert.equal(raw.overconfident.expectedCalibrationError, overconfident.expectedCalibrationError);
assert.deepEqual(raw.moderate.selectiveRisk, moderate.selectiveRisk);
assert.deepEqual(raw.overconfident.selectiveRisk, overconfident.selectiveRisk);
assert.deepEqual(raw.moderate.abstentionAt07, abstentionReport(variants.moderate, 0.7));
assert.deepEqual(raw.overconfident.abstentionAt095, abstentionReport(variants.overconfident, 0.95));

assert.ok(moderate.brierScore < overconfident.brierScore);
assert.ok(moderate.expectedCalibrationError < overconfident.expectedCalibrationError);
assert.equal(raw.verdict, "GO");

console.log("T2424-0024 independent evidence consistency: PASS");
