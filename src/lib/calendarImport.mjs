import { normalizePlannerTasks, normalizeStoredPlannerTask, minutesToPlannerTime, plannerTimeToMinutes } from './plannerTasks.mjs';

const decoder = value => value.replace(/\\[nN]/g, '\n').replace(/\\([,;\\])/g, '$1');
const pad = n => String(n).padStart(2, '0');
const dayText = date => `${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${date.getFullYear()}`;
const partsInZone = (date, zone) => Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
  timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
}).formatToParts(date).filter(part => part.type !== 'literal').map(part => [part.type, Number(part.value)]));

function parseTime(property) {
  if (!property || property.params.VALUE === 'DATE' || !/^\d{8}T\d{6}Z?$/.test(property.value)) throw new Error('Use timed events with start and end times. All-day events are not imported.');
  const value = property.value;
  const values = [Number(value.slice(0, 4)), Number(value.slice(4, 6)), Number(value.slice(6, 8)), Number(value.slice(9, 11)), Number(value.slice(11, 13)), Number(value.slice(13, 15))];
  const [year, month, day, hour, minute, second] = values;
  if (year < 2000 || year > 2100 || hour > 23 || minute > 59 || second !== 0) throw new Error('Use whole-minute calendar times between 2000 and 2100.');
  const target = Date.UTC(year, month - 1, day, hour, minute, second);
  const valid = new Date(target);
  if (valid.getUTCMonth() !== month - 1 || valid.getUTCDate() !== day) throw new Error('A calendar event has an invalid date.');
  if (value.endsWith('Z')) {
    if (property.params.TZID) throw new Error('An event cannot combine UTC and a named time zone.');
    return new Date(target);
  }
  const zone = property.params.TZID || Intl.DateTimeFormat().resolvedOptions().timeZone;
  let candidate = target;
  const matches = instant => {
    const p = partsInZone(new Date(instant), zone);
    return [p.year, p.month, p.day, p.hour, p.minute, p.second].every((v, i) => v === values[i]);
  };
  try {
    for (let i = 0; i < 4; i++) {
      const p = partsInZone(new Date(candidate), zone);
      const actual = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
      candidate += target - actual;
    }
    if (!matches(candidate)) throw new Error('gap');
    if ([-120, -60, -30, 30, 60, 120].some(minutes => matches(candidate + minutes * 60000))) throw new Error('overlap');
  } catch { throw new Error('A time zone is unsupported or an event falls in an ambiguous or skipped clock-change hour. Export that event with UTC times.'); }
  return new Date(candidate);
}

function properties(lines) {
  const result = {};
  let alarmDepth = 0;
  for (const line of lines) {
    if (line === 'BEGIN:VALARM') { alarmDepth++; continue; }
    if (line === 'END:VALARM') { alarmDepth--; continue; }
    if (alarmDepth) continue;
    if (/^(BEGIN|END):/.test(line)) throw new Error('Unsupported nested calendar component.');
    const colon = line.indexOf(':');
    if (colon < 1) throw new Error('A calendar property is malformed.');
    const [name, ...parameters] = line.slice(0, colon).split(';');
    const key = name.toUpperCase();
    if (!['UID', 'SUMMARY', 'DTSTART', 'DTEND', 'RRULE', 'RECURRENCE-ID', 'EXDATE', 'RDATE', 'STATUS'].includes(key)) continue;
    if (result[key]) throw new Error(`Repeated ${key} values are not supported.`);
    const params = {};
    for (const parameter of parameters) {
      const equal = parameter.indexOf('=');
      if (equal < 1) throw new Error('Invalid calendar parameter.');
      const param = parameter.slice(0, equal).toUpperCase();
      if (!['TZID', 'VALUE'].includes(param)) throw new Error('Unsupported calendar time parameter.');
      params[param] = parameter.slice(equal + 1).replace(/^"|"$/g, '');
    }
    result[key] = { value: line.slice(colon + 1), params };
  }
  if (alarmDepth) throw new Error('An event reminder is malformed.');
  return result;
}

export function parseCalendarFile(text) {
  if (typeof text !== 'string' || new TextEncoder().encode(text).length > 1024 * 1024) throw new Error('Choose a calendar file no larger than 1 MB.');
  const lines = text.replace(/^\uFEFF/, '').replace(/\r\n[ \t]|\n[ \t]/g, '').split(/\r\n|\n/).filter(Boolean);
  if (lines[0] !== 'BEGIN:VCALENDAR' || lines.at(-1) !== 'END:VCALENDAR') throw new Error('Choose a valid .ics calendar file.');
  const blocks = []; let block = null; let timezoneDepth = 0;
  for (const line of lines.slice(1, -1)) {
    if (line === 'BEGIN:VTIMEZONE') { timezoneDepth++; continue; }
    if (timezoneDepth) { if (line === 'END:VTIMEZONE') timezoneDepth--; continue; }
    if (line === 'BEGIN:VEVENT') { if (block) throw new Error('Nested events are invalid.'); block = []; }
    else if (line === 'END:VEVENT') { if (!block) throw new Error('Unmatched event end.'); blocks.push(block); block = null; }
    else if (block) block.push(line);
    else if (/^(BEGIN|END):/.test(line)) throw new Error('This calendar contains an unsupported component.');
  }
  if (block || timezoneDepth || blocks.length > 1000) throw new Error('The calendar is incomplete or contains more than 1,000 events.');
  const events = []; let cancelled = 0;
  const identities = new Set();
  for (const blockLines of blocks) {
    const p = properties(blockLines);
    if (p.STATUS?.value === 'CANCELLED') { cancelled++; continue; }
    const uid = p.UID?.value;
    if (!uid || uid.length > 512) throw new Error('Every event needs a stable UID of at most 512 characters.');
    if (p['RECURRENCE-ID'] || p.EXDATE || p.RDATE) throw new Error('Export recurring events as individual occurrences when they have exceptions or changed instances.');
    let count = 1; let interval = 1;
    if (p.RRULE) {
      const pairs = p.RRULE.value.split(';').map(item => item.split('='));
      const rule = Object.fromEntries(pairs);
      if (pairs.length !== Object.keys(rule).length || rule.FREQ !== 'WEEKLY' || !/^\d+$/.test(rule.COUNT || '') || Object.keys(rule).some(key => !['FREQ', 'COUNT', 'INTERVAL'].includes(key))) throw new Error('Supported repeats are weekly with a fixed COUNT. Export other repeats as individual events.');
      count = Number(rule.COUNT); interval = Number(rule.INTERVAL || 1);
      if (!Number.isInteger(count) || count < 1 || count > 52 || !Number.isInteger(interval) || interval < 1 || interval > 12) throw new Error('Use at most 52 weekly occurrences, 1 to 12 weeks apart.');
    }
    const shift = (property, weeks) => {
      if (!property) return property;
      const v = property.value;
      const date = new Date(Date.UTC(Number(v.slice(0, 4)), Number(v.slice(4, 6)) - 1, Number(v.slice(6, 8)) + weeks * 7));
      return { ...property, value: `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}${v.slice(8)}` };
    };
    // Validate original values before recurrence arithmetic can normalise bad dates.
    parseTime(p.DTSTART); parseTime(p.DTEND);
    for (let index = 0; index < count; index++) {
      const start = parseTime(shift(p.DTSTART, index * interval));
      const end = parseTime(shift(p.DTEND, index * interval));
      const duration = (end - start) / 60000;
      const minutes = start.getHours() * 60 + start.getMinutes();
      if (duration < 1 || duration > 1440 || minutes + duration > 1440 || end.getTimezoneOffset() !== start.getTimezoneOffset()) throw new Error('Split events that cross midnight or a clock change before importing.');
      const identity = `${uid}\u0000${index}`;
      if (identities.has(identity)) throw new Error('The file contains duplicate event identities.');
      identities.add(identity);
      const name = Array.from(decoder(p.SUMMARY?.value || 'Calendar commitment'))
        .map(character => character.codePointAt(0) < 32 || character.codePointAt(0) === 127 ? ' ' : character).join('').trim().slice(0, 160);
      events.push({ identity, name: name || 'Calendar commitment', date: dayText(start), start: minutes, duration });
      if (events.length > 1000) throw new Error('Choose a smaller calendar export, up to 1,000 occurrences.');
    }
  }
  if (!events.length) throw new Error('This file contains no active timed events.');
  return { events, cancelled };
}

export async function planCalendarImport(events, rawExisting, { accountId, source }) {
  if (typeof accountId !== 'string' || !accountId.trim()) throw new Error('Sign in before importing a calendar.');
  const sourceName = String(source || '').trim();
  if (!sourceName || sourceName.length > 80) throw new Error('Enter a calendar name of 1 to 80 characters.');
  const existing = normalizePlannerTasks(rawExisting);
  const additions = [], conflicts = [], duplicates = [];
  for (const event of events) {
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify([accountId, sourceName, event.identity])));
    const id = 'calendar:' + Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
    const task = normalizeStoredPlannerTask({ id, 'task name': event.name, date: event.date, 'start time': minutesToPlannerTime(event.start), 'task duration': event.duration, taskKind: 'commitment', calendarSource: sourceName });
    const duplicate = existing.find(item => item.id === id);
    if (duplicate) {
      if (['task name', 'date', 'start time', 'task duration'].every(key => duplicate[key] === task[key])) duplicates.push(task);
      else conflicts.push({ task, reason: 'This imported event was edited. Remove its earlier copy before importing the changed version.' });
      continue;
    }
    const conflict = [...existing, ...additions].find(item => !item.completed && item.date === task.date && event.start < plannerTimeToMinutes(item['start time']) + item['task duration'] && event.start + event.duration > plannerTimeToMinutes(item['start time']));
    if (conflict) conflicts.push({ task, reason: `Overlaps “${conflict['task name']}”.` });
    else additions.push(task);
  }
  return { additions, duplicates, conflicts, source: sourceName };
}
