import { inputDateToPlanner, normalizePlannerTasks, plannerDateToInput, plannerTimeToMinutes } from './plannerTasks.mjs';

const encoder = new TextEncoder();
const stamp = date => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
const escapeText = value => Array.from(String(value)).filter(character => {
  const code = character.codePointAt(0);
  return code >= 32 && code !== 127 || ['\t', '\r', '\n'].includes(character);
}).join('').replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');

// RFC 5545: fold at 75 octets without splitting a UTF-8 character.
function fold(line) {
  let output = '', bytes = 0;
  for (const character of line) {
    const size = encoder.encode(character).length;
    if (bytes + size > 75) { output += '\r\n '; bytes = 1; }
    output += character; bytes += size;
  }
  return output;
}

export function calendarTasks(tasks, from, to) {
  inputDateToPlanner(from); inputDateToPlanner(to);
  if (to < from) throw new Error('Choose an end date on or after the start date.');
  return normalizePlannerTasks(tasks).filter(task => !task.completed && plannerDateToInput(task.date) >= from && plannerDateToInput(task.date) <= to);
}

export async function buildPlannerCalendar(tasks, { from, to, accountId, includeTitles = false, reminderMinutes = null, now = new Date() }) {
  if (typeof accountId !== 'string' || !accountId.trim()) throw new Error('Sign in before exporting your plan.');
  if (![null, 5, 15, 30, 60].includes(reminderMinutes)) throw new Error('Choose a supported reminder time.');
  const selected = calendarTasks(tasks, from, to);
  if (!selected.length) throw new Error('There are no unfinished tasks in this date range.');
  if (selected.length > 1000) throw new Error('Choose a smaller date range (up to 1,000 tasks).');
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//VertexED//Study Planner//EN', 'CALSCALE:GREGORIAN'];
  for (const task of selected) {
    const [year, month, day] = plannerDateToInput(task.date).split('-').map(Number);
    const minutes = plannerTimeToMinutes(task['start time']);
    const start = new Date(year, month - 1, day, Math.floor(minutes / 60), minutes % 60);
    // Reject wall times skipped by daylight saving instead of silently moving work.
    if (start.getFullYear() !== year || start.getMonth() !== month - 1 || start.getDate() !== day || start.getHours() * 60 + start.getMinutes() !== minutes) throw new Error('A task falls in a clock-change gap. Choose another start time before exporting.');
    const end = new Date(start.getTime() + task['task duration'] * 60_000);
    const hash = await crypto.subtle.digest('SHA-256', encoder.encode(JSON.stringify([accountId, task.id])));
    const uid = Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
    const title = includeTitles ? task['task name'] : task.taskKind === 'commitment' ? 'Reserved time' : 'Study block';
    lines.push('BEGIN:VEVENT', `UID:${uid}@vertexed.app`, `DTSTAMP:${stamp(now)}`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`, `SUMMARY:${escapeText(title)}`, 'CLASS:PRIVATE', 'TRANSP:OPAQUE', 'DESCRIPTION:Copied from VertexED. Changes to your plan do not update this calendar copy.');
    if (reminderMinutes !== null) lines.push('BEGIN:VALARM', `TRIGGER:-PT${reminderMinutes}M`, 'ACTION:DISPLAY', `DESCRIPTION:${escapeText(title)}`, 'END:VALARM');
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return { text: lines.map(fold).join('\r\n') + '\r\n', count: selected.length };
}
