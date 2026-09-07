import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const releaseFiles = [
  'MANUSCRIPT.md',
  'CLAIM_EVIDENCE_MATRIX.md',
  'RELEASE_AUDIT.md',
  'evidence/EVIDENCE_MANIFEST.json',
  'evidence/raw_metrics.json',
  'evidence/uncertainty_metrics.json',
  'evidence/per_seed_relative_improvement.svg',
];

const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');


export const retainedPdfArtifact = Object.freeze({
  id: 9742216790,
  name: 't2424-1863-rendered-paper',
  workflow_run: 33346673784,
  workflow_head: 'ffac9fd9b2a7bda5b51a33e288bf7ffc3492f291',
  archive_sha256: '7f3e58bc3deb8bb7d7c5616b45e7e12010c234e450bb05e2788f05c3716b6c94',
  pdf_sha256: 'b20701a5329670d01af8d89b6437c58636b8d1b4c86282741f59d3af4cc860b0',
  pdf_bytes: 124650,
  pages: 5,
  page_size: 'A4',
  encrypted: false,
  javascript: false,
  visual_inspection: 'PASSED_ALL_5_PAGES',
  rendered_claim_audit: 'PASSED_NEGATIVE_RESULT_BOUNDARY',
  expires_at: '2026-09-30T01:09:29Z',
  permanent_archive: false,
});

export async function buildReleaseManifest(root = new URL('../paper/', import.meta.url)) {
  const entries = {};
  for (const path of releaseFiles) {
    const buffer = await readFile(new URL(path, root));
    entries[path] = { bytes: buffer.byteLength, sha256: sha256(buffer) };
  }
  const evidence = JSON.parse(await readFile(new URL('evidence/EVIDENCE_MANIFEST.json', root), 'utf8'));
  return {
    schema_version: 1,
    release_status: 'NOT_PREPRINT_READY',
    preprint_ready: false,
    protocol_change: false,
    scientific_verdict: evidence.scientific_verdict,
    scientific_source: evidence.scientific_source,
    retained_evidence_artifact: evidence.artifact,
    retained_pdf_artifact: retainedPdfArtifact,
    files: entries,
    unresolved_release_gates: [
      'authorship_and_contributions',
      'authorized_license_metadata',
      'permanent_pdf_archive',
      'archive_or_doi_selection',
    ],
  };
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const output = process.argv[2];
  if (!output) throw new Error('Usage: node scripts/generate-release-manifest.mjs <output.json>');
  const manifest = await buildReleaseManifest();
  await writeFile(output, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
}
