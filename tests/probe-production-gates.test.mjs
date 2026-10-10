import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  agentsGatePasses,
  canonicalDomainGatePasses,
  classifyAgentsDeployment,
  classifyCanonicalDomain,
  classifyProviderCandidate,
  providerCandidatePasses,
} from "../scripts/probe-production-gates-core.mjs";

const source = readFileSync(new URL("../scripts/probe-production-gates.mjs", import.meta.url), "utf8");

test("production gate probe covers custom-domain revision, readiness, and agents deployment", () => {
  assert.match(source, /www\.vertexed\.app/);
  assert.match(source, /wwwAppHealth/);
  assert.match(source, /readiness=1/);
  assert.match(source, /readiness_rpc_missing/);
  assert.match(source, /\/api\/agents/);
  assert.match(source, /WAITLIST_RATE_LIMIT_SALT/);
  assert.match(source, /digCname/);
  assert.match(source, /provider_candidates/);
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

test("custom domain passes only when its health endpoint serves the canonical revision", () => {
  const ready = classifyCanonicalDomain({
    rootClass: "HTTP_REACHABLE",
    healthProbe: { httpCode: "200", json: { revision: "abc123" } },
    canonicalRevision: "abc123",
  });
  assert.equal(ready, "READY_CANONICAL_DOMAIN");
  assert.equal(canonicalDomainGatePasses(ready), true);

  assert.equal(
    classifyCanonicalDomain({
      rootClass: "HTTP_REACHABLE",
      healthProbe: { httpCode: "200", json: { revision: "wrong" } },
      canonicalRevision: "abc123",
    }),
    "BLOCKED_DOMAIN_REVISION_MISMATCH",
  );
  assert.equal(
    classifyCanonicalDomain({
      rootClass: "HTTP_REACHABLE",
      healthProbe: { httpCode: "200", json: {} },
      canonicalRevision: "abc123",
    }),
    "BLOCKED_DOMAIN_REVISION_UNCONFIRMED",
  );
  assert.equal(
    classifyCanonicalDomain({
      rootClass: "HTTP_REACHABLE",
      healthProbe: { httpCode: "503", json: {} },
      canonicalRevision: "abc123",
    }),
    "BLOCKED_DOMAIN_HEALTH_UNREACHABLE",
  );
  assert.equal(
    classifyCanonicalDomain({
      rootClass: "TLS_FAIL_BEFORE_HTTP",
      healthProbe: { httpCode: "000", json: null },
      canonicalRevision: "abc123",
    }),
    "BLOCKED_TLS_FAIL_BEFORE_HTTP",
  );
});


test("provider candidate requires immutable revision and full deep readiness", () => {
  const ready = classifyProviderCandidate({
    shallowProbe: { curlExit: 0, httpCode: "200", json: { ok: true, revision: "a".repeat(40) } },
    readinessProbe: { curlExit: 0, httpCode: "200", json: { ok: true, status: "ready", checks: { database: true, auth: true } } },
  });
  assert.equal(ready, "READY_PROVIDER_CANDIDATE");
  assert.equal(providerCandidatePasses(ready), true);

  assert.equal(classifyProviderCandidate({
    shallowProbe: { curlExit: 0, httpCode: "200", json: { ok: true, revision: "short" } },
    readinessProbe: { curlExit: 0, httpCode: "200", json: { ok: true, status: "ready", checks: { database: true } } },
  }), "BLOCKED_PROVIDER_REVISION_UNCONFIRMED");

  assert.equal(classifyProviderCandidate({
    shallowProbe: { curlExit: 0, httpCode: "200", json: { ok: true, revision: "b".repeat(40) } },
    readinessProbe: { curlExit: 0, httpCode: "503", json: { ok: false, status: "degraded", checks: { database: false } } },
  }), "BLOCKED_PROVIDER_DEGRADED");

  assert.equal(classifyProviderCandidate({
    shallowProbe: { curlExit: 35, httpCode: "000", json: null },
    readinessProbe: { curlExit: 35, httpCode: "000", json: null },
  }), "BLOCKED_PROVIDER_UNREACHABLE");
});
