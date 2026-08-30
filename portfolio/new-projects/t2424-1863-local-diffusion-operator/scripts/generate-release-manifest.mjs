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
    files: entries,
    unresolved_release_gates: [
      'authorship_and_contributions',
      'authorized_license_metadata',
      'compiled_pdf',
      'visual_pdf_inspection',
      'rendered_pdf_claim_audit',
      'immutable_pdf_digest',
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
