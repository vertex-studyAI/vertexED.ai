#!/usr/bin/env node
/** Resolve the configured Vercel app; never probe or redirect to expired domains. */
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { normalizeAppOrigin, resolveAppOrigin } from '../contracts/appOrigin.js';

export async function resolveLiveAppBase({ base = process.env.LIVE_APP_BASE || resolveAppOrigin(process.env), request = fetch } = {}) {
  const origin = normalizeAppOrigin(base);
  if (!origin) throw new Error('LIVE_APP_BASE must be a non-expired absolute HTTPS origin (HTTP is allowed only on localhost).');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  let probe;
  try {
    const response = await request(`${origin}/api/health`, {
      signal: controller.signal, redirect: 'manual', headers: { accept: 'application/json' },
    });
    const body = response.headers.get('content-type')?.includes('application/json') ? await response.json() : null;
    const ok = response.status === 200 && body?.ok === true && body?.status === 'alive' && body?.service === 'vertexed';
    probe = { ok, httpStatus: response.status, revision: typeof body?.revision === 'string' ? body.revision : null,
      error: ok ? null : `unexpected VertexED health payload (http=${response.status})` };
  } catch (error) {
    probe = { ok: false, httpStatus: null, revision: null, error: error instanceof Error ? error.message : String(error) };
  } finally { clearTimeout(timer); }
  return { base: probe.ok ? origin : null, source: probe.ok ? 'vercel-app' : 'none', gate1a: probe.ok ? 'PASS' : 'BLOCKED_HTTP', probe };
}

if (import.meta.url === (process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : '')) {
  const result = await resolveLiveAppBase();
  console.log(process.argv.includes('--print-json') ? JSON.stringify(result) : result.base || 'No reachable VertexED application');
  if (!result.base) process.exitCode = 1;
}
