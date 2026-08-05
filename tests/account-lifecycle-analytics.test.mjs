import test from "node:test";
import assert from "node:assert/strict";

import {
  buildAccountDeletionAnalyticsProperties,
  buildLogoutAnalyticsProperties,
  isAccountDeletionRequest,
  statusClass,
} from "../src/lib/accountLifecycleAnalytics.mjs";

test("account deletion analytics matches only DELETE /api/account", () => {
  assert.equal(isAccountDeletionRequest("/api/account", "DELETE"), true);
  assert.equal(
    isAccountDeletionRequest("https://www.vertexed.app/api/account?confirm=1", "DELETE"),
    true,
  );
  assert.equal(isAccountDeletionRequest("/api/account", "GET"), false);
  assert.equal(isAccountDeletionRequest("/api/user-content", "DELETE"), false);
  assert.equal(isAccountDeletionRequest("not a valid url", "DELETE"), false);
});

test("status classes discard exact response codes", () => {
  assert.equal(statusClass(204), "2xx");
  assert.equal(statusClass(401), "4xx");
  assert.equal(statusClass(503), "5xx");
  assert.equal(statusClass(Number.NaN), "unknown");
});

test("logout analytics keeps only fixed outcome and backend categories", () => {
  assert.deepEqual(
    buildLogoutAnalyticsProperties({ outcome: "success", backend: "supabase" }),
    { outcome: "success", backend: "supabase" },
  );
  assert.deepEqual(
    buildLogoutAnalyticsProperties({ outcome: "raw private error", backend: "custom" }),
    { outcome: "failure", backend: "supabase" },
  );
  assert.deepEqual(
    buildLogoutAnalyticsProperties({ outcome: "success", backend: "local" }),
    { outcome: "success", backend: "local" },
  );
});

test("account deletion analytics exposes no identity or raw error text", () => {
  assert.deepEqual(
    buildAccountDeletionAnalyticsProperties({ outcome: "success", status: 200 }),
    { outcome: "success", status_class: "2xx" },
  );
  assert.deepEqual(
    buildAccountDeletionAnalyticsProperties({ outcome: "failure", status: 403 }),
    { outcome: "failure", status_class: "4xx" },
  );
  assert.deepEqual(
    buildAccountDeletionAnalyticsProperties({
      outcome: "private provider message",
      networkError: true,
    }),
    { outcome: "network_error", status_class: "network" },
  );
});
