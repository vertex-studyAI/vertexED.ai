import {
  deterministicSeedState,
  simulateCounterfactual,
  summarizeCounterfactual
} from "../src/core.mjs";

const result = simulateCounterfactual(deterministicSeedState(81), {
  rule: 110,
  steps: 40,
  intervention: { time: 10, index: 40, mode: "flip" }
});

console.log(JSON.stringify({
  experiment: "T2424-0026 Counterfactual Defect Worlds minimum experiment",
  model: "elementary cellular automaton with fixed-zero boundaries",
  claimBoundary: "causal intervention mechanics only; no claim that Rule 110 is a scientific world model",
  summary: summarizeCounterfactual(result),
  divergence: result.divergence
}, null, 2));
