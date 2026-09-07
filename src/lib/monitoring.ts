/**
 * Optional error monitoring — no-ops when VITE_SENTRY_DSN is unset.
 */
export function initMonitoring(): void {
  if (typeof window === 'undefined') return;

  window.addEventListener('error', (event) => {
    reportClientError(event.error ?? event.message, { source: 'client_error' });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason instanceof Error ? event.reason.message : String(event.reason ?? 'unknown');
    reportClientError(reason, { source: 'unhandled_rejection' });
  });
}

export function reportClientError(
  error: unknown,
  context?: Record<string, unknown>,
): void {
  const errorClass = error instanceof Error ? error.name : typeof error;
  const event = context?.source === 'unhandled_rejection' ? 'unhandled_rejection' : 'client_error';
  const payload = {
    event,
    errorClass: String(errorClass || 'unknown').toLowerCase().replace(/[^a-z0-9_.-]/g, '_').slice(0, 80),
    route: typeof window === 'undefined' ? 'unknown' : window.location.pathname,
    capability: 'web',
    outcome: 'failed',
  };

  // The server accepts only a fixed, privacy-safe telemetry schema. Never send
  // the error message, stack, prompt, answer, identity, or route query string.
  sendTelemetry(payload);
}

type AiRunReport = {
  capability: string;
  status?: number;
  durationMs: number;
  networkError?: boolean;
  timedOut?: boolean;
};

function sendTelemetry(payload: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  try {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      const queued = navigator.sendBeacon('/api/telemetry', new Blob([body], { type: 'application/json' }));
      if (queued) return;
    }
    void fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => undefined);
  } catch (err) {
    if (import.meta.env.DEV) console.warn('telemetry report failed', err);
  }
}

async function submitTelemetry(payload: Record<string, unknown>): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const response = await fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    });
    return response.status === 202;
  } catch {
    return false;
  }
}

export function reportAiRun({
  capability,
  status,
  durationMs,
  networkError = false,
  timedOut = false,
}: AiRunReport): void {
  const ok = Number.isInteger(status) && Number(status) >= 200 && Number(status) < 300;
  const statusClass = Number.isInteger(status) && Number(status) >= 100 && Number(status) <= 599
    ? `${Math.floor(Number(status) / 100)}xx`
    : 'unknown';
  sendTelemetry({
    event: 'ai_run',
    route: typeof window === 'undefined' ? 'unknown' : window.location.pathname,
    capability,
    errorClass: timedOut ? 'timeout' : networkError ? 'network_error' : ok ? 'none' : `http_${statusClass}`,
    outcome: timedOut || networkError ? 'failed' : ok ? 'success' : 'failed',
    durationMs,
  });
}

export type AiFeedbackRating = 'helpful' | 'not_helpful' | 'incorrect';
export type AiFeedbackReason = 'incorrect' | 'unclear' | 'irrelevant' | 'unsafe' | 'other';

export function reportAiFeedback(
  capability: string,
  rating: AiFeedbackRating,
  reason: AiFeedbackReason = 'other',
): Promise<boolean> {
  return submitTelemetry({
    event: 'ai_feedback',
    route: typeof window === 'undefined' ? 'unknown' : window.location.pathname,
    capability,
    errorClass: 'none',
    outcome: rating === 'helpful' ? 'success' : 'failed',
    feedback: rating,
    reason,
  });
}
