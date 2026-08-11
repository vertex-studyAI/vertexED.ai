import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import { pairedConfidenceVariants, summarizeTrust } from "../src/core.mjs";

const rawUrl = new URL("../evidence/raw/results.json", import.meta.url);
const rawText = fs.readFileSync(rawUrl, "utf8");
const raw = JSON.parse(rawText);
const expectedSha256 = "4a69125b38dd282c31f4db97e55042764c582193e8248323e0dc2e0cd4e2e403";
assert.equal(crypto.createHash("sha256").update(rawText).digest("hex"), expectedSha256, "retained result hash mismatch");

const variants = pairedConfidenceVariants(raw.data.outcomes);
const moderate = summarizeTrust(variants.moderate, { binCount: raw.protocol.binCount });
const overconfident = summarizeTrust(variants.overconfident, { binCount: raw.protocol.binCount });
assert.equal(raw.moderate.brierScore, moderate.brierScore);
assert.equal(raw.overconfident.brierScore, overconfident.brierScore);
assert.equal(raw.moderate.expectedCalibrationError, moderate.expectedCalibrationError);
assert.equal(raw.overconfident.expectedCalibrationError, overconfident.expectedCalibrationError);
assert.ok(overconfident.brierScore > moderate.brierScore);
assert.ok(overconfident.expectedCalibrationError > moderate.expectedCalibrationError);
assert.equal(raw.verdict, "GO");
console.log("T2424-0024 independent evidence consistency: PASS");
