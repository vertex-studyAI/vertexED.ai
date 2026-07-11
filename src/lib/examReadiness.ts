import { getStudyStats } from '@/lib/studyStats';
import { getWeaknessHeatmap } from '@/lib/weaknessTracker';
import { getProgressTrend } from '@/lib/progressAnalytics';
import { getLoopWeekStatus } from '@/lib/studyLoopTracker';
import { getDueFlashcardCount } from '@/lib/srDeck';
import { daysUntilExam } from '@/lib/curriculum';
import type { LearnerProfile } from '@/lib/learnerProfile';

export type ReadinessBand = 'warming' | 'building' | 'exam-ready' | 'unknown';

export type ExamReadiness = {
  score: number | null;
  band: ReadinessBand;
  label: string;
  hasData: boolean;
  factors: { name: string; score: number; max: number; detail: string }[];
};

function bandForScore(score: number): ReadinessBand {
  if (score >= 72) return 'exam-ready';
  if (score >= 42) return 'building';
  return 'warming';
}

function bandLabel(band: ReadinessBand): string {
  switch (band) {
    case 'exam-ready':
      return 'Closing gaps — keep the loop spinning';
    case 'building':
      return 'Momentum building — one loop step today helps';
    case 'warming':
      return 'Early week — pick one step and start';
    default:
      return 'Complete a session to see a score';
  }
}

export function computeExamReadiness(profile: LearnerProfile): ExamReadiness {
  const stats = getStudyStats();
  const loop = getLoopWeekStatus();
  const heatmap = getWeaknessHeatmap(8);
  const trend = getProgressTrend(false);
  const dueCards = getDueFlashcardCount();
  const examDays = daysUntilExam(profile.curriculum.examDate ?? null);

  const hasData =
    heatmap.length > 0 ||
    loop.completed.length > 0 ||
    stats.studyStreak > 0 ||
    trend.reviewsThisWeek > 0 ||
    dueCards > 0 ||
    stats.activityEntries > 0;

  const loopScore = Math.round((loop.completed.length / 5) * 30);
  const streakScore = Math.min(20, stats.studyStreak * 4);
  const masteryAvg =
    heatmap.length > 0 ? heatmap.reduce((s, h) => s + h.avgPercent, 0) / heatmap.length : 0;
  const masteryScore = heatmap.length > 0 ? Math.round((masteryAvg / 100) * 25) : 0;
  const activityScore = Math.min(
    25,
    trend.reviewsThisWeek * 5 + (stats.activityEntries > 0 ? 5 : 0) + (dueCards > 0 ? 3 : 0),
  );

  let examPressureBonus = 0;
  if (examDays != null && examDays <= 14) {
    examPressureBonus =
      loop.completed.includes('practise') && loop.completed.includes('review') ? 5 : 0;
  }

  const raw = loopScore + streakScore + masteryScore + activityScore + examPressureBonus;
  const score = hasData ? Math.min(100, Math.max(0, raw)) : null;
  const band: ReadinessBand = !hasData ? 'unknown' : bandForScore(score ?? 0);

  const factors = [
    {
      name: 'Study loop',
      score: loopScore,
      max: 30,
      detail: `${loop.completed.length}/5 steps this week`,
    },
    {
      name: 'Consistency',
      score: streakScore,
      max: 20,
      detail: `${stats.studyStreak} day streak`,
    },
    {
      name: 'Topic mastery',
      score: masteryScore,
      max: 25,
      detail: heatmap.length
        ? `${Math.round(masteryAvg)}% avg on tracked topics`
        : 'No review data yet',
    },
    {
      name: 'Active retrieval',
      score: activityScore,
      max: 25,
      detail:
        dueCards > 0
          ? `${dueCards} cards due · ${trend.reviewsThisWeek} reviews (7d)`
          : `${trend.reviewsThisWeek} reviews this week`,
    },
  ];

  if (examPressureBonus > 0) {
    factors.push({
      name: 'Exam week',
      score: examPressureBonus,
      max: 5,
      detail: `Mock + review logged with ${examDays}d to exam`,
    });
  }

  return {
    score,
    band,
    hasData,
    label: bandLabel(band),
    factors,
  };
}
