import test from "node:test";
import assert from "node:assert/strict";

import {
  adrSnapshot,
  buildADRGridSurrogate,
  predictADR,
  errorMetrics,
  evaluateADRSurrogate
} from "../portfolio/new-projects/adr-predictive-surrogate/src/core.mjs";

function l2(values) {
  return Math.sqrt(values.reduce((sum, value) => sum + value ** 2, 0));
}

const modes = [
  { k: 1, sine: 1, cosine: 0 },
  { k: 3, sine: 0.35, cosine: -0.2 }
];

test("ADR reference solver reproduces the initial Fourier field at t=0", () => {
  const snapshot = adrSnapshot({
    points: 128,
    modes,
    advection: 0.27,
    diffusion: 0.02,
    reaction: 0.3,
    time: 0
  });
  snapshot.values.forEach((value, index) => {
    const x = index / snapshot.points;
    const expected = Math.sin(2 * Math.PI * x)
      + 0.35 * Math.sin(6 * Math.PI * x)
      - 0.2 * Math.cos(6 * Math.PI * x);
    assert.ok(Math.abs(value - expected) < 1e-12);
  });
});

test("pure advection preserves discrete L2 norm on the periodic grid", () => {
  const initial = adrSnapshot({ points: 256, modes, advection: 0.31, diffusion: 0, reaction: 0, time: 0 });
  const shifted = adrSnapshot({ points: 256, modes, advection: 0.31, diffusion: 0, reaction: 0, time: 0.47 });
  assert.ok(Math.abs(l2(initial.values) - l2(shifted.values)) < 1e-12);
});

test("diffusion damps the higher Fourier mode more strongly", () => {
  const snapshot = adrSnapshot({ points: 128, modes, advection: 0, diffusion: 0.02, reaction: 0, time: 0.5 });
  const low = snapshot.modes.find((mode) => mode.k === 1);
  const high = snapshot.modes.find((mode) => mode.k === 3);
  const lowRatio = Math.hypot(low.sine, low.cosine);
  const highRatio = Math.hypot(high.sine, high.cosine) / Math.hypot(0.35, -0.2);
  assert.ok(highRatio < lowRatio);
});

test("grid surrogate is exact at a stored parameter node", () => {
  const surrogate = buildADRGridSurrogate({ points: 64, modes });
  const parameters = { advection: 0.15, diffusion: 0.01, reaction: 0, time: 0.3 };
  const reference = adrSnapshot({ points: 64, modes, ...parameters }).values;
  const prediction = predictADR(surrogate, parameters);
  const metrics = errorMetrics(reference, prediction);
  assert.ok(metrics.relativeL2 < 1e-12);
  assert.ok(metrics.maxAbsError < 1e-12);
});

test("refining the surrogate grid lowers held-out ADR error", () => {
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
  assert.equal(coarse.snapshotCount, 81);
  assert.equal(fine.snapshotCount, 625);
  assert.ok(fineReport.meanRelativeL2 < coarseReport.meanRelativeL2 * 0.5);
  assert.ok(fineReport.worstRelativeL2 < 0.02);
});

test("surrogate fails closed on malformed axes and extrapolation", () => {
  assert.throws(
    () => buildADRGridSurrogate({ diffusion: [0, 0.02, 0.01] }),
    /strictly increasing/
  );
  const surrogate = buildADRGridSurrogate();
  assert.throws(
    () => predictADR(surrogate, { advection: 0.31, diffusion: 0.01, reaction: 0, time: 0.2 }),
    /within surrogate axis bounds/
  );
  assert.throws(
    () => adrSnapshot({ diffusion: -0.01 }),
    /must be >= 0/
  );
});
