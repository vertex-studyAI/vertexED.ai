import fs from 'node:fs';

function usage() {
  console.error('Usage: node report.mjs <result.json> [--out report.md]');
  process.exit(2);
}

function finite(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new TypeError(`${label} must be finite`);
  return number;
}

const args = process.argv.slice(2);
if (args.length < 1) usage();
const inputPath = args[0];
let outPath = null;
for (let i = 1; i < args.length; i += 1) {
  if (args[i] === '--out' && i + 1 < args.length) {
    outPath = args[++i];
  } else {
    usage();
  }
}

const result = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
if (result.project !== 'T2424-0049') throw new Error('result.project must be T2424-0049');
if (!result.heldOut || !result.zeroDynamics || !result.gates) throw new Error('missing required result sections');

const coefficient = finite(result.coefficient, 'coefficient');
const baselineRmse = finite(result.heldOut.baselineRmse, 'heldOut.baselineRmse');
const predictorRmse = finite(result.heldOut.predictorRmse, 'heldOut.predictorRmse');
const relativeImprovement = finite(result.heldOut.relativeImprovement, 'heldOut.relativeImprovement');
const maxMassDrift = finite(result.maxMassDrift, 'maxMassDrift');
const zeroCoefficient = finite(result.zeroDynamics.coefficient, 'zeroDynamics.coefficient');
const zeroPredictorRmse = finite(result.zeroDynamics.predictorRmse, 'zeroDynamics.predictorRmse');

const gateRows = Object.entries(result.gates).map(([name, passed]) =>
  `| ${name} | ${passed === true ? 'PASS' : 'FAIL'} |`
).join('\n');

const protocol = result.protocol ?? {};
const md = `# T2424-0049 — Machine-Generated Minimum-Experiment Report

> Generated from \`${inputPath}\`. Do not hand-edit scientific values in this report; regenerate it from machine output.

## Claim boundary

${result.claimBoundary ?? 'No claim boundary recorded.'}

## Protocol

- grid cells: ${protocol.gridCells ?? 'unknown'}
- latent cells: ${protocol.latentCells ?? 'unknown'}
- training phases: ${JSON.stringify(protocol.trainPhases ?? [])}
- held-out phases: ${JSON.stringify(protocol.heldOutPhases ?? [])}
- dynamic alpha: ${protocol.dynamicAlpha ?? 'unknown'}
- baseline: ${protocol.baseline ?? 'unknown'}
- predictor: ${protocol.predictor ?? 'unknown'}

## Held-out metrics

| Metric | Value |
|---|---:|
| learned coefficient | ${coefficient} |
| persistence RMSE | ${baselineRmse} |
| predictor RMSE | ${predictorRmse} |
| relative improvement | ${(100 * relativeImprovement).toFixed(6)}% |
| maximum mass drift | ${maxMassDrift} |

## Zero-dynamics negative control

| Metric | Value |
|---|---:|
| learned coefficient | ${zeroCoefficient} |
| predictor RMSE | ${zeroPredictorRmse} |
| relative improvement | ${(100 * finite(result.zeroDynamics.relativeImprovement, 'zeroDynamics.relativeImprovement')).toFixed(6)}% |

## Predeclared gates

| Gate | Result |
|---|---|
${gateRows}

## Frozen-screen verdict

**${result.verdict ?? 'UNKNOWN'}**

This verdict applies only to the bounded deterministic synthetic screen. It is not a claim of porous-media realism, trained-JEPA superiority, real-data generalization, novelty, or publication readiness.
`;

if (outPath) {
  fs.writeFileSync(outPath, md, 'utf8');
} else {
  process.stdout.write(md);
}
