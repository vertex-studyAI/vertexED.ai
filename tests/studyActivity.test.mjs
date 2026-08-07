import test from "node:test";
import assert from "node:assert/strict";

import { userContentStorageKeys } from "../src/lib/userContentStorageScope.mjs";

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

test("activity storage key is stable inside an account but isolated across accounts", () => {
  const first = userContentStorageKeys("user-1").activity;
  assert.equal(first, userContentStorageKeys("user-1").activity);
  assert.notEqual(first, userContentStorageKeys("user-2").activity);
  assert.match(first, /^vertex_content:user-1:study_activity$/);
});
