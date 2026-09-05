import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { buildReleaseManifest, releaseFiles, retainedPdfArtifact } from '../portfolio/new-projects/t2424-1863-local-diffusion-operator/scripts/generate-release-manifest.mjs';

const paper = new URL('../portfolio/new-projects/t2424-1863-local-diffusion-operator/paper/', import.meta.url);

test('T2424-1863 release inventory recomputes byte-for-byte from current artifacts', async () => {
  const retained = JSON.parse(await readFile(new URL('RELEASE_MANIFEST.json', paper), 'utf8'));
  const recomputed = await buildReleaseManifest(paper);

  assert.deepEqual(recomputed, retained);
  assert.deepEqual(Object.keys(retained.files), releaseFiles);
  assert.equal(retained.scientific_source, '7cee0bd4d5cc7a3ac497476d322c6f0e16da9ee6');
  assert.equal(retained.protocol_change, false);
  assert.equal(retained.scientific_verdict, 'NEGATIVE_OR_INCONCLUSIVE_AGAINST_PREDECLARED_GATE');
});

test('release manifest binds the inspected PDF while permanent release gates fail closed', async () => {
  const retained = JSON.parse(await readFile(new URL('RELEASE_MANIFEST.json', paper), 'utf8'));

  assert.equal(retained.preprint_ready, false);
  assert.equal(retained.release_status, 'NOT_PREPRINT_READY');
  assert.deepEqual(retained.retained_pdf_artifact, retainedPdfArtifact);
  assert.match(retained.retained_pdf_artifact.pdf_sha256, /^[0-9a-f]{64}$/);
  assert.match(retained.retained_pdf_artifact.archive_sha256, /^[0-9a-f]{64}$/);
  assert.equal(retained.retained_pdf_artifact.workflow_head.length, 40);
  assert.equal(retained.retained_pdf_artifact.pdf_bytes, 124650);
  assert.equal(retained.retained_pdf_artifact.pages, 5);
  assert.equal(retained.retained_pdf_artifact.encrypted, false);
  assert.equal(retained.retained_pdf_artifact.javascript, false);
  assert.equal(retained.retained_pdf_artifact.visual_inspection, 'PASSED_ALL_5_PAGES');
  assert.equal(retained.retained_pdf_artifact.rendered_claim_audit, 'PASSED_NEGATIVE_RESULT_BOUNDARY');
  assert.equal(retained.retained_pdf_artifact.permanent_archive, false);
  assert.deepEqual(retained.unresolved_release_gates, [
    'authorship_and_contributions',
    'authorized_license_metadata',
    'permanent_pdf_archive',
    'archive_or_doi_selection',
  ]);
  for (const closedGate of [
    'compiled_pdf',
    'visual_pdf_inspection',
    'rendered_pdf_claim_audit',
    'immutable_pdf_digest',
  ]) {
    assert.equal(retained.unresolved_release_gates.includes(closedGate), false);
  }
});
