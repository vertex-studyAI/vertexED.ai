import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const manifestPath = path.join(here, 's3_successor_manifest.json');
const adapterRegistryPath = path.join(here, 's3_external_adapter_registry.json');
const defaultFreezePath = path.join(here, 's3_execution_freeze.json');
const defaultAuthorizationPath = path.join(here, 'EXECUTION_AUTHORIZATION.json');

const SHA256 = /^[a-f0-9]{64}$/;
const COMMIT = /^[a-f0-9]{40}$/;

async function readJsonOrNull(filePath) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}

function nonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export async function assessS3ExecutionAuthorization({ freezePath = defaultFreezePath } = {}) {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const adapters = JSON.parse(await fs.readFile(adapterRegistryPath, 'utf8'));
  const freeze = await readJsonOrNull(freezePath);
  const blockers = [];

  if (manifest.execution_authorized !== false || manifest.results_status !== 'NOT_RUN') {
    blockers.push('PROTOCOL_PREEXECUTION_STATE_INVALID');
  }

  const materializedEligible = adapters.adapters.filter(
    (item) => item.materialized === true
      && item.counts_toward_required_materialized_adapters !== false
      && COMMIT.test(item.materialized_revision ?? '')
      && SHA256.test(item.content_sha256 ?? ''),
  );
  if (materializedEligible.length < adapters.required_materialized_adapters) {
    blockers.push('EXTERNAL_ADAPTERS_NOT_MATERIALIZED_AND_HASHED');
  }

  if (!freeze) {
    blockers.push('S3_EXECUTION_FREEZE_MISSING');
  } else {
    if (!SHA256.test(freeze.benchmark_records_sha256 ?? '')) blockers.push('BENCHMARK_RECORD_HASH_MISSING_OR_INVALID');
    if (!SHA256.test(freeze.evaluation_split_sha256 ?? '')) blockers.push('EVALUATION_SPLIT_HASH_MISSING_OR_INVALID');
    if (!COMMIT.test(freeze.method_commit ?? '')) blockers.push('METHOD_COMMIT_NOT_FROZEN');

    const baselineIds = ['B0', 'B1', 'B2', 'B3'];
    for (const id of baselineIds) {
      if (!COMMIT.test(freeze.baseline_commits?.[id] ?? '')) blockers.push(`BASELINE_${id}_COMMIT_NOT_FROZEN`);
    }

    if (!nonEmpty(freeze.provider?.provider)) blockers.push('PROVIDER_IDENTITY_MISSING');
    if (!nonEmpty(freeze.provider?.model)) blockers.push('MODEL_IDENTITY_MISSING');
    if (!nonEmpty(freeze.provider?.model_version)) blockers.push('MODEL_VERSION_MISSING');
    if (!Number.isFinite(freeze.provider?.temperature)) blockers.push('SAMPLING_TEMPERATURE_MISSING');
    if (!Number.isInteger(freeze.provider?.max_attempts) || freeze.provider.max_attempts < 1) blockers.push('MAX_ATTEMPTS_INVALID');
    if (!Number.isInteger(freeze.provider?.max_input_tokens) || freeze.provider.max_input_tokens < 1) blockers.push('INPUT_BUDGET_INVALID');
    if (!Number.isInteger(freeze.provider?.max_output_tokens) || freeze.provider.max_output_tokens < 1) blockers.push('OUTPUT_BUDGET_INVALID');
    if (!SHA256.test(freeze.prompts_sha256 ?? '')) blockers.push('PROMPT_HASH_MISSING_OR_INVALID');
    if (!SHA256.test(freeze.retry_repair_policy_sha256 ?? '')) blockers.push('RETRY_REPAIR_POLICY_HASH_MISSING_OR_INVALID');

    const frozenAdapterIds = new Set((freeze.external_adapters ?? []).map((item) => item.id));
    for (const adapter of materializedEligible) {
      if (!frozenAdapterIds.has(adapter.id)) blockers.push(`ADAPTER_${adapter.id.toUpperCase()}_MISSING_FROM_FREEZE`);
    }
  }

  return {
    protocol_id: manifest.protocol_id,
    execution_authorized: blockers.length === 0,
    blockers,
    materialized_external_adapters: materializedEligible.map((item) => item.id),
    freeze_present: Boolean(freeze),
    claim_boundary: blockers.length === 0
      ? 'Predeclared execution inputs are frozen; this authorizes running the untouched confirmatory evaluation, not claiming a result.'
      : 'Confirmatory execution is forbidden until every blocker is resolved without changing the frozen hypotheses or historical evidence.',
  };
}

export async function generateS3ExecutionAuthorization({
  freezePath = defaultFreezePath,
  outputPath = defaultAuthorizationPath,
} = {}) {
  const assessment = await assessS3ExecutionAuthorization({ freezePath });
  if (!assessment.execution_authorized) {
    const error = new Error(`S3 execution authorization refused: ${assessment.blockers.join(', ')}`);
    error.code = 'S3_EXECUTION_NOT_AUTHORIZED';
    error.assessment = assessment;
    throw error;
  }

  const artifact = {
    ...assessment,
    authorized_at: new Date().toISOString(),
    authorization_version: 1,
  };
  await fs.writeFile(outputPath, `${JSON.stringify(artifact, null, 2)}\n`, { flag: 'wx' });
  return artifact;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  generateS3ExecutionAuthorization()
    .then((artifact) => process.stdout.write(`${JSON.stringify(artifact, null, 2)}\n`))
    .catch((error) => {
      process.stderr.write(`${error.message}\n`);
      if (error.assessment) process.stderr.write(`${JSON.stringify(error.assessment, null, 2)}\n`);
      process.exitCode = 2;
    });
}
