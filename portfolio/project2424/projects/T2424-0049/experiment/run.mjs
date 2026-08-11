import { runPorousJepaExperiment } from '../src/core.mjs';

const result = runPorousJepaExperiment();
console.log(JSON.stringify(result, null, 2));

if (result.verdict !== 'PASS_SYNTHETIC_LATENT_PREDICTION_SCREEN') {
  process.exitCode = 1;
}
