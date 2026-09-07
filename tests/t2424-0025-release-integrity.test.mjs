import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { buildManifest, ROOT } from '../scripts/generate-t2424-0025-release-manifest.mjs';

test('T2424-0025 release manifest is deterministic and matches repository bytes', async () => {
  const checked = JSON.parse(await readFile(`${ROOT}/RELEASE_MANIFEST.json`, 'utf8'));
  assert.deepEqual(await buildManifest(), checked);
  assert.equal(checked.files.length, 8);
  assert.equal(checked.pdf.sha256, '6cb16ac5662b7fadbf06c50e14174d190693fe22e56023cd8c0d106646b3722c');
  assert.equal(checked.pdf.bytes, 155174);
  assert.equal(checked.pdf.pages, 7);
  assert.equal(checked.pdf.encrypted, false);
  assert.equal(checked.pdf.javascript, false);
  assert.equal(checked.pdf.permanent_archive, false);
  assert.equal(checked.preprint_ready, false);
});

test('T2424-0025 release boundaries preserve the clean-control falsifier', async () => {
  const checked = JSON.parse(await readFile(`${ROOT}/RELEASE_MANIFEST.json`, 'utf8'));
  assert.equal(checked.scientific_boundaries.zero_contamination_mean_mae, 0.02464691771133496);
  assert.equal(checked.scientific_boundaries.zero_contamination_median_mae, 0.012569888975136025);
  assert.equal(checked.scientific_boundaries.zero_contamination_median_reduction, 0.4900015846867857);
  assert.equal(checked.scientific_boundaries.unique_heavy_tail_attribution, 'FALSIFIED_NOT_ISOLATED');
  assert.equal(checked.scientific_boundaries.transformer_evidence, false);
  assert.equal(checked.scientific_boundaries.learned_memory_evidence, false);
  assert.equal(checked.scientific_boundaries.confirmatory_significance_claim, false);
});

test('T2424-0025 release audit records completed PDF inspection without claiming readiness', async () => {
  const [claimAudit, releaseMetadata, readiness] = await Promise.all([
    readFile(`${ROOT}/CLAIM_AUDIT.md`, 'utf8'),
    readFile(`${ROOT}/RELEASE_METADATA.md`, 'utf8'),
    readFile(`${ROOT}/PREPRINT_READINESS.md`, 'utf8'),
  ]);
  assert.match(claimAudit, /FINAL PDF CLAIM AUDIT PASS/);
  assert.match(claimAudit, /49\.00%/);
  assert.match(claimAudit, /does not establish a Transformer/);
  assert.match(releaseMetadata, /\[x\] clean PDF compiled and visually audited/);
  assert.match(readiness, /\[x\] clean manuscript\/PDF is compiled and visually audited/);
  assert.match(readiness, /NO-GO \/ NOT PREPRINT_READY/);
  assert.match(readiness, /permanent archival release/);
});
