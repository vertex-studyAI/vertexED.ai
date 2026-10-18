import { createServerSupabaseClient, getServerSupabaseConfig } from './serverSupabase.js';

function getObservabilityClient() {
  const { url, key } = getServerSupabaseConfig();
  // Telemetry follows paid settlement and must not hold a completed response
  // open. Bound the entire database response and cancel its reader on expiry.
  return createServerSupabaseClient(url, key, { timeoutMs: 3000, bufferResponses: true, maxResponseBytes: 64 * 1024 });
}

export function toObservabilityRow(event) {
  return {
    schema_version: event.schema,
    event_type: event.event,
    route: event.route ?? 'unknown',
    capability: event.capability ?? 'unknown',
    provider: event.provider ?? null,
    model: event.model ?? null,
    error_class: event.errorClass ?? 'none',
    outcome: event.outcome,
    status: event.status ?? null,
    duration_ms: event.durationMs ?? null,
    feedback: event.feedback ?? null,
    reason: event.reason ?? null,
    recorded_at: event.recordedAt,
  };
}

export async function persistObservabilityEvent(event, supabase = getObservabilityClient()) {
  const { error } = await supabase.from('observability_events').insert(toObservabilityRow(event));
  return { ok: !error, error: error ?? null };
}
