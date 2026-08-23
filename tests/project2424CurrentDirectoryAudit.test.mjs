import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const manifestUrl = new URL('portfolio/project2424/SOURCE_IDENTITY_MANIFEST.json', root);
const auditUrl = new URL('portfolio/project2424/CURRENT_DIRECTORY_AUDIT_20260823.json', root);

async function loadJson(url) {
  return JSON.parse(await readFile(url, 'utf8'));
}

test('current Project2424 directory audit covers every represented manifest identity exactly once', async () => {
  const manifest = await loadJson(manifestUrl);
  const audit = await loadJson(auditUrl);

  const manifestIds = manifest.entries.map((entry) => entry.id).sort();
  const auditIds = audit.projects.map((entry) => entry.id).sort();

  assert.equal(manifest.represented_project_directory_count, 23);
  assert.equal(audit.represented_directory_count, 23);
  assert.equal(new Set(auditIds).size, auditIds.length, 'audit contains duplicate IDs');
  assert.deepEqual(auditIds, manifestIds);
});

test('only PST and NPMS canonical directories retain source-migration integration blockers', async () => {
  const audit = await loadJson(auditUrl);
  const blocked = audit.projects.filter((entry) => !entry.integration_green).map((entry) => entry.id).sort();
  assert.deepEqual(blocked, ['T2424-0016', 'T2424-0019']);
  assert.equal(audit.summary.integration_green, 21);
  assert.equal(audit.summary.integration_blocked_on_original_source_migration, 2);
});

test('integration-green directory status headers no longer advertise stale CI/manual-merge states', async () => {
  const audit = await loadJson(auditUrl);
  const stale = ['CI_VERIFICATION_PENDING', 'MANUAL_MERGE_PENDING', '**State:** VERIFYING', '**State:** `VERIFYING`'];

  for (const project of audit.projects.filter((entry) => entry.integration_green)) {
    const statusUrl = new URL(`portfolio/project2424/projects/${project.id}/STATUS.md`, root);
    const status = await readFile(statusUrl, 'utf8');
    const header = status.slice(0, 700);
    for (const token of stale) {
      assert.equal(header.includes(token), false, `${project.id} still exposes stale header state ${token}`);
    }
  }
});

test('bounded evidence never implies external scientific validation in the current directory audit', async () => {
  const audit = await loadJson(auditUrl);
  assert.equal(audit.summary.external_science_green, 0);
  for (const project of audit.projects) {
    if (project.bounded_evidence_green) {
      assert.equal(project.external_science_green, false, `${project.id} improperly widens bounded evidence`);
      assert.ok(project.next_gate, `${project.id} must name its next scientific gate`);
    }
  }
});

test('every represented directory has an explicit scientific state and next gate', async () => {
  const audit = await loadJson(auditUrl);
  for (const project of audit.projects) {
    assert.ok(project.scientific_state && project.scientific_state.length > 5, `${project.id} missing scientific state`);
    assert.ok(project.next_gate && project.next_gate.length > 5, `${project.id} missing next gate`);
  }
});
