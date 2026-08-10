import { applyMoves, scramble, solveAstar, SOLVED_STATE } from '../src/rubiksAstar.mjs';

export const BENCHMARK_SCRAMBLES = Object.freeze([
  ['U'],
  ['R', 'F'],
  ['U', 'R', 'F'],
  ['F', 'U', 'R', "F'"],
  ['R', 'U', 'F', "R'", 'U'],
  ['U', 'R', 'F', 'U', "R'", "F'"],
]);

export function runBenchmark({ nodeBudget = 100_000, maxDepth = 12 } = {}) {
  const cases = BENCHMARK_SCRAMBLES.map((moves, index) => {
    const state = scramble(moves);
    const result = solveAstar(state, { nodeBudget, maxDepth });
    const verified = result.status === 'solved'
      ? applyMoves(state, result.moves).every((cubie, position) => cubie === SOLVED_STATE[position])
      : false;
    return {
      id: `scramble-${index + 1}`,
      scramble: moves,
      scrambleLength: moves.length,
      status: result.status,
      solutionLength: result.cost,
      nodesExpanded: result.nodesExpanded,
      solution: result.moves,
      verified,
    };
  });

  return {
    model: '2x2 corner permutation only; corner orientation intentionally omitted',
    moveSet: ['U', "U'", 'R', "R'", 'F', "F'"],
    heuristic: 'ceil(misplaced corners / 4)',
    nodeBudget,
    maxDepth,
    cases,
    solved: cases.filter(({ verified }) => verified).length,
    total: cases.length,
    claimBoundary: 'search-engine/tool benchmark only; not a full Rubik cube solver or intelligence benchmark',
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify(runBenchmark(), null, 2));
}
