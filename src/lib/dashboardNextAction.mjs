// Keep the upstream Today priority and the saved-work recovery fallback together.
export function dashboardNextAction({ todayItem, pendingMock, retry, recentId, loading = false }) {
  if (todayItem) return { to: todayItem.href, label: 'Start next step' };
  if (pendingMock) return pendingMock.status === 'in_progress'
    ? { to: '/paper-maker?resumeMock=1', label: 'Resume your mock' }
    : { to: '/answer-reviewer', label: 'Review your mock' };
  if (retry) return { to: retry.href, label: `Retry ${retry.topic}` };
  if (loading) return { to: '/study-notebook', label: 'Open your study notebook' };
  if (recentId) return { to: `/saved-work?item=${encodeURIComponent(recentId)}`, label: 'Continue your latest work' };
  return { to: '/study-notebook?start=1', label: 'Start your first study session' };
}
