import { writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { runBenchmark } from '../src/core.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const result = runBenchmark({ seeds: 20, cellCount: 24, blockCount: 6 });
const verdict = Object.values(result.predeclaredScreen).every(Boolean)
  ? 'PASS_BOUNDED_DARCY_LATENT_SCREEN'
  : 'NEGATIVE_OR_INCONCLUSIVE_AGAINST_PREDECLARED_SCREEN';
const output = {
  project: 'T2424-0050',
  name: 'Darcy Latent Operator',
  equation: 'steady 1D Darcy flow with heterogeneous positive permeability and fixed Dirichlet pressures',
  ...result,
  verdict,
  claimBoundary: 'deterministic 1D reduced-resistance surrogate only; no learned neural operator, multidimensional PDE, real porous-media, or publication claim',
};
await writeFile(resolve(here, '../results/reference.json'), `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(output, null, 2));
