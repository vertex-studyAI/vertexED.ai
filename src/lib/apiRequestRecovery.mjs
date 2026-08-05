export const AI_REQUEST_TIMEOUT_MS = 45_000;
export const AI_REQUEST_TIMEOUT_MESSAGE =
  "This request took too long. Please try again; your input is still available.";

export class ApiRequestTimeoutError extends Error {
  constructor(message = AI_REQUEST_TIMEOUT_MESSAGE) {
    super(message);
    this.name = "ApiRequestTimeoutError";
  }
}

export function shouldRetryAfterUnauthorized({
  status,
  hasAuthorization,
  alreadyRetried = false,
}) {
  return status === 401 && hasAuthorization === true && alreadyRetried === false;
}

export function createRequestDeadline(externalSignal, timeoutMs = AI_REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  let timedOut = false;

  const forwardExternalAbort = () => {
    controller.abort(externalSignal?.reason);
  };

  if (externalSignal?.aborted) {
    forwardExternalAbort();
  } else {
    externalSignal?.addEventListener("abort", forwardExternalAbort, { once: true });
  }

  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  return {
    signal: controller.signal,
    didTimeout: () => timedOut,
    cleanup: () => {
      clearTimeout(timeoutId);
      externalSignal?.removeEventListener("abort", forwardExternalAbort);
    },
  };
}

export function toRequestError(error, didTimeout) {
  if (didTimeout) return new ApiRequestTimeoutError();
  return error;
}
