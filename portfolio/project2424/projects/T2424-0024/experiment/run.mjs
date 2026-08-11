import fs from "node:fs";
import { abstentionReport, pairedConfidenceVariants, summarizeTrust } from "../src/core.mjs";

const outcomes = [true,true,false,true,false,true,true,true,false,true,true,false,true,true,true,false,true,false,true,true];
const variants = pairedConfidenceVariants(outcomes);
const result = {
  experiment: "T2424-0024 Trust Under Uncertainty minimum calibration experiment",
  claim: "On identical synthetic outcomes, the overconfident policy has worse Brier score and ECE than the moderate policy.",
  primaryMetric: "Brier score",
  baseline: "moderate confidence policy",
  negativeControl: "overconfident policy",
  successThreshold: "overconfident Brier > moderate Brier AND overconfident ECE > moderate ECE",
  data: "20 fixed synthetic correctness outcomes",
  moderate: { summary: summarizeTrust(variants.moderate, { binCount: 5 }), abstentionAt07: abstentionReport(variants.moderate, 0.7) },
  overconfident: { summary: summarizeTrust(variants.overconfident, { binCount: 5 }), abstentionAt095: abstentionReport(variants.overconfident, 0.95) }
};
result.verdict = result.overconfident.summary.brierScore > result.moderate.summary.brierScore && result.overconfident.summary.expectedCalibrationError > result.moderate.summary.expectedCalibrationError ? "GO" : "STOP";
const output = JSON.stringify(result, null, 2) + "\n";
if (process.argv[2]) fs.writeFileSync(process.argv[2], output); else process.stdout.write(output);
