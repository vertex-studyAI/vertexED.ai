import {
  abstentionReport,
  pairedConfidenceVariants,
  summarizeTrust
} from "../src/core.mjs";

const outcomes = [
  true, true, false, true, false, true, true, true, false, true,
  true, false, true, true, true, false, true, false, true, true
];
const variants = pairedConfidenceVariants(outcomes);

console.log(JSON.stringify({
  experiment: "T2424-0024 Trust Under Uncertainty minimum calibration experiment",
  claimBoundary: "deterministic evaluator mechanics on paired synthetic confidence variants; no model trustworthiness claim",
  moderate: {
    summary: summarizeTrust(variants.moderate, { binCount: 5 }),
    abstentionAt07: abstentionReport(variants.moderate, 0.7)
  },
  overconfident: {
    summary: summarizeTrust(variants.overconfident, { binCount: 5 }),
    abstentionAt095: abstentionReport(variants.overconfident, 0.95)
  }
}, null, 2));
