import test from "node:test";
import assert from "node:assert/strict";
import {
  acquisitionScore,
  rankExperiments,
  selectExperimentBatch,
  updateCandidateFromEvidence
} from "../portfolio/project2424/projects/T2424-0054/src/core.mjs";

const candidate = (overrides = {}) => ({
  id: "candidate-a",
  family: "family-a",
  expectedValue: 0.7,
  uncertainty: 0.5,
  novelty: 0.6,
  costHours: 4,
  dependenciesComplete: true,
  ...overrides
});

test("cost-aware acquisition prefers the cheaper experiment when benefits match", () => {
  const cheap = candidate({ id: "cheap", costHours: 2 });
  const expensive = candidate({ id: "expensive", costHours: 18 });
  assert.ok(acquisitionScore(cheap) > acquisitionScore(expensive));
  assert.deepEqual(rankExperiments([expensive, cheap]).map((row) => row.id), ["cheap", "expensive"]);
});

test("blocked dependencies are never selected", () => {
  const blocked = candidate({ id: "blocked", expectedValue: 1, uncertainty: 1, novelty: 1, costHours: 1, dependenciesComplete: false });
  const feasible = candidate({ id: "feasible", expectedValue: 0.4, uncertainty: 0.3, novelty: 0.2, costHours: 2 });
  assert.equal(acquisitionScore(blocked), Number.NEGATIVE_INFINITY);
  const batch = selectExperimentBatch([blocked, feasible], { batchSize: 2, budgetHours: 10 });
  assert.deepEqual(batch.selected.map((row) => row.id), ["feasible"]);
  assert.deepEqual(batch.blocked, ["blocked"]);
});

test("repeat-family penalty can diversify a research batch", () => {
  const candidates = [
    candidate({ id: "a1", family: "A", expectedValue: 0.9, costHours: 2 }),
    candidate({ id: "a2", family: "A", expectedValue: 0.88, costHours: 2 }),
    candidate({ id: "b1", family: "B", expectedValue: 0.76, costHours: 2 })
  ];
  const batch = selectExperimentBatch(candidates, { batchSize: 2, budgetHours: 4, repeatFamilyPenalty: 1.2, explorationWeight: 0, noveltyWeight: 0 });
  assert.deepEqual(batch.selected.map((row) => row.id), ["a1", "b1"]);
});

test("budget constraint is hard rather than advisory", () => {
  const batch = selectExperimentBatch([
    candidate({ id: "two", costHours: 2 }),
    candidate({ id: "three", costHours: 3 }),
    candidate({ id: "five", costHours: 5 })
  ], { batchSize: 3, budgetHours: 4 });
  assert.ok(batch.usedHours <= 4);
  assert.equal(batch.selected.length, 1);
});

test("new evidence updates expected value and contracts uncertainty", () => {
  const prior = candidate({ expectedValue: 0.4, uncertainty: 0.8 });
  const posterior = updateCandidateFromEvidence(prior, 0.9, 0.5);
  assert.ok(posterior.expectedValue > prior.expectedValue);
  assert.ok(posterior.expectedValue < 0.9);
  assert.ok(posterior.uncertainty < prior.uncertainty);
});
