import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateAuthorizationManifest } from './validate-authorization.mjs';

const SHA256_RE = /^[a-f0-9]{64}$/;

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export async function sha256File(filePath) {
  const bytes = await fs.readFile(filePath);
  return createHash('sha256').update(bytes).digest('hex');
}

function repositoryRootForManifest(manifestPath) {
  // AUTHORIZATION_MANIFEST.json is frozen at
  // research/multimodal-calibration/AUTHORIZATION_MANIFEST.json. Keeping root
  // resolution anchored to that location makes every repo-relative binding
  // independent of the caller's current working directory.
  return path.resolve(path.dirname(path.resolve(manifestPath)), '..', '..');
}

function resolveBoundPath(repositoryRoot, repoRelativePath, field) {
  if (!isNonEmptyString(repoRelativePath)) {
    throw new Error(`${field} path is unresolved`);
  }

  const resolved = path.resolve(repositoryRoot, repoRelativePath);
  const relative = path.relative(repositoryRoot, resolved);
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error(`${field} path escapes the repository root`);
  }
  return resolved;
}

function bindingCandidates(manifest) {
  return [
    {
      field: 'dataset.freeze_receipt',
      path: manifest?.dataset?.freeze_receipt_path,
      sha256: manifest?.dataset?.freeze_receipt_sha256,
    },
    {
      field: 'model_runtime.identity_freeze',
      path: manifest?.model_runtime?.identity_freeze_path,
      sha256: manifest?.model_runtime?.identity_freeze_sha256,
    },
    {
      field: 'option_score_extraction.prompt_template',
      path: manifest?.option_score_extraction?.prompt_template_path,
      sha256: manifest?.option_score_extraction?.prompt_template_sha256,
    },
    {
      field: 'option_score_extraction.implementation',
      path: manifest?.option_score_extraction?.implementation_path,
      sha256: manifest?.option_score_extraction?.implementation_sha256,
    },
    {
      field: 'transforms.implementation',
      path: manifest?.transforms?.implementation_path,
      sha256: manifest?.transforms?.implementation_sha256,
    },
    {
      field: 'environment.package_lock',
      path: manifest?.environment?.package_lock_path,
      sha256: manifest?.environment?.package_lock_sha256,
    },
  ];
}

export async function assessAuthorizationFileBindings(manifest, manifestPath) {
  const repositoryRoot = repositoryRootForManifest(manifestPath);
  const checked = [];
  const unresolved = [];
  const observedUnresolved = [];
  const errors = [];

  for (const binding of bindingCandidates(manifest)) {
    if (!isNonEmptyString(binding.path)) {
      unresolved.push(binding.field);
      continue;
    }

    let absolutePath;
    try {
      absolutePath = resolveBoundPath(repositoryRoot, binding.path, binding.field);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
      continue;
    }

    if (!SHA256_RE.test(binding.sha256 ?? '')) {
      unresolved.push(binding.field);
      try {
        observedUnresolved.push({
          field: binding.field,
          path: binding.path,
          actual_sha256: await sha256File(absolutePath),
        });
      } catch (error) {
        errors.push(
          `${binding.field} could not be read: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
      continue;
    }

    try {
      const actualSha256 = await sha256File(absolutePath);
      checked.push({
        field: binding.field,
        path: binding.path,
        expected_sha256: binding.sha256,
        actual_sha256: actualSha256,
      });
      if (actualSha256 !== binding.sha256) {
        errors.push(
          `${binding.field} content SHA-256 mismatch: expected ${binding.sha256}, received ${actualSha256}`,
        );
      }
    } catch (error) {
      errors.push(
        `${binding.field} could not be read: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  return {
    ok: errors.length === 0,
    repository_root: repositoryRoot,
    checked,
    unresolved,
    observed_unresolved: observedUnresolved,
    errors,
  };
}

export async function verifyAuthorizationBindings(manifestPath) {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const structuralAssessment = validateAuthorizationManifest(manifest);
  const fileBindings = await assessAuthorizationFileBindings(manifest, manifestPath);

  return {
    authorized: structuralAssessment.authorized && fileBindings.ok && fileBindings.unresolved.length === 0,
    structural_authorized: structuralAssessment.authorized,
    structural_errors: structuralAssessment.errors,
    file_bindings: fileBindings,
  };
}

const thisFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(thisFile)) {
  const manifestPath =
    process.argv[2] ?? path.join(path.dirname(thisFile), 'AUTHORIZATION_MANIFEST.json');
  const result = await verifyAuthorizationBindings(manifestPath);

  if (!result.file_bindings.ok) {
    console.error('MULTIMODAL_CALIBRATION_AUTHORIZATION_BINDINGS=FAIL');
    for (const error of result.file_bindings.errors) console.error(`BINDING_ERROR: ${error}`);
    process.exitCode = 1;
  } else {
    console.log('MULTIMODAL_CALIBRATION_AUTHORIZATION_BINDINGS=PASS');
  }

  console.log(`CHECKED_FILE_BINDINGS=${result.file_bindings.checked.length}`);
  if (result.file_bindings.unresolved.length > 0) {
    console.log(`UNRESOLVED_FILE_BINDINGS=${result.file_bindings.unresolved.join(',')}`);
  }
  for (const observed of result.file_bindings.observed_unresolved) {
    console.log(
      `UNRESOLVED_OBSERVED_SHA256 field=${observed.field} path=${observed.path} sha256=${observed.actual_sha256}`,
    );
  }

  if (result.authorized) {
    console.log('MULTIMODAL_CALIBRATION_AUTHORIZATION=AUTHORIZED');
  } else {
    console.log('MULTIMODAL_CALIBRATION_AUTHORIZATION=BLOCKED');
    for (const error of result.structural_errors) console.log(`BLOCKER: ${error}`);
  }
}
