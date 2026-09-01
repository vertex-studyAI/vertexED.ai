import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const manuscriptPath = new URL(
  "../portfolio/research/papers/IRIS_V02_NEGATIVE_RESULT_MANUSCRIPT.md",
  import.meta.url,
);

async function readManuscript() {
  return readFile(manuscriptPath, "utf8");
}

test("IRIS manuscript distinguishes confirmatory experiment IDs from derived RNG values", async () => {
  const manuscript = await readManuscript();

  assert.match(manuscript, /confirmatory \*\*experiment IDs\*\* `1000–1029` remain unevaluated/);
  assert.match(manuscript, /derived RNG values internally/);
  assert.match(manuscript, /outer confirmatory experiment IDs `1000–1029` remain unavailable for evaluation/);
  assert.doesNotMatch(manuscript, /confirmatory seeds `1000–1029` remain untouched/);
  assert.doesNotMatch(manuscript, /Development seeds are separated from reserved confirmatory seeds/);
});

test("IRIS manuscript preserves the frozen mixed-negative result while tightening provenance language", async () => {
  const manuscript = await readManuscript();

  assert.match(manuscript, /5\.33–5\.36%/);
  assert.match(manuscript, /`>=10%` abrupt-regime gain \| \*\*FAILED\*\*/);
  assert.match(manuscript, /Broad adaptive-memory superiority \| \*\*UNSUPPORTED\*\*/);
  assert.match(manuscript, /Confirmatory experiment family evaluated \| \*\*FALSE\*\*/);
});
