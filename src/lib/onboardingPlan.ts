import type { TaskItem } from '@/features/study-calendar/components/Schedule';
import type { PlannerSnapshot } from '@/lib/plannerSync';
import { daysUntilExam } from '@/lib/curriculum';
import type { CurriculumPreference } from '@/types/curriculum';

function formatPlannerDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function createTaskId(index: number): string {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `starter-plan-${Date.now()}-${index}`;
}

function formatTime(totalMinutes: number): string {
  const hour24 = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 || 12;
  return `${String(hour12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
}

/**
 * Produces a useful first week without spending an AI request. The user can
 * refine it in the planner or ask the planner AI for a longer plan afterwards.
 */
export function createFirstStudyPlan(preference: CurriculumPreference): PlannerSnapshot {
  const subjects = preference.subjects.slice(0, 6);
  const daysLeft = daysUntilExam(preference.examDate);
  const examIsNear = daysLeft !== null && daysLeft <= 21;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tasks: TaskItem[] = subjects.map((subject, index) => {
    const sessionDate = new Date(today);
    sessionDate.setDate(today.getDate() + index);
    const isPracticeSession = examIsNear || index % 2 === 1;
    const duration = isPracticeSession ? 60 : 45;
    const startMinutes = (index % 2 === 0 ? 17 : 18) * 60;

    return {
      id: createTaskId(index),
      'task name': isPracticeSession
        ? `${subject}: timed practice and review`
        : `${subject}: priority-topic review`,
      'start time': formatTime(startMinutes),
      'task duration': duration,
      'end time': formatTime(startMinutes + duration),
      date: formatPlannerDate(sessionDate),
      subject,
      source: 'onboarding',
    };
  });

  return {
    tasks,
    mode: 'Week',
    updatedAt: new Date().toISOString(),
  };
}
