import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import test from 'node:test';

import {
  classifyCanonicalDomain,
  classifyProviderCandidate,
} from '../scripts/probe-production-gates-core.mjs';

const revision = 'a'.repeat(40);
const completeChecks = {
  authentication: true, waitlist: true, coreAi: true, plannerAi: true,
  durableRateLimiting: true, databaseConnection: true, atomicRateLimitRpc: true,
  learnerStateStorage: true, batchLearnerStateSync: true, examSessionStorage: true,
  observabilityStorage: true, singletonIntegrity: true,
};

function healthyProbe(status = 'alive', overrides = {}) {
  return {
    curlExit: 0,
    httpCode: '200',
    json: {
      ok: true, service: 'vertexed', healthContract: '3', status, revision,
      ...(status === 'ready' ? { checks: { ...completeChecks } } : {}),
      ...overrides,
    },
  };
}

function providerVerdict(readinessProbe, shallowProbe = healthyProbe()) {
  return classifyProviderCandidate({ shallowProbe, readinessProbe });
}

test('complete same-revision health v3 is accepted', () => {
  assert.equal(providerVerdict(healthyProbe('ready')), 'READY_PROVIDER_CANDIDATE');
});

for (const [name, checks] of [
  ['empty object', {}],
  ['empty array', []],
  ['incomplete object', { databaseConnection: true }],
  ['string false', { ...completeChecks, authentication: 'false' }],
  ['numeric true', { ...completeChecks, authentication: 1 }],
  ['additional failed capability', { ...completeChecks, futureCapability: false }],
]) {
  test(`provider readiness rejects ${name}`, () => {
    assert.notEqual(providerVerdict(healthyProbe('ready', { checks })), 'READY_PROVIDER_CANDIDATE');
  });
}

for (const [name, overrides] of [
  ['missing revision', { revision: undefined }],
  ['different revision', { revision: 'b'.repeat(40) }],
  ['different service', { service: 'other' }],
  ['missing health contract', { healthContract: undefined }],
  ['unknown health contract', { healthContract: '999' }],
  ['database error despite true checks', { databaseError: 'readiness_rpc_missing' }],
  ['redacted details despite true checks', { detail: 'redacted' }],
]) {
  test(`provider readiness rejects ${name}`, () => {
    assert.notEqual(providerVerdict(healthyProbe('ready', overrides)), 'READY_PROVIDER_CANDIDATE');
  });
}

test('known v4 readiness requires both additional capabilities', () => {
  const shallow = healthyProbe('alive', { healthContract: '4' });
  const checks = { ...completeChecks, expiringHashedInvites: true, automaticTimestamps: true };
  assert.equal(providerVerdict(healthyProbe('ready', { healthContract: '4', checks }), shallow), 'READY_PROVIDER_CANDIDATE');
  for (const field of ['expiringHashedInvites', 'automaticTimestamps']) {
    const incomplete = { ...checks };
    delete incomplete[field];
    assert.notEqual(providerVerdict(healthyProbe('ready', { healthContract: '4', checks: incomplete }), shallow), 'READY_PROVIDER_CANDIDATE');
  }
});

test('shallow and deep health contracts must agree', () => {
  const checks = { ...completeChecks, expiringHashedInvites: true, automaticTimestamps: true };
  assert.notEqual(providerVerdict(healthyProbe('ready', { healthContract: '4', checks })), 'READY_PROVIDER_CANDIDATE');
});

for (const [name, healthProbe] of [
  ['failed transfer after HTTP headers', { ...healthyProbe(), curlExit: 28 }],
  ['negative ok', healthyProbe('alive', { ok: false })],
  ['degraded status', healthyProbe('degraded')],
  ['wrong service', healthyProbe('alive', { service: 'other' })],
  ['unknown contract', healthyProbe('alive', { healthContract: '999' })],
  ['invalid revision', healthyProbe('alive', { revision: 'not-a-git-revision' })],
]) {
  test(`canonical domain rejects ${name}`, () => {
    assert.notEqual(classifyCanonicalDomain({
      rootClass: 'HTTP_REACHABLE', healthProbe,
      canonicalRevision: healthProbe.json.revision,
    }), 'READY_CANONICAL_DOMAIN');
  });
}

function runProbeCli({ readiness = healthyProbe('ready'), shallow = healthyProbe(), canonical = healthyProbe() } = {}) {
  const directory = mkdtempSync(join(tmpdir(), 'vertexed-gate-contract-test-'));
  try {
    const curl = join(directory, 'curl');
    writeFileSync(curl, `#!/usr/bin/env node
const fs = require('node:fs');
const args = process.argv.slice(2);
const url = args.at(-1);
const fixture = JSON.parse(process.env.VERTEXED_GATE_TEST_FIXTURE);
let probe;
if (url.endsWith('/api/agents')) probe = { curlExit: 0, httpCode: '401', json: { error: 'Unauthorized' } };
else if (url.includes('readiness=1')) probe = fixture.readiness;
else if (url === 'https://www.vertexed.app/api/health') probe = fixture.canonical;
else if (url.endsWith('/api/health')) probe = fixture.shallow;
else probe = { curlExit: 0, httpCode: '200', json: {} };
fs.writeFileSync(args[args.indexOf('-o') + 1], JSON.stringify(probe.json));
process.stdout.write(probe.httpCode + '|0|');
process.exitCode = probe.curlExit;
`);
    chmodSync(curl, 0o755);
    const dig = join(directory, 'dig');
    writeFileSync(dig, '#!/usr/bin/env node\nprocess.stdout.write("192.0.2.1\\n");\n');
    chmodSync(dig, 0o755);
    const result = spawnSync(process.execPath, ['scripts/probe-production-gates.mjs', '--json'], {
      cwd: new URL('..', import.meta.url),
      encoding: 'utf8',
      timeout: 15_000,
      env: {
        ...process.env,
        PATH: `${directory}${delimiter}${process.env.PATH || ''}`,
        VERTEXED_GATE_TEST_FIXTURE: JSON.stringify({ readiness, shallow, canonical }),
      },
    });
    assert.ifError(result.error);
    return { status: result.status, report: JSON.parse(result.stdout) };
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test('actual CLI succeeds on complete health and closed agents access', () => {
  const { status, report } = runProbeCli();
  assert.equal(status, 0);
  assert.equal(report.verdict.gate1b, 'READY');
});

for (const [name, readiness] of [
  ['missing capabilities', healthyProbe('ready', { checks: {} })],
  ['different deployment revision', healthyProbe('ready', { revision: 'b'.repeat(40) })],
  ['failed readiness transfer', { ...healthyProbe('ready'), curlExit: 28 }],
  ['non-success readiness HTTP', { ...healthyProbe('ready'), httpCode: '503' }],
]) {
  test(`actual CLI cannot pass with ${name}`, () => {
    const { status, report } = runProbeCli({ readiness });
    assert.equal(status, 2);
    assert.match(report.verdict.gate1b, /^BLOCKED_/);
  });
}
