function validateBinaryState(state) {
  if (!Array.isArray(state) || state.length < 3) {
    throw new TypeError("state must contain at least three binary cells");
  }
  state.forEach((value, index) => {
    if (value !== 0 && value !== 1) throw new TypeError(`state[${index}] must be 0 or 1`);
  });
  return state.slice();
}

function validateRule(rule) {
  if (!Number.isInteger(rule) || rule < 0 || rule > 255) {
    throw new RangeError("rule must be an integer in [0, 255]");
  }
  return rule;
}

function validateSteps(steps) {
  if (!Number.isInteger(steps) || steps < 0 || steps > 10_000) {
    throw new RangeError("steps must be an integer in [0, 10000]");
  }
  return steps;
}

export function nextCell(left, center, right, rule) {
  validateRule(rule);
  for (const [label, value] of [["left", left], ["center", center], ["right", right]]) {
    if (value !== 0 && value !== 1) throw new TypeError(`${label} must be 0 or 1`);
  }
  const neighborhood = (left << 2) | (center << 1) | right;
  return (rule >> neighborhood) & 1;
}

export function evolve(state, rule) {
  const clean = validateBinaryState(state);
  validateRule(rule);
  return clean.map((_, index) => {
    const left = index === 0 ? 0 : clean[index - 1];
    const center = clean[index];
    const right = index === clean.length - 1 ? 0 : clean[index + 1];
    return nextCell(left, center, right, rule);
  });
}

export function simulateWorld(initialState, options = {}) {
  const rule = validateRule(options.rule ?? 110);
  const steps = validateSteps(options.steps ?? 20);
  let state = validateBinaryState(initialState);
  const snapshots = [{ time: 0, state: state.slice() }];
  for (let time = 1; time <= steps; time += 1) {
    state = evolve(state, rule);
    snapshots.push({ time, state: state.slice() });
  }
  return { rule, steps, width: state.length, snapshots };
}

function validateIntervention(intervention, width, steps) {
  if (!intervention || !Number.isInteger(intervention.time) || intervention.time < 0 || intervention.time > steps) {
    throw new RangeError("intervention.time must be an integer inside the simulated time range");
  }
  if (!Number.isInteger(intervention.index) || intervention.index < 0 || intervention.index >= width) {
    throw new RangeError("intervention.index must address an existing cell");
  }
  const mode = intervention.mode ?? "flip";
  if (mode !== "flip" && mode !== "set") throw new RangeError("intervention.mode must be 'flip' or 'set'");
  if (mode === "set" && intervention.value !== 0 && intervention.value !== 1) {
    throw new TypeError("set intervention requires value 0 or 1");
  }
  return { time: intervention.time, index: intervention.index, mode, value: intervention.value };
}

function applyIntervention(state, intervention) {
  const next = state.slice();
  next[intervention.index] = intervention.mode === "flip"
    ? 1 - next[intervention.index]
    : intervention.value;
  return next;
}

export function hammingDistance(left, right) {
  const a = validateBinaryState(left);
  const b = validateBinaryState(right);
  if (a.length !== b.length) throw new RangeError("states must have equal width");
  return a.reduce((sum, value, index) => sum + (value === b[index] ? 0 : 1), 0);
}

export function simulateCounterfactual(initialState, options = {}) {
  const rule = validateRule(options.rule ?? 110);
  const steps = validateSteps(options.steps ?? 20);
  const initial = validateBinaryState(initialState);
  const intervention = validateIntervention(
    options.intervention ?? { time: 5, index: Math.floor(initial.length / 2), mode: "flip" },
    initial.length,
    steps
  );

  let baselineState = initial.slice();
  let counterfactualState = initial.slice();
  const baseline = [];
  const counterfactual = [];
  const divergence = [];

  for (let time = 0; time <= steps; time += 1) {
    if (time === intervention.time) {
      counterfactualState = applyIntervention(counterfactualState, intervention);
    }

    baseline.push({ time, state: baselineState.slice() });
    counterfactual.push({ time, state: counterfactualState.slice() });
    const differingIndices = baselineState
      .map((value, index) => value === counterfactualState[index] ? null : index)
      .filter((index) => index !== null);
    divergence.push({
      time,
      hammingDistance: differingIndices.length,
      fractionDifferent: differingIndices.length / initial.length,
      differingIndices
    });

    if (time < steps) {
      baselineState = evolve(baselineState, rule);
      counterfactualState = evolve(counterfactualState, rule);
    }
  }

  return {
    rule,
    steps,
    width: initial.length,
    intervention,
    baseline,
    counterfactual,
    divergence
  };
}

export function causalConeViolations(result) {
  if (!result || !Array.isArray(result.divergence) || !result.intervention) {
    throw new TypeError("result must come from simulateCounterfactual");
  }
  const violations = [];
  for (const row of result.divergence) {
    if (row.time < result.intervention.time) {
      if (row.differingIndices.length > 0) violations.push({ time: row.time, indices: row.differingIndices.slice() });
      continue;
    }
    const radius = row.time - result.intervention.time;
    const outside = row.differingIndices.filter(
      (index) => Math.abs(index - result.intervention.index) > radius
    );
    if (outside.length > 0) violations.push({ time: row.time, indices: outside });
  }
  return violations;
}

export function summarizeCounterfactual(result) {
  const violations = causalConeViolations(result);
  const post = result.divergence.filter((row) => row.time >= result.intervention.time);
  const peak = post.reduce((best, row) => row.hammingDistance > best.hammingDistance ? row : best, post[0]);
  const final = result.divergence.at(-1);
  return {
    rule: result.rule,
    width: result.width,
    steps: result.steps,
    intervention: result.intervention,
    peakHammingDistance: peak.hammingDistance,
    peakTime: peak.time,
    finalHammingDistance: final.hammingDistance,
    finalFractionDifferent: final.fractionDifferent,
    causalConeViolations: violations.length
  };
}

export function deterministicSeedState(width = 81) {
  if (!Number.isInteger(width) || width < 3 || width > 10_001) {
    throw new RangeError("width must be an integer in [3, 10001]");
  }
  const state = Array(width).fill(0);
  state[Math.floor(width / 2)] = 1;
  return state;
}
