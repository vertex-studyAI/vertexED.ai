const ALLOWED_CLASSES = new Set([
  'RECOVERED_EXECUTION_REPORT',
  'RECOVERED_MEASURED',
  'UNVERIFIED_HISTORICAL',
  'PLANNED',
]);

const HISTORICAL_DATASETS = ['paul15', 'pancreas', 'dentate gyrus'];

function requiredString(value, label) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new TypeError(`${label} must be a non-empty string`);
  }
  return value.trim();
}

export function validateRecoveredClaim(claim) {
  if (!claim || typeof claim !== 'object' || Array.isArray(claim)) {
    throw new TypeError('claim must be an object');
  }

  const id = requiredString(claim.id, 'claim.id');
  const text = requiredString(claim.claim, 'claim.claim');
  const evidenceClass = requiredString(claim.evidence_class, 'claim.evidence_class');
  const scope = requiredString(claim.scope, 'claim.scope');
  const status = requiredString(claim.status, 'claim.status');
  const source = requiredString(claim.source, 'claim.source');

  if (!ALLOWED_CLASSES.has(evidenceClass)) {
    throw new RangeError(`unsupported evidence class: ${evidenceClass}`);
  }

  const lower = text.toLowerCase();
  const namesHistoricalDataset = HISTORICAL_DATASETS.some((dataset) => lower.includes(dataset));

  if (evidenceClass === 'RECOVERED_MEASURED' && scope !== 'SYNTHETIC_CONTROLLED') {
    throw new RangeError(`${id}: recovered measured claims must remain SYNTHETIC_CONTROLLED`);
  }

  if (namesHistoricalDataset && evidenceClass === 'RECOVERED_MEASURED') {
    throw new RangeError(`${id}: historical biological dataset claims cannot be promoted to measured`);
  }

  if (scope === 'EXTERNAL_BIOLOGICAL' && !['UNVERIFIED_HISTORICAL', 'PLANNED'].includes(evidenceClass)) {
    throw new RangeError(`${id}: external biological claims must remain unverified or planned`);
  }

  return { id, text, evidenceClass, scope, status, source };
}

export function validateRecoveredManifest(manifest) {
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    throw new TypeError('manifest must be an object');
  }
  if (manifest.project_id !== 'T2424-0016') {
    throw new RangeError('manifest.project_id must be T2424-0016');
  }
  if (manifest.certified_complete !== false) {
    throw new RangeError('recovered PST package must not claim certified completion');
  }
  if (manifest.external_biological_validation !== 'BLOCKED_EXTERNAL') {
    throw new RangeError('external biological validation must remain BLOCKED_EXTERNAL');
  }
  if (!Array.isArray(manifest.claims) || manifest.claims.length === 0) {
    throw new TypeError('manifest.claims must be non-empty');
  }

  const ids = new Set();
  const claims = manifest.claims.map((claim) => {
    const validated = validateRecoveredClaim(claim);
    if (ids.has(validated.id)) throw new RangeError(`duplicate claim id: ${validated.id}`);
    ids.add(validated.id);
    return validated;
  });

  const historical = claims.filter((claim) => claim.evidenceClass === 'UNVERIFIED_HISTORICAL');
  const plannedExternal = claims.filter(
    (claim) => claim.evidenceClass === 'PLANNED' && claim.scope === 'EXTERNAL_BIOLOGICAL',
  );
  const measuredSynthetic = claims.filter((claim) => claim.evidenceClass === 'RECOVERED_MEASURED');

  if (historical.length === 0) {
    throw new RangeError('manifest must explicitly quarantine historical unverified claims');
  }
  if (plannedExternal.length === 0) {
    throw new RangeError('manifest must preserve the external biological validation gate');
  }
  if (measuredSynthetic.length === 0) {
    throw new RangeError('manifest must retain at least one recovered synthetic measured result');
  }

  return {
    projectId: manifest.project_id,
    claimCount: claims.length,
    measuredSyntheticCount: measuredSynthetic.length,
    historicalQuarantinedCount: historical.length,
    plannedExternalCount: plannedExternal.length,
    externalBiologicalValidation: manifest.external_biological_validation,
    certifiedComplete: manifest.certified_complete,
  };
}
