#!/usr/bin/env node
/**
 * Resolve which live app origin CI should exercise.
 *
 * Prefer the custom domain when it answers application HTTP.
 * When Gate 1a TLS/DNS is down, fall back to the documented canonical
 * Vercel host so browser certification still covers the deployed app.
 *
 * Usage:
 *   node scripts/resolve-live-app-base.mjs
 *   node scripts/resolve-live-app-base.mjs --print-json
 *
 * Env:
 *   LIVE_APP_CUSTOM_BASE   default https://www.vertexed.app
 *   LIVE_APP_FALLBACK_BASE default https://vertex-ed-ai.vercel.app
 *   LIVE_APP_PROBE_TIMEOUT_MS default 8000
 */

import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const CUSTOM_BASE = (process.env.LIVE_APP_CUSTOM_BASE || 'https://www.vertexed.app').replace(/\/$/, '');
const FALLBACK_BASE = (process.env.LIVE_APP_FALLBACK_BASE || 'https://vertex-ed-ai.vercel.app').replace(/\/$/, '');
const TIMEOUT_MS = Number(process.env.LIVE_APP_PROBE_TIMEOUT_MS || 8_000);

function normalizeBase(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    return url.origin;
  } catch {
    return null;
  }
}

async function probeHealth(base) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${base}/api/health`, {
      signal: controller.signal,
      headers: { accept: 'application/json' },
    });
    let body = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        body = await response.json();
      } catch {
        body = null;
      }
    }
    const ok = response.status === 200 && body && body.ok === true && body.status === 'alive';
    return {
      reachable: true,
      httpStatus: response.status,
      ok: Boolean(ok),
      revision: typeof body?.revision === 'string' ? body.revision : null,
      error: ok ? null : `unexpected health payload (http=${response.status})`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      reachable: false,
      httpStatus: null,
      ok: false,
      revision: null,
      error: message,
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function resolveLiveAppBase({
  customBase = CUSTOM_BASE,
  fallbackBase = FALLBACK_BASE,
} = {}) {
  const custom = normalizeBase(customBase);
  const fallback = normalizeBase(fallbackBase);
  if (!custom || !fallback) {
    throw new Error('LIVE_APP_CUSTOM_BASE and LIVE_APP_FALLBACK_BASE must be absolute http(s) origins');
  }

  const customProbe = await probeHealth(custom);
  if (customProbe.ok) {
    return {
      base: custom,
      source: 'custom-domain',
      gate1a: 'PASS',
      customProbe,
      fallbackProbe: null,
    };
  }

  const fallbackProbe = await probeHealth(fallback);
  if (fallbackProbe.ok) {
    return {
      base: fallback,
      source: 'canonical-fallback',
      gate1a: 'BLOCKED_TLS_OR_HTTP',
      customProbe,
      fallbackProbe,
    };
  }

  return {
    base: null,
    source: 'none',
    gate1a: 'BLOCKED_TLS_OR_HTTP',
    customProbe,
    fallbackProbe,
  };
}

async function main() {
  const printJson = process.argv.includes('--print-json');
  const result = await resolveLiveAppBase();
  if (printJson) {
    process.stdout.write(`${JSON.stringify(result)}\n`);
  } else if (result.base) {
    process.stdout.write(`${result.base}\n`);
  } else {
    console.error('[resolve-live-app-base] No reachable live app origin');
    console.error(`  custom=${CUSTOM_BASE} error=${result.customProbe?.error || 'unknown'}`);
    console.error(`  fallback=${FALLBACK_BASE} error=${result.fallbackProbe?.error || 'unknown'}`);
    process.exitCode = 1;
    return;
  }

  if (result.source === 'canonical-fallback') {
    console.error(
      `[resolve-live-app-base] Gate1a custom domain unreachable (${result.customProbe?.error || 'unknown'}); using fallback ${result.base}`,
    );
  }
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : '';
if (import.meta.url === invokedPath) {
  main();
}
