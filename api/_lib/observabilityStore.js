import { getSupabaseAdmin } from './supabaseAdmin.js';

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

export async function persistObservabilityEvent(event, supabase = getSupabaseAdmin()) {
  const { error } = await supabase.from('observability_events').insert(toObservabilityRow(event));
  return { ok: !error, error: error ?? null };
}
