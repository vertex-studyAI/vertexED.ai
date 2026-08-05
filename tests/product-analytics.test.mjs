import test from "node:test";
import assert from "node:assert/strict";

import {
  normalizeAnalyticsEventName,
  sanitizeAnalyticsProperties,
  trackProductEvent,
} from "../src/lib/productAnalytics.mjs";

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
