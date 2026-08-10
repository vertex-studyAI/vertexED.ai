import { supabase } from '@/lib/supabaseClient';

const LEGACY_SHARED_SESSION_KEYS = [
  'vertex_apex_prefill',
  'vertex_mock_review_handoff',
  'vertex_exam_answers',
] as const;

let initialized = false;
let activeUserId: string | null | undefined;

export function clearLegacySharedSessionHandoffs() {
  if (typeof window === 'undefined') return;
  for (const key of LEGACY_SHARED_SESSION_KEYS) {
    window.sessionStorage.removeItem(key);
  }
}

/**
 * Fail-closed migration guard for transient study data that historically used
 * browser-global sessionStorage keys. New handoffs should use account-scoped
 * keys, but the exam-answer flow still has a legacy shared key while its large
 * reviewer surface is migrated separately.
 *
 * Clear stale legacy values at bootstrap and whenever auth ownership changes so
 * one account can never inherit another account's transient questions/answers.
 */
export function initTransientSessionIsolation() {
  if (typeof window === 'undefined' || initialized) return () => {};
  initialized = true;

  // A reload is a safe boundary for these one-navigation handoffs. Clearing here
  // also removes values written by older app revisions before account scoping.
  clearLegacySharedSessionHandoffs();

  if (!supabase) return () => {};

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    const nextUserId = session?.user?.id ?? null;
    if (activeUserId !== undefined && activeUserId !== nextUserId) {
      clearLegacySharedSessionHandoffs();
    }
    activeUserId = nextUserId;
  });

  return () => {
    data.subscription.unsubscribe();
    activeUserId = undefined;
    initialized = false;
  };
}
