import { buildDecisionLedger, selectExperimentBatch } from "../src/core.mjs";

const candidates = [
  { id: "pi-jepa-ablation", family: "predictive-architectures", expectedValue: 0.78, uncertainty: 0.62, novelty: 0.82, costHours: 6 },
  { id: "eigen-jepa-spectrum", family: "predictive-architectures", expectedValue: 0.7, uncertainty: 0.7, novelty: 0.86, costHours: 7 },
  { id: "residual-token-real-data", family: "compression", expectedValue: 0.66, uncertainty: 0.42, novelty: 0.58, costHours: 2 },
  { id: "quant-walkforward-real-data", family: "finance", expectedValue: 0.64, uncertainty: 0.5, novelty: 0.45, costHours: 3 },
  { id: "nlp-cad-kernel-check", family: "cad", expectedValue: 0.72, uncertainty: 0.35, novelty: 0.6, costHours: 4 },
  { id: "large-training-run", family: "predictive-architectures", expectedValue: 0.85, uncertainty: 0.7, novelty: 0.8, costHours: 40, dependenciesComplete: false }
];
const options = { explorationWeight: 0.7, noveltyWeight: 0.35, costExponent: 0.5, repeatFamilyPenalty: 0.7 };
console.log(JSON.stringify({
  experiment: "T2424-0054 Theory-Manifold Experiment Planner minimum decision run",
  claimBoundary: "illustrative deterministic candidate scores; not evidence that listed research hypotheses are correct",
  ledger: buildDecisionLedger(candidates, options),
  batch: selectExperimentBatch(candidates, { ...options, batchSize: 3, budgetHours: 10 })
}, null, 2));
