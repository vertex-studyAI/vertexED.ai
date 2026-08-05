import test from "node:test";
import assert from "node:assert/strict";

import { getOnboardingStatus, isOnboardingComplete } from "../src/lib/onboardingStatus.js";

test("username-only invite accounts remain in onboarding", () => {
  const user = { user_metadata: { username: "alex.student" } };

  assert.equal(isOnboardingComplete(user), false);
  assert.deepEqual(getOnboardingStatus(user), {
    hasValidUsername: true,
    hasValidBoard: false,
    hasValidGrade: false,
    hasSubjects: false,
    isComplete: false,
  });
});

test("flat curriculum metadata completes onboarding", () => {
  const user = {
    user_metadata: {
      username: "alex.student",
      board: "IB_DP",
      grade: 11,
      subjects: ["Math AA", "Physics"],
    },
  };

  assert.equal(isOnboardingComplete(user), true);
});

test("nested legacy preferences complete onboarding", () => {
  const user = {
    user_metadata: {
      username: "learner_01",
      preferences: {
        board: "AP",
        grade: "12",
        subjects: ["Calculus BC"],
      },
    },
  };

  assert.equal(isOnboardingComplete(user), true);
});

test("empty subjects never count as a usable first study plan", () => {
  const user = {
    user_metadata: {
      username: "learner_01",
      board: "IB_MYP",
      grade: 10,
      subjects: ["", "   "],
    },
  };

  assert.equal(isOnboardingComplete(user), false);
});

test("unknown boards and malformed usernames remain incomplete", () => {
  assert.equal(isOnboardingComplete({
    user_metadata: {
      username: "x",
      board: "UNKNOWN",
      grade: 10,
      subjects: ["Physics"],
    },
  }), false);
});
