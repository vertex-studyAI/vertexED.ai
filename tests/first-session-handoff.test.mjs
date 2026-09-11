import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  FIRST_SESSION_SYNC_NOTICE_KEY,
  FIRST_SESSION_WELCOME_KEY,
  consumeFirstSessionHandoff,
  firstSessionSyncNoticeKey,
  firstSessionWelcomeKey,
  markFirstSessionSyncNotice,
  markFirstSessionWelcome,
} from "../src/lib/firstSessionHandoff.mjs";

const ACCOUNT_A = "account-a";
const ACCOUNT_B = "account-b";

function createStorage(entries = {}) {
  const values = new Map(Object.entries(entries));
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
    removeItem(key) {
      values.delete(key);
    },
    has(key) {
      return values.has(key);
    },
  };
}

test("first-session handoff consumes the current account welcome marker once", () => {
  const storage = createStorage();
  assert.equal(markFirstSessionWelcome(storage, ACCOUNT_A), true);

  assert.deepEqual(consumeFirstSessionHandoff(storage, ACCOUNT_A), {
    showWelcome: true,
    deviceOnly: false,
  });
  assert.equal(storage.has(firstSessionWelcomeKey(ACCOUNT_A)), false);
  assert.equal(consumeFirstSessionHandoff(storage, ACCOUNT_A), null);
});

test("device-only planner state is reduced to a fixed boolean", () => {
  const storage = createStorage();
  markFirstSessionWelcome(storage, ACCOUNT_A);
  markFirstSessionSyncNotice(storage, ACCOUNT_A);

  const handoff = consumeFirstSessionHandoff(storage, ACCOUNT_A);
  assert.deepEqual(handoff, {
    showWelcome: true,
    deviceOnly: true,
  });
  assert.equal("message" in handoff, false);
  assert.equal(storage.has(firstSessionSyncNoticeKey(ACCOUNT_A)), false);
});

test("sync-only recovery still surfaces a fixed dashboard handoff", () => {
  const storage = createStorage();
  markFirstSessionSyncNotice(storage, ACCOUNT_A);
  assert.deepEqual(consumeFirstSessionHandoff(storage, ACCOUNT_A), {
    showWelcome: false,
    deviceOnly: true,
  });
});

test("handoff markers cannot cross account boundaries", () => {
  const storage = createStorage();
  markFirstSessionWelcome(storage, ACCOUNT_A);
  markFirstSessionSyncNotice(storage, ACCOUNT_A);

  assert.equal(consumeFirstSessionHandoff(storage, ACCOUNT_B), null);
  assert.equal(storage.has(firstSessionWelcomeKey(ACCOUNT_A)), true);
  assert.equal(storage.has(firstSessionSyncNoticeKey(ACCOUNT_A)), true);

  assert.deepEqual(consumeFirstSessionHandoff(storage, ACCOUNT_A), {
    showWelcome: true,
    deviceOnly: true,
  });
});

test("legacy unscoped markers are discarded instead of attributed to the active account", () => {
  const storage = createStorage({
    [FIRST_SESSION_WELCOME_KEY]: "1",
    [FIRST_SESSION_SYNC_NOTICE_KEY]: "untrusted legacy text",
  });

  assert.equal(consumeFirstSessionHandoff(storage, ACCOUNT_B), null);
  assert.equal(storage.has(FIRST_SESSION_WELCOME_KEY), false);
  assert.equal(storage.has(FIRST_SESSION_SYNC_NOTICE_KEY), false);
});

test("invalid account identity cannot create or consume a handoff", () => {
  const storage = createStorage();
  assert.equal(markFirstSessionWelcome(storage, null), false);
  assert.equal(markFirstSessionSyncNotice(storage, ""), false);
  assert.equal(consumeFirstSessionHandoff(storage, null), null);
});

test("dashboard handoff follows the authenticated account and exposes status semantics", async () => {
  const source = await readFile(
    new URL("../src/components/ContinueSessionBanner.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /useAuth\(\)/);
  assert.match(source, /consumeFirstSessionHandoff\(window\.sessionStorage, user\.id\)/);
  assert.match(source, /\[authLoading, user\?\.id\]/);
  assert.match(source, /aria-live="polite"/);
  assert.match(source, /aria-labelledby="first-session-handoff-title"/);
  assert.match(source, /to="\/planner"/);
  assert.match(source, />\s*Review plan\s*</);
  assert.match(source, /aria-label="Dismiss starter plan message"/);
});

test("onboarding writes only account-scoped first-session markers", async () => {
  const source = await readFile(
    new URL("../src/pages/Onboarding.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /markFirstSessionSyncNotice\(sessionStorage, user\.id\)/);
  assert.match(source, /markFirstSessionWelcome\(sessionStorage, user\.id\)/);
  assert.doesNotMatch(source, /sessionStorage\.setItem\(\s*["']vertex_plan_sync_notice["']/);
  assert.doesNotMatch(source, /sessionStorage\.setItem\(\s*["']vertex_welcome["']/);
});
