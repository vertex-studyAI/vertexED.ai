import { createHash } from 'node:crypto';

import { checkRateLimit } from '../_lib/rateLimit.js';
import { getClientIp } from '../_lib/security.js';
import { persistObservabilityEvent } from '../_lib/observabilityStore.js';

const EVENT_TYPES = new Set(['client_error', 'unhandled_rejection', 'ai_run', 'ai_feedback', 'performance']);
const OUTCOMES = new Set(['success', 'degraded', 'blocked', 'failed']);
const FEEDBACK = new Set(['helpful', 'not_helpful', 'incorrect']);
const FEEDBACK_REASONS = new Set(['incorrect', 'unclear', 'irrelevant', 'unsafe', 'other']);

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
  const normalized = {
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
  if (event === 'ai_feedback') {
    if (!FEEDBACK.has(body?.feedback) || !FEEDBACK_REASONS.has(body?.reason)) return null;
    normalized.feedback = body.feedback;
    normalized.reason = body.reason;
  }
  return normalized;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }
  const ipHash = createHash('sha256').update(getClientIp(req)).digest('hex').slice(0, 24);
  const rate = await checkRateLimit(`telemetry:${ipHash}`, 30, 60_000);
  if (!rate.allowed) {
    return res.status(rate.configurationError ? 503 : 429).json({ error: 'Telemetry unavailable.' });
  }

  const event = normalizeTelemetry(req.body);
  if (!event) return res.status(400).json({ error: 'Invalid telemetry event.' });

  // The durable row deliberately omits identity, free text, prompts, answers,
  // URLs with query strings, and request headers.
  try {
    const stored = await persistObservabilityEvent(event);
    if (!stored.ok) {
      console.error('telemetry persistence failed:', stored.error?.code || 'unknown');
      return res.status(503).json({ error: 'Telemetry storage is unavailable.' });
    }
  } catch (error) {
    console.error('telemetry persistence failed:', error instanceof Error ? error.name : 'UnknownError');
    return res.status(503).json({ error: 'Telemetry storage is unavailable.' });
  }
  return res.status(202).json({ accepted: true, schema: event.schema });
}
