import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  FIRST_SESSION_SYNC_NOTICE_KEY,
  FIRST_SESSION_WELCOME_KEY,
  consumeFirstSessionHandoff,
} from "../src/lib/firstSessionHandoff.mjs";

function createStorage(entries = {}) {
  const values = new Map(Object.entries(entries));
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    removeItem(key) {
      values.delete(key);
    },
    has(key) {
      return values.has(key);
    },
  };
}

test("first-session handoff consumes the welcome marker once", () => {
  const storage = createStorage({ [FIRST_SESSION_WELCOME_KEY]: "1" });

  assert.deepEqual(consumeFirstSessionHandoff(storage), {
    showWelcome: true,
    deviceOnly: false,
  });
  assert.equal(storage.has(FIRST_SESSION_WELCOME_KEY), false);
  assert.equal(consumeFirstSessionHandoff(storage), null);
});

test("device-only planner state is reduced to a fixed boolean", () => {
  const storage = createStorage({
    [FIRST_SESSION_WELCOME_KEY]: "1",
    [FIRST_SESSION_SYNC_NOTICE_KEY]: "untrusted free-form text must never render",
  });

  const handoff = consumeFirstSessionHandoff(storage);
  assert.deepEqual(handoff, {
    showWelcome: true,
    deviceOnly: true,
  });
  assert.equal("message" in handoff, false);
  assert.equal(storage.has(FIRST_SESSION_SYNC_NOTICE_KEY), false);
});

test("sync-only recovery still surfaces a fixed dashboard handoff", () => {
  const storage = createStorage({ [FIRST_SESSION_SYNC_NOTICE_KEY]: "present" });
  assert.deepEqual(consumeFirstSessionHandoff(storage), {
    showWelcome: false,
    deviceOnly: true,
  });
});

test("dashboard handoff exposes status semantics and a direct planner action", async () => {
  const source = await readFile(
    new URL("../src/components/ContinueSessionBanner.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /aria-live="polite"/);
  assert.match(source, /aria-labelledby="first-session-handoff-title"/);
  assert.match(source, /to="\/planner"/);
  assert.match(source, />\s*Review plan\s*</);
  assert.match(source, /aria-label="Dismiss starter plan message"/);
});
