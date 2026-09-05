import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(
  new URL("../src/features/study-calendar/components/Calendar.tsx", import.meta.url),
  "utf8",
);

const nativeControlStyles = await readFile(
  new URL("../src/features/study-calendar/styles/calendar-native-controls.css", import.meta.url),
  "utf8",
);

test("planner calendar exposes valid grouped date-picker semantics", () => {
  assert.match(source, /className="calendar-grid" role="group" aria-label="Choose a date"/);
  assert.doesNotMatch(source, /className="calendar-grid" role="grid"/);
  assert.equal(source.split("aria-label={`Select ${dayDate.toLocaleDateString").length - 1, 3);
  assert.doesNotMatch(source, /Previous month day|Next month day/);
  assert.match(source, /aria-label="Previous month" type="button"/);
  assert.match(source, /aria-label="Next month" type="button"/);
});

test("planner calendar month heading excludes navigation controls", () => {
  assert.match(source, /<div className="calendar-header">/);
  assert.doesNotMatch(source, /className="calendar-header" role="heading"/);
  assert.match(source, /<span role="heading" aria-level=\{2\} aria-live="polite">/);
});

test("planner calendar uses native date buttons without custom keyboard emulation", () => {
  assert.equal(source.match(/<button\n\s+key=/g)?.length, 3);
  assert.equal(source.match(/type="button"\n\s+className=/g)?.length, 3);
  assert.doesNotMatch(source, /role="button"/);
  assert.doesNotMatch(source, /tabIndex=\{0\}/);
  assert.doesNotMatch(source, /e\.key === 'Enter' \|\| e\.key === ' '/);
});

test("planner calendar distinguishes the real current date from the selected date", () => {
  assert.match(source, /const isSameCalendarDay = \(left: Date, right: Date\) =>/);
  assert.match(source, /const today = new Date\(\);/);
  assert.equal(
    source.split("aria-current={isSameCalendarDay(dayDate, today) ? 'date' : undefined}").length - 1,
    3,
  );
  assert.equal(
    source.split("aria-pressed={isSameCalendarDay(dayDate, currentDate)}").length - 1,
    3,
  );
  assert.doesNotMatch(source, /aria-current=\{i === currentDay \? 'date' : undefined\}/);
});

test("native date-button reset preserves planner styling without browser chrome", () => {
  assert.match(source, /import "\.\.\/styles\/calendar-native-controls\.css";/);
  assert.match(nativeControlStyles, /button\.calendar-day/);
  assert.match(nativeControlStyles, /appearance: none;/);
  assert.match(nativeControlStyles, /border: 0;/);
  assert.match(nativeControlStyles, /background-color: transparent;/);
});