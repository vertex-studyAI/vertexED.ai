import { createHash } from 'node:crypto';
import { readFile, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export const ROOT = 'portfolio/research/ngmt';
export const FILES = [
  ".github/workflows/ngmt-v01-frozen.yml",
  "portfolio/research/ngmt/NGMT_V01_BUG_LOG.md",
  "portfolio/research/ngmt/NGMT_V01_INDEPENDENT_REPRODUCTION_PROTOCOL.md",
  "portfolio/research/ngmt/NGMT_V01_PROTOCOL.md",
  "portfolio/research/ngmt/NGMT_V01_PROTOCOL_CLARIFICATION.md",
  "portfolio/research/ngmt/NGMT_V01_REPLICATION.md",
  "portfolio/research/ngmt/NGMT_V01_TRAINING_FIXTURE.md",
  "portfolio/research/ngmt/NGMT_V01_VERDICT_RULE.md",
  "portfolio/research/ngmt/REPRODUCE.md",
  "portfolio/research/ngmt/RESULTS.md",
  "portfolio/research/ngmt/ngmt_v01_experiment_metadata.json",
  "portfolio/research/ngmt/ngmt_v01_replay_verification.json",
  "portfolio/research/ngmt/v01/run.py",
  "tests/test_ngmt_v01.py",
  "portfolio/research/ngmt/NGMT_V01_NEGATIVE_RESULT_MANUSCRIPT.md",
  "portfolio/research/ngmt/NGMT_V01_MANUSCRIPT_CLAIM_AUDIT.md"
];
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

export async function buildManifest() {
  const files = [];
  for (const path of FILES) {
    const bytes = await readFile(path);
    files.push({ path, sha256: sha256(bytes), bytes: (await stat(path)).size });
  }
  return {
  "schema_version": 1,
  "experiment_id": "NGMT-v0.1-frozen-2026-08-13",
  "scientific_status": "REPRODUCED_NEGATIVE_OR_INCONCLUSIVE",
  "verdict": "NEGATIVE_OR_INCONCLUSIVE_NGMT_V01",
  "hypothesis_supported": false,
  "mechanism_advantage_supported": false,
  "preprint_ready": false,
  "pdf_artifact": {
    "path": "portfolio/research/ngmt/paper/ngmt-v01-negative-result.pdf",
    "sha256": "abf50c62977187a8d63fe7bf92ae372d7a72164ba393de3ed9fe83de4fa4050d",
    "bytes": 24292,
    "pages": 3,
    "page_size": "letter",
    "encrypted": false,
    "javascript": false,
    "all_fonts_embedded": false,
    "reportlab_version": "4.4.9",
    "deterministic_two_render_equality": true,
    "visually_inspected": true,
    "permanent_archive": false
  },
  "relationship_to_t2424_0025": "distinct learned B0-B3 experiment; precursor contributes no positive result",
  "protocol_freeze_commits": [
    "60d03821177a179ba0aec4253e3f987103c45f87",
    "c077168986ebbf64a5e94eb12eff0afcf220ea56",
    "876e1ca64f1f756d1d426bceea42139b743872fc",
    "8234b335c046b893fe241d25859f84a475ab907f"
  ],
  "implementation_commit": "540c471c329244363e18193b4ae982ffafc00b44",
  "files": files,
  "invalid_attempt": {
    "run_id": 31661146957,
    "head_sha": "475fd26c568a71db8a82be87a1321fc1f06f9afd",
    "artifact_id": 9166231239,
    "artifact_sha256": "97b191ac1a8ba3de2776c07caa6e38b28a6cd77330e8af82e69802b82995c42a",
    "classification": "INVALID_EXECUTION_PLUMBING_FAILURE_PRE_SCIENTIFIC_RUN",
    "scientific_training_executed": false
  },
  "first_valid_run": {
    "run_id": 31661313386,
    "head_sha": "385ea6251561ed2a7b05b6a6f10307666b169b80",
    "artifact_id": 9166307730,
    "artifact_sha256": "ec7d88d342271ad28b6f9ae485338985a219b7d43d55dd45350a4611c585ce76",
    "results_json_sha256": "f8feeccc6ca864efc6389c9e8b9b952698d349251d332f81735c542913f33b14"
  },
  "unchanged_protocol_replay": {
    "run_id": 31661621771,
    "head_sha": "7e4547345052c3514219005fc00f396d4efa0838",
    "artifact_id": 9166406618,
    "artifact_sha256": "5a34b13b54761e894b5cd3de2941c44121ea39705f8588e83aaf8a18dd2d7d06",
    "results_json_sha256": "7f67822872960ed037cb4bbe66dbcd1faa99d86d7ea0b954636c5ccc37c7b684",
    "scientific_payload_exact_matches": [
      "condition_summary",
      "paired_seed_effects",
      "paired_effect_summary",
      "parameter_counts",
      "runtime_memory_capacities",
      "criteria",
      "verdict",
      "all_12_training_histories",
      "all_12_checkpoint_sha256"
    ],
    "expected_nonmatches": [
      "runtime_seconds",
      "full_results_json_sha256",
      "artifact_zip_sha256"
    ]
  },
  "frozen_effects": {
    "b3_over_b2_mean": 0.004945732296129727,
    "b3_over_b2_required_min": 0.05,
    "b3_over_b2_pass": false,
    "b3_over_b1_mean": 0.004392875989642753,
    "b3_over_b1_required_min": 0.03,
    "b3_over_b1_pass": false,
    "clean_regression_mean": 0.009600300111813348,
    "clean_regression_allowed_max": 0.02,
    "clean_guardrail_pass": true,
    "n_seeds": 3,
    "statistical_significance_claim": false
  },
  "fairness": {
    "trainable_parameters_each": 6049,
    "memory_scalars": {
      "B0": 0,
      "B1": 18,
      "B2": 18,
      "B3": 18
    },
    "b3_failed_or_divergent_seeds": 0
  },
  "stop_rules": [
    "no_rescue_tuning",
    "no_seed_expansion",
    "no_condition_dropping",
    "no_threshold_movement",
    "no_positive_result_ablations",
    "new_versioned_protocol_required_for_successor"
  ]
};
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname)) {
  const output = process.argv[2] || `${ROOT}/NGMT_V01_RELEASE_MANIFEST.json`;
  await writeFile(output, JSON.stringify(await buildManifest(), null, 2) + '
');
}
