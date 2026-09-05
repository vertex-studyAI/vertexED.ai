import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(
  new URL("../src/features/study-calendar/components/TimeLeftWidget.tsx", import.meta.url),
  "utf8",
);

test("planner time bars expose bounded native progress semantics", () => {
  assert.equal(source.match(/role="progressbar"/g)?.length, 3);
  assert.equal(source.match(/aria-valuemin=\{0\}/g)?.length, 3);
  assert.equal(source.match(/aria-valuemax=\{100\}/g)?.length, 3);
  assert.match(source, /aria-valuenow=\{hourProgress\}/);
  assert.match(source, /aria-valuenow=\{dayProgress\}/);
  assert.match(source, /aria-valuenow=\{weekProgress\}/);
  assert.match(source, /Math\.min\(100, Math\.max\(0, Math\.round\(value\)\)\)/);
});

test("planner time bars have distinct accessible names and value text", () => {
  assert.match(source, /aria-label="Time elapsed in current hour"/);
  assert.match(source, /aria-label="Time elapsed in current day"/);
  assert.match(source, /aria-label="Time elapsed in current week"/);
  assert.match(source, /aria-valuetext=\{`\$\{hourProgress\}% of the current hour elapsed`\}/);
  assert.match(source, /aria-valuetext=\{`\$\{dayProgress\}% of the current day elapsed`\}/);
  assert.match(source, /aria-valuetext=\{`\$\{weekProgress\}% of the current week elapsed`\}/);
});

test("visual progress fills are hidden from the accessibility tree", () => {
  assert.equal(source.match(/className="fill" aria-hidden="true"/g)?.length, 3);
});

test("calendar progress uses real local period boundaries instead of fixed 24h and 7d durations", () => {
  assert.match(source, /const endOfHour = new Date\(/);
  assert.match(source, /const endOfDay = new Date\(/);
  assert.match(source, /const endOfWeek = new Date\(/);
  assert.match(source, /elapsedPercent\(now, startOfHour, endOfHour\)/);
  assert.match(source, /elapsedPercent\(now, startOfDay, endOfDay\)/);
  assert.match(source, /elapsedPercent\(now, startOfWeek, endOfWeek\)/);
  assert.doesNotMatch(source, /24 \* 60 \* 60 \* 1000/);
  assert.doesNotMatch(source, /7 \* 24 \* 60 \* 60 \* 1000/);
});
