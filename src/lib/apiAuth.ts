import { isAccountDeletionRequest, trackAccountDeletion } from '@/lib/accountLifecycleAnalytics.mjs';
import { getAiFeatureForRequest, trackAiRequestOutcome } from '@/lib/aiRequestAnalytics.mjs';
import {
  createRequestDeadline,
  createSingleFlight,
  resolveRefreshSession,
  shouldRetryAfterUnauthorized,
  toRequestError,
} from '@/lib/apiRequestRecovery.mjs';
import { supabase } from '@/lib/supabaseClient';

export async function getAccessToken(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export async function authHeaders(init?: HeadersInit): Promise<Headers> {
  const headers = new Headers(init);
  const token = await getAccessToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
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

  const result = await supabase.auth.refreshSession();
  return resolveRefreshSession(result, () => supabase.auth.signOut({ scope: 'local' }));
});

async function refreshAccessToken(): Promise<string | null> {
  return runRefreshAccessTokenSingleFlight();
}

export async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
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
    let response = await performRequest(headers);
    let retried = false;

    if (
      shouldRetryAfterUnauthorized({
        status: response.status,
        hasAuthorization: hadAuthorization,
        alreadyRetried: retried,
      })
    ) {
      const refreshedToken = await refreshAccessToken();
      if (refreshedToken) {
        retried = true;
        const retryHeaders = new Headers(headers);
        retryHeaders.set('Authorization', `Bearer ${refreshedToken}`);
        response = await performRequest(retryHeaders);
      }
    }

    if (shouldTrackAiRequest) {
      trackAiRequestOutcome(input, {
        status: response.status,
        durationMs: Date.now() - startedAt,
      });
    }
    if (shouldTrackAccountDeletion) {
      trackAccountDeletion({
        outcome: response.ok ? 'success' : 'failure',
        status: response.status,
      });
    }
    return response;
  } catch (error) {
    const timedOut = deadline?.didTimeout() ?? false;
    if (shouldTrackAiRequest) {
      trackAiRequestOutcome(input, {
        durationMs: Date.now() - startedAt,
        networkError: !timedOut,
        timedOut,
      });
    }
    if (shouldTrackAccountDeletion) {
      trackAccountDeletion({ outcome: 'failure', networkError: true });
    }
    throw toRequestError(error, timedOut);
  } finally {
    deadline?.cleanup();
  }
}
