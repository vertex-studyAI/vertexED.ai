import { ProviderTimeoutError } from './fetchWithTimeout.js';

export const MAX_PROVIDER_TEXT_BYTES = 4 * 1024 * 1024;

export class ProviderResponseSizeError extends Error {
  constructor() {
    super('Upstream response exceeded the supported size.');
    this.name = 'ProviderResponseSizeError';
    this.code = 'PROVIDER_RESPONSE_TOO_LARGE';
  }
}

function cancelWithoutBlocking(cancel, reason) {
  try {
    Promise.resolve(cancel?.(reason)).catch(() => {});
  } catch {
    // Cancellation cannot replace the original error or extend the deadline.
  }
}

async function readResponseText(response, signal, maxBytes, setCancel) {
  const declaredLength = response?.headers?.get?.('content-length');
  if (declaredLength && Number(declaredLength) > maxBytes) {
    throw new ProviderResponseSizeError();
  }

  const reader = response?.body?.getReader?.();
  if (!reader) {
    // Injected transports may expose only text(). The outer deadline still
    // bounds those calls, even if the transport does not implement cancellation.
    const raw = await response.text();
    signal.throwIfAborted();
    if (new TextEncoder().encode(raw).byteLength > maxBytes) throw new ProviderResponseSizeError();
    return raw;
  }

  setCancel((reason) => reader.cancel(reason));
  const decoder = new TextDecoder();
  let totalBytes = 0;
  let raw = '';
  try {
    while (true) {
      signal.throwIfAborted();
      const { done, value } = await reader.read();
      signal.throwIfAborted();
      if (done) break;
      const chunk = value instanceof Uint8Array ? value : new Uint8Array(value ?? []);
      totalBytes += chunk.byteLength;
      if (totalBytes > maxBytes) throw new ProviderResponseSizeError();
      raw += decoder.decode(chunk, { stream: true });
    }
    return raw + decoder.decode();
  } catch (error) {
    cancelWithoutBlocking((reason) => reader.cancel(reason), error);
    throw error;
  } finally {
    try {
      reader.releaseLock();
    } catch {
      // Custom streams can leave a read pending after cancellation. Preserve
      // the bounded result rather than waiting for their cleanup.
    }
  }
}

/** One deadline covers headers and the complete non-streaming provider body. */
export async function fetchProviderText(url, options = {}, {
  timeoutMs = 30_000,
  maxBytes = MAX_PROVIDER_TEXT_BYTES,
  fetchImpl = globalThis.fetch,
} = {}) {
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1) throw new Error('Invalid provider request timeout');
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 1) throw new Error('Invalid provider response size limit');
  if (typeof fetchImpl !== 'function') throw new Error('Invalid provider transport');

  const controller = new AbortController();
  const upstreamSignal = options.signal;
  let cancelResponse;
  const aborted = new Promise((_, reject) => {
    controller.signal.addEventListener('abort', () => {
      cancelWithoutBlocking(cancelResponse, controller.signal.reason);
      reject(controller.signal.reason);
    }, { once: true });
  });
  const abortFromUpstream = () => controller.abort(upstreamSignal.reason);
  if (upstreamSignal?.aborted) abortFromUpstream();
  else upstreamSignal?.addEventListener('abort', abortFromUpstream, { once: true });

  const timer = setTimeout(() => controller.abort(new ProviderTimeoutError(timeoutMs)), timeoutMs);
  const read = async () => {
    controller.signal.throwIfAborted();
    const response = await fetchImpl(url, { ...options, signal: controller.signal });
    cancelResponse = (reason) => response?.body?.cancel?.(reason);
    // A custom transport can resolve after the deadline despite its signal.
    // Discard that response without consuming it or leaking its body stream.
    if (controller.signal.aborted) {
      cancelWithoutBlocking(cancelResponse, controller.signal.reason);
      throw controller.signal.reason;
    }
    try {
      const raw = await readResponseText(response, controller.signal, maxBytes, (cancel) => { cancelResponse = cancel; });
      return { response, raw };
    } catch (error) {
      cancelWithoutBlocking(cancelResponse, error);
      throw error;
    }
  };
  try {
    return await Promise.race([read(), aborted]);
  } finally {
    clearTimeout(timer);
    upstreamSignal?.removeEventListener('abort', abortFromUpstream);
  }
}
