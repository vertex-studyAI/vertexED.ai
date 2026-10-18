const ACCESS_TIMEOUT_MS = 12_000;

export class AccessRequestError extends Error {
  constructor(kind, status = 0, retryAfter = 0) {
    super(kind);
    this.name = 'AccessRequestError';
    this.kind = kind;
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

export function retryAfterSeconds(value, now = Date.now()) {
  if (!value) return 0;
  const seconds = /^\d+$/.test(String(value).trim())
    ? Number(value)
    : Math.ceil((Date.parse(value) - now) / 1000);
  return Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
}

/** No automatic retries: account creation may already have committed. The
 * deadline includes token acquisition and the response body, not only headers.
 * The race also bounds a transport/auth implementation that ignores abort. */
export async function requestAccessJson(input, init = {}, { fetcher = fetch, timeoutMs = ACCESS_TIMEOUT_MS } = {}) {
  const controller = new AbortController();
  let timeout;
  let onAbort;
  let timedOut = false;
  const aborted = new Promise((_, reject) => {
    onAbort = () => {
      controller.abort();
      reject(new AccessRequestError('cancelled'));
    };
    if (init.signal?.aborted) onAbort();
    else init.signal?.addEventListener('abort', onAbort, { once: true });
    timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
      reject(new AccessRequestError('timeout'));
    }, timeoutMs);
  });
  const request = async () => {
    if (controller.signal.aborted) throw new AccessRequestError('cancelled');
    const response = await fetcher(input, { ...init, cache: 'no-store', signal: controller.signal });
    const retryAfter = retryAfterSeconds(response.headers.get('Retry-After'));
    if (response.status === 401) throw new AccessRequestError('session', 401);
    if (response.status === 429) throw new AccessRequestError('rate_limit', 429, retryAfter || 60);
    if (response.status >= 500) throw new AccessRequestError('service', response.status, retryAfter || 30);
    if (!/\bapplication\/(?:[\w.+-]+\+)?json\b/i.test(response.headers.get('Content-Type') || '')) {
      throw new AccessRequestError('routing', response.status);
    }
    let data;
    try { data = await response.json(); }
    catch { throw new AccessRequestError('response', response.status); }
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new AccessRequestError('response', response.status);
    if (!response.ok) throw new AccessRequestError('request', response.status, retryAfter);
    return data;
  };
  try { return await Promise.race([request(), aborted]); }
  catch (error) {
    if (timedOut) throw new AccessRequestError('timeout');
    if (error instanceof AccessRequestError) throw error;
    throw new AccessRequestError(controller.signal.aborted ? 'cancelled' : 'transport');
  } finally {
    clearTimeout(timeout);
    init.signal?.removeEventListener('abort', onAbort);
  }
}

export function accessStateFromResponse(data) {
  if (data?.status === 'approved' && data.access === true) return 'approved';
  if (data?.status === 'pending') return 'pending';
  if (data?.status === 'verification_required') return 'verification_required';
  if (['rejected', 'revoked', 'unregistered'].includes(data?.status)) return 'denied';
  return 'unavailable';
}

export function accessFailureMessage(error) {
  switch (error?.kind) {
    case 'routing': return 'The account service returned an unexpected page. Try again later or contact support.';
    case 'response': return 'The account service returned an unreadable response. Try again or contact support.';
    case 'timeout': return 'The account service took too long to respond. Your access status has not changed.';
    case 'rate_limit': return 'Too many checks were requested. Wait for the retry button before trying again.';
    case 'session': return 'Your session could not be verified. Sign in again to continue.';
    case 'request': return 'This request could not be accepted. Check your details or use your latest invitation.';
    case 'transport': return 'The account service could not be reached. Check your connection, then try again.';
    default: return 'The account service is temporarily unavailable. Your access status has not changed.';
  }
}
