import { persistObservabilityEvent } from './observabilityStore.js';

function cleanToken(value, fallback = 'unknown', maxLength = 120) {
  if (typeof value !== 'string') return fallback;
  const token = value.trim().toLowerCase().replace(/[^a-z0-9_.:/-]/g, '_');
  return token ? token.slice(0, maxLength) : fallback;
}

export function createProviderRunEvent({ capability, provider, model, route, status, durationMs, error = false }, now = new Date()) {
  const safeStatus = Number.isInteger(status) && status >= 100 && status <= 599 ? status : null;
  const safeRoute = typeof route === 'string' && route.trim() ? cleanToken(route) : null;
  return {
    schema: 'vertexed.ai_provider.v1',
    event: 'provider_run',
    capability: cleanToken(capability),
    provider: cleanToken(provider),
    model: cleanToken(model),
    ...(safeRoute ? { route: safeRoute } : {}),
    outcome: !error && safeStatus !== null && safeStatus >= 200 && safeStatus < 300 ? 'success' : 'failed',
    status: safeStatus,
    durationMs: Number.isFinite(Number(durationMs)) ? Math.max(0, Math.min(300_000, Math.round(Number(durationMs)))) : null,
    recordedAt: now.toISOString(),
  };
}

export async function logProviderRun(input) {
  // Fixed fields only: never include user identity, prompts, answers, or provider payloads.
  const event = createProviderRunEvent(input);
  try {
    const stored = await persistObservabilityEvent(event);
    if (!stored.ok) console.error('provider telemetry persistence failed:', stored.error?.code || 'unknown');
    return stored.ok;
  } catch (error) {
    console.error('provider telemetry persistence failed:', error instanceof Error ? error.name : 'UnknownError');
    return false;
  }
}
