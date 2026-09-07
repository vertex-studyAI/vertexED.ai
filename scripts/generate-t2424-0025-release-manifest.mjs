import { createHash } from 'node:crypto';
import { readFile, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export const ROOT = 'portfolio/project2424/projects/T2424-0025';
export const FILES = [
  "portfolio/project2424/projects/T2424-0025/MANUSCRIPT.md",
  "portfolio/project2424/projects/T2424-0025/RELATED_WORK_AUDIT.md",
  "portfolio/project2424/projects/T2424-0025/RESULTS.md",
  "portfolio/project2424/projects/T2424-0025/RESULTS_ABLATION_20260812.md",
  "portfolio/project2424/projects/T2424-0025/raw_metrics/repro-wave-20260812.json",
  "portfolio/project2424/projects/T2424-0025/figures/FIGURE_DATA.json",
  "portfolio/project2424/projects/T2424-0025/figures/figure1_contamination_mae.svg",
  "portfolio/project2424/projects/T2424-0025/figures/figure2_relative_improvement.svg"
];

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

export async function buildManifest() {
  const files = [];
  for (const path of FILES) {
    const bytes = await readFile(path);
    const info = await stat(path);
    files.push({ path, sha256: sha256(bytes), bytes: info.size });
  }
  return {
    schema_version: 1,
    project_id: 'T2424-0025',
    generated_from: 'deterministic repository bytes plus exact workflow evidence',
    scientific_status: 'REPRODUCED_WITH_LIMITATIONS',
    preprint_ready: false,
    frozen_source_commit: '0d2a14e559b0caa9b5b1cbeef0995013594ecf15',
    independent_reproduction_merge: '715aea0b632c70493c226a84473d77ff7ca8cfc6',
    files,
    pdf: {
      title: 'T2424-0025 robust weighted readouts bounded manuscript',
      sha256: '6cb16ac5662b7fadbf06c50e14174d190693fe22e56023cd8c0d106646b3722c',
      bytes: 155174,
      pages: 7,
      page_size: 'A4',
      encrypted: false,
      javascript: false,
      metadata_dates_normalized_to: '1970-01-01T00:00:00Z',
      workflow_run_id: 33409968826,
      workflow_url: 'https://github.com/vertex-studyAI/vertexED.ai/actions/runs/33409968826',
      artifact_id: 9764731032,
      artifact_archive_sha256: 'e15643e72bdb6805dc4eabe0bec90b3a7aec3474c7dceb9f81caf96a30f905d8',
      expires_on: '2026-09-30',
      permanent_archive: false,
    },
    scientific_boundaries: {
      zero_contamination_mean_mae: 0.02464691771133496,
      zero_contamination_median_mae: 0.012569888975136025,
      zero_contamination_median_reduction: 0.4900015846867857,
      unique_heavy_tail_attribution: 'FALSIFIED_NOT_ISOLATED',
      transformer_evidence: false,
      learned_memory_evidence: false,
      real_data_evidence: false,
      confirmatory_significance_claim: false,
    },
    unresolved_release_gates: [
      'authorized_authorship_and_contributions',
      'authorized_license',
      'permanent_archive',
    ],
  };
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname)) {
  const output = process.argv[2] || `${ROOT}/RELEASE_MANIFEST.json`;
  await writeFile(output, JSON.stringify(await buildManifest(), null, 2) + '\n');
}
