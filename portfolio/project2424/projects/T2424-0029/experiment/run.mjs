import {
  detectRepresentationTransitions,
  sweepDiffusivity
} from "../src/core.mjs";

const sweep = sweepDiffusivity({
  points: 128,
  time: 1,
  diffusivities: [0, 0.0002, 0.001, 0.005, 0.02],
  modes: [
    { k: 1, amplitude: 1 },
    { k: 5, amplitude: 0.8 },
    { k: 12, amplitude: 0.6 }
  ],
  energyFraction: 0.95
});

console.log(JSON.stringify({
  experiment: "T2424-0029 PDE representation-transition minimum experiment",
  equation: "1D periodic heat equation analytic Fourier solution",
  representationMetric: "minimum number of sine modes carrying 95% of measured spectral energy",
  claimBoundary: "discrete effective-rank transitions in a controlled analytic system; not a universal neural representation phase transition",
  sweep,
  transitions: detectRepresentationTransitions(sweep)
}, null, 2));
