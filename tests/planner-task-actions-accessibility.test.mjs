import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(
  new URL("../src/features/study-calendar/components/Schedule.tsx", import.meta.url),
  "utf8",
);

test("planner schedule exposes its dynamic accessible name on a semantic region", () => {
  const scheduleStart = source.indexOf('className={`schedule-container');
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
  assert.equal(source.match(/role="group"/g)?.length, 3);
  assert.equal(source.match(/aria-label=\{`\$\{name\} actions`\}/g)?.length, 3);
  assert.match(source, /className="task-edit-button [^"]*focus-visible:ring-2/);
  assert.match(source, /className="complete-task-button"/);
});

test("native edit action keeps activation semantics and the existing Delete completion shortcut", () => {
  assert.match(source, /const handleTaskEditKeyDown = \(event: React\.KeyboardEvent<HTMLButtonElement>, task: TaskItem\) => \{/);
  assert.match(source, /if \(event\.key === 'Delete'\)/);
  assert.doesNotMatch(source, /event\.key === 'Enter' \|\| event\.key === ' '/);
  assert.match(source, /onClick=\{\(\) => handleTaskClick\(task\)\}/);
  assert.match(source, /onKeyDown=\{\(event\) => handleTaskEditKeyDown\(event, task\)\}/);
});

test("all three planner layouts reuse the same edit and complete control pair", () => {
  assert.equal(source.match(/renderTaskControls\(task, name, duration, startStr\)/g)?.length, 3);
  assert.match(source, /aria-label=\{`Edit \$\{name\}, starting at \$\{startTime\} for \$\{duration\} minutes`\}/);
  assert.match(source, /aria-label=\{`Mark \$\{name\} complete`\}/);
});