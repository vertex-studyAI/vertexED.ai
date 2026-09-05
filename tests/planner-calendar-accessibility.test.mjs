import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(
  new URL("../src/features/study-calendar/components/Calendar.tsx", import.meta.url),
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

test("planner calendar retains explicit keyboard activation for custom date controls", () => {
  const activations = source.match(/e\.key === 'Enter' \|\| e\.key === ' '/g) ?? [];
  assert.equal(activations.length, 3);
  assert.equal(source.match(/tabIndex=\{0\}/g)?.length, 3);
});
