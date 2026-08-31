import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { buildManifest, REPO_ROOT } from '../scripts/generate-iris-release-manifest.mjs';

const readText = (path) => readFile(`${REPO_ROOT}/${path}`, 'utf8');

test('IRIS manifest deterministically binds the retained mixed-negative evidence surface', async () => {
  const checked = JSON.parse(await readText('portfolio/research/iris/IRIS_RELEASE_MANIFEST.json'));
  assert.deepEqual(await buildManifest(), checked);
  assert.equal(checked.files.length, 13);
  assert.equal(checked.scientific_status, 'REPRODUCED_MIXED_NEGATIVE');
  assert.equal(checked.harness_verdict, 'NEGATIVE_OR_INCONCLUSIVE_DEVELOPMENT_GATE');
  assert.equal(checked.promotion.submission_ready, false);
  assert.equal(checked.promotion.successor_authorized, false);
});

test('IRIS confirmatory seeds 1000-1029 remain exhaustively quarantined', async () => {
  const protocol = JSON.parse(await readText('portfolio/research/iris/common_adaptation_harness_v1/PROTOCOL.json'));
  const manifest = JSON.parse(await readText('portfolio/research/iris/IRIS_RELEASE_MANIFEST.json'));
  const expected = Array.from({ length: 30 }, (_, index) => 1000 + index);
  assert.deepEqual(protocol.seed_policy.development_seeds, [0,1,2,3,4,5,6,7,8,9]);
  assert.deepEqual(protocol.seed_policy.reserved_confirmatory_seeds, expected);
  assert.equal(protocol.seed_policy.confirmatory_access_forbidden, true);
  assert.deepEqual(manifest.confirmatory_seed_quarantine, {
    first: 1000, last: 1029, count: 30, accessed: false, authorized: false,
  });
});

test('IRIS source and release provenance gaps remain fail-closed', async () => {
  const [source, gap, results, manifest] = await Promise.all([
    readText('portfolio/research/IRIS_SOURCE_RECOVERY_20260814.md'),
    readText('portfolio/research/iris/common_adaptation_harness_v1/EVIDENCE_GAP.md'),
    readText('portfolio/research/iris/common_adaptation_harness_v1/RESULTS.md'),
    readText('portfolio/research/iris/IRIS_RELEASE_MANIFEST.json').then(JSON.parse),
  ]);
  assert.match(source, /PROTOCOL_BLOCKED_ON_EXACT_TRAJECTORY_IDENTITY_ONLY/);
  assert.match(source, /Do not run `IRIS-FRONTIER-DEV-20260814` yet/);
  assert.match(gap, /BLOCKED_ON_RETAINED_EVIDENCE_PROVENANCE/);
  assert.match(gap, /Do not regenerate missing evidence and present it as the original retained evidence/);
  assert.match(results, /NEGATIVE_OR_INCONCLUSIVE_DEVELOPMENT_GATE/);
  assert.equal(manifest.missing_release_evidence.length, 4);
});

test('IRIS negative-result and no-rescue boundaries remain explicit', async () => {
  const [status, decision, manuscript] = await Promise.all([
    readText('portfolio/research/IRIS_REPRO_STATUS_20260813.md'),
    readText('portfolio/research/IRIS_SUCCESSOR_DECISION_20260814.md'),
    readText('portfolio/research/papers/IRIS_V02_NEGATIVE_RESULT_MANUSCRIPT.md'),
  ]);
  assert.match(status, /mixed\/negative synthetic research result/i);
  assert.match(status, /Do not claim a proven new architecture, external real-world benefit, novelty, or submission readiness/);
  assert.match(decision, /NO NEW IRIS SUCCESSOR ARCHITECTURE IS AUTHORIZED YET/);
  assert.match(decision, /Seeds `1000–1029` remain forbidden/);
  assert.doesNotMatch(manuscript, /submission[- ]ready/i);
});
