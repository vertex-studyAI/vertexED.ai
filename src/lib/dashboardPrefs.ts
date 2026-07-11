const HIDE_READINESS_KEY = 'vertex_hide_exam_readiness';

export function getHideExamReadiness(userMetadata?: Record<string, unknown> | null): boolean {
  if (userMetadata?.hide_exam_readiness === true) return true;
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(HIDE_READINESS_KEY) === '1';
  } catch {
    return false;
  }
}

export function setHideExamReadiness(hide: boolean, persistLocal = true): void {
  if (typeof window === 'undefined') return;
  try {
    if (persistLocal) {
      window.localStorage.setItem(HIDE_READINESS_KEY, hide ? '1' : '0');
    }
  } catch {
    /* ignore */
  }
}
