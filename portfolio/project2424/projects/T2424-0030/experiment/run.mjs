import { runSyntheticGeometryBenchmark } from '../src/core.mjs';

const benchmark = runSyntheticGeometryBenchmark({ seeds: 20 });

console.log(JSON.stringify({
  project: 'T2424-0030',
  name: 'Adaptive Theory Geometry in World Models',
  claimBoundary: 'synthetic local-geometry forecasting mechanism only; no general world-model or scientific superiority claim',
  predeclaredGate: {
    curvedRelativeImprovementGreaterThan: 0.85,
    straightControlAbsoluteImprovementLessThan: 0.01,
  },
  benchmark,
  verdict:
    benchmark.curved.relativeImprovement > 0.85 &&
    Math.abs(benchmark.straightControl.relativeImprovement) < 0.01
      ? 'PASS_CHEAP_GEOMETRY_SCREEN'
      : 'FAIL_OR_INCONCLUSIVE',
}, null, 2));
