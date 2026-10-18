import assert from 'node:assert/strict';
import test from 'node:test';
import { parseCalendarFile, planCalendarImport } from '../src/lib/calendarImport.mjs';

const calendar = (...events) => ['BEGIN:VCALENDAR', 'VERSION:2.0', ...events.flatMap(lines => ['BEGIN:VEVENT', ...lines, 'END:VEVENT']), 'END:VCALENDAR'].join('\r\n');
const event = (uid = 'class-1', extra = []) => [`UID:${uid}`, 'SUMMARY:Physics\\, lesson', 'DTSTART:20261014T100000Z', 'DTEND:20261014T110000Z', ...extra];
const opts = { accountId: 'account-a', source: 'School' };

test('calendar import reads folded/escaped titles but does not retain private descriptions or links', () => {
  const { events } = parseCalendarFile(calendar(event('one', ['DESCRIPTION:PRIVATE NOTES', 'URL:https://secret.test', 'ATTENDEE:mailto:secret@example.test'])));
  assert.equal(events.length, 1);
  assert.equal(events[0].name, 'Physics, lesson');
  assert.doesNotMatch(JSON.stringify(events), /PRIVATE|secret/);
  assert.equal(parseCalendarFile(calendar(event().map(line => line.startsWith('SUMMARY') ? 'SUMMARY:Long\r\n  title' : line))).events[0].name, 'Long title');
});

test('named-zone weekly recurrence preserves local time across daylight saving', () => {
  const original = process.env.TZ;
  process.env.TZ = 'Europe/London';
  try {
    const { events } = parseCalendarFile(calendar(['UID:weekly', 'DTSTART;TZID=Europe/London:20261021T100000', 'DTEND;TZID=Europe/London:20261021T110000', 'RRULE:FREQ=WEEKLY;COUNT=3']));
    assert.equal(events.length, 3);
    assert.deepEqual(events.map(item => item.start), [600, 600, 600]);
    assert.deepEqual(events.map(item => item.date), ['10/21/2026', '10/28/2026', '11/04/2026']);
  } finally { if (original === undefined) delete process.env.TZ; else process.env.TZ = original; }
});

test('invalid, unbounded and ambiguous events fail before any planner write', () => {
  for (const fields of [
    ['UID:a', 'DTSTART;VALUE=DATE:20261014', 'DTEND;VALUE=DATE:20261015'],
    ['UID:a', 'DTSTART:20260230T100000Z', 'DTEND:20260230T110000Z'],
    ['UID:a', 'DTSTART;TZID=America/New_York:20260308T023000', 'DTEND;TZID=America/New_York:20260308T033000'],
    ['UID:a', 'DTSTART;TZID=America/New_York:20261101T013000', 'DTEND;TZID=America/New_York:20261101T023000'],
    event('a', ['RRULE:FREQ=WEEKLY']), event('a', ['RRULE:FREQ=WEEKLY;COUNT=9999']),
    event('a', ['RRULE:FREQ=DAILY;COUNT=3']), event('a', ['RECURRENCE-ID:20261014T100000Z']),
  ]) assert.throws(() => parseCalendarFile(calendar(fields)));
  assert.throws(() => parseCalendarFile('x'.repeat(1024 * 1024 + 1)), /1 MB/);
  assert.throws(() => parseCalendarFile(calendar(event(), event())), /duplicate event/);
});

test('repeat imports are idempotent, account scoped, fixed and safe against overlaps and source edits', async () => {
  const { events } = parseCalendarFile(calendar(event()));
  const first = await planCalendarImport(events, [], opts);
  assert.equal(first.additions.length, 1);
  assert.equal(first.additions[0].taskKind, 'commitment');
  assert.equal(first.additions[0].calendarSource, 'School');
  assert.equal(first.additions[0].reschedule, undefined);
  const repeated = await planCalendarImport(events, first.additions, opts);
  assert.equal(repeated.additions.length, 0);
  assert.equal(repeated.duplicates.length, 1);
  const other = await planCalendarImport(events, [], { ...opts, accountId: 'account-b' });
  assert.notEqual(other.additions[0].id, first.additions[0].id);
  const changed = await planCalendarImport([{ ...events[0], name: 'Changed class' }], first.additions, opts);
  assert.equal(changed.conflicts.length, 1);
  const manual = { ...first.additions[0], id: 'manual', calendarSource: undefined };
  const overlap = await planCalendarImport(events, [manual], opts);
  assert.equal(overlap.additions.length, 0);
  assert.match(overlap.conflicts[0].reason, /Overlaps/);
  assert.equal(manual.id, 'manual');
});

test('cancelled events never delete existing tasks and partial overlaps remain explicitly excluded', async () => {
  const result = parseCalendarFile(calendar(event('cancelled', ['STATUS:CANCELLED']), event('a'), event('b')));
  assert.equal(result.cancelled, 1);
  const plan = await planCalendarImport(result.events, [], opts);
  assert.equal(plan.additions.length, 1);
  assert.equal(plan.conflicts.length, 1);
});
