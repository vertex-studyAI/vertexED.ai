import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  agentsGatePasses,
  classifyAgentsDeployment,
} from "../scripts/probe-production-gates-core.mjs";

const source = readFileSync(new URL("../scripts/probe-production-gates.mjs", import.meta.url), "utf8");

test("production gate probe covers Gate 1a TLS, Gate 1b readiness RPC, and agents deployment", () => {
  assert.match(source, /www\.vertexed\.app/);
  assert.match(source, /readiness=1/);
  assert.match(source, /readiness_rpc_missing/);
  assert.match(source, /\/api\/agents/);
  assert.match(source, /BLOCKED_TLS_FAIL_BEFORE_HTTP/);
  assert.match(source, /WAITLIST_RATE_LIMIT_SALT/);
  assert.match(source, /mkdtempSync/);
  assert.doesNotMatch(source, /\/tmp\/vertexed-gate-probe-body\.txt/);
  assert.match(source, /if \(follow\) args\.push\('-L'\)/);
  // Fail closed while any gate remains blocked.
  assert.match(source, /process\.exit\(failed \? 2 : 0\)/);
});

test("authenticated agents route is live only when unauthenticated access fails closed", () => {
  const authRequired = classifyAgentsDeployment({ curlExit: 0, httpCode: "401" });
  assert.equal(authRequired, "LIVE_AUTH_REQUIRED");
  assert.equal(agentsGatePasses(authRequired), true);

  const unexpectedlyPublic = classifyAgentsDeployment({ curlExit: 0, httpCode: "200" });
  assert.equal(unexpectedlyPublic, "BLOCKED_UNAUTHENTICATED_ACCESS");
  assert.equal(agentsGatePasses(unexpectedlyPublic), false);

  assert.equal(
    classifyAgentsDeployment({ curlExit: 0, httpCode: "404" }),
    "NOT_IN_PRODUCTION",
  );
  assert.equal(
    classifyAgentsDeployment({ curlExit: 35, httpCode: "000" }),
    "UNREACHABLE",
  );
});
