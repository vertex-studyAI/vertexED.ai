function nonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function sha40(value) {
  return typeof value === 'string' && /^[0-9a-f]{40}$/.test(value);
}

function sha256(value) {
  return typeof value === 'string' && /^[0-9a-f]{64}$/.test(value);
}

/**
 * Outcome-free readiness assessment for DARCY-FREEZE-001.
 *
 * This function deliberately inspects only the frozen control/config surface. It
 * does not load generated fields, checkpoints, ID-test data, OOD data, metrics,
 * or retained outcomes. Unknown or malformed gates fail closed.
 */
export function assessDarcyV2TrainingReadiness(configInput) {
  if (!configInput || typeof configInput !== 'object' || Array.isArray(configInput)) {
    throw new TypeError('Darcy v2 freeze config must be an object');
  }

  const config = configInput;
  const blockers = [];
  const checks = [];

  const requireGate = (id, passed, detail) => {
    const ok = passed === true;
    checks.push({ id, passed: ok, detail });
    if (!ok) blockers.push({ id, detail });
  };

  requireGate(
    'protocol_identity',
    config.protocol_id === 'DARCY-FREEZE-001 / darcy-operator-ood-v2',
    'protocol_id must match the frozen Darcy v2 protocol',
  );
  requireGate(
    'pre_outcome_state',
    config.outcome_state === 'EXPERIMENT_NOT_YET_RUN',
    'pre-training authorization is valid only while outcome_state is EXPERIMENT_NOT_YET_RUN',
  );
  requireGate(
    'generator_implementation_hash',
    sha40(config.generator?.implementation_git_blob_sha),
    'generator implementation Git blob SHA must be pinned',
  );
  requireGate(
    'split_manifest_hash',
    sha256(config.unresolved_pretraining_blockers?.split_manifest_sha256),
    'frozen split manifest SHA-256 must be pinned',
  );
  requireGate(
    'covariance_interpretation_approval',
    nonEmptyString(config.unresolved_pretraining_blockers?.covariance_interpretation_approval),
    'periodic/circulant finite-grid squared-exponential interpretation requires explicit pre-outcome approval',
  );
  requireGate(
    'ood_d_global_offset_interpretation_approval',
    nonEmptyString(config.unresolved_pretraining_blockers?.ood_d_global_offset_interpretation_approval),
    'OOD-D global log-offset interpretation requires explicit pre-outcome approval',
  );
  requireGate(
    'learned_environment_lock',
    nonEmptyString(config.unresolved_pretraining_blockers?.learned_environment_lock),
    'exact learned-model environment lock must be committed before training',
  );
  requireGate(
    'hardware_identity',
    nonEmptyString(config.unresolved_pretraining_blockers?.hardware_identity),
    'training hardware identity must be committed before training',
  );

  for (const systemId of ['B2', 'B3', 'B4']) {
    const system = config.systems?.[systemId];
    const implementationSha = config.unresolved_pretraining_blockers?.[`${systemId}_implementation_sha`];
    const implementationReady =
      system &&
      typeof system === 'object' &&
      typeof system.state === 'string' &&
      system.state.startsWith('IMPLEMENTED_PREOUTCOME_') &&
      sha40(implementationSha) &&
      (!system.implementation_git_blob_sha || system.implementation_git_blob_sha === implementationSha);

    requireGate(
      `${systemId.toLowerCase()}_implementation`,
      implementationReady,
      `${systemId} must have a pinned pre-outcome implementation SHA and an IMPLEMENTED_PREOUTCOME_* state`,
    );
  }

  const learnedFreeze = config.learned_model_freeze;
  requireGate(
    'learned_model_budget_freeze',
    learnedFreeze &&
      Array.isArray(learnedFreeze.training_seeds) &&
      learnedFreeze.training_seeds.length > 0 &&
      learnedFreeze.training_seeds.every(Number.isInteger) &&
      nonEmptyString(learnedFreeze.selection_metric) &&
      learnedFreeze.test_or_ood_for_selection === false &&
      nonEmptyString(learnedFreeze.optimizer_family) &&
      Array.isArray(learnedFreeze.candidate_learning_rates) &&
      learnedFreeze.candidate_learning_rates.length > 0 &&
      Number.isFinite(learnedFreeze.parameter_count_ceiling) &&
      learnedFreeze.parameter_count_ceiling > 0 &&
      Number.isFinite(learnedFreeze.max_wall_seconds_per_seed) &&
      learnedFreeze.max_wall_seconds_per_seed > 0 &&
      learnedFreeze.paid_resources_allowed === false,
    'learned-model seeds, selection rule, optimizer, LR grid, parameter cap, wall-time cap, and no-paid-resource boundary must be frozen',
  );

  const ready = blockers.length === 0;

  // The file on main intentionally keeps training_authorized=false. Readiness is
  // a prerequisite for a later explicit authorization commit; this function does
  // not mutate or reinterpret that owner/research-control flag.
  requireGate(
    'training_authorization_flag',
    config.training_authorized === true,
    'training_authorized must be explicitly set true in a later reviewed freeze commit after every prerequisite is closed',
  );

  return {
    protocol_id: config.protocol_id ?? null,
    outcome_state: config.outcome_state ?? null,
    ready_for_training: ready && config.training_authorized === true,
    prerequisite_gates_closed: ready,
    training_authorized: config.training_authorized === true,
    blocker_count: blockers.length,
    blockers,
    checks,
  };
}

export function assertDarcyV2TrainingAuthorized(configInput) {
  const assessment = assessDarcyV2TrainingReadiness(configInput);
  if (!assessment.ready_for_training) {
    const ids = assessment.blockers.map((blocker) => blocker.id).join(', ');
    throw new Error(`DARCY_V2_TRAINING_BLOCKED${ids ? `: ${ids}` : ''}`);
  }
  return assessment;
}
