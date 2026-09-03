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
  try {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/telemetry', new Blob([body], { type: 'application/json' }));
    } else {
      void fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => undefined);
    }
  } catch (err) {
    if (import.meta.env.DEV) console.warn('monitoring report failed', err);
  }
}
