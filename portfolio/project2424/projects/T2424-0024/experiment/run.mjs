import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { abstentionReport, pairedConfidenceVariants, summarizeTrust } from "../src/core.mjs";

const rawOutcomes = [
  true, true, false, true, false, true, true, true, false, true,
  true, false, true, true, true, false, true, false, true, true
];
const policies = {
  moderate: { correctConfidence: 0.8, errorConfidence: 0.2 },
  overconfident: { correctConfidence: 0.98, errorConfidence: 0.92 }
};
const variants = pairedConfidenceVariants(rawOutcomes);
const moderate = summarizeTrust(variants.moderate, { binCount: 5 });
const overconfident = summarizeTrust(variants.overconfident, { binCount: 5 });
const compactSelectiveRisk = (summary) => summary.selectiveRisk.map(({ coverage, risk }) => ({ coverage, risk }));
const moderateRisk = compactSelectiveRisk(moderate);
const overconfidentRisk = compactSelectiveRisk(overconfident);
const gates = {
  moderateBrierLower: moderate.brierScore < overconfident.brierScore,
  moderateEceLower: moderate.expectedCalibrationError < overconfident.expectedCalibrationError,
  rankingOnlySelectiveRiskUnchanged: moderateRisk.every((point, index) => {
    const other = overconfidentRisk[index];
    return point.coverage === other.coverage && Math.abs(point.risk - other.risk) <= 1e-15;
  })
};
const moderateAbstention = abstentionReport(variants.moderate, 0.7);
const overconfidentAbstention = abstentionReport(variants.overconfident, 0.95);
const output = {
  project: "T2424-0024",
  name: "Trust Under Uncertainty",
  protocol: "PROTOCOL.md",
  rawOutcomes,
  policies,
  metrics: {
    moderate: {
      accuracy: moderate.accuracy,
      meanConfidence: moderate.meanConfidence,
      brierScore: moderate.brierScore,
      expectedCalibrationError5Bins: moderate.expectedCalibrationError,
      selectiveRisk: moderateRisk,
      abstentionAt07: { coverage: moderateAbstention.coverage, acceptedRisk: moderateAbstention.acceptedRisk }
    },
    overconfident: {
      accuracy: overconfident.accuracy,
      meanConfidence: overconfident.meanConfidence,
      brierScore: overconfident.brierScore,
      expectedCalibrationError5Bins: overconfident.expectedCalibrationError,
      selectiveRisk: overconfidentRisk,
      abstentionAt095: { coverage: overconfidentAbstention.coverage, acceptedRisk: overconfidentAbstention.acceptedRisk }
    }
  },
  gates,
  verdict: Object.values(gates).every(Boolean) ? "GO_EVALUATOR_MECHANICS_ONLY" : "STOP_OR_PIVOT",
  claimBoundary: "deterministic paired synthetic evaluator mechanics only; no real-model trustworthiness, deployment, or optimal-threshold claim"
};

const here = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(here, "../evidence/results.json");
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(JSON.stringify(output, null, 2));
