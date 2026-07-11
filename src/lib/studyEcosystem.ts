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

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function getTodayPlannerTasks(): PlannerTaskPreview[] {
  const today = todayUsDate();
  const tasks = readJson<Array<Record<string, unknown>>>('planner_tasks', []);
  return tasks
    .filter((task) => task.date === today)
    .map((task) => ({
      id: String(task.id ?? ''),
      name: String(task['task name'] || task.taskName || 'Study task'),
      startTime: typeof task['start time'] === 'string' ? task['start time'] : undefined,
    }))
    .filter((task) => task.id);
}

export function getRecentActivity(limit = 4): ActivityEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem('studyzone_activity');
    const entries = raw ? (JSON.parse(raw) as ActivityEntry[]) : [];
    return entries.slice(0, limit);
  } catch {
    return [];
  }
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

  const todayKey = new Date().toISOString().slice(0, 10);
  const progressParts: number[] = [];
  if (stats.habitCount > 0) {
    progressParts.push(stats.habitsDoneToday / stats.habitCount);
  }
  if (dueFlashcards > 0) {
    progressParts.push(0);
  }
  if (stats.lastStudyDate === todayKey) {
    progressParts.push(1);
  }
  const dailyProgress =
    progressParts.length > 0
      ? Math.round((progressParts.reduce((a, b) => a + b, 0) / progressParts.length) * 100)
      : 0;

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
      `${examDaysLeft} day${examDaysLeft === 1 ? '' : 's'} to exam — run a timed mock and review weak topics`,
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
