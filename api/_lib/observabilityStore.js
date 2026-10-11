import { getSupabaseAdmin } from './supabaseAdmin.js';

export const OBSERVABILITY_TIMEOUT_MS = 1500;

class ObservabilityTimeoutError extends Error {
  constructor() {
    super(`Observability persistence exceeded ${OBSERVABILITY_TIMEOUT_MS}ms.`);
    this.name = 'ObservabilityTimeoutError';
    this.code = 'OBSERVABILITY_TIMEOUT';
  }
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

export async function persistObservabilityEvent(event, supabase = getSupabaseAdmin()) {
  const controller = new AbortController();
  let timer;
  try {
    const deadline = new Promise((_, reject) => {
      timer = setTimeout(() => {
        const error = new ObservabilityTimeoutError();
        // Settle before aborting so the stable timeout classification wins over
        // SDK-specific cancellation errors. The race also bounds transports
        // that do not honor cancellation.
        reject(error);
        controller.abort(error);
      }, OBSERVABILITY_TIMEOUT_MS);
    });
    const write = Promise.resolve().then(() => supabase
      .from('observability_events')
      .insert(toObservabilityRow(event))
      .abortSignal(controller.signal));
    const { error } = await Promise.race([write, deadline]);
    return { ok: !error, error: error ?? null };
  } catch (error) {
    // A timeout is unconfirmed persistence, never a successful receipt. The
    // provider telemetry caller can then return its original response/error.
    return { ok: false, error };
  } finally {
    clearTimeout(timer);
  }
}
