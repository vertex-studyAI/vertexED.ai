import { isAccountDeletionRequest, trackAccountDeletion } from '@/lib/accountLifecycleAnalytics.mjs';
import { getAiFeatureForRequest, trackAiRequestOutcome } from '@/lib/aiRequestAnalytics.mjs';
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

function requestMethod(input: RequestInfo | URL, init?: RequestInit) {
  if (init?.method) return init.method.toUpperCase();
  if (typeof Request !== 'undefined' && input instanceof Request) {
    return input.method.toUpperCase();
  }
  return 'GET';
}

export async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const headers = await authHeaders(init?.headers);
  const method = requestMethod(input, init);
  const shouldTrackAiRequest = method === 'POST' && Boolean(getAiFeatureForRequest(input));
  const shouldTrackAccountDeletion = isAccountDeletionRequest(input, method);
  const startedAt = Date.now();

  try {
    const response = await fetch(input, { ...init, headers });
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
    if (shouldTrackAiRequest) {
      trackAiRequestOutcome(input, {
        durationMs: Date.now() - startedAt,
        networkError: true,
      });
    }
    if (shouldTrackAccountDeletion) {
      trackAccountDeletion({ outcome: 'failure', networkError: true });
    }
    throw error;
  }
}
