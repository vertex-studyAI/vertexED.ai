export function localDayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function currentStreak(streak, lastStudyDate, now = new Date()) {
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  return [localDayKey(now), localDayKey(yesterday)].includes(lastStudyDate) && Number.isFinite(streak)
    ? Math.max(0, Math.floor(streak)) : 0;
}
