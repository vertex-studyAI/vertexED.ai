import test from "node:test";
import assert from "node:assert/strict";

function artifactTargetRoute(kind) {
  switch (kind) {
    case "note":
      return "/notetaker";
    case "paper":
      return "/paper-maker";
    case "review":
      return "/answer-reviewer";
  }
}

function formatArtifactDate(iso) {
  try {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

test("artifactTargetRoute maps kinds to tool routes", () => {
  assert.equal(artifactTargetRoute("note"), "/notetaker");
  assert.equal(artifactTargetRoute("paper"), "/paper-maker");
  assert.equal(artifactTargetRoute("review"), "/answer-reviewer");
});

test("formatArtifactDate returns readable date or fallback", () => {
  const formatted = formatArtifactDate("2026-07-09T12:00:00.000Z");
  assert.match(formatted, /2026/);
  assert.equal(formatArtifactDate("not-a-date"), "—");
});
