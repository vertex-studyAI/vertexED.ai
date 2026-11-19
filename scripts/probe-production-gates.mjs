#!/usr/bin/env node
// Read-only Vercel release gates. Liveness never substitutes for deep readiness.
import { resolveAppOrigin, normalizeAppOrigin } from '../contracts/appOrigin.js';
const base = normalizeAppOrigin(process.env.SMOKE_BASE_URL || resolveAppOrigin(process.env));
if (!base) throw new Error('Configure a valid non-expired application origin.');
async function probe(path) {
  try {
    const response = await fetch(`${base}${path}`, { redirect: 'manual', signal: AbortSignal.timeout(20000) });
    const json = response.headers.get('content-type')?.includes('application/json') ? await response.json() : null;
    return { httpStatus: response.status, json };
  } catch (error) { return { httpStatus: null, error: error.message }; }
}
const [health, readiness, agents] = await Promise.all([probe('/api/health'), probe('/api/health?readiness=1'), probe('/api/agents')]);
const revision = health.json?.revision;
const livenessPass = health.httpStatus === 200 && health.json?.service === 'vertexed' && health.json?.status === 'alive' && /^[a-f0-9]{40}$/.test(revision || '');
const readinessPass = readiness.httpStatus === 200 && readiness.json?.ok === true && readiness.json?.status === 'ready' && readiness.json?.revision === revision;
const authBoundaryPass = agents.httpStatus === 401;
const pass = livenessPass && readinessPass && authBoundaryPass;
console.log(JSON.stringify({ checkedAt: new Date().toISOString(), base, revision, status: pass ? 'PASS' : 'BLOCKED', livenessPass, readinessPass, authBoundaryPass, health, readiness, agents,
  boundary: 'Read-only service checks. Real sign-in, cross-account RLS, provider responses and browser journeys require separate evidence.' }, null, 2));
process.exitCode = pass ? 0 : 2;
