import {
  analyzeGrokking,
  generateMatchedControlCurve,
  generateSyntheticCurve
} from "../src/core.mjs";

const delayed = analyzeGrokking(generateSyntheticCurve());
const control = analyzeGrokking(generateMatchedControlCurve());

console.log(JSON.stringify({
  experiment: "T2424-0035 Grokking Agent minimum detector experiment",
  claimBoundary: "deterministic synthetic learning-curve classification only; no claim about a trained neural network",
  delayed: {
    verdict: delayed.verdict,
    memorizationStep: delayed.memorizationStep,
    generalizationStep: delayed.generalizationStep,
    delaySteps: delayed.delaySteps,
    evalAtMemorization: delayed.evalAtMemorization
  },
  matchedControl: {
    verdict: control.verdict,
    memorizationStep: control.memorizationStep,
    generalizationStep: control.generalizationStep,
    delaySteps: control.delaySteps,
    evalAtMemorization: control.evalAtMemorization
  }
}, null, 2));
