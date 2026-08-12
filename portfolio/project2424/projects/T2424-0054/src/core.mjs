function unitInterval(value, label) {
  if (!Number.isFinite(value) || value < 0 || value > 1) throw new RangeError(`${label} must be finite and in [0, 1]`);
  return Number(value);
}

function validateCandidate(candidate, index = 0) {
  if (!candidate || typeof candidate.id !== "string" || candidate.id.trim().length === 0) throw new TypeError(`candidates[${index}].id must be non-empty`);
  if (typeof candidate.family !== "string" || candidate.family.trim().length === 0) throw new TypeError(`candidates[${index}].family must be non-empty`);
  if (!Number.isFinite(candidate.costHours) || candidate.costHours <= 0) throw new RangeError(`candidates[${index}].costHours must be finite and > 0`);
  return {
    id: candidate.id.trim(), family: candidate.family.trim(),
    expectedValue: unitInterval(candidate.expectedValue, `candidates[${index}].expectedValue`),
    uncertainty: unitInterval(candidate.uncertainty, `candidates[${index}].uncertainty`),
    novelty: unitInterval(candidate.novelty, `candidates[${index}].novelty`),
    costHours: Number(candidate.costHours), dependenciesComplete: candidate.dependenciesComplete !== false
  };
}

export function acquisitionScore(candidate, options = {}) {
  const clean = validateCandidate(candidate);
  const explorationWeight = options.explorationWeight ?? 0.7;
  const noveltyWeight = options.noveltyWeight ?? 0.35;
  const costExponent = options.costExponent ?? 0.5;
  const repeatFamilyPenalty = options.repeatFamilyPenalty ?? 0;
  const familySelections = options.familySelections ?? 0;
  [explorationWeight, noveltyWeight, costExponent, repeatFamilyPenalty].forEach((value, index) => {
    if (!Number.isFinite(value) || value < 0) throw new RangeError(["explorationWeight", "noveltyWeight", "costExponent", "repeatFamilyPenalty"][index] + " must be finite and >= 0");
  });
  if (!Number.isInteger(familySelections) || familySelections < 0) throw new RangeError("familySelections must be a non-negative integer");
  if (!clean.dependenciesComplete) return Number.NEGATIVE_INFINITY;
  const benefit = clean.expectedValue + explorationWeight * clean.uncertainty + noveltyWeight * clean.novelty;
  return benefit / (clean.costHours ** costExponent * (1 + repeatFamilyPenalty * familySelections));
}

export function rankExperiments(candidates, options = {}) {
  if (!Array.isArray(candidates) || candidates.length === 0) throw new TypeError("candidates must be non-empty");
  const clean = candidates.map(validateCandidate);
  const ids = new Set();
  for (const candidate of clean) {
    if (ids.has(candidate.id)) throw new Error(`candidate id must be unique: ${candidate.id}`);
    ids.add(candidate.id);
  }
  return clean.map((candidate) => ({ ...candidate, score: acquisitionScore(candidate, options) })).sort((left, right) => {
    if (right.score !== left.score) return right.score - left.score;
    if (left.costHours !== right.costHours) return left.costHours - right.costHours;
    return left.id.localeCompare(right.id);
  });
}

export function selectExperimentBatch(candidates, options = {}) {
  const batchSize = options.batchSize ?? 4;
  const budgetHours = options.budgetHours ?? Number.POSITIVE_INFINITY;
  const repeatFamilyPenalty = options.repeatFamilyPenalty ?? 0.6;
  if (!Number.isInteger(batchSize) || batchSize < 1) throw new RangeError("batchSize must be a positive integer");
  if (!(budgetHours > 0)) throw new RangeError("budgetHours must be > 0");
  const remaining = candidates.map(validateCandidate);
  const selected = [];
  const familyCounts = new Map();
  let usedHours = 0;
  while (selected.length < batchSize) {
    const feasible = remaining.filter((candidate) => candidate.dependenciesComplete && usedHours + candidate.costHours <= budgetHours).map((candidate) => ({
      candidate,
      score: acquisitionScore(candidate, { ...options, repeatFamilyPenalty, familySelections: familyCounts.get(candidate.family) ?? 0 })
    })).sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      if (left.candidate.costHours !== right.candidate.costHours) return left.candidate.costHours - right.candidate.costHours;
      return left.candidate.id.localeCompare(right.candidate.id);
    });
    if (feasible.length === 0) break;
    const winner = feasible[0];
    selected.push({ ...winner.candidate, score: winner.score });
    usedHours += winner.candidate.costHours;
    familyCounts.set(winner.candidate.family, (familyCounts.get(winner.candidate.family) ?? 0) + 1);
    remaining.splice(remaining.findIndex((candidate) => candidate.id === winner.candidate.id), 1);
  }
  return {
    selected,
    usedHours,
    remainingBudgetHours: Number.isFinite(budgetHours) ? budgetHours - usedHours : Number.POSITIVE_INFINITY,
    blocked: remaining.filter((candidate) => !candidate.dependenciesComplete).map((candidate) => candidate.id),
    unselected: remaining.filter((candidate) => candidate.dependenciesComplete).map((candidate) => candidate.id)
  };
}

export function updateCandidateFromEvidence(candidate, observedValue, evidenceWeight = 0.5) {
  const clean = validateCandidate(candidate);
  const observation = unitInterval(observedValue, "observedValue");
  if (!Number.isFinite(evidenceWeight) || evidenceWeight <= 0 || evidenceWeight > 1) throw new RangeError("evidenceWeight must be in (0, 1]");
  return {
    ...clean,
    expectedValue: (1 - evidenceWeight) * clean.expectedValue + evidenceWeight * observation,
    uncertainty: clean.uncertainty * (1 - 0.75 * evidenceWeight)
  };
}

export function buildDecisionLedger(candidates, options = {}) {
  return rankExperiments(candidates, options).map((candidate, index) => ({
    rank: index + 1, id: candidate.id, family: candidate.family, score: candidate.score,
    expectedValue: candidate.expectedValue, uncertainty: candidate.uncertainty,
    novelty: candidate.novelty, costHours: candidate.costHours,
    dependenciesComplete: candidate.dependenciesComplete
  }));
}
