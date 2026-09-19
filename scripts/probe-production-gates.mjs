#!/usr/bin/env node
/**
 * Read-only production gate probe for VX-203 / Gate 1b.
 * Does not mutate DNS, Vercel, or Supabase. Prints JSON summary to stdout.
 *
 * Usage:
 *   node scripts/probe-production-gates.mjs
 *   node scripts/probe-production-gates.mjs --json
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  agentsGatePasses,
  canonicalDomainGatePasses,
  classifyAgentsDeployment,
  classifyCanonicalDomain,
} from './probe-production-gates-core.mjs';

const HOSTS = {
  edAi: 'https://vertex-ed-ai.vercel.app',
  rho: 'https://vertex-ai-rho.vercel.app',
  wwwApp: 'https://www.vertexed.app',
  apexApp: 'https://vertexed.app',
  wwwAi: 'https://www.vertexed.ai',
  apexAi: 'https://vertexed.ai',
};

function curlMeta(url, { follow = false, query = '' } = {}) {
  const target = `${url}${query}`;
  const tempDir = mkdtempSync(join(tmpdir(), 'vertexed-gate-probe-'));
  const outputPath = join(tempDir, 'body.txt');
  const args = [
    '-sS',
    '-o',
    outputPath,
    '-w',
    '%{http_code}|%{ssl_verify_result}|%{errormsg}',
    '--connect-timeout',
    '8',
    '--max-time',
    '25',
  ];
  if (follow) args.push('-L');
  else args.push('--max-redirs', '0');
  args.push(target);

  let result = { status: null, stdout: '', stderr: '' };
  let body = '';
  try {
    result = spawnSync('curl', args, { encoding: 'utf8' });
    try {
      body = readFileSync(outputPath, 'utf8').slice(0, 2000);
    } catch {
      body = '';
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }

  const raw = (result.stdout || '').trim();
  const [httpCode, sslVerify, errormsg] = raw.split('|');
  let json = null;
  try {
    json = JSON.parse(body);
  } catch {
    json = null;
  }
  return {
    url: target,
    curlExit: result.status,
    httpCode: httpCode || '000',
    sslVerify: sslVerify ?? '',
    errormsg: errormsg || (result.stderr || '').trim(),
    json,
    bodyPreview: body.slice(0, 240),
  };
}

function digA(host) {
  const result = spawnSync('dig', ['+short', host, 'A'], { encoding: 'utf8' });
  return (result.stdout || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function classifyWww(probe) {
  if (probe.curlExit !== 0 || probe.httpCode === '000') {
    if (/SSL_ERROR_SYSCALL|SSL_connect|Connection reset/i.test(probe.errormsg)) {
      return 'TLS_FAIL_BEFORE_HTTP';
    }
    if (/Could not resolve host|resolve host/i.test(probe.errormsg)) {
      return 'DNS_NXDOMAIN_OR_EMPTY';
    }
    return 'UNREACHABLE';
  }
  if (Number(probe.httpCode) >= 200 && Number(probe.httpCode) < 500) {
    return 'HTTP_REACHABLE';
  }
  return `HTTP_${probe.httpCode}`;
}

function summarizeHealth(probe, label) {
  const j = probe.json || {};
  return {
    label,
    httpCode: probe.httpCode,
    ok: j.ok === true,
    status: j.status ?? null,
    revision: j.revision ?? null,
    databaseError: j.databaseError ?? null,
    checks: j.checks ?? null,
    errormsg: probe.errormsg || null,
  };
}

const asJson = process.argv.includes('--json');

const dig = {
  'www.vertexed.app': digA('www.vertexed.app'),
  'vertexed.app': digA('vertexed.app'),
  'www.vertexed.ai': digA('www.vertexed.ai'),
  'vertexed.ai': digA('vertexed.ai'),
};

const wwwApp = curlMeta(HOSTS.wwwApp);
const wwwAppHealth = curlMeta(`${HOSTS.wwwApp}/api/health`);
const apexApp = curlMeta(HOSTS.apexApp);
const wwwAi = curlMeta(HOSTS.wwwAi);
const apexAi = curlMeta(HOSTS.apexAi);

const edShallow = curlMeta(`${HOSTS.edAi}/api/health`);
const edReady = curlMeta(`${HOSTS.edAi}/api/health`, { query: '?readiness=1' });
const rhoShallow = curlMeta(`${HOSTS.rho}/api/health`);
const rhoReady = curlMeta(`${HOSTS.rho}/api/health`, { query: '?readiness=1' });
const edAgents = curlMeta(`${HOSTS.edAi}/api/agents`);

const wwwAppClass = classifyWww(wwwApp);
const gate1aVerdict = classifyCanonicalDomain({
  rootClass: wwwAppClass,
  healthProbe: wwwAppHealth,
  canonicalRevision: edShallow.json?.revision ?? null,
});

const report = {
  probedAt: new Date().toISOString(),
  gate1a_custom_domain: {
    www_vertexed_app: {
      class: wwwAppClass,
      aRecords: dig['www.vertexed.app'],
      probe: { httpCode: wwwApp.httpCode, errormsg: wwwApp.errormsg || null },
      health: summarizeHealth(wwwAppHealth, 'www-vertexed-app-health'),
    },
    apex_vertexed_app: {
      class: classifyWww(apexApp),
      aRecords: dig['vertexed.app'],
      probe: { httpCode: apexApp.httpCode, errormsg: apexApp.errormsg || null },
    },
    www_vertexed_ai: {
      class: classifyWww(wwwAi),
      aRecords: dig['www.vertexed.ai'],
      probe: { httpCode: wwwAi.httpCode, errormsg: wwwAi.errormsg || null },
    },
    apex_vertexed_ai: {
      class: classifyWww(apexAi),
      aRecords: dig['vertexed.ai'],
      probe: { httpCode: apexAi.httpCode, errormsg: apexAi.errormsg || null },
    },
  },
  gate1b_readiness: {
    ed_ai_shallow: summarizeHealth(edShallow, 'ed-ai-shallow'),
    ed_ai_readiness: summarizeHealth(edReady, 'ed-ai-readiness'),
    rho_shallow: summarizeHealth(rhoShallow, 'rho-shallow'),
    rho_readiness: summarizeHealth(rhoReady, 'rho-readiness'),
    operatorHints: [
      edReady.json?.databaseError === 'readiness_rpc_missing'
        ? 'rehearse the checked-in readiness migration chain against a production-equivalent database before any production apply'
        : null,
      edReady.json?.checks?.durableRateLimiting === false
        ? 'set WAITLIST_RATE_LIMIT_SALT in the Vercel project env'
        : null,
    ].filter(Boolean),
  },
  agents_pr_917: {
    ed_ai_agents: {
      httpCode: edAgents.httpCode,
      bodyPreview: edAgents.bodyPreview,
      note: 'Before deployment expect 404; once the authenticated route is live, an unauthenticated probe must return 401',
    },
  },
  verdict: {
    gate1a: gate1aVerdict,
    gate1b: (() => {
      const checks = edReady.json?.checks;
      const allChecks =
        checks && typeof checks === 'object' && Object.values(checks).every(Boolean);
      if (
        edReady.json?.ok === true &&
        edReady.json?.status === 'ready' &&
        allChecks
      ) {
        return 'READY';
      }
      if (edReady.json?.databaseError === 'readiness_rpc_missing') {
        return 'BLOCKED_READINESS_RPC_MISSING';
      }
      if (checks && checks.durableRateLimiting === false) {
        return 'BLOCKED_MISSING_WAITLIST_RATE_LIMIT_SALT_OR_DEGRADED';
      }
      return 'BLOCKED_DEGRADED';
    })(),
    agents: classifyAgentsDeployment(edAgents),
  },
};

if (asJson) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  process.stdout.write(`VertexED production gate probe @ ${report.probedAt}\n`);
  process.stdout.write(`Gate1a verdict: ${report.verdict.gate1a}\n`);
  process.stdout.write(`  www.vertexed.app: ${report.gate1a_custom_domain.www_vertexed_app.class} A=${report.gate1a_custom_domain.www_vertexed_app.aRecords.join(',') || '(none)'} healthRevision=${report.gate1a_custom_domain.www_vertexed_app.health.revision || '(none)'}\n`);
  process.stdout.write(`  www.vertexed.ai:  ${report.gate1a_custom_domain.www_vertexed_ai.class} A=${report.gate1a_custom_domain.www_vertexed_ai.aRecords.join(',') || '(none)'}\n`);
  process.stdout.write(`Gate1b verdict: ${report.verdict.gate1b}\n`);
  process.stdout.write(`  ed-ai readiness: http=${report.gate1b_readiness.ed_ai_readiness.httpCode} status=${report.gate1b_readiness.ed_ai_readiness.status} dbErr=${report.gate1b_readiness.ed_ai_readiness.databaseError}\n`);
  process.stdout.write(`  ed-ai revision:  ${report.gate1b_readiness.ed_ai_shallow.revision}\n`);
  if (report.gate1b_readiness.operatorHints.length) {
    for (const hint of report.gate1b_readiness.operatorHints) {
      process.stdout.write(`  hint: ${hint}\n`);
    }
  }
  process.stdout.write(`Agents: ${report.verdict.agents} (http ${report.agents_pr_917.ed_ai_agents.httpCode})\n`);
}

const failed =
  !canonicalDomainGatePasses(report.verdict.gate1a) ||
  report.verdict.gate1b.startsWith('BLOCKED') ||
  !agentsGatePasses(report.verdict.agents);
process.exit(failed ? 2 : 0);
