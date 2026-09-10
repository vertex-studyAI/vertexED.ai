import { getUserContentStorageScope } from '@/lib/userContentStorageScope.mjs';
import { isAccountDeletionRequest, trackAccountDeletion } from '@/lib/accountLifecycleAnalytics.mjs';
import { getAiFeatureForRequest, trackAiRequestOutcome } from '@/lib/aiRequestAnalytics.mjs';
import {
  createRequestDeadline,
  createSingleFlight,
  runRefreshAttempt,
  shouldRetryAfterUnauthorized,
  toRequestError,
} from '@/lib/apiRequestRecovery.mjs';
import { supabase } from '@/lib/supabaseClient';
import { reportAiRun } from '@/lib/monitoring';

let currentAccessToken: string | null = null;

class AccountScopeChangedError extends Error {
  constructor() {
    super('Account changed while the request was in flight. Try again in the current account.');
    this.name = 'AccountScopeChangedError';
  }
}

function assertAccountScope(accountScope: ReturnType<typeof getUserContentStorageScope>) {
  if (getUserContentStorageScope() !== accountScope) {
    throw new AccountScopeChangedError();
  }
}

export function setAuthAccessToken(token?: string | null) {
  currentAccessToken = typeof token === 'string' && token ? token : null;
}

export async function getAccessToken(): Promise<string | null> {
  if (currentAccessToken) return currentAccessToken;
  if (!supabase) return null;
  const accountScope = getUserContentStorageScope();
  try {
    const { data } = await supabase.auth.getSession();
    if (getUserContentStorageScope() !== accountScope) return null;
    const token = data.session?.access_token ?? null;
    setAuthAccessToken(token);
    return token;
  } catch { return null; }
}

export async function authHeaders(init?: HeadersInit): Promise<Headers> {
  const headers = new Headers(init);
  // Callers that already hold a verified current-session token can avoid a
  // redundant Supabase session lookup (and its serialized auth lock).
  if (headers.has('Authorization')) return headers;
  const token = await getAccessToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
}

/**
 * Performs one request with an already captured access token. This deliberately
 * does not refresh on 401: background persistence must never retry an old
 * account's payload with credentials from a newly active account. The returned
 * response is also bound to the account scope that initiated this request so a
 * late old-account response cannot be consumed by newly active account UI.
 */
export async function authFetchWithAccessToken(
  input: RequestInfo | URL,
  accessToken: string,
  init?: RequestInit,
): Promise<Response> {
  if (!accessToken) throw new Error('A bound access token is required.');
  const accountScope = getUserContentStorageScope();
  const headers = new Headers(init?.headers);
  headers.set('Authorization', `Bearer ${accessToken}`);
  const deadline = createRequestDeadline(init?.signal, 30_000);
  try {
    assertAccountScope(accountScope);
    const response = await fetch(input, { ...init, headers, signal: deadline.signal });
    assertAccountScope(accountScope);
    // Persistence/export responses are finite JSON. Keep the deadline active
    // through the body so a stalled response cannot block the save queue.
    await response.clone().arrayBuffer();
    assertAccountScope(accountScope);
    return response;
  } catch (error) {
    throw toRequestError(error, deadline.didTimeout());
  } finally {
    deadline.cleanup();
  }
}

function isRequestInput(input: RequestInfo | URL): input is Request {
  return typeof Request !== 'undefined' && input instanceof Request;
}

function requestMethod(input: RequestInfo | URL, init?: RequestInit) {
  if (init?.method) return init.method.toUpperCase();
  if (isRequestInput(input)) return input.method.toUpperCase();
  return 'GET';
}

function mergedRequestHeaders(input: RequestInfo | URL, init?: RequestInit) {
  const headers = new Headers(isRequestInput(input) ? input.headers : undefined);
  new Headers(init?.headers).forEach((value, key) => headers.set(key, value));
  return headers;
}

function requestInputForAttempt(input: RequestInfo | URL): RequestInfo | URL {
  return isRequestInput(input) ? input.clone() : input;
}

const runRefreshAccessTokenSingleFlight = createSingleFlight(async (): Promise<string | null> => {
  if (!supabase) return null;

  const accountScope = getUserContentStorageScope();
  const token = await runRefreshAttempt(
    () => supabase.auth.refreshSession(),
    () => getUserContentStorageScope() === accountScope ? supabase.auth.signOut({ scope: 'local' }) : Promise.resolve(),
  );
  return getUserContentStorageScope() === accountScope ? token : null;
});

async function refreshAccessToken(): Promise<string | null> {
  const accountScope = getUserContentStorageScope();
  const token = await runRefreshAccessTokenSingleFlight();
  if (getUserContentStorageScope() !== accountScope) return null;
  setAuthAccessToken(token);
  return token;
}

export async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const accountScope = getUserContentStorageScope();
  const method = requestMethod(input, init);
  const shouldTrackAiRequest = method === 'POST' && Boolean(getAiFeatureForRequest(input));
  const shouldTrackAccountDeletion = isAccountDeletionRequest(input, method);
  const deadline = shouldTrackAiRequest ? createRequestDeadline(init?.signal) : null;
  const startedAt = Date.now();
  const headers = await authHeaders(mergedRequestHeaders(input, init));
  const hadAuthorization = headers.has('Authorization');

  const performRequest = (attemptHeaders: Headers) =>
    fetch(requestInputForAttempt(input), {
      ...init,
      headers: attemptHeaders,
      signal: deadline?.signal ?? init?.signal,
    });

  try {
    assertAccountScope(accountScope);
    let response = await performRequest(headers);
    assertAccountScope(accountScope);
    let retried = false;

    if (
      shouldRetryAfterUnauthorized({
        status: response.status,
        hasAuthorization: hadAuthorization,
        alreadyRetried: retried,
      })
    ) {
      const refreshedToken = await refreshAccessToken();
      assertAccountScope(accountScope);
      if (refreshedToken) {
        retried = true;
        const retryHeaders = new Headers(headers);
        retryHeaders.set('Authorization', `Bearer ${refreshedToken}`);
        response = await performRequest(retryHeaders);
        assertAccountScope(accountScope);
      }
    }

    if (shouldTrackAiRequest) {
      const durationMs = Date.now() - startedAt;
      trackAiRequestOutcome(input, {
        status: response.status,
        durationMs,
      });
      const resultBody = response.ok ? await response.clone().json().catch(() => null) : null;
      assertAccountScope(accountScope);
      reportAiRun({
        degraded: resultBody?.degraded === true || resultBody?.generation?.degraded === true,
        invalidOutput: response.ok && !resultBody,
        capability: getAiFeatureForRequest(input) || 'unknown',
        status: response.status,
        durationMs,
      });
    }
    if (shouldTrackAccountDeletion) {
      trackAccountDeletion({
        outcome: response.ok ? 'success' : 'failure',
        status: response.status,
      });
    }
    assertAccountScope(accountScope);
    return response;
  } catch (error) {
    const timedOut = deadline?.didTimeout() ?? false;
    const accountScopeChanged = error instanceof AccountScopeChangedError;
    if (shouldTrackAiRequest && !accountScopeChanged) {
      const durationMs = Date.now() - startedAt;
      trackAiRequestOutcome(input, {
        durationMs,
        networkError: !timedOut,
        timedOut,
      });
      reportAiRun({
        capability: getAiFeatureForRequest(input) || 'unknown',
        durationMs,
        networkError: !timedOut,
        timedOut,
      });
    }
    if (shouldTrackAccountDeletion && !accountScopeChanged) {
      trackAccountDeletion({ outcome: 'failure', networkError: true });
    }
    throw toRequestError(error, timedOut);
  } finally {
    deadline?.cleanup();
  }
}
