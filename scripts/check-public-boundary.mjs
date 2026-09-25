#!/usr/bin/env node
/**
 * Operator boundary probe for VertexED Gate 1a/1b.
 * Does not weaken production smoke gates — diagnostics only.
 *
 * Usage:
 *   node scripts/check-public-boundary.mjs
 *   node scripts/check-public-boundary.mjs --base https://vertex-ed-ai.vercel.app
 */
import { execFileSync } from 'node:child_process';
import { lookup } from 'node:dns/promises';

const args = process.argv.slice(2);
const baseIdx = args.indexOf('--base');
const base = baseIdx >= 0 ? args[baseIdx + 1] : 'https://www.vertexed.app';
const host = new URL(base).hostname;

function line(label, value) {
  process.stdout.write(`${label}: ${value}\n`);
}

async function digA(name) {
  try {
    const out = execFileSync('dig', ['+short', name, 'A'], { encoding: 'utf8', timeout: 8000 });
    return out.trim().split('\n').filter(Boolean);
  } catch {
    try {
      const res = await lookup(name, { all: true, family: 4 });
      return res.map((r) => r.address);
    } catch (error) {
      return [`lookup_failed:${error instanceof Error ? error.message : 'unknown'}`];
    }
  }
}

async function probe(url) {
  try {
    const headers = {};
    const token = (process.env.HEALTH_READINESS_TOKEN || '').trim();
    if (token && url.includes('readiness')) {
      headers['x-vertexed-readiness-token'] = token;
    }
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'manual',
      signal: AbortSignal.timeout(20000),
      headers,
    });
    const text = await response.text();
    let body = null;
    try {
      body = JSON.parse(text);
    } catch {
      body = text.slice(0, 120);
    }
    return { ok: true, status: response.status, body };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

const addresses = await digA(host);
line('host', host);
line('dns_a', addresses.join(',') || '(none)');
const looksVercel = addresses.some((ip) => ip.includes('vercel') || ip.startsWith('76.') || ip.startsWith('66.33.'));
const looksParking = addresses.some((ip) => ip === '104.219.250.37' || ip === '2.59.170.20');
line('dns_heuristic', looksParking ? 'parking_or_non_vercel_known' : looksVercel ? 'possibly_vercel' : 'unknown_need_owner_confirm');

const health = await probe(`${base.replace(/\/$/, '')}/api/health`);
if (!health.ok) {
  line('shallow_health', `FAIL ${health.error}`);
} else {
  line('shallow_health', `HTTP ${health.status} ${typeof health.body === 'object' ? JSON.stringify(health.body) : health.body}`);
}

const readiness = await probe(`${base.replace(/\/$/, '')}/api/health?readiness=1`);
if (!readiness.ok) {
  line('deep_readiness', `FAIL ${readiness.error}`);
} else {
  const body = readiness.body;
  const checks = body && typeof body === 'object' ? body.checks : null;
  const failed = checks
    ? Object.entries(checks).filter(([, v]) => v !== true).map(([k]) => k)
    : [];
  line('deep_readiness', `HTTP ${readiness.status}`);
  if (body && typeof body === 'object') {
    line('deep_status', String(body.status ?? 'missing'));
    if (body.databaseError) line('databaseError', String(body.databaseError));
    if (failed.length) line('failedChecks', failed.join(','));
    if (body.revision) line('revision', String(body.revision));
  }
}

line('next', looksParking
  ? 'Gate 1a: replace parking DNS with Vercel records (docs/CUSTOM_DOMAIN_DNS_RECOVERY_2026-09-18.md)'
  : 'If TLS works but readiness degraded: Gate 1b migrations + WAITLIST_RATE_LIMIT_SALT');
