export function summarizeHeatmapMastery(heatmap) {
  const reviewsCompleted = heatmap.reduce((sum, item) => sum + item.attempts, 0);
  const avgMastery =
    heatmap.length > 0 && reviewsCompleted > 0
      ? Math.round(heatmap.reduce((sum, item) => sum + item.avgPercent, 0) / heatmap.length)
      : null;

  return { reviewsCompleted, avgMastery };
}

export function summarizeSnapshotMastery(snapshots) {
  const measured = snapshots.filter(
    (snapshot) =>
      snapshot.reviewsCompleted > 0 &&
      typeof snapshot.avgMastery === 'number' &&
      Number.isFinite(snapshot.avgMastery),
  );

  let masteryTrend = 'flat';
  if (measured.length >= 2) {
    const first = measured[0].avgMastery;
    const last = measured[measured.length - 1].avgMastery;
    if (last > first + 3) masteryTrend = 'up';
    else if (last < first - 3) masteryTrend = 'down';
  }

  const avgMastery = measured.length
    ? Math.round(measured.reduce((sum, snapshot) => sum + snapshot.avgMastery, 0) / measured.length)
    : null;

  return { avgMastery, masteryTrend, measuredCount: measured.length };
}

export function estimateStudyMinutes(stats) {
  return stats.studyStreak * 25 + stats.habitsDoneToday * 15;
}
