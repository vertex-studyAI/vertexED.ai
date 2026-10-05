import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(
  new URL("../src/features/study-calendar/components/Schedule.tsx", import.meta.url),
  "utf8",
);

test("planner schedule exposes its dynamic accessible name on a semantic region", () => {
  const scheduleStart = source.indexOf('className="planner-agenda"');
  const scheduleEnd = source.indexOf('>', scheduleStart);
  assert.ok(scheduleStart >= 0);
  assert.ok(scheduleEnd > scheduleStart);

  const scheduleOpeningTag = source.slice(scheduleStart, scheduleEnd);
  assert.match(scheduleOpeningTag, /role="region"/);
  assert.match(
    scheduleOpeningTag,
    /aria-label=\{`\$\{mode\} planner schedule for \$\{selectedDate\.toLocaleDateString/,
  );
});

test("planner task cards expose sibling native actions instead of nested interactive roles", () => {
  assert.doesNotMatch(source, /role="button"/);
  assert.doesNotMatch(source, /tabIndex=\{0\}/);
  assert.equal(source.match(/role="group"/g)?.length, 1);
  assert.equal(source.match(/aria-label=\{`\$\{name\} actions`\}/g)?.length, 1);
  assert.match(source, /className="task-edit-button [^"]*focus-visible:ring-2/);
  assert.match(source, /onClick=\{\(\) => onTaskComplete\(task.id\)\}/);
});

test("native edit action keeps activation semantics without accidental Delete completion", () => {
  assert.doesNotMatch(source, /handleTaskEditKeyDown/);
  assert.doesNotMatch(source, /if \(event\.key === 'Delete'\)/);
  assert.doesNotMatch(source, /event\.key === 'Enter' \|\| event\.key === ' '/);
  assert.match(source, /onClick=\{\(\) => handleTaskClick\(task\)\}/);
  assert.doesNotMatch(source, /onKeyDown=/);
});

test("day and week views share one responsive native-action agenda", () => {
  assert.match(source, /mode === 'Week' \? 7 : 1/);
  assert.equal(source.match(/onTaskComplete\(task.id\)/g)?.length, 1);
  assert.match(source, /aria-label=\{`Edit \$\{name\}, starting at \$\{startTime\} for \$\{duration\} minutes`\}/);
  assert.match(source, /aria-label=\{`Mark \$\{name\} complete`\}/);
});
