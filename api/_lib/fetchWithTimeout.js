export class ProviderTimeoutError extends Error {
  constructor(timeoutMs) {
    super(`Upstream request exceeded ${timeoutMs}ms.`);
    this.name = 'ProviderTimeoutError';
    this.code = 'PROVIDER_TIMEOUT';
  }
}

/** Fetch with a bounded deadline while preserving any caller-provided signal. */
export async function fetchWithTimeout(url, options = {}, timeoutMs = 30_000) {
  const controller = new AbortController();
  const upstreamSignal = options.signal;
  const abortFromUpstream = () => controller.abort(upstreamSignal?.reason);
  if (upstreamSignal) {
    if (upstreamSignal.aborted) abortFromUpstream();
    else upstreamSignal.addEventListener('abort', abortFromUpstream, { once: true });
  }

  const timer = setTimeout(() => controller.abort(new ProviderTimeoutError(timeoutMs)), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
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
