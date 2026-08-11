import {
  buildSyntheticBlindSpotFixture,
  evaluateBlindSpotBenchmark,
} from '../src/core.mjs';

const result = evaluateBlindSpotBenchmark(buildSyntheticBlindSpotFixture(), {
  highConfidence: 0.8,
});

console.log(JSON.stringify(result, null, 2));
