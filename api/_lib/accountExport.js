export const ACCOUNT_EXPORT_SCHEMA = 'vertexed.account-export.v1';
export const ACCOUNT_EXPORT_PAGE_SIZE = 500;
export const ACCOUNT_EXPORT_MAX_ROWS = 20_000;

function invalidPage() {
  const error = new Error('Account export returned an invalid database page.');
  error.code = 'EXPORT_INVALID_PAGE';
  return error;
}

function validatePage(data, expectedRows) {
  if (!Array.isArray(data) || data.length > expectedRows
    || data.some(row => !row || typeof row !== 'object' || Array.isArray(row))) {
    throw invalidPage();
  }
  return data;
}

/**
 * Exhaust an owner-scoped Supabase query without silently truncating exports.
 * The query factory must be constrained to the owner and ordered by stable,
 * unique identity columns. This traversal is not a transaction-wide snapshot.
 */
export async function listAllOwnedRows(queryFactory, options = {}) {
  const pageSize = options.pageSize ?? ACCOUNT_EXPORT_PAGE_SIZE;
  const maxRows = options.maxRows ?? ACCOUNT_EXPORT_MAX_ROWS;
  const rowKey = options.rowKey;
  if (!Number.isSafeInteger(pageSize) || pageSize <= 0
    || !Number.isSafeInteger(maxRows) || maxRows <= 0
    || (rowKey !== undefined && typeof rowKey !== 'function')) {
    throw new TypeError('Account export requires positive integer limits and an optional row-key function.');
  }
  const rows = [];
  const seen = new Set();

  for (let from = 0; from < maxRows; from += pageSize) {
    const to = Math.min(from + pageSize, maxRows) - 1;
    const { data, error } = await queryFactory().range(from, to);
    if (error) throw error;
    const expectedRows = to - from + 1;
    const page = validatePage(data, expectedRows);
    if (rowKey) {
      for (const row of page) {
        const key = rowKey(row);
        if (typeof key !== 'string' || !key.trim()) throw invalidPage();
        if (seen.has(key)) {
          const duplicate = new Error('Account export repeated a database row. Try again for a complete export.');
          duplicate.code = 'EXPORT_DUPLICATE_ROW';
          throw duplicate;
        }
        seen.add(key);
      }
    }
    rows.push(...page);
    if (page.length < expectedRows) return rows;
  }

  // Probe for one more row. An explicit failure is safer than presenting a
  // partial privacy export as complete.
  const { data, error } = await queryFactory().range(maxRows, maxRows);
  if (error) throw error;
  if (validatePage(data, 1).length > 0) {
    const errorWithCode = new Error('Account export exceeds the supported row limit. Contact support for a complete export.');
    errorWithCode.code = 'EXPORT_ROW_LIMIT';
    throw errorWithCode;
  }

  return rows;
}

export function buildAccountExport({ user, profile, waitlist, studyArtifacts, learnerState, exportedAt }) {
  const providers = Array.from(new Set(
    (Array.isArray(user?.identities) ? user.identities : [])
      .map((identity) => identity?.provider)
      .filter((provider) => typeof provider === 'string' && provider.length > 0),
  ));

  return {
    schema: ACCOUNT_EXPORT_SCHEMA,
    complete: true,
    exportedAt,
    account: {
      id: user.id,
      email: user.email ?? null,
      createdAt: user.created_at ?? null,
      updatedAt: user.updated_at ?? null,
      providers,
      userMetadata: user.user_metadata ?? {},
    },
    profile: profile ?? null,
    waitlist: waitlist ?? null,
    studyArtifacts,
    learnerState,
    counts: {
      studyArtifacts: studyArtifacts.length,
      learnerState: learnerState.length,
    },
    exclusions: [
      'Server observability is privacy-minimised and not linked to account identities.',
      'Authentication secrets, sessions, password hashes, service metadata, and invite tokens are never exported.',
    ],
  };
}
