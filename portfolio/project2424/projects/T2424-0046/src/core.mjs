const ALLOWED_PRIORITIES = new Set(['P0', 'P1', 'P2', 'P3']);
const PRIORITY_ORDER = { P0: 0, P1: 1, P2: 2, P3: 3 };

function text(value, label) {
  const normalized = String(value ?? '').trim();
  if (!normalized) throw new TypeError(`${label} is required`);
  return normalized;
}

function positiveNumber(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) throw new RangeError(`${label} must be > 0`);
  return number;
}

function stringArray(value, label) {
  if (!Array.isArray(value)) throw new TypeError(`${label} must be an array`);
  return value.map((entry, index) => text(entry, `${label}[${index}]`));
}

export function validateExperimentManifest(manifest) {
  if (!manifest || typeof manifest !== 'object') throw new TypeError('manifest must be an object');
  const priority = String(manifest.priority ?? 'P2').trim().toUpperCase();
  if (!ALLOWED_PRIORITIES.has(priority)) throw new RangeError('priority must be P0, P1, P2, or P3');
  const dependencies = [...new Set(stringArray(manifest.dependencies ?? [], 'dependencies'))].sort();
  const expectedArtifacts = [...new Set(stringArray(manifest.expectedArtifacts ?? [], 'expectedArtifacts'))].sort();
  if (expectedArtifacts.length === 0) throw new TypeError('expectedArtifacts must contain at least one path');
  return {
    id: text(manifest.id, 'id'),
    project: text(manifest.project, 'project'),
    claim: text(manifest.claim, 'claim'),
    command: text(manifest.command, 'command'),
    priority,
    dependencies,
    expectedArtifacts,
    estimatedCpuMinutes: positiveNumber(manifest.estimatedCpuMinutes ?? 1, 'estimatedCpuMinutes'),
  };
}

export function compileDependencyWaves(manifests) {
  if (!Array.isArray(manifests) || manifests.length === 0) {
    throw new TypeError('manifests must be a non-empty array');
  }
  const normalized = manifests.map(validateExperimentManifest);
  const byId = new Map();
  for (const manifest of normalized) {
    if (byId.has(manifest.id)) throw new Error(`duplicate manifest id: ${manifest.id}`);
    byId.set(manifest.id, manifest);
  }
  for (const manifest of normalized) {
    for (const dependency of manifest.dependencies) {
      if (!byId.has(dependency)) throw new Error(`${manifest.id} depends on missing manifest ${dependency}`);
      if (dependency === manifest.id) throw new Error(`${manifest.id} cannot depend on itself`);
    }
  }

  const completed = new Set();
  const remaining = new Map(byId);
  const waves = [];

  while (remaining.size > 0) {
    const ready = [...remaining.values()]
      .filter((manifest) => manifest.dependencies.every((dependency) => completed.has(dependency)))
      .sort((left, right) =>
        PRIORITY_ORDER[left.priority] - PRIORITY_ORDER[right.priority] || left.id.localeCompare(right.id));

    if (ready.length === 0) {
      throw new Error(`dependency cycle detected among: ${[...remaining.keys()].sort().join(', ')}`);
    }

    waves.push(ready);
    for (const manifest of ready) {
      remaining.delete(manifest.id);
      completed.add(manifest.id);
    }
  }

  return waves;
}

export function flattenPlan(waves) {
  if (!Array.isArray(waves)) throw new TypeError('waves must be an array');
  return waves.flatMap((wave, waveIndex) => wave.map((manifest) => ({ ...manifest, wave: waveIndex + 1 })));
}

export function selectWithinCpuBudget(manifests, cpuMinuteBudget) {
  const budget = positiveNumber(cpuMinuteBudget, 'cpuMinuteBudget');
  const plan = flattenPlan(compileDependencyWaves(manifests));
  const selectedIds = new Set();
  const selected = [];
  const deferred = [];
  let usedCpuMinutes = 0;

  for (const task of plan) {
    const dependenciesSelected = task.dependencies.every((dependency) => selectedIds.has(dependency));
    const fits = usedCpuMinutes + task.estimatedCpuMinutes <= budget;
    if (dependenciesSelected && fits) {
      selected.push(task);
      selectedIds.add(task.id);
      usedCpuMinutes += task.estimatedCpuMinutes;
    } else {
      deferred.push({
        ...task,
        reason: dependenciesSelected ? 'CPU_BUDGET_EXHAUSTED' : 'DEPENDENCY_NOT_SELECTED',
      });
    }
  }

  return {
    budgetCpuMinutes: budget,
    usedCpuMinutes,
    remainingCpuMinutes: budget - usedCpuMinutes,
    selected,
    deferred,
  };
}

export function verifyTaskEvidence(taskInput, observation = {}) {
  const task = validateExperimentManifest(taskInput);
  const exitCode = Number(observation.exitCode);
  const artifacts = new Set(stringArray(observation.artifacts ?? [], 'artifacts'));
  const checks = Array.isArray(observation.checks) ? observation.checks : [];
  const missingArtifacts = task.expectedArtifacts.filter((artifact) => !artifacts.has(artifact));
  const failedChecks = checks
    .filter((check) => !check || check.passed !== true)
    .map((check, index) => String(check?.name ?? `check-${index + 1}`));
  const blockers = [];

  if (!Number.isInteger(exitCode) || exitCode !== 0) blockers.push('COMMAND_DID_NOT_EXIT_ZERO');
  if (missingArtifacts.length > 0) blockers.push('EXPECTED_ARTIFACTS_MISSING');
  if (checks.length === 0) blockers.push('NO_VERIFICATION_CHECKS_RECORDED');
  if (failedChecks.length > 0) blockers.push('VERIFICATION_CHECK_FAILED');

  return {
    id: task.id,
    state: blockers.length === 0 ? 'DONE' : 'FAILED',
    command: task.command,
    exitCode: Number.isInteger(exitCode) ? exitCode : null,
    expectedArtifacts: task.expectedArtifacts,
    observedArtifacts: [...artifacts].sort(),
    missingArtifacts,
    checks: checks.map((check, index) => ({
      name: String(check?.name ?? `check-${index + 1}`),
      passed: check?.passed === true,
    })),
    failedChecks,
    blockers,
  };
}

export function buildEvidenceLedger(entries) {
  if (!Array.isArray(entries)) throw new TypeError('entries must be an array');
  const normalized = entries.map((entry) => ({ ...entry }));
  const counts = normalized.reduce((accumulator, entry) => {
    const state = String(entry.state ?? 'UNKNOWN');
    accumulator[state] = (accumulator[state] ?? 0) + 1;
    return accumulator;
  }, {});
  return {
    counts,
    entries: normalized.sort((left, right) => String(left.id).localeCompare(String(right.id))),
  };
}
