/**
 * Partition a learner-state sync batch against the API results.
 * HTTP 200 can still include applied:false conflict rows — those must never be
 * treated as successful mutations (fake success / dropped durable outbox).
 */
export function partitionLearnerStateSyncResults(batch, results) {
  const items = Array.isArray(batch) ? batch : [];
  const byRevision = new Map();
  for (const result of Array.isArray(results) ? results : []) {
    if (!result || typeof result.requestedRevision !== 'string') continue;
    byRevision.set(result.requestedRevision, result);
  }

  const applied = [];
  const rejected = [];
  const unresolved = [];

  for (const item of items) {
    const result = byRevision.get(item?.clientRevision);
    if (result?.applied === true) applied.push(item);
    else if (result && result.applied === false) rejected.push(item);
    else unresolved.push(item);
  }

  return { applied, rejected, unresolved };
}
