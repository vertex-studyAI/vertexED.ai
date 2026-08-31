export const AI_REQUEST_TIMEOUT_MS = 45_000;
export const AI_REQUEST_TIMEOUT_MESSAGE =
  "This request took too long. Please try again; your input is still available.";

export class ApiRequestTimeoutError extends Error {
  constructor(message = AI_REQUEST_TIMEOUT_MESSAGE) {
    super(message);
    this.name = "ApiRequestTimeoutError";
  }
}

const TERMINAL_REFRESH_ERROR_CODES = new Set([
  "refresh_token_not_found",
  "refresh_token_already_used",
  "refresh_token_reuse_detected",
  "invalid_refresh_token",
  "session_not_found",
]);

export function createSingleFlight(task) {
  let inFlight = null;

  return function runSingleFlight(...args) {
    if (!inFlight) {
      inFlight = Promise.resolve()
        .then(() => task(...args))
        .finally(() => {
          inFlight = null;
        });
    }
    return inFlight;
  };
}

export function shouldClearLocalSessionAfterRefreshFailure(error) {
  if (!error || typeof error !== "object") return false;
  const code = typeof error.code === "string" ? error.code.toLowerCase() : "";
  if (TERMINAL_REFRESH_ERROR_CODES.has(code)) return true;

  const message = typeof error.message === "string" ? error.message : "";
  return /refresh token/i.test(message) &&
    /(?:invalid|expired|not found|already used|reuse detected)/i.test(message);
}

export async function resolveRefreshSession(result, clearLocalSession) {
  const token = result?.data?.session?.access_token;
  if (!result?.error && typeof token === "string" && token) return token;

  if (
    shouldClearLocalSessionAfterRefreshFailure(result?.error) &&
    typeof clearLocalSession === "function"
  ) {
    await clearLocalSession();
  }
  return null;
}

export async function runRefreshAttempt(refreshSession, clearLocalSession) {
  try {
    return await resolveRefreshSession(await refreshSession(), clearLocalSession);
  } catch (error) {
    return resolveRefreshSession(
      { data: { session: null }, error },
      clearLocalSession,
    );
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
