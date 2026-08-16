const SHA256 = /^[0-9a-f]{64}$/;
const SHA40 = /^[0-9a-f]{40}$/;

function sha256(value) {
  return typeof value === 'string' && SHA256.test(value);
}

function sha40(value) {
  return typeof value === 'string' && SHA40.test(value);
}

function finiteNonNegative(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

export function assessHistoricalEvalReadiness(config) {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new TypeError('historical evaluation freeze config must be an object');
  }

  const checks = [];
  const blockers = [];
  const requireGate = (id, passed, detail) => {
    const ok = passed === true;
    checks.push({ id, passed: ok, detail });
    if (!ok) blockers.push({ id, detail });
  };

  requireGate(
    'protocol_identity',
    config.protocol_id === 'OBSCURED-HIST-EVAL-001',
    'protocol_id must match the frozen historical evaluation protocol',
  );
  requireGate(
    'pre_outcome_state',
    config.outcome_state === 'EVALUATION_NOT_YET_RUN',
    'preflight is valid only before the frozen evaluation has run',
  );
  requireGate(
    'candidate_blob',
    sha40(config.candidate?.implementation_git_blob_sha),
    'candidate implementation Git blob must be pinned',
  );
  requireGate(
    'candidate_repository_revision',
    sha40(config.candidate?.repository_revision) &&
      config.candidate.repository_revision === config.unresolved_pre_evaluation?.candidate_repository_revision,
    'exact candidate repository revision must be pinned consistently before labels are opened',
  );

  const expectedBaselines = ['B0_RECENCY_ONLY', 'B1_MEAN_EVIDENCE_ONLY', 'B2_HARD_BLOCKERS_ONLY'];
  requireGate(
    'baseline_set',
    Array.isArray(config.frozen_baselines) &&
      expectedBaselines.every((baseline) => config.frozen_baselines.includes(baseline)) &&
      config.frozen_baselines.length === expectedBaselines.length,
    'all three transparent baselines must remain frozen',
  );

  const expectedMetrics = [
    'FALSE_PROMOTION_RATE',
    'HIGH_RISK_FALSE_PROMOTION_RATE',
    'BALANCED_ACCURACY',
    'TOP10_PRECISION',
  ];
  requireGate(
    'primary_metric_set',
    Array.isArray(config.primary_metrics) &&
      expectedMetrics.every((metric) => config.primary_metrics.includes(metric)),
    'frozen primary safety/usefulness metrics must be present',
  );

  const gate = config.primary_gate ?? {};
  requireGate(
    'primary_gate_thresholds',
    gate.reference_baseline === 'B2_HARD_BLOCKERS_ONLY' &&
      finiteNonNegative(gate.max_absolute_false_promotion_regression) &&
      finiteNonNegative(gate.max_absolute_high_risk_false_promotion_regression) &&
      finiteNonNegative(gate.minimum_balanced_accuracy_improvement) &&
      finiteNonNegative(gate.alternative_minimum_top10_precision_improvement) &&
      Number.isInteger(gate.minimum_high_risk_negative_examples_for_strong_gate) &&
      gate.minimum_high_risk_negative_examples_for_strong_gate > 0,
    'primary gate and minimum high-risk sample requirement must be frozen',
  );

  const requiredHashes = [
    'data_manifest_sha256',
    'sealed_label_manifest_sha256',
    'baseline_implementation_sha256',
    'selection_rule_record_sha256',
    'editor_blinding_record_sha256',
    'publisher_independence_review_sha256',
    'environment_lock_sha256',
    'evaluation_script_sha256',
    'bootstrap_spec_sha256',
  ];
  for (const field of requiredHashes) {
    requireGate(
      field,
      sha256(config.unresolved_pre_evaluation?.[field]),
      `${field} must be a pinned SHA-256 before evaluation`,
    );
  }

  const prerequisitesClosed = blockers.length === 0;
  requireGate(
    'evaluation_authorization_flag',
    config.evaluation_authorized === true,
    'evaluation_authorized must be explicitly set true only after all freeze artifacts are reviewed',
  );

  return {
    protocol_id: config.protocol_id ?? null,
    outcome_state: config.outcome_state ?? null,
    prerequisites_closed: prerequisitesClosed,
    evaluation_authorized: config.evaluation_authorized === true,
    ready_for_evaluation: prerequisitesClosed && config.evaluation_authorized === true,
    blocker_count: blockers.length,
    blockers,
    checks,
  };
}

export function assertHistoricalEvalAuthorized(config) {
  const assessment = assessHistoricalEvalReadiness(config);
  if (!assessment.ready_for_evaluation) {
    const ids = assessment.blockers.map(({ id }) => id).join(', ');
    throw new Error(`OBSCURED_HISTORICAL_EVAL_BLOCKED${ids ? `: ${ids}` : ''}`);
  }
  return assessment;
}
