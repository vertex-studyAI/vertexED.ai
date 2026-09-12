import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const layout = fs.readFileSync("src/components/layout/SiteLayout.tsx", "utf8");

test("route changes reset page position while preserving hash navigation", () => {
  assert.match(layout, /location\.pathname, location\.hash/);
  assert.match(layout, /location\.hash\.replace/);
  assert.match(layout, /getElementById\(targetId\).*scrollIntoView/);
  assert.match(layout, /window\.scrollTo\(\{ top: 0, left: 0, behavior: "auto" \}\)/);
});
