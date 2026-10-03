import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createAccountOperationScope } from "../src/lib/accountOperationScope.mjs";

const launcherSource = readFileSync(
  new URL("../src/components/FeedbackLauncher.tsx", import.meta.url),
  "utf8",
);

test("same-account rerenders preserve a captured operation", () => {
  const scope = createAccountOperationScope("learner-a");
  const token = scope.capture("learner-a");
  scope.bind("learner-a");
  assert.ok(token);
  assert.equal(scope.isCurrent(token), true);
});

test("an account switch invalidates an older operation", () => {
  const scope = createAccountOperationScope("learner-a");
  const oldToken = scope.capture("learner-a");
  scope.bind("learner-b");
  const newToken = scope.capture("learner-b");
  assert.ok(oldToken);
  assert.ok(newToken);
  assert.equal(scope.isCurrent(oldToken), false);
  assert.equal(scope.isCurrent(newToken), true);
});

test("sign-out invalidates work and prevents anonymous capture", () => {
  const scope = createAccountOperationScope("learner-a");
  const token = scope.capture("learner-a");
  scope.bind(null);
  assert.ok(token);
  assert.equal(scope.isCurrent(token), false);
  assert.equal(scope.capture(null), null);
  assert.equal(scope.capture(""), null);
});

test("the launcher clears unsent account-bound form state on identity change", () => {
  const effect = launcherSource.match(
    /useEffect\(\(\) => \{[\s\S]*?\}, \[user\?\.id\]\);/,
  )?.[0] ?? "";
  assert.match(effect, /setOpen\(false\)/);
  assert.match(effect, /setFeedback\(""\)/);
  assert.match(effect, /setRating\(""\)/);
  assert.match(effect, /setCategory\("idea"\)/);
  assert.match(effect, /setSubmitting\(false\)/);
});

test("the feedback row is bound to the captured account token", () => {
  assert.match(
    launcherSource,
    /const submissionToken = submissionScope\.capture\(user\.id\);/,
  );
  assert.match(launcherSource, /user_id: submissionToken\.accountId/);
});

test("stale completion paths cannot mutate the next account UI", () => {
  const submitBlock = launcherSource.match(
    /const submitFeedback = async \(\) => \{[\s\S]*?\n  \};/,
  )?.[0] ?? "";
  const guards = submitBlock.match(
    /submissionScope\.isCurrent\(submissionToken\)/g,
  ) ?? [];
  assert.ok(guards.length >= 3, "expected success, error, and finally guards");
  assert.ok(
    submitBlock.indexOf("if (!submissionScope.isCurrent(submissionToken)) return;")
      < submitBlock.indexOf("if (error) throw error;"),
    "the post-await account guard must run before handling the database result",
  );
});
