import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const artifactUrl = new URL('../portfolio/project2424/RECOVERED_EXTERNAL_ARTIFACTS_20260823.json', import.meta.url);
const evidence = JSON.parse(await readFile(artifactUrl, 'utf8'));

test('recovered external artifacts never silently acquire canonical T2424 identity', () => {
  assert.ok(evidence.artifacts.length >= 7);
  for (const artifact of evidence.artifacts) {
    if (artifact.canonical_T2424_candidate) {
      assert.equal(artifact.canonical_T2424_crosswalk_complete, false);
      assert.ok(artifact.claim_boundary);
    }
  }
});

test('Atlas V4 recovery keeps the exact recorded release hashes and bounded verification counts', () => {
  const atlas = evidence.artifacts.find((artifact) => artifact.artifact_family === 'BU1LD Research Atlas V4');
  assert.ok(atlas);
  assert.equal(atlas.research_source_evidence_sha256, '076f12750d6a8e6c298c17815224a79463bcad149d6cf1283900d98c6e394a2c');
  assert.equal(atlas.papers_release_sha256, '1be70acf821c57dee65b13f80940a9a195bc64ebc8c31464c9fcc87ce33ce5ae');
  assert.equal(atlas.recorded_project_count, 18);
  assert.equal(atlas.recorded_test_count, 39);
  assert.equal(atlas.recorded_manifest_file_count, 769);
});

test('recovered FinanceJEPA pilot stays family-crosswalk blocked and preserves adverse ablations', () => {
  const finance = evidence.artifacts.find((artifact) => artifact.artifact_family === 'MODEL-002 FinanceJEPA');
  assert.ok(finance);
  assert.equal(finance.canonical_T2424_candidate, 'T2424-0005');
  assert.equal(finance.canonical_T2424_crosswalk_complete, false);
  assert.equal(finance.recorded_local_tests, '9 PASS');
  assert.ok(finance.claim_boundary.includes('identity collision'));
  assert.ok(finance.claim_boundary.includes('unsupported'));
});

test('recovered ESNF evidence preserves the sparse-update negative result and provisional identity', () => {
  const esnf = evidence.artifacts.find((artifact) => artifact.artifact_family === 'MODEL-ESNF');
  assert.ok(esnf);
  assert.equal(esnf.canonical_T2424_candidate, 'T2424-0017');
  assert.equal(esnf.canonical_T2424_crosswalk_complete, false);
  assert.equal(esnf.recorded_local_tests, '10 PASS');
  assert.equal(esnf.recorded_workspace_sha256, '686d480dcc32143499b0b563081014264dd77c6db18d801fff53253380aea118');
  assert.ok(esnf.claim_boundary.includes('worse than dense and matched-budget uniform refinement'));
});

test('recovered PRC evidence preserves the dominant linear-autoregression baseline', () => {
  const prc = evidence.artifacts.find((artifact) => artifact.artifact_family === 'MODEL-PRC');
  assert.ok(prc);
  assert.equal(prc.canonical_T2424_candidate, 'T2424-0018');
  assert.equal(prc.canonical_T2424_crosswalk_complete, false);
  assert.equal(prc.recorded_git_commit, 'b07342dbcb7bc1dca2284394101e0bdd751ce603');
  assert.ok(prc.recorded_linear_autoregression_mean_rmse < prc.recorded_prc_mean_rmse);
});

test('recovered PEN evidence preserves the adverse primary-control comparison', () => {
  const pen = evidence.artifacts.find((artifact) => artifact.artifact_family === 'MODEL-PEN');
  assert.ok(pen);
  assert.equal(pen.canonical_T2424_candidate, 'T2424-0033');
  assert.equal(pen.canonical_T2424_crosswalk_complete, false);
  assert.ok(pen.recorded_attention_only_mean_predictive_mse < pen.recorded_mean_predictive_mse);
  assert.ok(pen.recorded_random_write_mean_predictive_mse < pen.recorded_mean_predictive_mse);
});

test('Typhon recovered archive hashes are retained without converting checksum evidence to completion', () => {
  const foundation = evidence.artifacts.find((artifact) => artifact.artifact_family === 'Typhon Foundation / Full Execution');
  const release = evidence.artifacts.find((artifact) => artifact.artifact_family === 'Typhon BU1LD Verified Reference v1.0.0');
  assert.ok(foundation);
  assert.ok(release);
  assert.equal(foundation.canonical_T2424_candidate, 'T2424-0055');
  assert.equal(release.canonical_T2424_candidate, 'T2424-0055');
  assert.equal(release.full_archive.sha256, 'd54e27a02eb46407122df607eeff8e9f687dde7ddab46241b0450f049da8fe65');
  assert.equal(release.individual_archive_collection.recorded_individual_zip_count, 32);
});
