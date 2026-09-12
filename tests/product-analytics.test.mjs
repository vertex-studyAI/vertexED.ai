import test from "node:test";
import assert from "node:assert/strict";

import {
  buildAiRequestAnalyticsProperties,
  bucketAiRequestDuration,
  getAiFeatureForRequest,
} from "../src/lib/aiRequestAnalytics.mjs";
import {
  FIRST_CORE_ACTION_EVENT,
  buildFirstCoreActionProperties,
  firstCoreActionReceiptKey,
  recordFirstCoreActionCompleted,
} from "../src/lib/firstCoreActionAnalytics.mjs";
import {
  normalizeAnalyticsEventName,
  sanitizeAnalyticsProperties,
  trackProductEvent,
} from "../src/lib/productAnalytics.mjs";

function memoryStorage() {
  const values = new Map();
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    },
  };
}

test("analytics event names are normalized and bounded", () => {
  const normalized = normalizeAnalyticsEventName(`  Account     Created ${"x".repeat(100)}  `);
  assert.equal(normalized.startsWith("Account Created"), true);
  assert.equal(normalized.length, 80);
});

test("analytics properties strip likely personal or sensitive fields", () => {
  const properties = sanitizeAnalyticsProperties({
    method: "email",
    invite_type: "waitlist",
    email: "student@example.com",
    username: "student123",
    user_id: "abc-123",
    prompt: "private study prompt",
    invite_code: "secret",
  });

  assert.deepEqual(properties, {
    method: "email",
    invite_type: "waitlist",
  });
});

test("analytics properties keep only bounded primitive values", () => {
  const properties = sanitizeAnalyticsProperties({
    curriculum: "IB".repeat(100),
    subject_count: 6,
    cloud_synced: true,
    empty: null,
    invalid_number: Number.NaN,
    nested: { unsafe: true },
    list: ["unsafe"],
  });

  assert.equal(properties.curriculum.length, 120);
  assert.equal(properties.subject_count, 6);
  assert.equal(properties.cloud_synced, true);
  assert.equal(properties.empty, null);
  assert.equal("invalid_number" in properties, false);
  assert.equal("nested" in properties, false);
  assert.equal("list" in properties, false);
});

test("analytics is a no-op during server-side execution", () => {
  assert.doesNotThrow(() => trackProductEvent("Login Succeeded", { method: "password" }));
});

test("first core action accepts only the fixed privacy-safe schema", () => {
  assert.deepEqual(
    buildFirstCoreActionProperties({
      kind: "deterministic_quiz",
      entry: "exam_prep",
      result: "completed",
    }),
    {
      kind: "deterministic_quiz",
      entry: "exam_prep",
      result: "completed",
    },
  );

  assert.equal(
    buildFirstCoreActionProperties({
      kind: "deterministic_quiz",
      entry: "exam_prep",
      result: "completed",
      subject: "mathematics",
    }),
    null,
  );
  assert.equal(
    buildFirstCoreActionProperties({
      kind: "deterministic_quiz",
      entry: "exam_prep",
      result: "completed",
      score: 100,
    }),
    null,
  );
  assert.equal(
    buildFirstCoreActionProperties({
      kind: "quiz",
      entry: "exam_prep",
      result: "completed",
    }),
    null,
  );
  assert.equal(
    buildFirstCoreActionProperties({
      kind: "deterministic_quiz",
      entry: "direct",
      result: "completed",
    }),
    null,
  );
});

test("first core action receipt is account scoped without entering the analytics payload", () => {
  assert.equal(
    firstCoreActionReceiptKey("account-a"),
    "vertex_content:account-a:first_core_action_completed",
  );
  assert.equal(firstCoreActionReceiptKey(""), null);
});

test("first core action emits at most once per account", () => {
  const localStorage = memoryStorage();
  const calls = [];
  const track = (name, properties) => calls.push({ name, properties });

  const first = recordFirstCoreActionCompleted({
    accountId: "account-a",
    kind: "deterministic_quiz",
    entry: "exam_prep",
    result: "completed",
    owner: { localStorage },
    track,
  });
  const duplicate = recordFirstCoreActionCompleted({
    accountId: "account-a",
    kind: "practice_session",
    entry: "dashboard",
    result: "completed",
    owner: { localStorage },
    track,
  });
  const otherAccount = recordFirstCoreActionCompleted({
    accountId: "account-b",
    kind: "practice_session",
    entry: "dashboard",
    result: "degraded",
    owner: { localStorage },
    track,
  });

  assert.equal(first, true);
  assert.equal(duplicate, false);
  assert.equal(otherAccount, true);
  assert.deepEqual(calls, [
    {
      name: FIRST_CORE_ACTION_EVENT,
      properties: {
        kind: "deterministic_quiz",
        entry: "exam_prep",
        result: "completed",
      },
    },
    {
      name: FIRST_CORE_ACTION_EVENT,
      properties: {
        kind: "practice_session",
        entry: "dashboard",
        result: "degraded",
      },
    },
  ]);
  assert.equal("accountId" in calls[0].properties, false);
});

test("first core action fails closed when a durable dedupe receipt cannot be written", () => {
  const calls = [];
  const owner = {
    localStorage: {
      getItem() {
        return null;
      },
      setItem() {
        throw new Error("storage unavailable");
      },
    },
  };

  assert.equal(
    recordFirstCoreActionCompleted({
      accountId: "account-a",
      kind: "deterministic_quiz",
      entry: "exam_prep",
      result: "completed",
      owner,
      track: (...args) => calls.push(args),
    }),
    false,
  );
  assert.deepEqual(calls, []);
});

test("AI analytics maps only fixed feature endpoints", () => {
  assert.equal(getAiFeatureForRequest("/api/ask"), "chatbot");
  assert.equal(
    getAiFeatureForRequest("https://www.vertexed.app/api/paper-generator?mode=exam"),
    "paper",
  );
  assert.equal(getAiFeatureForRequest("/api/user-content"), null);
  assert.equal(getAiFeatureForRequest("not a valid url"), null);
});

test("AI analytics uses bounded duration buckets", () => {
  assert.equal(bucketAiRequestDuration(250), "under_1s");
  assert.equal(bucketAiRequestDuration(1_500), "1_3s");
  assert.equal(bucketAiRequestDuration(6_000), "3_10s");
  assert.equal(bucketAiRequestDuration(12_000), "10_30s");
  assert.equal(bucketAiRequestDuration(45_000), "over_30s");
  assert.equal(bucketAiRequestDuration(Number.NaN), "unknown");
});

test("AI request analytics exposes only fixed operational categories", () => {
  assert.deepEqual(
    buildAiRequestAnalyticsProperties({
      feature: "quiz",
      status: 201,
      durationMs: 2_200,
    }),
    {
      feature: "quiz",
      outcome: "success",
      status_class: "2xx",
      duration_bucket: "1_3s",
    },
  );

  assert.deepEqual(
    buildAiRequestAnalyticsProperties({
      feature: "chatbot",
      durationMs: 31_000,
      networkError: true,
    }),
    {
      feature: "chatbot",
      outcome: "network_error",
      status_class: "network",
      duration_bucket: "over_30s",
    },
  );

  assert.deepEqual(
    buildAiRequestAnalyticsProperties({
      feature: "paper",
      durationMs: 45_000,
      timedOut: true,
    }),
    {
      feature: "paper",
      outcome: "timeout",
      status_class: "network",
      duration_bucket: "over_30s",
    },
  );
});
