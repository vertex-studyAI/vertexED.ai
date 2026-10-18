import { createFirstStudyPlan } from './onboardingPlan';
import { loadPlannerSnapshot, savePlannerSnapshot } from './plannerSync';
import { getUserContentStorageScope } from './userContentStorageScope.mjs';
import { studySyncError } from './studySyncError.mjs';
import type { CurriculumPreference } from '@/types/curriculum';

export async function saveInitialStudyPlan(preference: CurriculumPreference, accountId: string, accessToken: string): Promise<{ ok: boolean; cloudSynced: boolean; error?: string }> {
  const current = () => getUserContentStorageScope() === accountId;
  const accountChanged = () => ({ ok: false, cloudSynced: false, error: 'Account changed. Sign in again before finishing setup.' });
  if (!current()) return accountChanged();
  const persist = async (snapshot: Parameters<typeof savePlannerSnapshot>[0]) => {
    const result = await savePlannerSnapshot(snapshot, accountId, accessToken);
    return { ...result, error: result.error ? studySyncError(result.error, 'sync') : undefined };
  };
  const loaded = await loadPlannerSnapshot(accountId);
  if (!current()) return accountChanged();
  if (loaded.readOnly) return {
    ok: false, cloudSynced: false,
    error: 'Your saved planner could not be read safely. Original work is preserved. Restore it before finishing setup.',
  };
  // This precise pending state is emitted only after successful cloud parsing
  // and reconciliation. All outage, invalid-response and conflict states stop
  // setup; an unavailable cloud must never be mistaken for an empty planner.
  if (!loaded.cloudSynced && loaded.error !== 'Local edits are waiting to sync.') return {
    ok: false, cloudSynced: false,
    error: 'Could not check your saved planner. Check your connection and retry; existing work has not been replaced.',
  };
  if (loaded.snapshot.tasks.length > 0) {
    if (loaded.cloudSynced) return { ok: true, cloudSynced: true };
    return persist(loaded.snapshot);
  }
  return persist({
    ...createFirstStudyPlan(preference),
    coursework: loaded.snapshot.coursework ?? [],
  });
}
