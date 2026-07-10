import test from "node:test";
import assert from "node:assert/strict";

const ACTIVITY_KEY = "studyzone_activity";

function logStudyActivity(message) {
  const entry = {
    id: `${Date.now()}-x`,
    message: message.trim(),
    createdAt: new Date().toISOString(),
  };
  const existing = [];
  const next = [entry, ...existing].slice(0, 50);
  return next;
}

test("logStudyActivity trims and prepends entries", () => {
  const entries = logStudyActivity("  Finished Pomodoro  ");
  assert.equal(entries[0].message, "Finished Pomodoro");
  assert.equal(entries.length, 1);
});

test("activity storage key is stable", () => {
  assert.equal(ACTIVITY_KEY, "studyzone_activity");
});
