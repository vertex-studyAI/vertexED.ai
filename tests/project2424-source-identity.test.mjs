import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const projectRoot = path.join(repoRoot, 'portfolio', 'project2424');
const queuePath = path.join(projectRoot, 'FIRST_100_QUEUE.ndjson');
const manifestPath = path.join(projectRoot, 'SOURCE_IDENTITY_MANIFEST.json');
const projectsPath = path.join(projectRoot, 'projects');

async function loadRegistry() {
  const raw = await readFile(queuePath, 'utf8');
  return raw.split(/\r?\n/).filter(Boolean).map((line, index) => {
    try {
      return JSON.parse(line);
    } catch (error) {
      throw new Error(`invalid FIRST_100_QUEUE.ndjson line ${index + 1}: ${error.message}`);
    }
  });
}

async function loadManifest() {
  return JSON.parse(await readFile(manifestPath, 'utf8'));
}

test('Project 2424 frozen current First-100 queue has exactly 100 unique ranked identities', async () => {
  const registry = await loadRegistry();
  assert.equal(registry.length, 100, 'FIRST_100_QUEUE.ndjson must remain exactly 100 rows');
  assert.equal(new Set(registry.map((entry) => entry.id)).size, 100, 'First-100 IDs must be unique');
  assert.equal(new Set(registry.map((entry) => entry.rank)).size, 100, 'First-100 ranks must be unique');
  assert.deepEqual([...registry.map((entry) => entry.rank)].sort((a, b) => a - b), Array.from({ length: 100 }, (_, i) => i + 1));
});

test('every current T2424 project directory is represented exactly once in the current source identity manifest', async () => {
  const manifest = await loadManifest();
  const projectDirectories = (await readdir(projectsPath, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && /^T2424-\d{4}$/.test(entry.name))
    .map((entry) => entry.name)
    .sort();
  const manifestIds = manifest.entries.map((entry) => entry.id).sort();

  assert.equal(new Set(manifestIds).size, manifestIds.length, 'source manifest IDs must be unique');
  assert.deepEqual(manifestIds, projectDirectories, 'directory set and current source identity manifest must match exactly');
  assert.equal(manifest.represented_project_directory_count, projectDirectories.length);
  assert.equal(manifest.truth_boundary.historical_wave001_registry_recovered, true);
  assert.equal(manifest.truth_boundary.current_full_2424_identity_migration_recovered, false);
  assert.equal(manifest.truth_boundary.directory_presence_is_not_scientific_completion, true);
  assert.equal(manifest.truth_boundary.directory_presence_is_not_external_validation, true);
  assert.equal(manifest.truth_boundary.numeric_suffix_is_not_cross_generation_identity_key, true);
});

test('current source identity manifest names and paths match the frozen current First-100 queue', async () => {
  const registry = await loadRegistry();
  const manifest = await loadManifest();
  const byId = new Map(registry.map((entry) => [entry.id, entry]));

  assert.equal(manifest.first_100_registry_expected_entries, registry.length);
  for (const entry of manifest.entries) {
    const frozen = byId.get(entry.id);
    assert.ok(frozen, `${entry.id} has a project directory but is absent from frozen First-100 registry`);
    assert.equal(entry.registry_name, frozen.name, `${entry.id} registry name drift`);
    assert.equal(entry.source_path, `portfolio/project2424/projects/${entry.id}`, `${entry.id} source path drift`);
    assert.equal(entry.evidence_state, 'DIRECTORY_PRESENT', `${entry.id} must not be promoted above directory presence by this manifest`);
  }
});

test('known repaired current-generation collisions remain bound to frozen current identities', async () => {
  const manifest = await loadManifest();
  const byId = new Map(manifest.entries.map((entry) => [entry.id, entry]));
  assert.equal(byId.get('T2424-0049')?.registry_name, 'Multiphase Porous JEPA');
  assert.equal(byId.get('T2424-0050')?.registry_name, 'Darcy Latent Operator');
});
