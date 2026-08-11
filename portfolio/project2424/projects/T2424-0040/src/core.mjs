function assertFinite(value, field) {
  if (!Number.isFinite(value)) throw new Error(`${field} must be finite`);
}

export function validateLearningGraph(nodes) {
  if (!Array.isArray(nodes) || nodes.length === 0) {
    throw new Error('nodes must be a non-empty array');
  }

  const byId = new Map();
  for (const raw of nodes) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      throw new Error('each node must be an object');
    }
    const id = typeof raw.id === 'string' ? raw.id.trim() : '';
    if (!id) throw new Error('node.id must be non-empty');
    if (byId.has(id)) throw new Error(`duplicate node id: ${id}`);
    if (!Array.isArray(raw.prerequisites)) {
      throw new Error(`node ${id}.prerequisites must be an array`);
    }
    assertFinite(raw.utility, `node ${id}.utility`);
    assertFinite(raw.difficulty, `node ${id}.difficulty`);
    if (raw.utility <= 0) throw new Error(`node ${id}.utility must be > 0`);
    if (raw.difficulty <= 0) throw new Error(`node ${id}.difficulty must be > 0`);

    const prerequisites = raw.prerequisites.map((value) => {
      if (typeof value !== 'string' || !value.trim()) {
        throw new Error(`node ${id} has invalid prerequisite`);
      }
      return value.trim();
    });
    if (new Set(prerequisites).size !== prerequisites.length) {
      throw new Error(`node ${id} has duplicate prerequisites`);
    }
    if (prerequisites.includes(id)) throw new Error(`node ${id} cannot require itself`);

    byId.set(id, {
      id,
      prerequisites,
      utility: raw.utility,
      difficulty: raw.difficulty,
    });
  }

  for (const node of byId.values()) {
    for (const prerequisite of node.prerequisites) {
      if (!byId.has(prerequisite)) {
        throw new Error(`node ${node.id} references missing prerequisite ${prerequisite}`);
      }
    }
  }

  const visiting = new Set();
  const visited = new Set();
  function visit(id) {
    if (visiting.has(id)) throw new Error(`learning graph contains a cycle involving ${id}`);
    if (visited.has(id)) return;
    visiting.add(id);
    for (const prerequisite of byId.get(id).prerequisites) visit(prerequisite);
    visiting.delete(id);
    visited.add(id);
  }
  for (const id of byId.keys()) visit(id);

  return [...byId.values()];
}

function masteryValue(mastery, id) {
  const value = mastery?.[id] ?? 0;
  assertFinite(value, `mastery.${id}`);
  if (value < 0 || value > 1) throw new Error(`mastery.${id} must be within [0, 1]`);
  return value;
}

function validateThreshold(threshold) {
  assertFinite(threshold, 'threshold');
  if (threshold <= 0 || threshold > 1) throw new Error('threshold must be within (0, 1]');
}

function sortPrerequisiteAwareCandidates(candidates, mastery) {
  return [...candidates].sort((a, b) => {
    const scoreA = ((1 - masteryValue(mastery, a.id)) * a.utility) / a.difficulty;
    const scoreB = ((1 - masteryValue(mastery, b.id)) * b.utility) / b.difficulty;
    if (scoreB !== scoreA) return scoreB - scoreA;
    if (b.utility !== a.utility) return b.utility - a.utility;
    return a.id.localeCompare(b.id);
  });
}

export function unmetPrerequisites(node, mastery, threshold = 0.8) {
  validateThreshold(threshold);
  return node.prerequisites.filter((id) => masteryValue(mastery, id) < threshold);
}

export function recommendPrerequisiteAware(nodesInput, mastery = {}, threshold = 0.8) {
  const nodes = validateLearningGraph(nodesInput);
  validateThreshold(threshold);
  const incomplete = nodes.filter((node) => masteryValue(mastery, node.id) < threshold);
  const eligible = incomplete.filter(
    (node) => unmetPrerequisites(node, mastery, threshold).length === 0,
  );
  return sortPrerequisiteAwareCandidates(eligible, mastery)[0] ?? null;
}

export function recommendUtilityOnly(nodesInput, mastery = {}, threshold = 0.8) {
  const nodes = validateLearningGraph(nodesInput);
  validateThreshold(threshold);
  const incomplete = nodes.filter((node) => masteryValue(mastery, node.id) < threshold);
  return [...incomplete].sort(
    (a, b) => b.utility - a.utility || a.id.localeCompare(b.id),
  )[0] ?? null;
}

export function simulatePolicy(
  nodesInput,
  {
    policy = 'prerequisite-aware',
    initialMastery = {},
    threshold = 0.8,
    steps,
  } = {},
) {
  const nodes = validateLearningGraph(nodesInput);
  validateThreshold(threshold);
  const totalSteps = steps ?? nodes.length;
  if (!Number.isInteger(totalSteps) || totalSteps < 0) {
    throw new Error('steps must be a non-negative integer');
  }

  const mastery = Object.fromEntries(
    nodes.map((node) => [node.id, masteryValue(initialMastery, node.id)]),
  );
  const selections = [];
  let violatingSelections = 0;
  let unmetPrerequisiteEdges = 0;

  for (let step = 0; step < totalSteps; step += 1) {
    let selected;
    if (policy === 'prerequisite-aware') {
      selected = recommendPrerequisiteAware(nodes, mastery, threshold);
    } else if (policy === 'utility-only') {
      selected = recommendUtilityOnly(nodes, mastery, threshold);
    } else {
      throw new Error(`unsupported policy: ${policy}`);
    }

    if (!selected) break;
    const unmet = unmetPrerequisites(selected, mastery, threshold);
    if (unmet.length > 0) violatingSelections += 1;
    unmetPrerequisiteEdges += unmet.length;
    mastery[selected.id] = 1;
    selections.push({
      step: step + 1,
      conceptId: selected.id,
      unmetPrerequisites: unmet,
    });
  }

  const completedConcepts = nodes.filter(
    (node) => mastery[node.id] >= threshold,
  ).length;

  return {
    policy,
    threshold,
    stepsRequested: totalSteps,
    selections,
    violatingSelections,
    unmetPrerequisiteEdges,
    completedConcepts,
    finalMastery: mastery,
  };
}
