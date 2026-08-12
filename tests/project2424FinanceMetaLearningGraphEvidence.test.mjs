import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { validateCertificationManifest } from '../portfolio/project2424/tools/certification-readiness/check.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const projectRoot = path.join(repoRoot, 'portfolio/project2424/projects/T2424-0040');

test('implementation-independent verifier recomputes retained graph evidence', () => {
  const verifier = path.join(projectRoot, 'reproduction/verify.mjs');
  const summary = JSON.parse(
    execFileSync(process.execPath, [verifier], { encoding: 'utf8' }),
  );

  assert.equal(summary.projectId, 'T2424-0040');
  assert.equal(
    summary.resultSha256,
    '2b48ddb63ed9a58c4100fed2b9cb6e0c032737f7ea359edfc9a55822d2ba709f',
  );
  assert.equal(summary.prerequisiteAware.violatingSelections, 0);
  assert.equal(summary.prerequisiteAware.completedConcepts, 6);
  assert.equal(summary.utilityOnlyBaseline.violatingSelections, 5);
  assert.equal(summary.utilityOnlyBaseline.unmetPrerequisiteEdges, 7);
  assert.equal(summary.verdict, 'PASS_CONTROLLED_PREREQUISITE_ORDERING_MECHANICS');
  assert.equal(summary.boundary.importsSchedulerImplementation, false);
  assert.equal(summary.boundary.realLearnerValidation, false);
});

test('nine-gate manifest stays pending on unresolved source identity', async () => {
  const manifest = JSON.parse(
    await fs.readFile(path.join(projectRoot, 'certification-manifest.json'), 'utf8'),
  );
  const result = await validateCertificationManifest({ projectRoot, manifest });

  assert.equal(result.declaredStatus, 'CERTIFICATION_PENDING');
  assert.equal(result.validatedStatus, 'CERTIFICATION_PENDING');
  assert.equal(result.eligibleForCertifiedComplete, false);
  assert.deepEqual(result.missingGates, ['source_identity']);
  assert.equal(result.gateResults.independent_qa.passed, true);
  assert.ok(result.unpinnedEvidence.length > 0);
  assert.equal(result.boundary.authorizesStatusPromotion, false);
});
