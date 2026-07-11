import type { ExamBoard } from '@/types/curriculum';
import { BOARD_CONFIGS, daysUntilExam } from '@/lib/curriculum';
import { getWeakestTopics, type TopicHeat } from '@/lib/weaknessTracker';
import { getDueFlashcardCount, getCramDueCount } from '@/lib/srDeck';
import { getConfidenceRatings } from '@/lib/portalFeatures';
import type { LearnerProfile } from '@/lib/learnerProfile';
import type { StudyStats } from '@/lib/studyStats';

export type AdaptiveActionKind = 'learn' | 'practice' | 'review' | 'remember' | 'plan' | 'cram';

export type AdaptiveRecommendation = {
  id: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  kind: AdaptiveActionKind;
  title: string;
  description: string;
  to: string;
  subject?: string;
  topic?: string;
  score?: number;
};

export type SubjectMastery = {
  subject: string;
  mastery: number;
  attempts: number;
  trend: 'improving' | 'stable' | 'declining' | 'unknown';
};

export type AdaptivePlan = {
  recommendations: AdaptiveRecommendation[];
  masteryBySubject: SubjectMastery[];
  cramModeActive: boolean;
  focusSubject: string | null;
  estimatedMinutesToday: number;
};

type BuildAdaptiveInput = {
  profile: LearnerProfile;
  stats: StudyStats;
  dueFlashcards: number;
  examDaysLeft: number | null;
  todayTaskCount: number;
};

function masteryFromWeaknesses(weaknesses: TopicHeat[]): SubjectMastery[] {
  const bySubject = new Map<string, { total: number; count: number; scores: number[] }>();

  for (const w of weaknesses) {
    const entry = bySubject.get(w.subject) ?? { total: 0, count: 0, scores: [] };
    entry.total += w.avgPercent;
    entry.count += 1;
    entry.scores.push(w.avgPercent);
    bySubject.set(w.subject, entry);
  }

  return Array.from(bySubject.entries()).map(([subject, data]) => {
    const avg = data.total / data.count;
    const recent = data.scores.slice(0, 3);
    const older = data.scores.slice(3, 6);
    const recentAvg = recent.length ? recent.reduce((a, b) => a + b, 0) / recent.length : avg;
    const olderAvg = older.length ? older.reduce((a, b) => a + b, 0) / older.length : recentAvg;
    let trend: SubjectMastery['trend'] = 'unknown';
    if (data.count >= 2) {
      if (recentAvg > olderAvg + 5) trend = 'improving';
      else if (recentAvg < olderAvg - 5) trend = 'declining';
      else trend = 'stable';
    }
    return {
      subject,
      mastery: Math.round(avg),
      attempts: data.count,
      trend,
    };
  });
}

export function buildAdaptivePlan(input: BuildAdaptiveInput): AdaptivePlan {
  const { profile, stats, dueFlashcards, examDaysLeft, todayTaskCount } = input;
  const { curriculum } = profile;
  const weaknesses = getWeakestTopics(8);
  const cramDue = getCramDueCount();
  const cramModeActive = examDaysLeft !== null && examDaysLeft >= 0 && examDaysLeft <= 7;

  const masteryBySubject = masteryFromWeaknesses(weaknesses);

  const weakest = masteryBySubject.sort((a, b) => a.mastery - b.mastery)[0];
  const focusSubject = weakest?.subject ?? curriculum.subjects[0] ?? null;

  const recs: AdaptiveRecommendation[] = [];

  if (cramModeActive) {
    recs.push({
      id: 'cram-session',
      priority: 'urgent',
      kind: 'cram',
      title: 'Exam cram session',
      description: `${examDaysLeft} day${examDaysLeft === 1 ? '' : 's'} left — high-yield review on weak topics only`,
      to: '/learning-hub?mode=cram',
      subject: focusSubject ?? undefined,
    });
  }

  const confidenceSubjects =
    curriculum.subjects.length > 0
      ? curriculum.subjects
      : masteryBySubject.map((m) => m.subject);
  const confidenceRatings = getConfidenceRatings(confidenceSubjects);

  for (const c of confidenceRatings.filter((r) => r.rating != null && r.rating <= 2 && r.subject)) {
    const weakInSubject = weaknesses.find((w) => w.subject === c.subject);
    recs.push({
      id: `confidence-${c.subject}`,
      priority: 'high',
      kind: 'review',
      title: `Rebuild confidence: ${c.subject}`,
      description: weakInSubject
        ? `You rated this subject low — review ${weakInSubject.topic.slice(0, 36)} with rubric feedback`
        : 'You rated this subject low — a short rubric review can shift how it feels on exam day',
      to: weakInSubject
        ? `/answer-reviewer?subject=${encodeURIComponent(c.subject)}&topic=${encodeURIComponent(weakInSubject.topic)}`
        : `/answer-reviewer?subject=${encodeURIComponent(c.subject)}`,
      subject: c.subject,
      topic: weakInSubject?.topic,
    });
  }

  if (profile.gradeLevel === 'middle_school') {
    recs.push({
      id: 'foundations-quiz',
      priority: 'medium',
      kind: 'practice',
      title: 'Foundation quiz',
      description: 'Shorter questions with clear steps — build confidence before harder papers',
      to: '/notetaker',
    });
  } else if (profile.gradeLevel === 'undergraduate') {
    recs.push({
      id: 'deep-synthesis',
      priority: 'low',
      kind: 'learn',
      title: 'Synthesis notes',
      description: 'Connect ideas across topics — undergraduate exams reward links, not isolated facts',
      to: '/notetaker',
    });
  }

  if (examDaysLeft !== null && examDaysLeft >= 0 && examDaysLeft <= 14) {
    recs.push({
      id: 'timed-mock',
      priority: examDaysLeft <= 7 ? 'urgent' : 'high',
      kind: 'practice',
      title: 'Timed mock exam',
      description: `Simulate ${curriculum.board ? BOARD_CONFIGS[curriculum.board].label : 'board'} conditions under time pressure`,
      to: '/paper-maker',
      subject: focusSubject ?? undefined,
    });
  }

  for (const w of weaknesses.slice(0, 3)) {
    if (w.avgPercent >= 75) continue;
    recs.push({
      id: `weak-${w.subject}-${w.topic}`,
      priority: w.avgPercent < 50 ? 'urgent' : 'high',
      kind: 'review',
      title: `Strengthen: ${w.topic.slice(0, 40)}`,
      description: `${w.subject} — scoring ${Math.round(w.avgPercent)}% on recent attempts`,
      to: `/answer-reviewer?subject=${encodeURIComponent(w.subject)}&topic=${encodeURIComponent(w.topic)}`,
      subject: w.subject,
      topic: w.topic,
      score: w.avgPercent,
    });
  }

  const cardsToReview = cramModeActive ? cramDue : dueFlashcards;
  if (cardsToReview > 0) {
    recs.push({
      id: 'flashcards',
      priority: cramModeActive ? 'urgent' : 'high',
      kind: 'remember',
      title: cramModeActive ? `Cram ${cardsToReview} high-yield cards` : `Review ${cardsToReview} due cards`,
      description: cramModeActive
        ? 'Spaced repetition in exam cram mode — hardest cards first'
        : 'Lock in facts before they slip',
      to: '/notetaker?mode=study',
    });
  }

  if (focusSubject && !recs.some((r) => r.kind === 'practice' && r.subject === focusSubject)) {
    recs.push({
      id: `practice-${focusSubject}`,
      priority: 'medium',
      kind: 'practice',
      title: `Practice ${focusSubject}`,
      description: 'Generate a targeted mock on your weakest subject',
      to: `/paper-maker?subject=${encodeURIComponent(focusSubject)}`,
      subject: focusSubject,
    });
  }

  if (stats.studyStreak === 0) {
    recs.push({
      id: 'focus-session',
      priority: 'medium',
      kind: 'plan',
      title: 'Start a focus session',
      description: '25-minute Pomodoro to build your study streak',
      to: '/study-zone?focus=timer',
    });
  }

  if (todayTaskCount === 0) {
    recs.push({
      id: 'plan-day',
      priority: 'medium',
      kind: 'plan',
      title: 'Plan today\'s study blocks',
      description: 'AI will suggest blocks based on weak topics and exam date',
      to: '/planner?suggest=1',
    });
  }

  if (profile.studyGoal === 'understand_better') {
    recs.push({
      id: 'deep-dive',
      priority: 'low',
      kind: 'learn',
      title: 'Deep-dive with AI tutor',
      description: 'Ask why, not just what — clarify concepts step by step',
      to: '/chatbot',
    });
  }

  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  const recommendations = recs
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, 8);

  const estimatedMinutesToday =
    (cardsToReview > 0 ? Math.min(cardsToReview * 2, 30) : 0) +
    (cramModeActive ? 45 : 25) +
    (weakest && weakest.mastery < 60 ? 30 : 0);

  return {
    recommendations,
    masteryBySubject: masteryBySubject.sort((a, b) => a.mastery - b.mastery),
    cramModeActive,
    focusSubject,
    estimatedMinutesToday,
  };
}

export function getAdaptiveTopicsForQuiz(
  board: ExamBoard | null,
  subjects: string[],
  count = 5,
): string[] {
  const weak = getWeakestTopics(count).map((w) => w.topic);
  if (weak.length >= count) return weak.slice(0, count);
  const filler = subjects.flatMap((s) => [`${s} key concepts`, `${s} exam techniques`]);
  return [...weak, ...filler].slice(0, count);
}
