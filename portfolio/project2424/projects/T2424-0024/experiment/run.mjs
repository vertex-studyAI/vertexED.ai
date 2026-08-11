import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { abstentionReport, pairedConfidenceVariants, summarizeTrust } from "../src/core.mjs";

const outcomes = [
  true, true, false, true, false, true, true, true, false, true,
  true, false, true, true, true, false, true, false, true, true
];
const variants = pairedConfidenceVariants(outcomes);
const moderate = summarizeTrust(variants.moderate, { binCount: 5 });
const overconfident = summarizeTrust(variants.overconfident, { binCount: 5 });
const rankingRiskMatches = moderate.selectiveRisk.every((point, index) => {
  const other = overconfident.selectiveRisk[index];
  return point.coverage === other.coverage && Math.abs(point.risk - other.risk) <= 1e-15;
});
const gates = {
  moderateBrierLower: moderate.brierScore < overconfident.brierScore,
  moderateEceLower: moderate.expectedCalibrationError < overconfident.expectedCalibrationError,
  rankingOnlySelectiveRiskUnchanged: rankingRiskMatches
};
const output = {
  project: "T2424-0024",
  name: "Trust Under Uncertainty",
  protocol: "PROTOCOL.md",
  records: variants,
  metrics: {
    moderate,
    overconfident,
    moderateAbstentionAt07: abstentionReport(variants.moderate, 0.7),
    overconfidentAbstentionAt095: abstentionReport(variants.overconfident, 0.95)
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
