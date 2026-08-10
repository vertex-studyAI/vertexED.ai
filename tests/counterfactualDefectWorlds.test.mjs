import test from "node:test";
import assert from "node:assert/strict";
import {
  causalConeViolations,
  deterministicSeedState,
  evolve,
  hammingDistance,
  simulateCounterfactual,
  simulateWorld
} from "../portfolio/new-projects/counterfactual-defect-worlds/src/core.mjs";

test("identical deterministic worlds reproduce exactly", () => {
  const initial = deterministicSeedState(41);
  const left = simulateWorld(initial, { rule: 110, steps: 20 });
  const right = simulateWorld(initial, { rule: 110, steps: 20 });
  assert.deepEqual(left, right);
});

test("counterfactual has zero divergence before intervention and one changed cell at intervention", () => {
  const result = simulateCounterfactual(deterministicSeedState(41), {
    rule: 110,
    steps: 12,
    intervention: { time: 5, index: 20, mode: "flip" }
  });
  assert.ok(result.divergence.slice(0, 5).every((row) => row.hammingDistance === 0));
  assert.equal(result.divergence[5].hammingDistance, 1);
  assert.deepEqual(result.divergence[5].differingIndices, [20]);
});

test("radius-one dynamics cannot propagate a local defect outside its causal cone", () => {
  const result = simulateCounterfactual(deterministicSeedState(81), {
    rule: 30,
    steps: 25,
    intervention: { time: 4, index: 40, mode: "flip" }
  });
  assert.deepEqual(causalConeViolations(result), []);
  for (const row of result.divergence.filter((candidate) => candidate.time >= 4)) {
    const radius = row.time - 4;
    assert.ok(row.hammingDistance <= 2 * radius + 1);
  }
});

test("rule 0 erases any finite binary state after one evolution", () => {
  const state = [1, 0, 1, 1, 0, 1, 0];
  assert.deepEqual(evolve(state, 0), Array(state.length).fill(0));
});

test("distance and simulator inputs fail closed on invalid states", () => {
  assert.equal(hammingDistance([0, 1, 0], [1, 1, 0]), 1);
  assert.throws(() => hammingDistance([0, 1, 0], [0, 1, 0, 1]), /equal width/);
  assert.throws(() => simulateWorld([0, 2, 0], { rule: 110, steps: 1 }), /0 or 1/);
  assert.throws(() => simulateWorld([0, 1, 0], { rule: 256, steps: 1 }), /\[0, 255\]/);
  assert.throws(
    () => simulateCounterfactual([0, 1, 0], { steps: 2, intervention: { time: 3, index: 1, mode: "flip" } }),
    /time/
  );
});
