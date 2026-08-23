import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const registryPath = path.join(here, 's3_external_adapter_registry.json');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export async function validateS3ExternalAdapterRegistry() {
  const registry = JSON.parse(await fs.readFile(registryPath, 'utf8'));
  const byId = new Map(registry.adapters.map((item) => [item.id, item]));
  const selected = registry.adapters.filter((item) => item.selected_for_successor);
  const materialized = registry.adapters.filter((item) => item.materialized);
  const materializedEligible = registry.adapters.filter(
    (item) => item.materialized && item.counts_toward_required_materialized_adapters !== false,
  );

  assert(registry.registry_id === 'T2424-0037-S3-EXTERNAL-ADAPTERS-20260823', 'unexpected registry id');
  assert(registry.status === 'IDENTITIES_VERIFIED_NOT_MATERIALIZED', 'registry must remain identity-only before materialization');
  assert(registry.confirmatory_execution_authorized === false, 'adapter registry must not authorize confirmatory execution');
  assert(registry.required_materialized_adapters >= 2, 'S3 requires at least two materialized external adapters');

  const cadtestbench = byId.get('cadtestbench');
  const muse = byId.get('muse');
  const text2cad = byId.get('text2cad_bench');
  const assemcad = byId.get('assemcad');

  assert(cadtestbench?.dataset_repository === 'dimitrismallis/CADTestBench', 'CADTestBench dataset identity drifted');
  assert(cadtestbench?.license === 'MIT', 'CADTestBench license boundary drifted');
  assert(cadtestbench?.selected_for_successor === true, 'CADTestBench must remain selected');
  assert(cadtestbench?.materialized === false, 'CADTestBench must not be marked materialized without frozen hashes');

  assert(muse?.dataset_repository === 'dongxiaoyu/MUSE', 'MUSE dataset identity drifted');
  assert(muse?.dataset_license === 'CC-BY-4.0', 'MUSE dataset license boundary drifted');
  assert(muse?.selected_for_successor === true, 'MUSE must remain selected');
  assert(muse?.materialized === false, 'MUSE must not be marked materialized without frozen hashes');
  assert(muse?.evaluation_boundary?.includes('frozen judge/provider/model/prompt identity'), 'MUSE model-judge freeze boundary missing');

  assert(text2cad?.public_availability === 'PREVIEW_ONLY_30_PERCENT_PROMPTS', 'Text2CAD-Bench preview limitation must remain explicit');
  assert(text2cad?.counts_toward_required_materialized_adapters === false, 'Text2CAD-Bench preview must not satisfy materialization gate');
  assert(text2cad?.materialized === false, 'Text2CAD-Bench preview must not be marked materialized');

  assert(assemcad?.public_availability === 'CODE_REFERENCE_VERIFIED_DATASET_IDENTITY_UNVERIFIED', 'AssemCAD data-identity uncertainty must remain explicit');
  assert(assemcad?.counts_toward_required_materialized_adapters === false, 'AssemCAD must not satisfy materialization gate before dataset verification');

  assert(selected.length === 2, `expected exactly two selected feasible adapter identities, found ${selected.length}`);
  assert(materialized.length === 0, 'no external adapter may be materialized by identity registry alone');
  assert(materializedEligible.length < registry.required_materialized_adapters, 'identity registry unexpectedly satisfies execution materialization gate');

  return {
    registry_id: registry.registry_id,
    verdict: 'PASS_EXTERNAL_ADAPTER_IDENTITY_GATE',
    selected_adapter_ids: selected.map((item) => item.id),
    materialized_count: materialized.length,
    required_materialized_adapters: registry.required_materialized_adapters,
    confirmatory_execution_authorized: registry.confirmatory_execution_authorized,
    blocker: 'EXACT_DATASET_REVISIONS_AND_CONTENT_HASHES_NOT_FROZEN',
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await validateS3ExternalAdapterRegistry();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}
