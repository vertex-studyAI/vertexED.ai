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
  const hardening = fs.readFileSync(
    "supabase/migrations/20260919055925_feedback_service_grants_and_force_rls.sql",
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
  assert.match(
    hardening,
    /grant select, insert, delete on table public\.product_feedback to service_role/i,
  );
  assert.match(hardening, /alter table public\.product_feedback force row level security/i);
});

test("feedback is submitted through an authenticated rate-limited route that returns only the generated case id", () => {
  const handler = fs.readFileSync("api/_handlers/product-feedback.js", "utf8");
  const routes = fs.readFileSync("api/_lib/routes.js", "utf8");
  const launcher = fs.readFileSync("src/components/FeedbackLauncher.tsx", "utf8");
  assert.match(handler, /verifyAuthUser\(req, res\)/);
  assert.match(handler, /rateLimitUserEndpoint\(user\.id, 'product-feedback'/);
  assert.match(handler, /insert\(\{ user_id: user\.id, \.\.\.normalized\.data \}\)/);
  assert.match(handler, /select\('id'\)/);
  assert.doesNotMatch(handler, /email|prompt|answer/);
  assert.match(routes, /'product-feedback': \{[\s\S]*access: 'account'/);
  assert.match(launcher, /authFetch\("\/api\/product-feedback"/);
  assert.match(launcher, /Request ID: \$\{result\.case\.id\}/);
});
