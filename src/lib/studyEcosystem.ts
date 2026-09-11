import { getStudyStats, type StudyStats } from '@/lib/studyStats';
import { getDueFlashcardCount } from '@/lib/srDeck';
import {
  getGoalLearningPath,
  getLearnerProfile,
  getTimeGreeting,
  type LearnerProfile,
  type LearningPathStep,
} from '@/lib/learnerProfile';
import { type ActivityEntry } from '@/lib/studyActivity';
import {
  boardLabel,
  daysUntilExam,
  getThisWeekFocus,
} from '@/lib/curriculum';
import { buildAdaptivePlan, type AdaptivePlan } from '@/lib/adaptiveLearning';
import { plannerStorageKeys } from '@/lib/plannerStorageScope.mjs';
import { userContentStorageKeys } from '@/lib/userContentStorageScope.mjs';
import {
  parseStoredArray,
  resolveLocalStorage,
  safeStorageGet,
} from '@/lib/browserStorage.mjs';

export type { ActivityEntry };

export type PlannerTaskPreview = {
  id: string;
  name: string;
  startTime?: string;
};

export type EcosystemBrief = {
  stats: StudyStats;
  profile: LearnerProfile;
  greeting: string;
  dueFlashcards: number;
  todayTasks: PlannerTaskPreview[];
  recentActivity: ActivityEntry[];
  learningPath: LearningPathStep[];
  dailyProgress: number;
  suggestions: string[];
  weekFocus: string[];
  examDaysLeft: number | null;
  boardLabel: string | null;
  adaptivePlan: AdaptivePlan;
};

function todayUsDate(): string {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function readStoredArray(key: string): unknown[] {
  if (typeof window === 'undefined') return [];
  const storage = resolveLocalStorage(window);
  return parseStoredArray(safeStorageGet(storage, key));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isActivityEntry(value: unknown): value is ActivityEntry {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.message === 'string'
    && typeof value.createdAt === 'string'
    && Number.isFinite(Date.parse(value.createdAt));
}

export function getTodayPlannerTasks(): PlannerTaskPreview[] {
  const today = todayUsDate();
  return readStoredArray(plannerStorageKeys().tasks)
    .filter(isRecord)
    .filter((task) => task.date === today && typeof task.id === 'string' && task.id.trim())
    .map((task) => ({
      id: task.id as string,
      name: typeof task['task name'] === 'string'
        ? task['task name']
        : typeof task.taskName === 'string'
          ? task.taskName
          : 'Study task',
      startTime: typeof task['start time'] === 'string' ? task['start time'] : undefined,
    }));
}

export function getRecentActivity(limit = 4): ActivityEntry[] {
  const { activity } = userContentStorageKeys();
  return readStoredArray(activity)
    .filter(isActivityEntry)
    .slice(0, Math.max(0, Math.floor(limit)));
}

export function buildEcosystemBrief(
  user: Parameters<typeof getLearnerProfile>[0],
): EcosystemBrief {
  const stats = getStudyStats();
  const profile = getLearnerProfile(user);
  const dueFlashcards = getDueFlashcardCount();
  const todayTasks = getTodayPlannerTasks();
  const recentActivity = getRecentActivity(4);
  const learningPath = getGoalLearningPath(profile.studyGoal);

  const habitProgress =
    stats.habitCount > 0 ? stats.habitsDoneToday / stats.habitCount : 0;
  const flashProgress = dueFlashcards === 0 ? 1 : 0;
  const plannerProgress = todayTasks.length === 0 ? 0.5 : 0;
  const streakSignal = stats.studyStreak > 0 ? 1 : 0;
  const dailyProgress = Math.round(
    ((habitProgress + flashProgress + plannerProgress + streakSignal) / 4) * 100,
  );

  const suggestions: string[] = [];
  if (dueFlashcards > 0) {
    suggestions.push(`Review ${dueFlashcards} flashcard${dueFlashcards === 1 ? '' : 's'} due today`);
  }
  if (todayTasks.length > 0) {
    suggestions.push(`${todayTasks.length} planner task${todayTasks.length === 1 ? '' : 's'} scheduled for today`);
  }
  if (stats.habitCount > 0 && stats.habitsDoneToday < stats.habitCount) {
    const left = stats.habitCount - stats.habitsDoneToday;
    suggestions.push(`Complete ${left} habit${left === 1 ? '' : 's'} in Study Zone`);
  }
  if (stats.studyStreak === 0) {
    suggestions.push('Start a focus session to begin your study streak');
  }
  if (profile.studyGoal === 'ace_exams' && !suggestions.some((s) => s.includes('Mock'))) {
    suggestions.push('Run a mock paper under timed conditions');
  }

  const { curriculum } = profile;
  const examDaysLeft = daysUntilExam(curriculum.examDate);
  if (examDaysLeft !== null && examDaysLeft >= 0 && examDaysLeft <= 21) {
    suggestions.unshift(
      `${examDaysLeft} day${examDaysLeft === 1 ? '' : 's'} to exam - run a timed mock and review weak topics`,
    );
  }
  if (curriculum.board && !curriculum.subjects.length) {
    suggestions.push(`Add your ${boardLabel(curriculum.board)} subjects in settings for personalized paths`);
  }

  const weekFocus = getThisWeekFocus(curriculum.board, curriculum.subjects, examDaysLeft);

  const adaptivePlan = buildAdaptivePlan({
    profile,
    stats,
    dueFlashcards,
    examDaysLeft,
    todayTaskCount: todayTasks.length,
  });

  const adaptiveSuggestions = adaptivePlan.recommendations
    .slice(0, 2)
    .map((r) => r.title);
  for (const s of adaptiveSuggestions) {
    if (!suggestions.includes(s)) suggestions.unshift(s);
  }

  return {
    stats,
    profile,
    greeting: getTimeGreeting(),
    dueFlashcards,
    todayTasks,
    recentActivity,
    learningPath,
    dailyProgress,
    suggestions: suggestions.slice(0, 4),
    weekFocus,
    examDaysLeft,
    boardLabel: boardLabel(curriculum.board),
    adaptivePlan,
  };
}
