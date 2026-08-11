#!/usr/bin/env node
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const NINE_GATES = Object.freeze([
  'source_identity',
  'falsifiable_claim',
  'frozen_protocol',
  'runnable_command',
  'baseline_evidence',
  'raw_results',
  'ablation_or_negative_result',
  'explicit_verdict',
  'independent_qa',
]);

const ALLOWED_DECLARED_STATES = new Set([
  'CERTIFICATION_PENDING',
  'CERTIFIED_COMPLETE',
]);

function fail(message) {
  throw new Error(message);
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function normalizeRelativeEvidencePath(value) {
  if (typeof value !== 'string' || !value.trim()) {
    fail('evidence.path must be a non-empty relative path');
  }
  const normalized = value.replaceAll('\\', '/').trim();
  if (path.posix.isAbsolute(normalized)) {
    fail(`evidence path must be relative: ${value}`);
  }
  const clean = path.posix.normalize(normalized);
  if (clean === '..' || clean.startsWith('../')) {
    fail(`evidence path escapes project root: ${value}`);
  }
  return clean;
}

function normalizeSha256(value, { required }) {
  if (value === undefined || value === null || value === '') {
    if (required) fail('certified evidence references require sha256');
    return null;
  }
  if (typeof value !== 'string' || !/^[0-9a-f]{64}$/i.test(value.trim())) {
    fail('evidence.sha256 must be a 64-character hexadecimal digest');
  }
  return value.trim().toLowerCase();
}

async function hashFile(filePath) {
  const bytes = await fs.readFile(filePath);
  return createHash('sha256').update(bytes).digest('hex');
}

async function verifyEvidenceReference(projectRoot, reference, { requireHash }) {
  if (!isPlainObject(reference)) fail('each evidence reference must be an object');
  const relativePath = normalizeRelativeEvidencePath(reference.path);
  const expectedSha256 = normalizeSha256(reference.sha256, { required: requireHash });
  const absolutePath = path.resolve(projectRoot, relativePath);
  const relativeFromRoot = path.relative(projectRoot, absolutePath);
  if (relativeFromRoot === '..' || relativeFromRoot.startsWith(`..${path.sep}`) || path.isAbsolute(relativeFromRoot)) {
    fail(`evidence path escapes project root after resolution: ${relativePath}`);
  }

  let stats;
  try {
    stats = await fs.stat(absolutePath);
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      fail(`evidence file is missing: ${relativePath}`);
    }
    throw error;
  }
  if (!stats.isFile()) fail(`evidence reference is not a file: ${relativePath}`);
  if (stats.size === 0) fail(`evidence file is empty: ${relativePath}`);

  const actualSha256 = await hashFile(absolutePath);
  if (expectedSha256 && actualSha256 !== expectedSha256) {
    fail(`evidence hash mismatch for ${relativePath}: expected ${expectedSha256}, got ${actualSha256}`);
  }

  return {
    path: relativePath,
    bytes: stats.size,
    sha256: actualSha256,
    hashPinned: Boolean(expectedSha256),
  };
}

function validateTopLevel(manifest) {
  if (!isPlainObject(manifest)) fail('certification manifest must be a JSON object');
  if (manifest.schemaVersion !== 1) fail('schemaVersion must be 1');
  if (typeof manifest.projectId !== 'string' || !/^T2424-\d{4}$/.test(manifest.projectId)) {
    fail('projectId must match T2424-####');
  }
  if (!ALLOWED_DECLARED_STATES.has(manifest.declaredStatus)) {
    fail('declaredStatus must be CERTIFICATION_PENDING or CERTIFIED_COMPLETE');
  }
  if (!isPlainObject(manifest.gates)) fail('gates must be an object');

  const keys = Object.keys(manifest.gates).sort();
  const expected = [...NINE_GATES].sort();
  if (JSON.stringify(keys) !== JSON.stringify(expected)) {
    const missing = expected.filter((key) => !keys.includes(key));
    const extra = keys.filter((key) => !expected.includes(key));
    fail(`gates must contain exactly the nine contract keys; missing=${missing.join(',') || 'none'} extra=${extra.join(',') || 'none'}`);
  }
}

export async function validateCertificationManifest({ projectRoot, manifest }) {
  const resolvedProjectRoot = path.resolve(projectRoot);
  validateTopLevel(manifest);

  const certifiedClaim = manifest.declaredStatus === 'CERTIFIED_COMPLETE';
  const gateResults = {};
  const missingGates = [];
  const unpinnedEvidence = [];

  for (const gateName of NINE_GATES) {
    const gate = manifest.gates[gateName];
    if (!isPlainObject(gate)) fail(`gate ${gateName} must be an object`);
    if (typeof gate.passed !== 'boolean') fail(`gate ${gateName}.passed must be boolean`);
    if (!Array.isArray(gate.evidence)) fail(`gate ${gateName}.evidence must be an array`);

    if (!gate.passed) {
      if (gate.evidence.length > 0) {
        fail(`gate ${gateName} is marked failed but still declares evidence; move diagnostic references into note instead`);
      }
      missingGates.push(gateName);
      gateResults[gateName] = { passed: false, evidence: [] };
      continue;
    }

    if (gate.evidence.length === 0) {
      fail(`gate ${gateName} is marked passed without evidence references`);
    }

    const verifiedEvidence = [];
    for (const reference of gate.evidence) {
      const verified = await verifyEvidenceReference(resolvedProjectRoot, reference, {
        requireHash: certifiedClaim,
      });
      if (!verified.hashPinned) unpinnedEvidence.push(`${gateName}:${verified.path}`);
      verifiedEvidence.push(verified);
    }

    gateResults[gateName] = {
      passed: true,
      evidence: verifiedEvidence,
    };
  }

  const allGatesPassed = missingGates.length === 0;
  const allEvidenceHashPinned = unpinnedEvidence.length === 0;
  const eligibleForCertifiedComplete = allGatesPassed && allEvidenceHashPinned;

  if (certifiedClaim && !allGatesPassed) {
    fail(`CERTIFIED_COMPLETE is unsupported; missing gates: ${missingGates.join(', ')}`);
  }
  if (certifiedClaim && !allEvidenceHashPinned) {
    fail(`CERTIFIED_COMPLETE is unsupported; unpinned evidence: ${unpinnedEvidence.join(', ')}`);
  }

  return {
    schemaVersion: 1,
    projectId: manifest.projectId,
    declaredStatus: manifest.declaredStatus,
    validatedStatus: eligibleForCertifiedComplete ? 'CERTIFICATION_READY' : 'CERTIFICATION_PENDING',
    eligibleForCertifiedComplete,
    missingGates,
    unpinnedEvidence,
    gateResults,
    boundary: {
      verifiesEvidenceFilesExistAndMatchDeclaredHashes: true,
      verifiesScientificCorrectness: false,
      verifiesExternalValidity: false,
      verifiesIndependenceOfQaAuthor: false,
      authorizesStatusPromotion: false,
      note: 'A CERTIFICATION_READY result is a mechanical evidence-integrity check, not an independent scientific certification.',
    },
  };
}

async function main(argv) {
  const args = argv.slice(2);
  const projectIndex = args.indexOf('--project');
  const manifestIndex = args.indexOf('--manifest');
  if (projectIndex === -1 || manifestIndex === -1 || !args[projectIndex + 1] || !args[manifestIndex + 1]) {
    fail('usage: node check.mjs --project <project-dir> --manifest <manifest.json>');
  }

  const projectRoot = path.resolve(args[projectIndex + 1]);
  const manifestPath = path.resolve(args[manifestIndex + 1]);
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const result = await validateCertificationManifest({ projectRoot, manifest });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) {
  main(process.argv).catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
