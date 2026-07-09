import test from "node:test";
import assert from "node:assert/strict";

function readPref(metadata, flatKey, nestedKey, allowed) {
  const flat = metadata?.[flatKey];
  if (typeof flat === "string" && allowed.includes(flat)) return flat;

  const prefs = metadata?.preferences;
  if (prefs && typeof prefs === "object") {
    const nested = prefs[nestedKey];
    if (typeof nested === "string" && allowed.includes(nested)) return nested;
  }
  return null;
}

function getLearnerProfile(user) {
  const metadata = user?.user_metadata ?? {};
  const username = metadata.username;
  const displayName =
    (typeof username === "string" && username) ||
    (user?.email ? user.email.split("@")[0] : "Student");

  return {
    displayName,
    studyGoal: readPref(metadata, "study_goal", "studyGoal", [
      "ace_exams",
      "catch_up",
      "build_habits",
      "understand_better",
    ]),
    gradeLevel: readPref(metadata, "grade_level", "gradeLevel", [
      "middle_school",
      "high_school",
      "undergraduate",
      "other",
    ]),
  };
}

function getGoalLearningPath(goal) {
  if (goal === "ace_exams") return 4;
  if (goal === "catch_up") return 4;
  return 4;
}

test("getLearnerProfile reads nested onboarding preferences", () => {
  const profile = getLearnerProfile({
    email: "student@school.edu",
    user_metadata: {
      username: "alex",
      preferences: { studyGoal: "ace_exams", gradeLevel: "high_school" },
    },
  });
  assert.equal(profile.displayName, "alex");
  assert.equal(profile.studyGoal, "ace_exams");
  assert.equal(profile.gradeLevel, "high_school");
});

test("getLearnerProfile prefers flat metadata keys", () => {
  const profile = getLearnerProfile({
    user_metadata: {
      study_goal: "build_habits",
      grade_level: "undergraduate",
    },
  });
  assert.equal(profile.studyGoal, "build_habits");
  assert.equal(profile.gradeLevel, "undergraduate");
});

test("goal learning paths always have four steps", () => {
  assert.equal(getGoalLearningPath("ace_exams"), 4);
  assert.equal(getGoalLearningPath(null), 4);
});
