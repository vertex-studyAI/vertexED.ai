/**
 * Portal intelligence — aggregates learner signals into dashboard widget payloads.
 */

import type { LearnerProfile } from '@/lib/learnerProfile';
import type { AdaptivePlan, SubjectMastery } from '@/lib/adaptiveLearning';
import type { RetrievalPulse } from '@/lib/retrievalPulse';
import type { StudyStats } from '@/lib/studyStats';
import type { ProgressTrend } from '@/lib/progressAnalytics';
import { getWeaknessHeatmap } from '@/lib/weaknessTracker';
import { getProgressTrend } from '@/lib/progressAnalytics';
import { getLoopWeekStatus, LOOP_STEPS, type LoopStep } from '@/lib/studyLoopTracker';
import { loadSrDeck, getDueFlashcardCount } from '@/lib/srDeck';
import { dueCards } from '@/lib/spacedRepetition';
import { daysUntilExam, BOARD_CONFIGS } from '@/lib/curriculum';

const CONFIDENCE_KEY = 'vertex_confidence_checkin_v1';
const EXAM_NIGHT_KEY = 'vertex_exam_night_checklist_v1';
const TARGET_MARK = 80;

export type MemoryDecayItem = {
  topic: string;
  subject: string;
  daysSince: number;
  avgPercent: number;
};

export type MarksGap = {
  subject: string;
  current: number;
  target: number;
  gap: number;
};

export type FlashcardBucket = {
  label: string;
  due: number;
};

export type ExamNightItem = { id: string; label: string };

export type PortalIntelligence = {
  apexBrief: string;
  memoryDecay: MemoryDecayItem[];
  revisionVelocity: { delta: number; label: string; trend: 'up' | 'down' | 'flat' };
  marksGaps: MarksGap[];
  interleave: { subjects: string[]; reason: string };
  examNight: { active: boolean; items: ExamNightItem[] };
  focusScore: number;
  flashcardHeatmap: FlashcardBucket[];
  weakSprint: { topic: string; subject: string; href: string; minutes: number } | null;
  loopClosure: { step: LoopStep; label: string; href: string } | null;
  boardTip: string;
  streakCalendar: Array<{ date: string; active: boolean }>;
  readinessIndex: number;
  readinessLabel: string;
  dueFlashcards: number;
};

const BOARD_TIPS: Record<string, string> = {
  IB_DP: 'IB mark schemes reward command terms in the question stem — underline them before you write.',
  IB_MYP: 'MYP criteria want explicit links to the statement of inquiry — name the criterion you are hitting.',
  IGCSE: 'IGCSE examiners want concise points; one mark usually equals one clear idea.',
  A_LEVELS: 'A Level essays need a line of argument in the intro — state your judgment early.',
  AP: 'AP FRQs: label diagrams and show units; partial credit is generous when working is visible.',
  GCSE: 'GCSE 6-markers need a conclusion that directly answers the question.',
  ICSE: 'ICSE step marking rewards neat working — never skip units or intermediate lines.',
  CBSE: 'CBSE long answers need point-wise structure with labelled diagrams where applicable.',
};

function daysSince(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(ms / 86400000));
}

function readActivityDates(limit = 14): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('studyzone_activity');
    if (!raw) return [];
    const entries = JSON.parse(raw) as Array<{ createdAt: string }>;
    return entries.slice(0, limit).map((e) => e.createdAt.slice(0, 10));
  } catch {
    return [];
  }
}

function buildStreakCalendar(stats: StudyStats): PortalIntelligence['streakCalendar'] {
  const activityDates = new Set(readActivityDates(14));
  if (stats.lastStudyDate) activityDates.add(stats.lastStudyDate);

  const days: PortalIntelligence['streakCalendar'] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, active: activityDates.has(key) });
  }
  return days;
}

function buildFlashcardHeatmap(): FlashcardBucket[] {
  const deck = loadSrDeck();
  const due = dueCards(deck);
  const buckets = new Map<string, number>();
  for (const card of due) {
    const deckName = card.id.split('-')[0] || 'General';
    buckets.set(deckName, (buckets.get(deckName) ?? 0) + 1);
  }
  return Array.from(buckets.entries())
    .map(([label, count]) => ({ label, due: count }))
    .sort((a, b) => b.due - a.due)
    .slice(0, 6);
}

function buildApexBrief(pulse: RetrievalPulse, profile: LearnerProfile): string {
  const name = profile.displayName.split(' ')[0] || 'there';
  if (pulse.readiness.score >= 75) {
    return `${name}, retrieval and loop look solid — protect sleep before the paper and avoid new chapters the night before.`;
  }
  if (pulse.loopGap) {
    const step = LOOP_STEPS.find((s) => s.id === pulse.loopGap);
    return `${name}, you haven't "${step?.label ?? pulse.loopGap}" this week yet — that's the best thing to do tonight.`;
  }
  if (pulse.signals.some((s) => s.urgency === 'high')) {
    const urgent = pulse.signals.find((s) => s.urgency === 'high');
    return `${name}, ${urgent?.value ?? 'one priority'} needs attention before you add new content.`;
  }
  return `${name} — ${pulse.nextAction.reason}`;
}

export function buildPortalIntelligence(
  profile: LearnerProfile,
  stats: StudyStats,
  adaptivePlan: AdaptivePlan,
  pulse: RetrievalPulse,
): PortalIntelligence {
  const trend = getProgressTrend(false);
  const heatmap = getWeaknessHeatmap(12);
  const examDays = daysUntilExam(profile.curriculum.examDate ?? null);
  const loop = getLoopWeekStatus();

  const memoryDecay = heatmap
    .filter((h) => daysSince(h.lastSeen) >= 5)
    .map((h) => ({
      topic: h.topic,
      subject: h.subject,
      daysSince: daysSince(h.lastSeen),
      avgPercent: h.avgPercent,
    }))
    .slice(0, 5);

  const last7 = trend.snapshots.slice(-7);
  let delta = 0;
  let velocityTrend: PortalIntelligence['revisionVelocity']['trend'] = 'flat';
  if (last7.length >= 2) {
    delta = last7[last7.length - 1].avgMastery - last7[0].avgMastery;
    if (delta > 3) velocityTrend = 'up';
    else if (delta < -3) velocityTrend = 'down';
  }
  const velocityLabel =
    velocityTrend === 'up'
      ? `+${delta}% mastery this week`
      : velocityTrend === 'down'
        ? `${delta}% dip — schedule a review block`
        : 'Steady — add one deliberate practice session';

  const marksGaps: MarksGap[] = adaptivePlan.masteryBySubject
    .map((m) => ({
      subject: m.subject,
      current: m.mastery,
      target: TARGET_MARK,
      gap: Math.max(0, TARGET_MARK - m.mastery),
    }))
    .filter((g) => g.gap > 0)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 5);

  const curriculumSubjects = profile.curriculum.subjects;
  const interleaveSubjects =
    curriculumSubjects.length >= 2
      ? [curriculumSubjects[0], curriculumSubjects[1]]
      : subjects.length >= 2
        ? [subjects[0], subjects[1]]
        : [];
  const interleave = {
    subjects: interleaveSubjects,
    reason:
      interleaveSubjects.length >= 2
        ? 'Mixing two subjects in one session helps long-term retention — try 25 minutes each with a short break.'
        : 'Add at least two subjects in settings to get an interleaved session plan.',
  };

  const examNight =
    examDays != null && examDays <= 3
      ? {
          active: true,
          items: [
            { id: 'pack-id', label: 'Pack ID, pens, calculator (if allowed)' },
            { id: 'command-sheet', label: 'Skim your command-term sheet — no new content tonight' },
            { id: 'retrieval', label: 'Run 10-minute retrieval on your weakest topic only' },
            { id: 'alarm', label: 'Set alarm with buffer time for travel' },
            { id: 'sleep', label: 'Sleep beats one more chapter' },
          ],
        }
      : { active: false, items: [] };

  const habitRatio = stats.habitCount > 0 ? stats.habitsDoneToday / stats.habitCount : 0;
  const loopRatio = loop.completed.length / 5;
  const focusScore = Math.round(
    Math.min(100, habitRatio * 35 + loopRatio * 35 + Math.min(stats.studyStreak, 14) * 2.14 + trend.avgMastery * 0.15),
  );

  const weakSprint = weakest
    ? {
        topic: weakest.topic,
        subject: weakest.subject,
        href: `/answer-reviewer?subject=${encodeURIComponent(weakest.subject)}&topic=${encodeURIComponent(weakest.topic)}`,
        minutes: profile.preferences.sessionMinutes >= 20 ? 15 : profile.preferences.sessionMinutes,
      }
    : null;

  const missing = loop.missing[0];
  const loopClosure = missing
    ? {
        step: missing,
        label: LOOP_STEPS.find((s) => s.id === missing)?.label ?? missing,
        href: LOOP_STEPS.find((s) => s.id === missing)?.href ?? '/main',
      }
    : null;

  const board = profile.curriculum.board;
  const boardTip =
    (board && BOARD_TIPS[board]) ||
    (board ? `Your ${BOARD_CONFIGS[board]?.label ?? board} rewards structured answers — plan before you write.` : 'Set your exam board in settings for mark-scheme-specific coaching.');

  const readinessIndex = Math.min(100, Math.max(0, pulse.readiness.score));
  const readinessLabel =
    readinessIndex >= 75
      ? 'Strong retrieval band'
      : readinessIndex >= 55
        ? 'Building — keep the loop closed'
        : 'Focus on mocks and review';

  return {
    apexBrief: buildApexBrief(pulse, profile),
    memoryDecay,
    revisionVelocity: { delta, label: velocityLabel, trend: velocityTrend },
    marksGaps,
    interleave,
    examNight,
    focusScore,
    flashcardHeatmap: buildFlashcardHeatmap(),
    weakSprint,
    loopClosure,
    boardTip,
    streakCalendar: buildStreakCalendar(stats),
    readinessIndex,
    readinessLabel,
    dueFlashcards: getDueFlashcardCount(),
  };
}

export function getExamNightDone(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(EXAM_NIGHT_KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(parsed);
  } catch {
    return new Set();
  }
}

export function toggleExamNightItem(id: string): Set<string> {
  const done = getExamNightDone();
  if (done.has(id)) done.delete(id);
  else done.add(id);
  localStorage.setItem(EXAM_NIGHT_KEY, JSON.stringify([...done]));
  return done;
}

// ── Confidence check-in ──────────────────────────────────────────────

export type ConfidenceRating = {
  subject: string;
  rating: 1 | 2 | 3 | 4 | 5;
  updatedAt: string;
};

function readConfidence(): Record<string, ConfidenceRating> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(CONFIDENCE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, ConfidenceRating>) : {};
  } catch {
    return {};
  }
}

export function getConfidenceRatings(subjects: string[]): ConfidenceRating[] {
  const store = readConfidence();
  return subjects.map((subject) => store[subject] ?? { subject, rating: 3 as const, updatedAt: '' });
}

export function setConfidenceRating(subject: string, rating: 1 | 2 | 3 | 4 | 5) {
  const store = readConfidence();
  store[subject] = { subject, rating, updatedAt: new Date().toISOString() };
  localStorage.setItem(CONFIDENCE_KEY, JSON.stringify(store));
}

// ── Data export ──────────────────────────────────────────────────────

export function exportLearnerSnapshot(profile: LearnerProfile, stats: StudyStats) {
  const payload = {
    exportedAt: new Date().toISOString(),
    profile: {
      displayName: profile.displayName,
      curriculum: profile.curriculum,
      studyGoal: profile.studyGoal,
    },
    stats,
    weakness: getWeaknessHeatmap(50),
    progress: getProgressTrend(false),
    confidence: readConfidence(),
    loop: getLoopWeekStatus(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vertexed-learner-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function masteryLabel(m: SubjectMastery): string {
  if (m.mastery >= 80) return 'On target (80%+)';
  if (m.mastery >= 65) return 'Building';
  return 'Below target — drill this';
}
