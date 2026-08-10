import assert from 'node:assert/strict';
import test from 'node:test';

import {
  applyMove,
  applyMoves,
  inverseMove,
  isSolved,
  misplacedCornerLowerBound,
  MOVES,
  scramble,
  SOLVED_STATE,
  solveAstar,
} from '../portfolio/project2424/projects/T2424-0036/src/rubiksAstar.mjs';
import { BENCHMARK_SCRAMBLES, runBenchmark } from '../portfolio/project2424/projects/T2424-0036/experiment/benchmark.mjs';

test('each supported face move is exactly inverted by its prime partner', () => {
  for (const move of MOVES) {
    const moved = applyMove(SOLVED_STATE, move);
    const restored = applyMove(moved, inverseMove(move));
    assert.deepEqual(restored, SOLVED_STATE, `${move} inverse failed`);
  }
});

test('four quarter turns return each modeled face to its starting permutation', () => {
  for (const face of ['U', 'R', 'F']) {
    assert.deepEqual(applyMoves(SOLVED_STATE, [face, face, face, face]), SOLVED_STATE);
  }
});

test('admissible misplaced-corner lower bound is zero at goal and <= one for one move', () => {
  assert.equal(misplacedCornerLowerBound(SOLVED_STATE), 0);
  for (const face of ['U', 'R', 'F']) {
    assert.ok(misplacedCornerLowerBound(scramble([face])) <= 1);
  }
});

test('A* solves a three-move scramble and returned path verifies', () => {
  const state = scramble(['U', 'R', 'F']);
  const result = solveAstar(state, { maxDepth: 8, nodeBudget: 50_000 });
  assert.equal(result.status, 'solved');
  assert.ok(result.cost <= 3, `expected an optimal solution no longer than inverse scramble, got ${result.cost}`);
  assert.ok(isSolved(applyMoves(state, result.moves)));
});

test('A* benchmark solves every fixed bounded scramble', () => {
  const report = runBenchmark({ maxDepth: 12, nodeBudget: 100_000 });
  assert.equal(report.total, BENCHMARK_SCRAMBLES.length);
  assert.equal(report.solved, report.total);
  for (const row of report.cases) {
    assert.equal(row.status, 'solved');
    assert.equal(row.verified, true);
    assert.ok(Number.isInteger(row.solutionLength) && row.solutionLength >= 0);
    assert.ok(Number.isInteger(row.nodesExpanded) && row.nodesExpanded >= 0);
  }
});

test('solver fails closed when its node budget is exhausted', () => {
  const state = scramble(['U', 'R', 'F', 'U', 'R', 'F']);
  const result = solveAstar(state, { maxDepth: 12, nodeBudget: 1 });
  assert.equal(result.status, 'node_budget_exhausted');
  assert.equal(result.moves, null);
  assert.equal(result.cost, null);
});

test('invalid cube states and unsupported moves are rejected', () => {
  assert.throws(() => applyMove([0, 1, 2], 'U'), /exactly 8/);
  assert.throws(() => applyMove([0, 1, 2, 3, 4, 5, 6, 6], 'U'), /permutation/);
  assert.throws(() => applyMove(SOLVED_STATE, 'X'), /unsupported move/);
  assert.throws(() => solveAstar(SOLVED_STATE, { nodeBudget: 0 }), /positive integer/);
});
