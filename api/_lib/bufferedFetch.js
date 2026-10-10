import { ProviderTimeoutError } from './fetchWithTimeout.js';

function cancelWithoutWaiting(body, reason) {
  try {
    Promise.resolve(body?.cancel(reason)).catch(() => {});
  } catch {
    // Cleanup must not replace the original error or extend the deadline.
  }
}

/**
 * Complete a non-streaming response within one deadline, then give the caller
 * a readable native Response. This also bounds transports that ignore abort.
 */
export async function fetchBufferedResponse(input, options = {}, timeoutMs = 12_000) {
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 2_147_483_647) {
    throw new Error('Invalid buffered request timeout');
  }

  const controller = new AbortController();
  const callerSignal = options.signal === undefined && input instanceof Request ? input.signal : options.signal;
  let upstreamResponse;
  let retainedResponse;
  let reader;
  const cancel = (reason) => {
    cancelWithoutWaiting(reader ?? upstreamResponse?.body, reason);
    // Response.clone() tees the stream; release both branches on failure.
    cancelWithoutWaiting(retainedResponse?.body, reason);
  };
  const aborted = new Promise((_, reject) => {
    controller.signal.addEventListener('abort', () => {
      cancel(controller.signal.reason);
      reject(controller.signal.reason);
    }, { once: true });
  });
  const abortFromCaller = () => controller.abort(callerSignal.reason);
  if (callerSignal?.aborted) abortFromCaller();
  else callerSignal?.addEventListener('abort', abortFromCaller, { once: true });
  const timer = setTimeout(() => controller.abort(new ProviderTimeoutError(timeoutMs)), timeoutMs);

  const fetchAndBuffer = async () => {
    controller.signal.throwIfAborted();
    upstreamResponse = await fetch(input, { ...options, signal: controller.signal });
    if (controller.signal.aborted) {
      // An abort-ignoring transport can return after the caller has finished.
      cancel(controller.signal.reason);
      throw controller.signal.reason;
    }
    retainedResponse = upstreamResponse.clone();
    reader = upstreamResponse.body?.getReader();
    if (reader) {
      try {
        while (true) {
          controller.signal.throwIfAborted();
          const { done } = await reader.read();
          controller.signal.throwIfAborted();
          if (done) break;
        }
      } finally {
        try { reader.releaseLock(); } catch { /* A custom stream may still be pending. */ }
      }
    }
    controller.signal.throwIfAborted();
    return retainedResponse;
  };

  try {
    return await Promise.race([fetchAndBuffer(), aborted]);
  } catch (error) {
    cancel(error);
    throw error;
  } finally {
    clearTimeout(timer);
    callerSignal?.removeEventListener('abort', abortFromCaller);
  }
}
