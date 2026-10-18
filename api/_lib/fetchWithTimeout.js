export class ProviderTimeoutError extends Error {
  constructor(timeoutMs) {
    super(`Upstream request exceeded ${timeoutMs}ms.`);
    this.name = 'ProviderTimeoutError';
    this.code = 'PROVIDER_TIMEOUT';
  }
}

export class ProviderResponseLimitError extends Error {
  constructor() { super('Upstream response exceeded the safe byte limit.'); this.name = 'ProviderResponseLimitError'; this.code = 'PROVIDER_RESPONSE_LIMIT'; }
}

function cancelWithoutWaiting(cancel) {
  try { Promise.resolve(cancel?.()).catch(() => {}); } catch { /* Preserve the original failure. */ }
}

/** Generic callers retain the Response contract. An optional consumer shares
 * the same deadline, including injected fetch implementations and body reads. */
export async function fetchWithTimeout(url, options = {}, timeoutMs = 30_000, { fetchImpl = fetch, consumeResponse } = {}) {
  const controller = new AbortController();
  const upstreamSignal = options.signal;
  let response;
  let cancelBody;
  let rejectAbort;
  const aborted = new Promise((_resolve, reject) => { rejectAbort = reject; });
  const abort = reason => {
    if (controller.signal.aborted) return;
    controller.abort(reason);
    rejectAbort(controller.signal.reason);
    cancelWithoutWaiting(cancelBody || (() => response?.body?.cancel?.()));
  };
  const abortFromUpstream = () => abort(upstreamSignal?.reason);
  if (upstreamSignal) {
    if (upstreamSignal.aborted) abortFromUpstream();
    else upstreamSignal.addEventListener('abort', abortFromUpstream, { once: true });
  }

  const timer = setTimeout(() => abort(new ProviderTimeoutError(timeoutMs)), timeoutMs);
  try {
    return await Promise.race([aborted, (async () => {
      if (controller.signal.aborted) throw controller.signal.reason;
      response = await fetchImpl(url, { ...options, signal: controller.signal });
      if (controller.signal.aborted) {
        cancelWithoutWaiting(() => response?.body?.cancel?.());
        throw controller.signal.reason;
      }
      return consumeResponse ? await consumeResponse(response, cancel => { cancelBody = cancel; }, controller.signal) : response;
    })()]);
  } catch (error) {
    if (controller.signal.aborted) throw controller.signal.reason;
    cancelWithoutWaiting(cancelBody || (() => response?.body?.cancel?.()));
    throw error;
  } finally {
    clearTimeout(timer);
    upstreamSignal?.removeEventListener?.('abort', abortFromUpstream);
  }
}

/** Non-streaming provider calls finish only after their full body arrives.
 * Return a fresh native Response so downstream json/text/status/header callers
 * keep their existing contract, without an unbounded clone/tee buffer. */
export function fetchBufferedResponseWithTimeout(url, options = {}, timeoutMs = 30_000, fetchImpl = fetch, maxBytes = 8 * 1024 * 1024) {
  return fetchWithTimeout(url, options, timeoutMs, {
    fetchImpl,
    consumeResponse: async (response, setCancel, signal) => {
      const reader = response.body?.getReader?.();
      const chunks = [];
      let bytes = 0;
      const append = value => {
        if (signal.aborted) throw signal.reason;
        bytes += typeof value === 'string' ? Buffer.byteLength(value) : value.byteLength;
        if (bytes > maxBytes) throw new ProviderResponseLimitError();
        chunks.push(value);
      };
      if (reader) {
        setCancel(() => reader.cancel());
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (signal.aborted) throw signal.reason;
            if (done) break;
            append(value);
          }
        } catch (error) {
          cancelWithoutWaiting(() => reader.cancel());
          throw error;
        } finally {
          try { reader.releaseLock?.(); } catch { /* A custom reader may still be pending after cancellation. */ }
        }
      } else if (typeof response.arrayBuffer === 'function') append(await response.arrayBuffer());
      else if (typeof response.text === 'function') append(await response.text());
      else if (typeof response.json === 'function') append(JSON.stringify(await response.json()));
      const body = [101, 204, 205, 304].includes(response.status) || response.body === null ? null : new Blob(chunks);
      const buffered = new Response(body, { status: response.status, statusText: response.statusText, headers: response.headers });
      for (const field of ['url', 'redirected', 'type']) {
        if (response[field] !== undefined) Object.defineProperty(buffered, field, { value: response[field] });
      }
      return buffered;
    },
  });
}
