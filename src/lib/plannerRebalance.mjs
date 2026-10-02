import { createPlannerTask, inputDateToPlanner, inputTimeToMinutes, minutesToPlannerTime, normalizePlannerTasks, normalizeStoredPlannerTask, plannerDateToInput, plannerTimeToMinutes } from './plannerTasks.mjs';

const dateText = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const startDate = task => {
  const [year, month, day] = plannerDateToInput(task.date).split('-').map(Number);
  return new Date(year, month - 1, day, 0, plannerTimeToMinutes(task['start time']));
};

// A bounded weekly series is materialised into ordinary conflict-checked tasks.
// Each occurrence can be moved or removed without silently recreating it.
export function createWeeklyCommitments(input, existing, weeks = 4) {
  if (!Number.isInteger(weeks) || weeks < 2 || weeks > 12) throw new Error('Choose 2 to 12 weekly occurrences.');
  const [year, month, day] = input.date.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const result = [];
  inputDateToPlanner(input.date);
  for (let index = 0; index < weeks; index++) {
    const task = createPlannerTask({ ...input, id: `${input.id}:${index}`, date: dateText(date) }, [...existing, ...result]);
    result.push({ ...task, taskKind: 'commitment', seriesId: input.id });
    date.setDate(date.getDate() + 7);
  }
  return result;
}

export function isMissedTask(task, now = new Date()) {
  return !task.completed && task.taskKind !== 'commitment' && startDate(task).getTime() + task['task duration'] * 60_000 <= now.getTime();
}

// Only tasks explicitly enabled by the learner can move. Deadline and daily
// limits are hard constraints; an unplaceable task stays visible in backlog.
export function rebalanceMissedTasks(rawTasks, now = new Date()) {
  const tasks = normalizePlannerTasks(rawTasks);
  const candidates = tasks.filter(task => task.reschedule && isMissedTask(task, now))
    .sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999') || (b.priority || 2) - (a.priority || 2) || startDate(a) - startDate(b));
  const candidateIds = new Set(candidates.map(task => task.id));
  const placed = tasks.filter(task => !candidateIds.has(task.id));
  const changed = new Map();
  const backlog = [];
  for (const task of candidates) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const duration = task['task duration'];
    const from = inputTimeToMinutes(task.reschedule.from), to = inputTimeToMinutes(task.reschedule.to);
    let replacement;
    for (let offset = 0; offset < 14 && !replacement; offset++, date.setDate(date.getDate() + 1)) {
      const iso = dateText(date), day = inputDateToPlanner(iso);
      if (task.dueDate && iso > task.dueDate) break;
      const dayTasks = placed.filter(item => item.date === day);
      const studyMinutes = dayTasks.filter(item => item.taskKind !== 'commitment').reduce((sum, item) => sum + item['task duration'], 0);
      // Use the smallest configured daily limit among study tasks on this day.
      const budget = Math.min(task.reschedule.dailyMinutes, ...dayTasks.filter(item => item.reschedule).map(item => item.reschedule.dailyMinutes));
      if (studyMinutes + duration > budget) continue;
      const first = offset === 0 ? Math.max(from, Math.ceil((now.getHours() * 60 + now.getMinutes() + 15) / 15) * 15) : from;
      for (let minute = first; minute + duration <= to; minute += 15) {
        if (dayTasks.some(item => !item.completed && minute < plannerTimeToMinutes(item['start time']) + item['task duration'] && minute + duration > plannerTimeToMinutes(item['start time']))) continue;
        replacement = normalizeStoredPlannerTask({ ...task, date: day, 'start time': minutesToPlannerTime(minute),
          rescheduledFrom: task.rescheduledFrom || `${task.date} ${task['start time']}`, rescheduledAt: now.toISOString() });
        break;
      }
    }
    if (replacement) { placed.push(replacement); changed.set(task.id, replacement); }
    else { placed.push(task); backlog.push(task.id); }
  }
  return { tasks: rawTasks.map(task => changed.get(task.id) || task), moved: changed.size, backlog };
}

export function plannerWorkload(rawTasks, now = new Date()) {
  const tasks = normalizePlannerTasks(rawTasks);
  const end = new Date(now); end.setDate(end.getDate() + 7);
  const weekAgo = now.getTime() - 7 * 86400_000;
  const study = tasks.filter(task => task.taskKind !== 'commitment');
  return {
    planned: study.filter(task => !task.completed && startDate(task) >= now && startDate(task) < end).reduce((sum, task) => sum + task['task duration'], 0),
    completed: study.filter(task => task.completed && Date.parse(task.completedAt) >= weekAgo && Date.parse(task.completedAt) <= now.getTime()).reduce((sum, task) => sum + task['task duration'], 0),
    backlog: study.filter(task => isMissedTask(task, now)),
  };
}
