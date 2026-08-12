import {
  causalConeViolations,
  deterministicSeedState,
  simulateCounterfactual,
  summarizeCounterfactual
} from "../src/core.mjs";

const result = simulateCounterfactual(deterministicSeedState(81), {
  rule: 110,
  steps: 40,
  intervention: { time: 10, index: 40, mode: "flip" }
});

const preInterventionDivergence = result.divergence
  .filter((row) => row.time < result.intervention.time)
  .reduce((sum, row) => sum + row.hammingDistance, 0);

console.log(JSON.stringify({
  project: "T2424-0026",
  experiment: "Counterfactual Defect Worlds frozen minimum experiment",
  model: "elementary cellular automaton with fixed-zero boundaries",
  claimBoundary: "causal intervention mechanics only; no physical or learned-world-model claim",
  protocol: {
    rule: 110,
    width: 81,
    steps: 40,
    intervention: result.intervention,
    successThreshold: "0 causal-cone violations and 0 pre-intervention divergence"
  },
  result: {
    summary: summarizeCounterfactual(result),
    preInterventionDivergence,
    causalConeViolations: causalConeViolations(result)
  },
  verdict: preInterventionDivergence === 0 && causalConeViolations(result).length === 0 ? "GO" : "STOP"
}, null, 2));
