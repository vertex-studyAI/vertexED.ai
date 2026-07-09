import { getStudyStats, type StudyStats } from '@/lib/studyStats';
import { getDueFlashcardCount } from '@/lib/srDeck';
import {
  getGoalLearningPath,
  getLearnerProfile,
  getTimeGreeting,
  type LearnerProfile,
  type LearningPathStep,
} from '@/lib/learnerProfile';

export type ActivityEntry = {
  id: string;
  message: string;
  createdAt: string;
};

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
  const entries = readJson<ActivityEntry[]>('studyzone_activity', []);
  return entries.slice(0, limit);
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
  };
}
