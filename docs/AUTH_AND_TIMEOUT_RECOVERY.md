# Authentication and AI Request Recovery

## Objective

Keep a recoverable expired session or slow AI provider from becoming a dead end, without creating retry loops, duplicating accepted product actions, or exposing private request data.

## Session recovery contract

Supabase `getSession()` refreshes an expiring session when possible before VertexED builds the Authorization header. If an authenticated API request still returns `401`, `authFetch` performs one explicit recovery attempt:

1. Call `supabase.auth.refreshSession()` using the browser's current persisted session.
2. If a new access token is returned, replace the Authorization header and retry the original request once.
3. If refresh fails or no new access token exists, clear only the local browser session with `signOut({ scope: 'local' })`.
4. Supabase emits the signed-out state to `AuthContext`, and protected routes can return the user to login.
5. Return the original `401` when recovery is impossible; never retry a second time.

The retry is restricted to requests that already carried an Authorization header. Logged-out `401` responses, `403` authorization failures, validation errors, provider failures, and other statuses are not retried.

A non-idempotent request is retried only after the server rejected the first attempt as unauthenticated. The first response therefore does not represent an accepted product action.

## AI timeout contract

Authenticated POST requests to the fixed AI endpoint allowlist receive a 45-second client deadline. The deadline:

- forwards an existing caller AbortSignal;
- covers the initial API attempt and any single authenticated retry;
- aborts only the active browser request;
- cleans up timers and abort listeners in every outcome;
- replaces the browser's raw abort error with `ApiRequestTimeoutError` and the message: `This request took too long. Please try again; your input is still available.`

Non-AI requests retain their existing timeout behavior.

## Analytics

Timed-out AI attempts emit the existing privacy-safe `AI Request Completed` event using:

- the fixed feature category;
- `outcome=timeout`;
- `status_class=network`;
- a bounded duration bucket.

No prompt, answer, request body, response body, identity, exact URL, exact latency, token, or raw transport error enters analytics.

## Regression coverage

- `tests/api-request-recovery.test.mjs` verifies one-retry eligibility, caller cancellation, timeout error normalization, and preservation of non-timeout errors.
- `tests/product-analytics.test.mjs` verifies that timeout analytics uses fixed categories only.
- The canonical release gate verifies TypeScript, application tests, deterministic evaluations, the production audit, and the production build.
- Browser-production certification remains required before merge.

## Official references

- https://supabase.com/docs/reference/javascript/auth-getsession
- https://supabase.com/docs/reference/javascript/auth-refreshsession
- https://supabase.com/docs/reference/javascript/auth-onauthstatechange
- https://supabase.com/docs/guides/auth/sessions
