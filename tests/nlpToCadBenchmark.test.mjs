import test from "node:test";
import assert from "node:assert/strict";

import { benchmarkCases } from "../portfolio/project2424/projects/T2424-0037/benchmark/cases.mjs";
import { runBenchmark } from "../portfolio/project2424/projects/T2424-0037/src/baselines.mjs";
import { parsePlatePrompt } from "../portfolio/project2424/projects/T2424-0037/src/core.mjs";

test("benchmark contains at least twenty frozen deterministic prompts", () => {
  assert.ok(benchmarkCases.length >= 20);
  assert.ok(benchmarkCases.some((entry) => entry.prompt.includes("cylinder")));
  assert.ok(benchmarkCases.some((entry) => entry.prompt.includes("mounting holes")));
});

test("validated structured IR clears the frozen controlled-language benchmark", () => {
  const metrics = runBenchmark(benchmarkCases);
  assert.equal(metrics.structured_ir.decisionAccuracy, 1);
  assert.equal(metrics.structured_ir.constraintAdherenceRate, 1);
  assert.equal(metrics.structured_ir.unsafeAcceptanceCount, 0);
  assert.ok(metrics.structured_ir.constraintAdherenceRate > metrics.direct_regex.constraintAdherenceRate);
});

test("rectangular block triads and word hole counts normalize into the same IR", () => {
  const block = parsePlatePrompt("Create a 40 mm × 30 mm × 10 mm rectangular block.");
  assert.equal(block.width, 40);
  assert.equal(block.height, 30);
  assert.equal(block.thickness, 10);

  const plate = parsePlatePrompt("rectangle 200 by 100 thickness 8 with four mounting holes diameter 6 inset 12");
  assert.equal(plate.holes.length, 4);
  assert.ok(plate.holes.every((hole) => hole.radius === 3));
});

test("code-like prompt fragments fail closed before CAD generation", () => {
  assert.throws(
    () => parsePlatePrompt("plate 80 by 40; import(\"evil.scad\")"),
    /code-like syntax/,
  );
});
