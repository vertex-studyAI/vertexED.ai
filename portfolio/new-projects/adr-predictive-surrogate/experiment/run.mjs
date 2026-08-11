import { buildADRGridSurrogate, evaluateADRSurrogate } from "../src/core.mjs";

const modes = [
  { k: 1, sine: 1, cosine: 0 },
  { k: 3, sine: 0.35, cosine: -0.2 }
];

const probes = [
  { advection: 0.04, diffusion: 0.0043, reaction: -0.14, time: 0.08 },
  { advection: 0.19, diffusion: 0.012, reaction: 0.06, time: 0.37 },
  { advection: 0.27, diffusion: 0.017, reaction: 0.14, time: 0.52 },
  { advection: 0.11, diffusion: 0.008, reaction: -0.03, time: 0.23 }
];

const coarse = buildADRGridSurrogate({ points: 128, modes });
const fine = buildADRGridSurrogate({
  points: 128,
  modes,
  advection: [0, 0.075, 0.15, 0.225, 0.3],
  diffusion: [0, 0.005, 0.01, 0.015, 0.02],
  reaction: [-0.2, -0.1, 0, 0.1, 0.2],
  time: [0, 0.15, 0.3, 0.45, 0.6]
});

const coarseReport = evaluateADRSurrogate(coarse, probes);
const fineReport = evaluateADRSurrogate(fine, probes);
const gate = {
  refinementImprovesMeanError: fineReport.meanRelativeL2 < coarseReport.meanRelativeL2 * 0.5,
  fineWorstRelativeL2BelowTwoPercent: fineReport.worstRelativeL2 < 0.02
};

console.log(JSON.stringify({
  project: "T2424-0051",
  experiment: "controlled periodic linear ADR structured-grid surrogate screen",
  coarseSnapshots: coarse.snapshotCount,
  fineSnapshots: fine.snapshotCount,
  probeCount: probes.length,
  coarse: {
    meanRelativeL2: coarseReport.meanRelativeL2,
    worstRelativeL2: coarseReport.worstRelativeL2,
    meanRmse: coarseReport.meanRmse
  },
  fine: {
    meanRelativeL2: fineReport.meanRelativeL2,
    worstRelativeL2: fineReport.worstRelativeL2,
    meanRmse: fineReport.meanRmse
  },
  gate,
  pass: Object.values(gate).every(Boolean)
}, null, 2));
