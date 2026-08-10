export const SOLVED_STATE = Object.freeze([0, 1, 2, 3, 4, 5, 6, 7]);

// Corner positions: URF, UFL, ULB, UBR, DFR, DLF, DBL, DRB.
// This prototype models corner permutation only; cubie orientation is deliberately omitted.
const BASE_CYCLES = Object.freeze({
  U: Object.freeze([0, 3, 2, 1]),
  R: Object.freeze([0, 3, 7, 4]),
  F: Object.freeze([0, 4, 5, 1]),
});

export const MOVES = Object.freeze(['U', "U'", 'R', "R'", 'F', "F'"]);

function validateState(state) {
  if (!Array.isArray(state) || state.length !== 8) {
    throw new TypeError('state must contain exactly 8 corner cubie ids');
  }
  if (!state.every(Number.isInteger)) throw new TypeError('state entries must be integers');
  const sorted = [...state].sort((a, b) => a - b);
  if (sorted.some((value, index) => value !== index)) {
    throw new TypeError('state must be a permutation of corner ids 0..7');
  }
}

export function inverseMove(move) {
  if (!MOVES.includes(move)) throw new TypeError(`unsupported move: ${move}`);
  return move.endsWith("'") ? move[0] : `${move}'`;
}

function applyCycle(state, cycle, inverse = false) {
  const next = [...state];
  const direction = inverse ? -1 : 1;
  for (let i = 0; i < cycle.length; i += 1) {
    const source = cycle[i];
    const destination = cycle[(i + direction + cycle.length) % cycle.length];
    next[destination] = state[source];
  }
  return next;
}

export function applyMove(state, move) {
  validateState(state);
  if (!MOVES.includes(move)) throw new TypeError(`unsupported move: ${move}`);
  const face = move[0];
  return applyCycle(state, BASE_CYCLES[face], move.endsWith("'"));
}

export function applyMoves(state, moves) {
  validateState(state);
  if (!Array.isArray(moves)) throw new TypeError('moves must be an array');
  return moves.reduce((current, move) => applyMove(current, move), [...state]);
}

export function isSolved(state) {
  validateState(state);
  return state.every((cubie, index) => cubie === index);
}

export function stateKey(state) {
  validateState(state);
  return state.join(',');
}

/**
 * Admissible lower bound: a quarter-turn moves at most four corner positions,
 * so ceil(misplaced/4) cannot overestimate the number of remaining moves.
 */
export function misplacedCornerLowerBound(state) {
  validateState(state);
  const misplaced = state.reduce((count, cubie, index) => count + Number(cubie !== index), 0);
  return Math.ceil(misplaced / 4);
}

class MinHeap {
  constructor(compare) {
    this.items = [];
    this.compare = compare;
  }

  get size() {
    return this.items.length;
  }

  push(value) {
    this.items.push(value);
    let index = this.items.length - 1;
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.compare(this.items[parent], this.items[index]) <= 0) break;
      [this.items[parent], this.items[index]] = [this.items[index], this.items[parent]];
      index = parent;
    }
  }

  pop() {
    if (this.items.length === 0) return null;
    const root = this.items[0];
    const last = this.items.pop();
    if (this.items.length > 0) {
      this.items[0] = last;
      let index = 0;
      for (;;) {
        const left = index * 2 + 1;
        const right = left + 1;
        let smallest = index;
        if (left < this.items.length && this.compare(this.items[left], this.items[smallest]) < 0) smallest = left;
        if (right < this.items.length && this.compare(this.items[right], this.items[smallest]) < 0) smallest = right;
        if (smallest === index) break;
        [this.items[index], this.items[smallest]] = [this.items[smallest], this.items[index]];
        index = smallest;
      }
    }
    return root;
  }
}

export function solveAstar(
  startState,
  {
    maxDepth = 12,
    nodeBudget = 100_000,
    heuristic = misplacedCornerLowerBound,
  } = {},
) {
  validateState(startState);
  if (!Number.isInteger(maxDepth) || maxDepth < 0) throw new TypeError('maxDepth must be a non-negative integer');
  if (!Number.isInteger(nodeBudget) || nodeBudget < 1) throw new TypeError('nodeBudget must be a positive integer');
  if (typeof heuristic !== 'function') throw new TypeError('heuristic must be a function');

  if (isSolved(startState)) {
    return { status: 'solved', moves: [], cost: 0, nodesExpanded: 0 };
  }

  let sequence = 0;
  const frontier = new MinHeap((a, b) => a.f - b.f || a.h - b.h || a.sequence - b.sequence);
  const bestG = new Map();
  const startH = heuristic(startState);
  frontier.push({ state: [...startState], moves: [], g: 0, h: startH, f: startH, lastMove: null, sequence: sequence++ });
  bestG.set(stateKey(startState), 0);

  let nodesExpanded = 0;
  let depthPruned = false;

  while (frontier.size > 0) {
    if (nodesExpanded >= nodeBudget) {
      return { status: 'node_budget_exhausted', moves: null, cost: null, nodesExpanded };
    }

    const current = frontier.pop();
    const currentKey = stateKey(current.state);
    if (current.g !== bestG.get(currentKey)) continue;
    nodesExpanded += 1;

    if (current.g >= maxDepth) {
      depthPruned = true;
      continue;
    }

    for (const move of MOVES) {
      if (current.lastMove && move === inverseMove(current.lastMove)) continue;
      const nextState = applyMove(current.state, move);
      const nextG = current.g + 1;
      const key = stateKey(nextState);
      if (bestG.has(key) && bestG.get(key) <= nextG) continue;

      const nextMoves = [...current.moves, move];
      if (isSolved(nextState)) {
        return { status: 'solved', moves: nextMoves, cost: nextG, nodesExpanded };
      }

      const h = heuristic(nextState);
      bestG.set(key, nextG);
      frontier.push({
        state: nextState,
        moves: nextMoves,
        g: nextG,
        h,
        f: nextG + h,
        lastMove: move,
        sequence: sequence++,
      });
    }
  }

  return {
    status: depthPruned ? 'max_depth_exhausted' : 'unsolved',
    moves: null,
    cost: null,
    nodesExpanded,
  };
}

export function scramble(moves) {
  return applyMoves(SOLVED_STATE, moves);
}
