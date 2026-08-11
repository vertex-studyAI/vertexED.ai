import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { runLatentLanguageAudit } from '../src/core.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const manifest = JSON.parse(await readFile(resolve(root, 'evidence/manifest.json'), 'utf8'));
const rawBytes = await readFile(resolve(root, manifest.rawResult));
const rawSha256 = createHash('sha256').update(rawBytes).digest('hex');
if (rawSha256 !== manifest.rawResultSha256) {
  throw new Error(`raw result hash mismatch: expected ${manifest.rawResultSha256}, got ${rawSha256}`);
}

const retained = JSON.parse(rawBytes.toString('utf8'));
const recomputed = runLatentLanguageAudit();

function assertEqual(actual, expected, label) {
  if (actual !== expected) throw new Error(`${label} mismatch: expected ${expected}, got ${actual}`);
}

function assertNear(actual, expected, label, tolerance = 1e-12) {
  if (!Number.isFinite(actual) || !Number.isFinite(expected) || Math.abs(actual - expected) > tolerance) {
    throw new Error(`${label} mismatch: expected ${expected}, got ${actual}`);
  }
}

assertEqual(retained.project, 'T2424-0027', 'project identity');
assertEqual(retained.name, 'Sapir–Whorf Latent Tongue', 'project name');
assertEqual(manifest.claimStatus, 'CONTROLLED_SYNTHETIC_MECHANICS_PASS', 'manifest claim status');
assertEqual(manifest.certificationStatus, 'CERTIFICATION_PENDING', 'manifest certification status');
assertEqual(retained.verdict, 'PASS_CONTROLLED_LANGUAGE_LEAKAGE_MECHANICS', 'retained verdict');
assertEqual(recomputed.verdict, retained.verdict, 'recomputed verdict');

for (const [metric, expected] of Object.entries(retained.metrics)) {
  assertNear(recomputed.metrics[metric], expected, `metric ${metric}`);
}
for (const [gate, expected] of Object.entries(retained.gates)) {
  assertEqual(recomputed.gates[gate], expected, `gate ${gate}`);
}
for (const gate of Object.values(retained.gates)) {
  if (gate !== true) throw new Error('retained PASS verdict is inconsistent with a failed gate');
}

if (retained.claimBoundary !== recomputed.claimBoundary) {
  throw new Error('claim boundary does not match the recomputed implementation boundary');
}

console.log(JSON.stringify({
  project: retained.project,
  rawResultSha256,
  evidenceConsistency: 'PASS',
  verdict: retained.verdict,
  certificationStatus: manifest.certificationStatus,
}, null, 2));
