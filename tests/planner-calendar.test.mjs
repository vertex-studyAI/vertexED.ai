import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPlannerCalendar, calendarTasks } from '../src/lib/plannerCalendar.mjs';

const task = (patch = {}) => ({ id: 'study-1', 'task name': 'Private revision topic', date: '09/28/2026', 'start time': '11:30 PM', 'task duration': 30, reviewContext: { answer: 'SECRET ANSWER' }, ...patch });
const options = { from: '2026-09-28', to: '2026-10-04', accountId: 'account-a', now: new Date('2026-09-28T00:00:00Z') };
const unfold = text => text.replace(/\r\n /g, '');
const uid = text => text.match(/UID:(.*)/)[1];

test('calendar range excludes completed and outside dates and keeps both boundaries', () => {
  const selected = calendarTasks([task(), task({ id: 'end', date: '10/04/2026' }), task({ id: 'old', date: '09/27/2026' }), task({ id: 'done', completed: true }), task({ id: 'later', date: '10/05/2026' })], options.from, options.to);
  assert.deepEqual(selected.map(item => item.id), ['study-1', 'end']);
  assert.throws(() => calendarTasks([], '2026-02-30', options.to));
  assert.throws(() => calendarTasks([], options.to, options.from));
});

test('default exports omit task names, account IDs, notes and reminders', async () => {
  const result = await buildPlannerCalendar([task()], options);
  assert.equal(result.count, 1);
  assert.match(result.text, /SUMMARY:Study block/);
  assert.match(result.text, /CLASS:PRIVATE/);
  for (const privateText of ['Private revision topic', 'SECRET ANSWER', 'account-a', 'VALARM']) assert.ok(!result.text.includes(privateText));
  assert.ok(result.text.endsWith('END:VCALENDAR\r\n'));
});

test('IDs stay stable for re-exports and are distinct across accounts', async () => {
  const a = (await buildPlannerCalendar([task()], options)).text;
  const same = (await buildPlannerCalendar([task({ 'task name': 'Edited' })], { ...options, now: new Date() })).text;
  const b = (await buildPlannerCalendar([task()], { ...options, accountId: 'account-b' })).text;
  assert.equal(uid(a), uid(same)); assert.notEqual(uid(a), uid(b));
});

test('escaped titles cannot inject events; UTF-8 folds never exceed 75 bytes', async () => {
  const title = '📚é'.repeat(60) + '\r\nEND:VEVENT\r\nBEGIN:VEVENT;,\\';
  const { text } = await buildPlannerCalendar([task({ 'task name': title })], { ...options, includeTitles: true, reminderMinutes: 15 });
  assert.equal(text.split('\r\nBEGIN:VEVENT').length - 1, 1);
  for (const line of text.split('\r\n')) assert.ok(Buffer.byteLength(line) <= 75);
  assert.match(unfold(text), /\\nEND:VEVENT\\nBEGIN:VEVENT\\;\\,\\\\/);
  assert.match(text, /TRIGGER:-PT15M/);
  assert.equal(text.split('BEGIN:VALARM').length - 1, 1);
  assert.ok(!text.includes('�'));
});

test('UTC conversion preserves a midnight end and a non-whole-hour offset', async () => {
  const original = process.env.TZ;
  try {
    process.env.TZ = 'Asia/Kolkata';
    const { text } = await buildPlannerCalendar([task()], options);
    assert.match(text, /DTSTART:20260928T180000Z/);
    assert.match(text, /DTEND:20260928T183000Z/);
    process.env.TZ = 'UTC';
    const utc = await buildPlannerCalendar([task()], options);
    assert.match(utc.text, /DTEND:20260929T000000Z/);
  } finally { if (original === undefined) delete process.env.TZ; else process.env.TZ = original; }
});

test('daylight-saving gaps reject, repeated times choose the first occurrence, durations remain elapsed minutes', async () => {
  const original = process.env.TZ;
  try {
    process.env.TZ = 'America/New_York';
    await assert.rejects(buildPlannerCalendar([task({ date: '03/08/2026', 'start time': '02:30 AM' })], { ...options, from: '2026-03-08', to: '2026-03-08' }), /clock-change gap/);
    const { text } = await buildPlannerCalendar([task({ date: '11/01/2026', 'start time': '01:30 AM', 'task duration': 60 })], { ...options, from: '2026-11-01', to: '2026-11-01' });
    assert.match(text, /DTSTART:20261101T053000Z/); assert.match(text, /DTEND:20261101T063000Z/);
  } finally { if (original === undefined) delete process.env.TZ; else process.env.TZ = original; }
});

test('empty, invalid, duplicate, unauthenticated and unsupported reminder exports reject', async () => {
  await assert.rejects(buildPlannerCalendar([], options), /no unfinished/);
  await assert.rejects(buildPlannerCalendar([task(), task()], options), /duplicate/);
  await assert.rejects(buildPlannerCalendar([task({ 'task duration': -1 })], options));
  await assert.rejects(buildPlannerCalendar([task()], { ...options, accountId: '' }), /Sign in/);
  await assert.rejects(buildPlannerCalendar([task()], { ...options, reminderMinutes: -5 }), /reminder/);
});
