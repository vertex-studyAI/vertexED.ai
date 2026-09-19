import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../scripts/probe-production-gates.mjs", import.meta.url), "utf8");

test("production gate probe covers Gate 1a TLS, Gate 1b readiness RPC, and agents 404 class", () => {
  assert.match(source, /www\.vertexed\.app/);
  assert.match(source, /readiness=1/);
  assert.match(source, /readiness_rpc_missing/);
  assert.match(source, /\/api\/agents/);
  assert.match(source, /BLOCKED_TLS_FAIL_BEFORE_HTTP/);
  assert.match(source, /WAITLIST_RATE_LIMIT_SALT/);
  // Fail closed while any gate remains blocked.
  assert.match(source, /process\.exit\(failed \? 2 : 0\)/);
});
