import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  NINE_GATES,
  validateCertificationManifest,
} from '../portfolio/project2424/tools/certification-readiness/check.mjs';

async function withProject(run) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'p2424-certification-'));
  try {
    await run(root);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
}

function manifestWithGateFactory(factory, declaredStatus = 'CERTIFICATION_PENDING') {
  return {
    schemaVersion: 1,
    projectId: 'T2424-0034',
    declaredStatus,
    gates: Object.fromEntries(NINE_GATES.map((gate) => [gate, factory(gate)])),
  };
}

async function writeEvidence(root, relativePath = 'evidence/result.json', content = '{"ok":true}\n') {
  const absolutePath = path.join(root, relativePath);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, content, 'utf8');
  return {
    path: relativePath,
    sha256: createHash('sha256').update(content).digest('hex'),
  };
}

test('pending manifests report missing gates without promoting status', async () => {
  await withProject(async (root) => {
    const evidence = await writeEvidence(root);
    const manifest = manifestWithGateFactory((gate) =>
      gate === 'source_identity'
        ? { passed: true, evidence: [{ path: evidence.path }] }
        : { passed: false, evidence: [] }
    );

    const result = await validateCertificationManifest({ projectRoot: root, manifest });
    assert.equal(result.validatedStatus, 'CERTIFICATION_PENDING');
    assert.equal(result.eligibleForCertifiedComplete, false);
    assert.deepEqual(result.missingGates, NINE_GATES.filter((gate) => gate !== 'source_identity'));
    assert.deepEqual(result.unpinnedEvidence, [`source_identity:${evidence.path}`]);
    assert.equal(result.boundary.verifiesScientificCorrectness, false);
    assert.equal(result.boundary.authorizesStatusPromotion, false);
  });
});

test('a passed gate without evidence fails closed', async () => {
  await withProject(async (root) => {
    const manifest = manifestWithGateFactory((gate) => ({
      passed: gate === 'source_identity',
      evidence: [],
    }));

    await assert.rejects(
      validateCertificationManifest({ projectRoot: root, manifest }),
      /source_identity is marked passed without evidence references/
    );
  });
});

test('CERTIFIED_COMPLETE requires every gate and pinned evidence hashes', async () => {
  await withProject(async (root) => {
    const evidence = await writeEvidence(root);
    const missingGateManifest = manifestWithGateFactory(
      (gate) =>
        gate === 'independent_qa'
          ? { passed: false, evidence: [] }
          : { passed: true, evidence: [{ path: evidence.path, sha256: evidence.sha256 }] },
      'CERTIFIED_COMPLETE'
    );

    await assert.rejects(
      validateCertificationManifest({ projectRoot: root, manifest: missingGateManifest }),
      /CERTIFIED_COMPLETE is unsupported; missing gates: independent_qa/
    );

    const unpinnedManifest = manifestWithGateFactory(
      () => ({ passed: true, evidence: [{ path: evidence.path }] }),
      'CERTIFIED_COMPLETE'
    );
    await assert.rejects(
      validateCertificationManifest({ projectRoot: root, manifest: unpinnedManifest }),
      /certified evidence references require sha256/
    );
  });
});

test('hash mismatches and path escapes fail closed', async () => {
  await withProject(async (root) => {
    const evidence = await writeEvidence(root);
    const badHash = '0'.repeat(64);
    const hashManifest = manifestWithGateFactory((gate) =>
      gate === 'source_identity'
        ? { passed: true, evidence: [{ path: evidence.path, sha256: badHash }] }
        : { passed: false, evidence: [] }
    );
    await assert.rejects(
      validateCertificationManifest({ projectRoot: root, manifest: hashManifest }),
      /evidence hash mismatch/
    );

    const escapeManifest = manifestWithGateFactory((gate) =>
      gate === 'source_identity'
        ? { passed: true, evidence: [{ path: '../outside.txt' }] }
        : { passed: false, evidence: [] }
    );
    await assert.rejects(
      validateCertificationManifest({ projectRoot: root, manifest: escapeManifest }),
      /evidence path escapes project root/
    );
  });
});

test('a fully pinned nine-gate manifest can reach mechanical certification readiness', async () => {
  await withProject(async (root) => {
    const references = {};
    for (const gate of NINE_GATES) {
      references[gate] = await writeEvidence(root, `evidence/${gate}.txt`, `${gate}\n`);
    }
    const manifest = manifestWithGateFactory(
      (gate) => ({
        passed: true,
        evidence: [{ path: references[gate].path, sha256: references[gate].sha256 }],
      }),
      'CERTIFIED_COMPLETE'
    );

    const result = await validateCertificationManifest({ projectRoot: root, manifest });
    assert.equal(result.validatedStatus, 'CERTIFICATION_READY');
    assert.equal(result.eligibleForCertifiedComplete, true);
    assert.deepEqual(result.missingGates, []);
    assert.deepEqual(result.unpinnedEvidence, []);
    assert.equal(Object.keys(result.gateResults).length, 9);
    assert.equal(result.boundary.verifiesExternalValidity, false);
    assert.equal(result.boundary.verifiesIndependenceOfQaAuthor, false);
  });
});

test('the manifest gate set is exact and rejects invented or omitted gates', async () => {
  await withProject(async (root) => {
    const manifest = manifestWithGateFactory(() => ({ passed: false, evidence: [] }));
    delete manifest.gates.raw_results;
    manifest.gates.novelty = { passed: false, evidence: [] };

    await assert.rejects(
      validateCertificationManifest({ projectRoot: root, manifest }),
      /gates must contain exactly the nine contract keys/
    );
  });
});
