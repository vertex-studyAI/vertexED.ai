import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  validateRecoveredClaim,
  validateRecoveredManifest,
} from '../portfolio/project2424/projects/T2424-0016/src/evidence_gate.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const manifestPath = path.join(
  here,
  '..',
  'portfolio',
  'project2424',
  'projects',
  'T2424-0016',
  'evidence',
  'recovered_claims.json',
);
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

test('recovered PST manifest validates with external gate preserved', () => {
  const summary = validateRecoveredManifest(manifest);
  assert.equal(summary.projectId, 'T2424-0016');
  assert.equal(summary.claimCount, 7);
  assert.equal(summary.measuredSyntheticCount, 4);
  assert.equal(summary.historicalQuarantinedCount, 1);
  assert.equal(summary.plannedExternalCount, 1);
  assert.equal(summary.externalBiologicalValidation, 'BLOCKED_EXTERNAL');
  assert.equal(summary.certifiedComplete, false);
});

test('historical Paul15 metrics cannot be promoted to recovered measured evidence', () => {
  assert.throws(
    () =>
      validateRecoveredClaim({
        id: 'bad-paul15',
        claim: 'Paul15 AUROC was 0.99.',
        evidence_class: 'RECOVERED_MEASURED',
        scope: 'SYNTHETIC_CONTROLLED',
        status: 'SUPPORTED',
        source: 'historical manuscript',
      }),
    /historical biological dataset claims cannot be promoted to measured/,
  );
});

test('recovered measured evidence cannot be relabelled external biological', () => {
  assert.throws(
    () =>
      validateRecoveredClaim({
        id: 'bad-scope',
        claim: 'A measured external result.',
        evidence_class: 'RECOVERED_MEASURED',
        scope: 'EXTERNAL_BIOLOGICAL',
        status: 'SUPPORTED',
        source: 'report',
      }),
    /must remain SYNTHETIC_CONTROLLED/,
  );
});

test('manifest cannot claim certified completion', () => {
  assert.throws(
    () => validateRecoveredManifest({ ...manifest, certified_complete: true }),
    /must not claim certified completion/,
  );
});

test('manifest cannot silently clear the external biological blocker', () => {
  assert.throws(
    () => validateRecoveredManifest({ ...manifest, external_biological_validation: 'COMPLETE' }),
    /must remain BLOCKED_EXTERNAL/,
  );
});

test('manifest requires explicit quarantine of historical evidence', () => {
  const claims = manifest.claims.filter((claim) => claim.evidence_class !== 'UNVERIFIED_HISTORICAL');
  assert.throws(
    () => validateRecoveredManifest({ ...manifest, claims }),
    /explicitly quarantine historical unverified claims/,
  );
});
