export const FULL_GIT_SHA_PATTERN = /^[0-9a-f]{40}$/;

export function normalizeImmutableGitSha(value) {
  if (typeof value !== 'string') return null;
  const revision = value.trim().toLowerCase();
  return FULL_GIT_SHA_PATTERN.test(revision) ? revision : null;
}
