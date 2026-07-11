/**
 * Optional error monitoring — no-ops when VITE_SENTRY_DSN is unset.
 */
export function initMonitoring(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn || typeof window === 'undefined') return;

  window.addEventListener('error', (event) => {
    reportClientError(event.error ?? event.message, { source: 'window.error' });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason instanceof Error ? event.reason.message : String(event.reason ?? 'unknown');
    reportClientError(reason, { source: 'unhandledrejection' });
  });
}

export function reportClientError(
  error: unknown,
  context?: Record<string, unknown>,
): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const message = error instanceof Error ? error.message : String(error);
  const payload = { message, context, ts: new Date().toISOString() };

  if (!dsn) {
    if (import.meta.env.DEV) {
      console.warn('[monitoring]', payload);
    }
    return;
  }

  // Lightweight beacon — swap for @sentry/react when DSN is configured in production.
  try {
    const body = JSON.stringify({ ...payload, dsn: '[redacted]' });
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/health', body);
    }
  } catch (err) {
    console.error('monitoring report failed', err);
  }
}
