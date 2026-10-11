const REVISION = /^state:[0-9]{13}:[A-Za-z0-9-]{8,64}$/;

function confirmationKey(stateType, stateKey, revision) {
  return JSON.stringify([stateType, stateKey, revision]);
}

/**
 * Partition a learner-state sync batch against the API results.
 * HTTP 200 can still include applied:false conflict rows — those must never be
 * treated as successful mutations (fake success / dropped durable outbox).
 */
export function partitionLearnerStateSyncResults(batch, results) {
  const items = Array.isArray(batch) ? batch : [];
  const byIdentity = new Map();
  for (const result of Array.isArray(results) ? results : []) {
    if (!result || Array.isArray(result)
      || typeof result.stateType !== 'string' || typeof result.stateKey !== 'string'
      || typeof result.requestedRevision !== 'string') continue;
    const key = confirmationKey(result.stateType, result.stateKey, result.requestedRevision);
    // The batch RPC returns exactly one row per logical item. Duplicate rows
    // cannot establish an unambiguous acknowledgement, even if they agree.
    byIdentity.set(key, byIdentity.has(key) ? null : result);
  }

  const applied = [];
  const rejected = [];
  const unresolved = [];

  for (const item of items) {
    const result = byIdentity.get(confirmationKey(item?.stateType, item?.stateKey, item?.clientRevision));
    const hasStoredRevision = typeof result?.currentRevision === 'string' && REVISION.test(result.currentRevision);
    if (hasStoredRevision && result.applied === true && result.currentRevision === item?.clientRevision) applied.push(item);
    else if (hasStoredRevision && result.applied === false && result.currentRevision !== item?.clientRevision) rejected.push(item);
    else unresolved.push(item);
  }

  return { applied, rejected, unresolved };
}
