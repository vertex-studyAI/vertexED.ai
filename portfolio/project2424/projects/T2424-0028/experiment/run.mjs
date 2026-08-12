import {
  encodeResidualEvents,
  evaluateResidualEncoding,
  generateTrendWithDefects,
  runThresholdSweep
} from "../src/core.mjs";

const values = generateTrendWithDefects(120);
const thresholds = [0.1, 0.25, 0.5, 1, 2];
const linear = runThresholdSweep(values, thresholds, "linear").map(({ events, reconstructed, ...row }) => row);
const hold = runThresholdSweep(values, thresholds, "hold").map(({ events, reconstructed, ...row }) => row);
const primary = encodeResidualEvents(values, { threshold: 0.5, mode: "linear" });
const primaryMetrics = evaluateResidualEncoding(values, primary);

console.log(JSON.stringify({
  experiment: "T2424-0028 residual event tokenization minimum experiment",
  source: "deterministic synthetic trend with two injected level defects",
  claimBoundary: "compression/reconstruction behavior only; no external dataset or model-quality claim",
  primary: {
    threshold: primary.threshold,
    mode: primary.mode,
    tokens: primary.events.length,
    tokenRatio: primaryMetrics.tokenRatio,
    compressionFactor: primaryMetrics.compressionFactor,
    mae: primaryMetrics.mae,
    rmse: primaryMetrics.rmse,
    maxAbsError: primaryMetrics.maxAbsError
  },
  sweep: { linear, hold }
}, null, 2));
