export const ACCOUNT_EXPORT_SCHEMA = 'vertexed.account-export.v1';
export const ACCOUNT_EXPORT_PAGE_SIZE = 500;
export const ACCOUNT_EXPORT_MAX_ROWS = 20_000;

/**
 * Exhaust an owner-scoped Supabase query without silently truncating exports.
 * The query factory must return a builder already constrained to the owner.
 */
export async function listAllOwnedRows(queryFactory, options = {}) {
  const pageSize = options.pageSize ?? ACCOUNT_EXPORT_PAGE_SIZE;
  const maxRows = options.maxRows ?? ACCOUNT_EXPORT_MAX_ROWS;
  const rows = [];

  for (let from = 0; from < maxRows; from += pageSize) {
    const { data, error } = await queryFactory().range(from, from + pageSize - 1);
    if (error) throw error;
    const page = Array.isArray(data) ? data : [];
    rows.push(...page);
    if (page.length < pageSize) return rows;
  }

  // Probe for one more row. An explicit failure is safer than presenting a
  // partial privacy export as complete.
  const { data, error } = await queryFactory().range(maxRows, maxRows);
  if (error) throw error;
  if (Array.isArray(data) && data.length > 0) {
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
