import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const manifestPath = path.join(here, 's3_successor_manifest.json');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export async function validateS3SuccessorProtocol() {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const strataTotal = manifest.strata.reduce((sum, item) => sum + item.cases, 0);
  const baselines = manifest.systems.filter((system) => system.kind === 'baseline');
  const hypothesisIds = new Set(manifest.confirmatory_hypotheses.map((item) => item.id));
  const ablations = new Set(manifest.required_ablations);

  assert(manifest.protocol_id === 'T2424-0037-S3-SUCCESSOR-20260822', 'unexpected protocol id');
  assert(manifest.protocol_status === 'PROTOCOL_FROZEN_DATASET_AND_MODEL_IDENTITY_BLOCKED', 'protocol must remain blocked until identities/hashes are frozen');
  assert(manifest.execution_authorized === false, 'confirmatory execution must not be authorized yet');
  assert(manifest.results_status === 'NOT_RUN', 'results must remain NOT_RUN before execution authorization');
  assert(manifest.historical_results_immutable === true, 'historical NeuroCAD results must be immutable');

  assert(manifest.benchmark_target_cases === 150, 'successor benchmark target must remain 150 cases');
  assert(strataTotal === manifest.benchmark_target_cases, `strata sum ${strataTotal} does not match target ${manifest.benchmark_target_cases}`);
  assert(manifest.strata.length === 6, 'expected six frozen benchmark strata');

  assert(baselines.length === 4, `expected four baseline families, found ${baselines.length}`);
  assert(manifest.systems.some((system) => system.id === 'M0' && system.kind === 'method'), 'M0 typed-IR method missing');
  assert(baselines.some((system) => system.id === 'B2' && system.name.includes('matched_validation')), 'matched validation baseline B2 is mandatory');

  assert(hypothesisIds.size === 3 && ['H1', 'H2', 'H3'].every((id) => hypothesisIds.has(id)), 'H1/H2/H3 confirmatory family must remain frozen');
  assert(manifest.primary_metric === 'semantic_test_pass_rate', 'primary metric must remain semantic_test_pass_rate');
  assert(manifest.statistics.bootstrap_ci === 0.95, 'bootstrap CI level must remain 95%');
  assert(manifest.statistics.holm_correct_confirmatory_family === true, 'Holm correction must remain enabled');

  for (const required of ['NO_TYPED_IR', 'NO_VALIDATION', 'NO_REPAIR', 'SCHEMA_ONLY']) {
    assert(ablations.has(required), `missing required ablation ${required}`);
  }

  assert(manifest.required_external_benchmark_adapters_min >= 2, 'S3 successor requires at least two external benchmark adapters');
  assert(manifest.external_benchmark_candidates.length >= 3, 'external benchmark candidate set unexpectedly narrowed');
  assert(manifest.execution_preconditions.includes('EXECUTION_AUTHORIZATION.json_written_with_hashes'), 'execution authorization hash gate missing');

  const frozenImplementations = manifest.systems.filter((system) => system.implementation_frozen).length;
  const materializedExternal = manifest.external_benchmark_candidates.filter((item) => item.materialized).length;

  return {
    protocol_id: manifest.protocol_id,
    verdict: 'PASS_PROTOCOL_INTEGRITY_GATE',
    execution_authorized: manifest.execution_authorized,
    results_status: manifest.results_status,
    benchmark_target_cases: manifest.benchmark_target_cases,
    strata_total: strataTotal,
    baseline_families: baselines.length,
    required_ablations: manifest.required_ablations.length,
    external_benchmark_adapters_required: manifest.required_external_benchmark_adapters_min,
    external_benchmark_candidates_materialized: materializedExternal,
    implementations_frozen: frozenImplementations,
    blocker: 'DATASET_AND_MODEL_IDENTITY_BLOCKED',
    claim_boundary: 'Protocol integrity only. No scientific performance result exists and no confirmatory execution is authorized.'
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await validateS3SuccessorProtocol();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}
