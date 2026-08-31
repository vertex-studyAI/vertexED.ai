import test from "node:test";
import assert from "node:assert/strict";

import {
  AI_REQUEST_TIMEOUT_MESSAGE,
  ApiRequestTimeoutError,
  createRequestDeadline,
  createSingleFlight,
  resolveRefreshSession,
  runRefreshAttempt,
  shouldClearLocalSessionAfterRefreshFailure,
  shouldRetryAfterUnauthorized,
  toRequestError,
} from "../src/lib/apiRequestRecovery.mjs";

test("session recovery retries exactly one authenticated 401", () => {
  assert.equal(
    shouldRetryAfterUnauthorized({
      status: 401,
      hasAuthorization: true,
      alreadyRetried: false,
    }),
    true,
  );
  assert.equal(
    shouldRetryAfterUnauthorized({
      status: 401,
      hasAuthorization: true,
      alreadyRetried: true,
    }),
    false,
  );
  assert.equal(
    shouldRetryAfterUnauthorized({
      status: 401,
      hasAuthorization: false,
      alreadyRetried: false,
    }),
    false,
  );
  assert.equal(
    shouldRetryAfterUnauthorized({
      status: 403,
      hasAuthorization: true,
      alreadyRetried: false,
    }),
    false,
  );
});

test("request deadlines preserve caller cancellation", () => {
  const caller = new AbortController();
  const deadline = createRequestDeadline(caller.signal, 60_000);

  caller.abort("caller-cancelled");

  assert.equal(deadline.signal.aborted, true);
  assert.equal(deadline.didTimeout(), false);
  deadline.cleanup();
});

test("timed-out requests receive a stable actionable error", () => {
  const original = new Error("raw transport error");
  const transformed = toRequestError(original, true);

  assert.equal(transformed instanceof ApiRequestTimeoutError, true);
  assert.equal(transformed.name, "ApiRequestTimeoutError");
  assert.equal(transformed.message, AI_REQUEST_TIMEOUT_MESSAGE);
  assert.equal(transformed.message.includes("raw transport error"), false);
});

test("non-timeout request errors are preserved", () => {
  const original = new Error("network unavailable");
  assert.equal(toRequestError(original, false), original);
});

test("terminal refresh credentials clear only the local session", () => {
  for (const code of [
    "refresh_token_not_found",
    "refresh_token_already_used",
    "refresh_token_reuse_detected",
    "invalid_refresh_token",
    "session_not_found",
  ]) {
    assert.equal(
      shouldClearLocalSessionAfterRefreshFailure({ code, status: 400, message: "auth failed" }),
      true,
      code,
    );
  }

  assert.equal(
    shouldClearLocalSessionAfterRefreshFailure({
      status: 400,
      message: "Refresh Token has expired",
    }),
    true,
  );
});

test("transient refresh failures preserve the recoverable browser session", () => {
  for (const error of [
    { name: "AuthRetryableFetchError", status: 0, message: "Failed to fetch" },
    { status: 429, message: "Rate limit exceeded" },
    { status: 500, message: "Internal server error" },
    { status: 503, message: "Service unavailable" },
    new TypeError("Network request failed"),
    null,
  ]) {
    assert.equal(shouldClearLocalSessionAfterRefreshFailure(error), false);
  }
});

test("refresh failure classification is fail-safe for unknown payloads", () => {
  assert.equal(shouldClearLocalSessionAfterRefreshFailure("invalid_refresh_token"), false);
  assert.equal(shouldClearLocalSessionAfterRefreshFailure({ code: 42 }), false);
  assert.equal(shouldClearLocalSessionAfterRefreshFailure({ message: "token error" }), false);
});

test("concurrent unauthorized requests share one token refresh", async () => {
  let calls = 0;
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  const refresh = createSingleFlight(async () => {
    calls += 1;
    await gate;
    return "fresh-token";
  });

  const first = refresh();
  const second = refresh();

  assert.equal(first, second);
  assert.equal(calls, 0);
  await Promise.resolve();
  assert.equal(calls, 1);

  release();
  assert.deepEqual(await Promise.all([first, second]), ["fresh-token", "fresh-token"]);
  assert.equal(calls, 1);
});

test("concurrent refresh callers share the same failure", async () => {
  let calls = 0;
  const refresh = createSingleFlight(async () => {
    calls += 1;
    throw new Error("refresh unavailable");
  });

  const first = refresh();
  const second = refresh();

  assert.equal(first, second);
  const outcomes = await Promise.allSettled([first, second]);
  assert.equal(calls, 1);
  assert.deepEqual(
    outcomes.map(({ status }) => status),
    ["rejected", "rejected"],
  );
  assert.equal(outcomes[0].reason, outcomes[1].reason);
});

test("single-flight refresh resets after settlement", async () => {
  let calls = 0;
  const refresh = createSingleFlight(async () => {
    calls += 1;
    return `token-${calls}`;
  });

  assert.equal(await refresh(), "token-1");
  assert.equal(await refresh(), "token-2");
  assert.equal(calls, 2);
});

test("concurrent terminal refresh failure clears the local session exactly once", async () => {
  let refreshCalls = 0;
  let localSignOuts = 0;
  const refresh = createSingleFlight(async () => {
    refreshCalls += 1;
    return resolveRefreshSession(
      {
        data: { session: null },
        error: { code: "refresh_token_reuse_detected", status: 400 },
      },
      async () => {
        localSignOuts += 1;
      },
    );
  });

  assert.deepEqual(await Promise.all([refresh(), refresh(), refresh()]), [null, null, null]);
  assert.equal(refreshCalls, 1);
  assert.equal(localSignOuts, 1);
});

test("concurrent transient refresh failure never clears the local session", async () => {
  let refreshCalls = 0;
  let localSignOuts = 0;
  const refresh = createSingleFlight(async () => {
    refreshCalls += 1;
    return resolveRefreshSession(
      {
        data: { session: null },
        error: { status: 503, message: "Service unavailable" },
      },
      async () => {
        localSignOuts += 1;
      },
    );
  });

  assert.deepEqual(await Promise.all([refresh(), refresh()]), [null, null]);
  assert.equal(refreshCalls, 1);
  assert.equal(localSignOuts, 0);
});

test("concurrent successful refresh propagates one shared token without sign-out", async () => {
  let refreshCalls = 0;
  let localSignOuts = 0;
  const refresh = createSingleFlight(async () => {
    refreshCalls += 1;
    return resolveRefreshSession(
      {
        data: { session: { access_token: "fresh-token" } },
        error: null,
      },
      async () => {
        localSignOuts += 1;
      },
    );
  });

  assert.deepEqual(await Promise.all([refresh(), refresh()]), ["fresh-token", "fresh-token"]);
  assert.equal(refreshCalls, 1);
  assert.equal(localSignOuts, 0);
});

test("thrown transient refresh failure preserves the original unauthorized response path", async () => {
  let localSignOuts = 0;
  const token = await runRefreshAttempt(
    async () => {
      throw Object.assign(new Error("Failed to fetch"), {
        name: "AuthRetryableFetchError",
        status: 0,
      });
    },
    async () => {
      localSignOuts += 1;
    },
  );

  assert.equal(token, null);
  assert.equal(localSignOuts, 0);
});

test("concurrent thrown terminal refresh failure clears local state exactly once", async () => {
  let refreshCalls = 0;
  let localSignOuts = 0;
  const refresh = createSingleFlight(() =>
    runRefreshAttempt(
      async () => {
        refreshCalls += 1;
        throw Object.assign(new Error("Refresh token reuse detected"), {
          code: "refresh_token_reuse_detected",
          status: 400,
        });
      },
      async () => {
        localSignOuts += 1;
      },
    ),
  );

  assert.deepEqual(await Promise.all([refresh(), refresh(), refresh()]), [null, null, null]);
  assert.equal(refreshCalls, 1);
  assert.equal(localSignOuts, 1);
});

test("a later request can recover after a thrown transient refresh failure", async () => {
  let refreshCalls = 0;
  let localSignOuts = 0;
  const refresh = createSingleFlight(() =>
    runRefreshAttempt(
      async () => {
        refreshCalls += 1;
        if (refreshCalls === 1) {
          throw Object.assign(new Error("Service unavailable"), { status: 503 });
        }
        return {
          data: { session: { access_token: "recovered-token" } },
          error: null,
        };
      },
      async () => {
        localSignOuts += 1;
      },
    ),
  );

  assert.equal(await refresh(), null);
  assert.equal(await refresh(), "recovered-token");
  assert.equal(refreshCalls, 2);
  assert.equal(localSignOuts, 0);
});
