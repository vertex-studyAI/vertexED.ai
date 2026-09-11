import { normalizeMeasuredWeaknessEntry } from './weaknessEvidenceCore.mjs';

function measuredEntries(entries) {
  const seen = new Set();
  return entries.map(normalizeMeasuredWeaknessEntry).filter(entry => {
    if (!entry || !Number.isFinite(Date.parse(entry.recordedAt))) return false;
    const key = entry.id || JSON.stringify(entry);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function countRecentAttempts(entries, now = new Date()) {
  const end = now.getTime();
  const start = end - 7 * 24 * 60 * 60 * 1000;
  return new Set(measuredEntries(entries).filter(entry => {
    const time = Date.parse(entry.recordedAt);
    return time > start && time <= end;
  }).map(entry => entry.attemptId || entry.id || JSON.stringify(entry))).size;
}

export function summarizeMeasuredSubjects(entries) {
  const subjects = new Map();
  for (const entry of measuredEntries(entries)) {
    const rows = subjects.get(entry.subject) || [];
    rows.push(entry);
    subjects.set(entry.subject, rows);
  }
  return [...subjects].map(([subject, rows]) => {
    const topics = new Map();
    for (const row of rows) {
      const key = JSON.stringify([row.board || '', row.topic]);
      const attempts = topics.get(key) || [];
      attempts.push(row);
      topics.set(key, attempts);
    }
    const changes = [...topics.values()].flatMap(attempts => {
      const sorted = attempts.toSorted((a, b) => Date.parse(a.recordedAt) - Date.parse(b.recordedAt));
      const first = sorted[0];
      const last = sorted.at(-1);
      if (Date.parse(first.recordedAt) === Date.parse(last.recordedAt)) return [];
      return [(last.score / last.maxScore - first.score / first.maxScore) * 100];
    });
    const change = changes.reduce((sum, value) => sum + value, 0) / changes.length;
    return {
      subject,
      mastery: Math.round(rows.reduce((sum, row) => sum + row.score / row.maxScore * 100, 0) / rows.length),
      attempts: new Set(rows.map(row => row.attemptId || row.id || JSON.stringify(row))).size,
      trend: !changes.length ? 'unknown' : change > 5 ? 'improving' : change < -5 ? 'declining' : 'stable',
    };
  });
}

function isCalendarDay(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function isFiniteNonNegative(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

export function normalizeProgressSnapshots(values) {
  if (!Array.isArray(values)) return [];
  return values.flatMap((value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return [];
    const { date, studyStreak, habitsDone, habitCount, reviewsCompleted, avgMastery } = value;
    if (
      !isCalendarDay(date) ||
      !isFiniteNonNegative(studyStreak) ||
      !isFiniteNonNegative(habitsDone) ||
      !isFiniteNonNegative(habitCount) ||
      !isFiniteNonNegative(reviewsCompleted) ||
      !(avgMastery === null || (typeof avgMastery === 'number' && Number.isFinite(avgMastery)))
    ) {
      return [];
    }
    return [{ date, studyStreak, habitsDone, habitCount, reviewsCompleted, avgMastery }];
  });
}

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
