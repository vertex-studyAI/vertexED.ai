import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  assessAuthorizationFileBindings,
  verifyAuthorizationBindings,
} from '../research/multimodal-calibration/verify-authorization-bindings.mjs';

const checkedInManifestPath = fileURLToPath(
  new URL('../research/multimodal-calibration/AUTHORIZATION_MANIFEST.json', import.meta.url),
);

function sha256(text) {
  return createHash('sha256').update(text).digest('hex');
}

async function createSyntheticRepository() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'multimodal-calibration-bindings-'));
  const manifestDir = path.join(root, 'research', 'multimodal-calibration');
  await fs.mkdir(manifestDir, { recursive: true });
  const manifestPath = path.join(manifestDir, 'AUTHORIZATION_MANIFEST.json');
  return { root, manifestPath };
}

test('checked-in authorization-bound source bytes match every resolved digest', async () => {
  const manifest = JSON.parse(await fs.readFile(checkedInManifestPath, 'utf8'));
  const assessment = await assessAuthorizationFileBindings(manifest, checkedInManifestPath);

  assert.equal(assessment.ok, true);
  assert.deepEqual(assessment.errors, []);
  assert.ok(assessment.checked.length >= 5);
  assert.ok(assessment.unresolved.includes('environment.package_lock'));
  assert.ok(
    assessment.checked.some((binding) => binding.field === 'dataset.freeze_receipt'),
  );
  assert.ok(
    assessment.checked.some((binding) => binding.field === 'model_runtime.identity_freeze'),
  );
  assert.ok(
    assessment.checked.some((binding) => binding.field === 'option_score_extraction.prompt_template'),
  );
  assert.ok(
    assessment.checked.some((binding) => binding.field === 'option_score_extraction.implementation'),
  );
  assert.ok(
    assessment.checked.some((binding) => binding.field === 'transforms.implementation'),
  );
});

test('file-binding verification detects byte drift after a digest is frozen', async (t) => {
  const { root, manifestPath } = await createSyntheticRepository();
  t.after(() => fs.rm(root, { recursive: true, force: true }));

  const lockPath = path.join(root, 'package-lock.json');
  const frozenBytes = '{"lockfileVersion":3}\n';
  await fs.writeFile(lockPath, frozenBytes);

  const manifest = {
    environment: {
      package_lock_path: 'package-lock.json',
      package_lock_sha256: sha256(frozenBytes),
    },
  };
  await fs.writeFile(manifestPath, JSON.stringify(manifest));

  const before = await assessAuthorizationFileBindings(manifest, manifestPath);
  assert.equal(before.ok, true);
  assert.equal(before.checked.length, 1);
  assert.deepEqual(before.errors, []);

  await fs.writeFile(lockPath, '{"lockfileVersion":3,"drift":true}\n');
  const after = await assessAuthorizationFileBindings(manifest, manifestPath);
  assert.equal(after.ok, false);
  assert.equal(after.errors.length, 1);
  assert.match(after.errors[0], /environment\.package_lock content SHA-256 mismatch/);
});

test('file-binding verification rejects repository-root escape attempts', async (t) => {
  const { root, manifestPath } = await createSyntheticRepository();
  t.after(() => fs.rm(root, { recursive: true, force: true }));

  const manifest = {
    environment: {
      package_lock_path: '../outside-lock.json',
      package_lock_sha256: 'a'.repeat(64),
    },
  };

  const assessment = await assessAuthorizationFileBindings(manifest, manifestPath);
  assert.equal(assessment.ok, false);
  assert.deepEqual(assessment.checked, []);
  assert.ok(
    assessment.errors.some((error) =>
      error.includes('environment.package_lock path escapes the repository root'),
    ),
  );
});

test('canonical verifier remains blocked before outcomes while file bindings stay independently checkable', async () => {
  const result = await verifyAuthorizationBindings(checkedInManifestPath);

  assert.equal(result.authorized, false);
  assert.equal(result.structural_authorized, false);
  assert.equal(result.file_bindings.ok, true);
  assert.ok(result.structural_errors.includes('model_runtime.runtime_identity is unresolved'));
  assert.ok(
    result.structural_errors.some((error) =>
      error.includes('option-score extraction must be validated against the exact model/runtime'),
    ),
  );
  assert.ok(
    result.structural_errors.some((error) => error.includes('fitted_temperature is unresolved')),
  );
  assert.ok(
    result.structural_errors.some((error) => error.includes('package_lock_sha256')),
  );
});
