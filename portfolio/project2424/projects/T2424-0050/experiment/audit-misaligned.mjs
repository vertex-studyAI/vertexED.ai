import { writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  evaluateField,
  linearPressureBaseline,
  meanAbsoluteError,
  solveSteadyDarcy1D,
} from '../src/core.mjs';

function mulberry32(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normal(random) {
  const u1 = Math.max(random(), 1e-12);
  const u2 = random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function correlatedField(seed, rho, cellCount = 24, sigma = 0.9) {
  const random = mulberry32((seed * 2654435761) >>> 0);
  let z = normal(random);
  const field = [];
  for (let cell = 0; cell < cellCount; cell += 1) {
    if (cell > 0) z = rho * z + Math.sqrt(1 - rho * rho) * normal(random);
    field.push(Math.exp(sigma * z));
  }
  return field;
}

function arithmeticBlockSurrogate(field, blockCount) {
  const blockSize = field.length / blockCount;
  const reconstructed = [];
  for (let block = 0; block < blockCount; block += 1) {
    const values = field.slice(block * blockSize, (block + 1) * blockSize);
    const arithmeticMean = values.reduce((sum, value) => sum + value, 0) / values.length;
    reconstructed.push(...Array(blockSize).fill(arithmeticMean));
  }
  return solveSteadyDarcy1D(reconstructed);
}

const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;
const conditions = [];

for (const rho of [0, 0.5, 0.9]) {
  const rows = [];
  for (let seed = 1; seed <= 100; seed += 1) {
    const field = correlatedField(seed, rho);
    const exact = solveSteadyDarcy1D(field);
    const linear = linearPressureBaseline(field.length);
    const harmonic = evaluateField(field, { blockCount: 6 });
    const arithmetic = arithmeticBlockSurrogate(field, 6);
    const linearMae = meanAbsoluteError(exact.pressure, linear.pressure);
    const arithmeticMae = meanAbsoluteError(exact.pressure, arithmetic.pressure);
    rows.push({
      seed,
      linearMae,
      harmonicMae: harmonic.latentMae,
      arithmeticMae,
      harmonicImprovement: (linearMae - harmonic.latentMae) / linearMae,
      arithmeticImprovement: (linearMae - arithmeticMae) / linearMae,
      harmonicFluxRelativeError: harmonic.fluxRelativeError,
    });
  }
  const worst = rows.reduce((current, row) => row.harmonicImprovement < current.harmonicImprovement ? row : current);
  conditions.push({
    rho,
    seeds: rows.length,
    meanLinearMae: mean(rows.map((row) => row.linearMae)),
    meanHarmonicMae: mean(rows.map((row) => row.harmonicMae)),
    meanArithmeticMae: mean(rows.map((row) => row.arithmeticMae)),
    meanHarmonicImprovement: mean(rows.map((row) => row.harmonicImprovement)),
    meanArithmeticImprovement: mean(rows.map((row) => row.arithmeticImprovement)),
    harmonicBeatsLinear: rows.filter((row) => row.harmonicMae < row.linearMae).length,
    harmonicBeatsArithmetic: rows.filter((row) => row.harmonicMae < row.arithmeticMae).length,
    arithmeticBeatsLinear: rows.filter((row) => row.arithmeticMae < row.linearMae).length,
    meanHarmonicFluxRelativeError: mean(rows.map((row) => row.harmonicFluxRelativeError)),
    maxHarmonicMae: Math.max(...rows.map((row) => row.harmonicMae)),
    worstHarmonicCase: worst,
  });
}

const output = {
  project: 'T2424-0050',
  audit: 'misaligned-correlated-field-and-arithmetic-ablation',
  generatedAt: '2026-08-22',
  environment: { runtime: process.version, platform: process.platform, arch: process.arch },
  configuration: {
    cellCount: 24,
    blockCount: 6,
    seedsPerCondition: 100,
    logPermeabilitySigma: 0.9,
    rhoValues: [0, 0.5, 0.9],
    baseline: 'linear pressure ignoring heterogeneity',
    ablation: 'arithmetic-mean block permeability',
    candidate: 'harmonic-mean block permeability',
  },
  conditions,
  interpretation: {
    boundedMechanismReproduced: true,
    harderAuditMixed: true,
    iidMeanImprovementClearsOriginal65PercentThreshold: conditions[0].meanHarmonicImprovement >= 0.65,
    claimBoundary: 'synthetic 1D robustness audit only; no learned operator, 2D/3D PDE, real porous-media, or publication claim',
  },
};

const here = dirname(fileURLToPath(import.meta.url));
await writeFile(resolve(here, '../results/misaligned-audit.json'), `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(output, null, 2));
