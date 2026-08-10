function assertFiniteNonNegative(value, name) {
  if (!Number.isFinite(value) || value < 0) {
    throw new TypeError(`${name} must be a finite non-negative number`);
  }
}

function normalizeExperts(experts) {
  if (!Array.isArray(experts) || experts.length === 0) {
    throw new TypeError('experts must be a non-empty array');
  }

  const ids = new Set();
  return experts.map((expert, index) => {
    if (!expert || typeof expert.id !== 'string' || expert.id.trim() === '') {
      throw new TypeError(`expert ${index} must have a non-empty string id`);
    }
    if (ids.has(expert.id)) throw new TypeError(`duplicate expert id: ${expert.id}`);
    ids.add(expert.id);
    assertFiniteNonNegative(expert.cost, `expert ${expert.id} cost`);
    if (expert.cost === 0) throw new TypeError(`expert ${expert.id} cost must be greater than zero`);
    if (typeof expert.predict !== 'function') {
      throw new TypeError(`expert ${expert.id} must provide predict(sample)`);
    }
    return { ...expert };
  });
}

export function softmax(values) {
  if (!Array.isArray(values) || values.length === 0) {
    throw new TypeError('softmax values must be a non-empty array');
  }
  if (values.some((value) => !Number.isFinite(value))) {
    throw new TypeError('softmax values must be finite numbers');
  }

  const max = Math.max(...values);
  const exp = values.map((value) => Math.exp(value - max));
  const denom = exp.reduce((sum, value) => sum + value, 0);
  return exp.map((value) => value / denom);
}

/**
 * Select experts under a hard per-sample cost budget.
 *
 * Candidates are ranked by score-per-cost. Ties prefer the higher raw score,
 * then lower cost, then stable expert order. This keeps the rule deterministic
 * while explicitly rewarding useful predictions per unit of resource.
 */
export function routeExperts({ scores, experts, budget, topK = 2 }) {
  const normalizedExperts = normalizeExperts(experts);
  assertFiniteNonNegative(budget, 'budget');
  if (!Number.isInteger(topK) || topK < 1) {
    throw new TypeError('topK must be a positive integer');
  }
  if (!Array.isArray(scores) || scores.length !== normalizedExperts.length) {
    throw new TypeError('scores must contain one finite score per expert');
  }
  if (scores.some((score) => !Number.isFinite(score))) {
    throw new TypeError('scores must contain only finite numbers');
  }

  const candidates = normalizedExperts
    .map((expert, index) => ({
      expert,
      index,
      score: scores[index],
      utility: scores[index] / expert.cost,
    }))
    .sort((a, b) =>
      b.utility - a.utility ||
      b.score - a.score ||
      a.expert.cost - b.expert.cost ||
      a.index - b.index,
    );

  const selected = [];
  let cost = 0;
  for (const candidate of candidates) {
    if (selected.length >= topK) break;
    if (cost + candidate.expert.cost <= budget) {
      selected.push(candidate);
      cost += candidate.expert.cost;
    }
  }

  if (selected.length === 0) {
    const cheapestFeasible = normalizedExperts
      .map((expert, index) => ({ expert, index, score: scores[index] }))
      .filter(({ expert }) => expert.cost <= budget)
      .sort((a, b) => a.expert.cost - b.expert.cost || b.score - a.score || a.index - b.index)[0];

    if (!cheapestFeasible) {
      return { selected: [], cost: 0, exhausted: true };
    }
    selected.push({ ...cheapestFeasible, utility: cheapestFeasible.score / cheapestFeasible.expert.cost });
    cost = cheapestFeasible.expert.cost;
  }

  return {
    selected: selected.map(({ expert, index, score, utility }) => ({
      id: expert.id,
      index,
      score,
      utility,
      cost: expert.cost,
    })),
    cost,
    exhausted: false,
  };
}

/**
 * Execute a deterministic resource-bounded mixture of scalar experts.
 * The router supplies one score per expert for each sample. Selected expert
 * predictions are combined with a softmax over the selected raw router scores.
 */
export function executeResourceBoundedMoe({ sample, experts, router, budget, topK = 2 }) {
  const normalizedExperts = normalizeExperts(experts);
  if (typeof router !== 'function') throw new TypeError('router must be a function');

  const scores = router(sample, normalizedExperts);
  const routed = routeExperts({ scores, experts: normalizedExperts, budget, topK });
  if (routed.exhausted) {
    return {
      prediction: null,
      selectedExperts: [],
      weights: [],
      cost: 0,
      exhausted: true,
    };
  }

  const weights = softmax(routed.selected.map(({ score }) => score));
  const predictions = routed.selected.map(({ index }) => {
    const value = normalizedExperts[index].predict(sample);
    if (!Number.isFinite(value)) {
      throw new TypeError(`expert ${normalizedExperts[index].id} returned a non-finite prediction`);
    }
    return value;
  });

  const prediction = predictions.reduce((sum, value, index) => sum + value * weights[index], 0);

  return {
    prediction,
    selectedExperts: routed.selected.map(({ id }) => id),
    weights,
    cost: routed.cost,
    exhausted: false,
  };
}
