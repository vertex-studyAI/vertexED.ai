export class ProviderTimeoutError extends Error {
  constructor(timeoutMs) {
    super(`Upstream request exceeded ${timeoutMs}ms.`);
    this.name = 'ProviderTimeoutError';
    this.code = 'PROVIDER_TIMEOUT';
  }
}

async function executeFetch(url, options, timeoutMs, consumeBody) {
  const controller = new AbortController();
  const upstreamSignal = options.signal;
  const abortFromUpstream = () => controller.abort(upstreamSignal?.reason);
  if (upstreamSignal) {
    if (upstreamSignal.aborted) abortFromUpstream();
    else upstreamSignal.addEventListener('abort', abortFromUpstream, { once: true });
  }

  const timer = setTimeout(() => controller.abort(new ProviderTimeoutError(timeoutMs)), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    // Finite API responses must finish inside the same deadline as their headers.
    // Consume a clone so the SDK retains the original response metadata and body.
    if (consumeBody) await response.clone().arrayBuffer();
    return response;
  } catch (error) {
    if (controller.signal.aborted && !upstreamSignal?.aborted) {
      throw new ProviderTimeoutError(timeoutMs);
    }
    throw error;
  } finally {
    clearTimeout(timer);
    upstreamSignal?.removeEventListener?.('abort', abortFromUpstream);
  }
}

/** Fetch headers with a bounded deadline, retaining streaming response behavior. */
export function fetchWithTimeout(url, options = {}, timeoutMs = 30_000) {
  return executeFetch(url, options, timeoutMs, false);
}

/** Fetch a finite response with one deadline covering headers and the complete body. */
export function fetchWithBodyTimeout(url, options = {}, timeoutMs = 30_000) {
  return executeFetch(url, options, timeoutMs, true);
}
