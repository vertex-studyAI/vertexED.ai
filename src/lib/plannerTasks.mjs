// Calendar arithmetic is local-date based. Times are minutes within one day.
export function inputDateToPlanner(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Choose a valid date.');
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (year < 2000 || year > 2100 || date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) throw new Error('Choose a valid date between 2000 and 2100.');
  return `${value.slice(5, 7)}/${value.slice(8, 10)}/${value.slice(0, 4)}`;
}

export function plannerDateToInput(value) {
  if (typeof value !== 'string' || !/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) throw new Error('Choose a valid date.');
  const [month, day, year] = value.split('/');
  const result = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  inputDateToPlanner(result);
  return result;
}

export function inputTimeToMinutes(value) {
  if (typeof value !== 'string' || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) throw new Error('Choose a valid start time.');
  const [hour, minute] = value.split(':').map(Number);
  return hour * 60 + minute;
}

export function plannerTimeToMinutes(value) {
  const match = typeof value === 'string' && value.match(/^(0?[1-9]|1[0-2]):([0-5]\d)\s+(AM|PM)$/i);
  if (!match) throw new Error('Choose a valid start time.');
  return (Number(match[1]) % 12 + (match[3].toUpperCase() === 'PM' ? 12 : 0)) * 60 + Number(match[2]);
}

export function minutesToPlannerTime(value) {
  const minutes = value % 1440;
  const hour = Math.floor(minutes / 60);
  return `${String(hour % 12 || 12).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
}

export function plannerTimeToInput(value) {
  const minutes = plannerTimeToMinutes(value);
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

export function normalizeStoredPlannerTask(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) || typeof raw.id !== 'string' || !raw.id.trim()) throw new Error('A saved task has no valid identity.');
  const name = raw['task name'] ?? raw.taskName;
  const start = plannerTimeToMinutes(raw['start time'] ?? raw.startTime);
  const duration = Number(raw['task duration'] ?? raw.taskDuration);
  if (typeof name !== 'string' || !name.trim() || !Number.isInteger(duration) || duration < 1 || duration > 1440 || start + duration > 1440) throw new Error('A saved task has invalid details.');
  return { ...raw, 'task name': name, date: inputDateToPlanner(plannerDateToInput(raw.date)), 'start time': minutesToPlannerTime(start), 'task duration': duration, 'end time': minutesToPlannerTime(start + duration) };
}

export function normalizePlannerTasks(value) {
  if (!Array.isArray(value)) throw new Error('Saved tasks must be a list.');
  const tasks = value.map(normalizeStoredPlannerTask);
  if (new Set(tasks.map(task => task.id)).size !== tasks.length) throw new Error('Saved tasks contain duplicate identities.');
  return tasks;
}

function conflictAt(tasks, date, start, duration, excludeId) {
  return tasks.find(task => task.id !== excludeId && plannerDateToInput(task.date) === plannerDateToInput(date)
    && start < plannerTimeToMinutes(task['start time']) + task['task duration']
    && start + duration > plannerTimeToMinutes(task['start time']));
}

export function createPlannerTask({ id, name, date, startTime, duration }, existing = [], excludeId) {
  if (typeof name !== 'string' || !name.trim() || name.trim().length > 160) throw new Error('Enter a task name of 1 to 160 characters.');
  const minutes = Number(duration);
  if (!Number.isInteger(minutes) || minutes < 15 || minutes > 480) throw new Error('Choose a duration from 15 to 480 whole minutes.');
  const start = inputTimeToMinutes(startTime);
  if (start + minutes > 1440) throw new Error('This task runs past midnight. Shorten it or choose an earlier start.');
  const task = normalizeStoredPlannerTask({ id, 'task name': name.trim(), date: inputDateToPlanner(date), 'start time': minutesToPlannerTime(start), 'task duration': minutes });
  const conflict = conflictAt(normalizePlannerTasks(existing), task.date, start, minutes, excludeId);
  if (conflict) throw new Error(`This overlaps “${conflict['task name']}”. Choose another time.`);
  return task;
}

// Search every occupied day, including rollover days. Never silently double-book.
export function placeSuggestedTasks(suggestions, existing, now = new Date()) {
  if (!Array.isArray(suggestions) || suggestions.length === 0 || suggestions.length > 200) throw new Error('No usable tasks were returned. Add a task manually or try again.');
  const placed = normalizePlannerTasks(existing);
  const result = [];
  for (const raw of suggestions) {
    // The API may suggest a block crossing midnight. Placement finds a full slot.
    const duration = Number(raw?.['task duration']);
    const name = raw?.['task name'];
    if (!Number.isInteger(duration) || duration < 15 || duration > 480 || typeof name !== 'string' || !name.trim() || name.length > 160 || typeof raw?.id !== 'string') throw new Error('The suggested task is invalid. Add it manually or try again.');
    const [year, month, day] = plannerDateToInput(raw.date).split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let start = plannerTimeToMinutes(raw['start time']);
    if (date < today) { date.setTime(today.getTime()); start = 8 * 60; }
    let task;
    for (let offset = 0; offset < 31 && !task; offset++) {
      const dateText = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const usDate = inputDateToPlanner(dateText);
      if (date.getTime() === today.getTime()) start = Math.max(start, Math.ceil((now.getHours() * 60 + now.getMinutes() + 15) / 15) * 15);
      for (; start + duration <= 1440; start += 15) {
        if (!conflictAt(placed, usDate, start, duration)) {
          task = normalizeStoredPlannerTask({ ...raw, date: usDate, 'start time': minutesToPlannerTime(start) });
          break;
        }
      }
      date.setDate(date.getDate() + 1);
      start = 8 * 60;
    }
    if (!task) throw new Error('No free slot was found within 31 days. Choose a time manually.');
    placed.push(task);
    result.push(task);
  }
  return result;
}
