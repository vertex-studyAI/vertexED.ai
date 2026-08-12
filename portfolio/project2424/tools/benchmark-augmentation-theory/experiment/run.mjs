import { runBenchmarkAugmentationScreen } from '../src/core.mjs';

const screen = runBenchmarkAugmentationScreen({ size: 100 });
const verdict =
  screen.baseAccuracyGap <= 0.01 &&
  screen.shortcutBreakingGap >= 0.90 &&
  screen.neutralGap <= 0.01
    ? 'PASS_SHORTCUT_EXPOSURE_SCREEN'
    : 'FAIL_OR_INCONCLUSIVE';

console.log(JSON.stringify({
  project: 'AUX-P2424-BENCHMARK-AUGMENTATION',
  name: 'Benchmark Augmentation Theory',
  claimBoundary: 'controlled synthetic ranking-audit mechanism only; no benchmark-validity theorem or real-model claim',
  predeclaredGate: {
    baseAccuracyGapAtMost: 0.01,
    shortcutBreakingGapAtLeast: 0.90,
    neutralGapAtMost: 0.01,
  },
  screen,
  verdict,
}, null, 2));
