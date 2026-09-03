import { createHash } from 'node:crypto';

import { checkRateLimit } from '../_lib/rateLimit.js';
import { getClientIp } from '../_lib/security.js';

const EVENT_TYPES = new Set(['client_error', 'unhandled_rejection', 'ai_run', 'performance']);
const OUTCOMES = new Set(['success', 'degraded', 'blocked', 'failed']);

function cleanToken(value, fallback, maxLength = 80) {
  if (typeof value !== 'string') return fallback;
  const token = value.trim().toLowerCase();
  return /^[a-z0-9_.:/-]+$/.test(token) ? token.slice(0, maxLength) : fallback;
}

function cleanRoute(value) {
  if (typeof value !== 'string') return 'unknown';
  const route = value.split('?')[0].split('#')[0];
  return /^\/[a-z0-9_./-]{0,160}$/i.test(route) ? route : 'unknown';
}

export function normalizeTelemetry(body, now = new Date()) {
  const event = EVENT_TYPES.has(body?.event) ? body.event : null;
  if (!event) return null;
  return {
    schema: 'vertexed.telemetry.v1',
    event,
    route: cleanRoute(body?.route),
    capability: cleanToken(body?.capability, 'unknown'),
    errorClass: cleanToken(body?.errorClass, 'none'),
    outcome: OUTCOMES.has(body?.outcome) ? body.outcome : 'failed',
    durationMs: Number.isFinite(Number(body?.durationMs))
      ? Math.max(0, Math.min(300_000, Math.round(Number(body.durationMs))))
      : null,
    recordedAt: now.toISOString(),
  };
}

export default async function handler(req, res) {
  const ipHash = createHash('sha256').update(getClientIp(req)).digest('hex').slice(0, 24);
  const rate = await checkRateLimit(`telemetry:${ipHash}`, 30, 60_000);
  if (!rate.allowed) {
    return res.status(rate.configurationError ? 503 : 429).json({ error: 'Telemetry unavailable.' });
  }

  const event = normalizeTelemetry(req.body);
  if (!event) return res.status(400).json({ error: 'Invalid telemetry event.' });

  // Structured server logs deliberately omit identity, free text, prompts,
  // answers, URLs with query strings, and request headers.
  console.info(JSON.stringify(event));
  return res.status(202).json({ accepted: true, schema: event.schema });
}
