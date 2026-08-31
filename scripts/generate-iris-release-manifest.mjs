import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const MANIFEST_PATH = 'portfolio/research/iris/IRIS_RELEASE_MANIFEST.json';

const EVIDENCE_FILES = [
  'portfolio/research/IRIS_BASELINE_AUDIT_20260813.md',
  'portfolio/research/IRIS_BASELINE_FRONTIER_PROTOCOL_20260814.md',
  'portfolio/research/IRIS_REPRO_STATUS_20260813.md',
  'portfolio/research/IRIS_SEQUENCE_ADAPTATION_METRIC_FREEZE_20260813.md',
  'portfolio/research/IRIS_SOURCE_RECOVERY_20260814.md',
  'portfolio/research/IRIS_SUCCESSOR_DECISION_20260814.md',
  'portfolio/research/evidence/iris-v0.2-development-baselines-20260813.json',
  'portfolio/research/evidence/iris-v0.2-fresh-reproduction-20260813.json',
  'portfolio/research/iris/common_adaptation_harness_v1/EVIDENCE_GAP.md',
  'portfolio/research/iris/common_adaptation_harness_v1/PROTOCOL.json',
  'portfolio/research/iris/common_adaptation_harness_v1/REPRODUCE.md',
  'portfolio/research/iris/common_adaptation_harness_v1/RESULTS.md',
  'portfolio/research/papers/IRIS_V02_NEGATIVE_RESULT_MANUSCRIPT.md',
];

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

export async function buildManifest() {
  const files = [];
  for (const path of EVIDENCE_FILES) {
    const bytes = await readFile(resolve(REPO_ROOT, path));
    files.push({ path, bytes: bytes.length, sha256: sha256(bytes) });
  }

  return {
    schema_version: 1,
    project: 'IRIS v0.2 and common adaptation harness v1',
    scientific_status: 'REPRODUCED_MIXED_NEGATIVE',
    harness_verdict: 'NEGATIVE_OR_INCONCLUSIVE_DEVELOPMENT_GATE',
    source_recovery_status: 'PARTIALLY_RECOVERED_PROTOCOL_BLOCKED_ON_EXACT_TRAJECTORY_IDENTITY_ONLY',
    branch_local_release_status: 'BLOCKED_ON_RETAINED_EVIDENCE_PROVENANCE',
    confirmatory_seed_quarantine: {
      first: 1000,
      last: 1029,
      count: 30,
      accessed: false,
      authorized: false,
    },
    promotion: {
      positive_architecture_proven: false,
      external_validation: false,
      submission_ready: false,
      successor_authorized: false,
    },
    missing_release_evidence: [
      'original common-harness results/raw.csv',
      'original common-harness results/summary.csv',
      'exact common-harness verify.py or traceable canonical verifier location',
      'canonical development trajectory identity or authoritative deterministic-equivalence record',
    ],
    stop_rules: [
      'do_not_access_confirmatory_seeds_1000_1029',
      'do_not_regenerate_missing_evidence_as_original',
      'do_not_retune_pabim_after_negative_gate',
      'do_not_change_frozen_thresholds_metrics_methods_or_seeds',
      'new_experiment_id_and_protocol_required_for_successor',
    ],
    files,
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.stdout.write(`${JSON.stringify(await buildManifest(), null, 2)}\n`);
}
