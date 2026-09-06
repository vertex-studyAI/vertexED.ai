export function summarizeHeatmapMastery(heatmap) {
  const reviewsCompleted = heatmap.reduce((sum, item) => sum + item.attempts, 0);
  const avgMastery =
    heatmap.length > 0 && reviewsCompleted > 0
      ? Math.round(heatmap.reduce((sum, item) => sum + item.avgPercent, 0) / heatmap.length)
      : null;

  return { reviewsCompleted, avgMastery };
}

function measuredSnapshots(snapshots) {
  return snapshots.filter(
    (snapshot) =>
      snapshot.reviewsCompleted > 0 &&
      typeof snapshot.avgMastery === 'number' &&
      Number.isFinite(snapshot.avgMastery),
  );
}

export function summarizeSnapshotMastery(snapshots) {
  const measured = measuredSnapshots(snapshots);

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

export function summarizeMasteryVelocity(snapshots) {
  const measured = measuredSnapshots(snapshots);
  if (measured.length < 2) {
    return { delta: null, trend: 'flat', measuredCount: measured.length };
  }

  const first = measured[0].avgMastery;
  const last = measured[measured.length - 1].avgMastery;
  const delta = last - first;
  const trend = delta > 3 ? 'up' : delta < -3 ? 'down' : 'flat';

  return { delta, trend, measuredCount: measured.length };
}

export function formatMeasuredMastery(avgMastery) {
  return typeof avgMastery === 'number' && Number.isFinite(avgMastery)
    ? `${Math.round(avgMastery)}%`
    : 'No data';
}

export function estimateStudyMinutes(stats) {
  return stats.studyStreak * 25 + stats.habitsDoneToday * 15;
}
