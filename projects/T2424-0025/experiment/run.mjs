import { runNonGaussianMemoryBenchmark } from '../src/core.mjs';

const benchmark = runNonGaussianMemoryBenchmark({ seeds: 30 });
const verdict =
  benchmark.heavyTail.relativeImprovement > 0.80 &&
  benchmark.cleanControl.robustMae <= benchmark.cleanControl.baselineMae * 1.10 &&
  benchmark.nonGaussianAdvantageGap > 0.30
    ? 'PASS_HEAVY_TAIL_MEMORY_SCREEN'
    : 'FAIL_OR_INCONCLUSIVE';

console.log(JSON.stringify({
  project: 'T2424-0025',
  name: 'Non-Gaussian Memory Transformer',
  claimBoundary: 'robust memory-aggregation mechanism only; no transformer architecture or general memory superiority claim',
  predeclaredGate: {
    heavyTailRelativeImprovementGreaterThan: 0.80,
    cleanControlRobustMaeAtMostBaselineMultiple: 1.10,
    nonGaussianAdvantageGapGreaterThan: 0.30,
  },
  benchmark,
  verdict,
}, null, 2));
