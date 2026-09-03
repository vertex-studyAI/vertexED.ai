import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
  buildFeedbackAnalyticsProperties,
  normalizeProductFeedback,
  PRODUCT_FEEDBACK_MAX_LENGTH,
} from "../src/lib/productFeedback.mjs";

test("feedback payload is bounded and strips query or fragment data from page paths", () => {
  const result = normalizeProductFeedback({
    category: "bug",
    rating: 4,
    feedback: "  The paper maker froze after I clicked generate.  ",
    pagePath: "/paper-maker?student=private#result",
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.data, {
    category: "bug",
    rating: 4,
    feedback: "The paper maker froze after I clicked generate.",
    page_path: "/paper-maker",
  });
});

test("feedback payload rejects empty text and normalizes untrusted categories and ratings", () => {
  assert.deepEqual(normalizeProductFeedback({ feedback: "   " }), {
    ok: false,
    error: "Feedback is required.",
  });

  const result = normalizeProductFeedback({
    category: "email@example.com",
    rating: 99,
    feedback: "x".repeat(PRODUCT_FEEDBACK_MAX_LENGTH + 100),
    pagePath: "main",
  });

  assert.equal(result.ok, true);
  assert.equal(result.data.category, "other");
  assert.equal(result.data.rating, null);
  assert.equal(result.data.feedback.length, PRODUCT_FEEDBACK_MAX_LENGTH);
  assert.equal(result.data.page_path, "/main");
});

test("analytics payload contains no feedback text, page path, or identity", () => {
  const properties = buildFeedbackAnalyticsProperties({
    category: "confusing",
    rating: 2,
    feedback: "private feedback text",
    user_id: "private-user-id",
    pagePath: "/private-route",
  });

  assert.deepEqual(properties, {
    category: "confusing",
    rating: 2,
    source: "in_product_launcher",
  });
  assert.equal("feedback" in properties, false);
  assert.equal("user_id" in properties, false);
  assert.equal("pagePath" in properties, false);
});

test("feedback migration is authenticated insert-only and user-bound", () => {
  const migration = fs.readFileSync(
    "supabase/migrations/20260903121711_product_feedback.sql",
    "utf8",
  );

  assert.match(migration, /enable row level security/i);
  assert.match(migration, /revoke all on table public\.product_feedback from anon, authenticated/i);
  assert.match(
    migration,
    /grant insert \(user_id, category, rating, feedback, page_path\)[\s\S]*to authenticated/i,
  );
  assert.match(migration, /with check \(\(select auth\.uid\(\)\) is not null and \(select auth\.uid\(\)\) = user_id\)/i);
  assert.doesNotMatch(migration, /grant\s+select[\s\S]*authenticated/i);
});
