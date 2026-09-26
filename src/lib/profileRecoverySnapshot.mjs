const CURRICULUM_FIELDS = ['board', 'grade', 'subjects', 'exam_date'];

function snapshotFilter(field, value) {
  if (value === null) return ['is', field, null];
  if (field === 'grade' && Number.isInteger(value)) return ['eq', field, value];
  if ((field === 'board' || field === 'exam_date') && typeof value === 'string') {
    return ['eq', field, value];
  }
  if (field === 'subjects' && Array.isArray(value)) {
    const elements = [];
    for (const subject of value) {
      if (subject === null) {
        elements.push('NULL');
      } else if (typeof subject === 'string') {
        // Postgres text[] input: quote every string, including the literal "NULL",
        // and escape backslashes/quotes. The client URL-encodes the eq value.
        elements.push(`"${subject.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`);
      } else {
        throw new TypeError('Cannot guard a malformed curriculum snapshot.');
      }
    }
    return ['eq', field, `{${elements.join(',')}}`];
  }
  throw new TypeError('Cannot guard an incomplete or malformed curriculum snapshot.');
}

/**
 * Add an atomic compare-and-set guard to an already user-scoped UPDATE builder.
 *
 * Compare the entire observed curriculum, not just the fields being repaired:
 * an intervening board change must also prevent a stale subjects-only repair.
 * Null and empty arrays are distinct. No timestamp precision/trigger is assumed.
 * A no-match response is a benign conflict; the caller refreshes without retrying
 * the stale patch. This does not replace the caller's user-id filter or RLS.
 */
export function withCurriculumRecoverySnapshot(query, snapshot) {
  // Validate everything before mutating even one filter on the query builder.
  const filters = CURRICULUM_FIELDS.map(field => {
    if (!snapshot || !Object.prototype.hasOwnProperty.call(snapshot, field)) {
      throw new TypeError('Cannot guard an incomplete curriculum snapshot.');
    }
    return snapshotFilter(field, snapshot[field]);
  });
  return filters.reduce((guarded, [method, field, value]) => (
    method === 'is' ? guarded.is(field, value) : guarded.eq(field, value)
  ), query);
}
