import test from "node:test";
import assert from "node:assert/strict";
import {
  analyzeRepresentation,
  detectRepresentationTransitions,
  heatSolution,
  projectSineModes,
  sweepDiffusivity
} from "../portfolio/project2424/projects/T2424-0029/src/core.mjs";

test("zero-time heat states are independent of diffusivity", () => {
  const modes = [{ k: 1, amplitude: 1 }, { k: 5, amplitude: 0.8 }];
  const left = heatSolution({ points: 64, time: 0, diffusivity: 0, modes });
  const right = heatSolution({ points: 64, time: 0, diffusivity: 100, modes });
  left.values.forEach((value, index) => assert.ok(Math.abs(value - right.values[index]) < 1e-12));
});

test("sine projection recovers known periodic mode amplitudes", () => {
  const solution = heatSolution({
    points: 128,
    time: 0,
    diffusivity: 0,
    modes: [{ k: 2, amplitude: 1.25 }, { k: 7, amplitude: -0.4 }]
  });
  const spectrum = projectSineModes(solution.values, 8);
  assert.ok(Math.abs(spectrum[1].amplitude - 1.25) < 1e-12);
  assert.ok(Math.abs(spectrum[6].amplitude + 0.4) < 1e-12);
  assert.ok(Math.abs(spectrum[0].amplitude) < 1e-12);
});

test("frozen diffusivity sweep matches the predeclared effective-mode sequence", () => {
  const rows = sweepDiffusivity({
    points: 128,
    time: 1,
    diffusivities: [0, 0.0002, 0.001, 0.005, 0.02],
    modes: [{ k: 1, amplitude: 1 }, { k: 5, amplitude: 0.8 }, { k: 12, amplitude: 0.6 }],
    energyFraction: 0.95
  });
  assert.deepEqual(rows.map((row) => row.effectiveModeCount), [3, 2, 2, 1, 1]);
  assert.ok(rows.at(-1).spectralEntropy < rows[0].spectralEntropy);
});

test("transition detector reports only discrete effective-mode count changes", () => {
  const rows = [
    { diffusivity: 0, effectiveModeCount: 3 },
    { diffusivity: 0.001, effectiveModeCount: 2 },
    { diffusivity: 0.002, effectiveModeCount: 2 },
    { diffusivity: 0.01, effectiveModeCount: 1 }
  ];
  assert.deepEqual(detectRepresentationTransitions(rows), [
    { fromDiffusivity: 0, toDiffusivity: 0.001, fromModeCount: 3, toModeCount: 2 },
    { fromDiffusivity: 0.002, toDiffusivity: 0.01, fromModeCount: 2, toModeCount: 1 }
  ]);
});

test("representation analysis fails closed on invalid energy targets", () => {
  const state = heatSolution({ points: 64, time: 0, diffusivity: 0 }).values;
  assert.throws(() => analyzeRepresentation(state, { energyFraction: 0 }), /\(0, 1\]/);
  assert.throws(() => heatSolution({ points: 8 }), /\[16, 4096\]/);
  assert.throws(() => heatSolution({ points: 64, diffusivity: -1 }), />= 0/);
});
