import test from "node:test";
import assert from "node:assert/strict";

import {
  AI_REQUEST_TIMEOUT_MESSAGE,
  ApiRequestTimeoutError,
  createRequestDeadline,
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
