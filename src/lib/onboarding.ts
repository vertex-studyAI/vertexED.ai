/** Bump when onboarding fields or flow change — prompts existing users once. */
export const ONBOARDING_VERSION = 2;

type UserLike = {
  user_metadata?: Record<string, unknown> | null;
} | null;

export function needsOnboarding(user: UserLike): boolean {
  if (!user) return false;
  const meta = user.user_metadata ?? {};
  if (typeof meta.username !== 'string' || !meta.username.trim()) return true;
  if (meta.onboarding_v2_complete === true) return false;
  if (meta.onboarding_version === ONBOARDING_VERSION) return false;
  return true;
}

export function buildOnboardingCompleteMetadata(
  existing: Record<string, unknown>,
): Record<string, unknown> {
  return {
    ...existing,
    onboarding_v2_complete: true,
    onboarding_version: ONBOARDING_VERSION,
  };
}
