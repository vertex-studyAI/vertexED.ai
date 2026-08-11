const REQUIRED_NEGATIVE_BOUNDARIES = new Set([
  'PRESERVE_METRIC_DEFECT',
  'PRESERVE_IMPLEMENTATION_LIMITATION',
  'PRESERVE_INTERPRETATION_LIMIT',
]);

function finiteNonNegative(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) {
    throw new RangeError(`${label} must be a finite non-negative number`);
  }
  return number;
}

function requiredString(value, label) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new TypeError(`${label} must be a non-empty string`);
  }
  return value.trim();
}

export function validateNpmsRecovery(report) {
  if (!report || typeof report !== 'object' || Array.isArray(report)) {
    throw new TypeError('report must be an object');
  }
  if (report.canonical_project_id !== 'T2424-0019') {
    throw new RangeError('canonical_project_id must be T2424-0019');
  }
  if (report.recovered_project_id !== 'MODEL-NPMS') {
    throw new RangeError('recovered_project_id must remain MODEL-NPMS');
  }
  if (report.evidence_class !== 'RECOVERED_SYNTHETIC_CONTROLLED') {
    throw new RangeError('evidence_class must remain RECOVERED_SYNTHETIC_CONTROLLED');
  }
  if (report.certified_complete !== false) {
    throw new RangeError('recovered NPMS must not claim Project 2424 certified completion');
  }
  if (report.external_benchmark_executed !== false) {
    throw new RangeError('external_benchmark_executed must remain false');
  }
  if (report.novelty_claim_approved !== false) {
    throw new RangeError('novelty_claim_approved must remain false');
  }
  if (report.trained_model_checkpoint_evaluated !== false) {
    throw new RangeError('trained_model_checkpoint_evaluated must remain false');
  }
  if (report.source_migration_complete !== false) {
    throw new RangeError('source_migration_complete must remain false until canonical source migration occurs');
  }
  if (report.isolated_verdict !== 'COMPACT_EVIDENCE_COMPLETE') {
    throw new RangeError('isolated_verdict must preserve COMPACT_EVIDENCE_COMPLETE');
  }

  const identity = requiredString(report.identity_boundary, 'identity_boundary').toLowerCase();
  if (!identity.includes('diagnostic') || !identity.includes('not a generic forecasting architecture')) {
    throw new RangeError('identity_boundary must preserve NPMS as a diagnostic rather than a generic forecaster');
  }

  if (!report.tests || report.tests.count !== 17 || report.tests.status !== 'PASSED_IN_RECOVERED_ISOLATED_BUNDLE') {
    throw new RangeError('recovered isolated test record must preserve 17 passed tests');
  }

  const smoke = report.smoke;
  const compact = report.compact;
  const robustness = report.robustness;
  if (!smoke || !compact || !robustness) throw new TypeError('smoke, compact and robustness records are required');
  if (smoke.run_count !== 2 || compact.run_count !== 15 || compact.ablation_count !== 36 || robustness.record_count !== 45) {
    throw new RangeError('recovered run/ablation/robustness counts do not match the retained execution report');
  }

  finiteNonNegative(smoke.mean_eigenvalue_mae, 'smoke.mean_eigenvalue_mae');
  finiteNonNegative(smoke.mean_target_prediction_mse, 'smoke.mean_target_prediction_mse');
  finiteNonNegative(compact.mean_eigenvalue_mae, 'compact.mean_eigenvalue_mae');
  finiteNonNegative(compact.mean_target_prediction_mse, 'compact.mean_target_prediction_mse');
  finiteNonNegative(compact.std_eigenvalue_mae, 'compact.std_eigenvalue_mae');
  finiteNonNegative(compact.std_target_prediction_mse, 'compact.std_target_prediction_mse');

  if (!Array.isArray(report.negative_findings) || report.negative_findings.length < 6) {
    throw new RangeError('at least six recovered negative findings must be retained');
  }
  const boundaries = new Set();
  const combinedFindings = [];
  const ids = new Set();
  for (const finding of report.negative_findings) {
    const id = requiredString(finding.id, 'negative_findings[].id');
    if (ids.has(id)) throw new RangeError(`duplicate negative finding id: ${id}`);
    ids.add(id);
    const text = requiredString(finding.finding, `${id}.finding`).toLowerCase();
    const boundary = requiredString(finding.required_boundary, `${id}.required_boundary`);
    boundaries.add(boundary);
    combinedFindings.push(text);
  }
  for (const boundary of REQUIRED_NEGATIVE_BOUNDARIES) {
    if (!boundaries.has(boundary)) {
      throw new RangeError(`required negative-evidence boundary missing: ${boundary}`);
    }
  }

  const corpus = combinedFindings.join(' ');
  if (!corpus.includes('spurious') || !corpus.includes('missing modes')) {
    throw new RangeError('matched-eigenvalue metric defect must remain explicit');
  }
  if (!corpus.includes('conjugate groups')) {
    throw new RangeError('conjugate-group truncation limitation must remain explicit');
  }
  if (!corpus.includes('resolvent proxy') || !corpus.includes('not a complete identified input-output transfer function')) {
    throw new RangeError('frequency-response interpretation limit must remain explicit');
  }

  if (!Array.isArray(report.unresolved_gates) || report.unresolved_gates.length < 6) {
    throw new RangeError('unresolved_gates must preserve the canonical migration and validation blockers');
  }
  const gates = report.unresolved_gates.join(' ').toLowerCase();
  for (const required of ['source', 'clean canonical checkout', 'residual spectral', 'switching', 'conjugate', 'trained-model']) {
    if (!gates.includes(required)) throw new RangeError(`unresolved gate missing required concept: ${required}`);
  }

  return {
    canonicalProjectId: report.canonical_project_id,
    recoveredProjectId: report.recovered_project_id,
    isolatedVerdict: report.isolated_verdict,
    testsPassedInRecoveredBundle: report.tests.count,
    compactRuns: compact.run_count,
    ablationRecords: compact.ablation_count,
    robustnessRecords: robustness.record_count,
    compactMeanEigenvalueMae: compact.mean_eigenvalue_mae,
    compactMeanTargetPredictionMse: compact.mean_target_prediction_mse,
    negativeFindingsPreserved: report.negative_findings.length,
    certifiedComplete: report.certified_complete,
    externalBenchmarkExecuted: report.external_benchmark_executed,
    sourceMigrationComplete: report.source_migration_complete,
  };
}
