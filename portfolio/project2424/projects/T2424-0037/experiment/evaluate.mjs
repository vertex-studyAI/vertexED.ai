import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { benchmarkCases } from "../benchmark/cases.mjs";
import { baselines, runBenchmark } from "../src/baselines.mjs";

function detectOpenScad() {
  const probe = spawnSync("openscad", ["--version"], { encoding: "utf8" });
  return { available: probe.status === 0, version: (probe.stdout || probe.stderr || "").trim() || null };
}

function runKernelCheck(compile) {
  const backend = detectOpenScad();
  if (!backend.available) return { ...backend, attempted: 0, succeeded: 0, successRate: null };
  const root = mkdtempSync(join(tmpdir(), "t2424-0037-"));
  let attempted = 0;
  let succeeded = 0;
  try {
    for (const testCase of benchmarkCases.filter((entry) => entry.expected.accept)) {
      try {
        const { source } = compile(testCase.prompt);
        const scadPath = join(root, `${testCase.id}.scad`);
        const stlPath = join(root, `${testCase.id}.stl`);
        writeFileSync(scadPath, source, "utf8");
        attempted += 1;
        const run = spawnSync("openscad", ["-o", stlPath, scadPath], { encoding: "utf8", timeout: 10_000 });
        if (run.status === 0) succeeded += 1;
      } catch {
        attempted += 1;
      }
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
  return { ...backend, attempted, succeeded, successRate: attempted > 0 ? succeeded / attempted : null };
}

const metrics = runBenchmark(benchmarkCases);
const kernel = runKernelCheck(baselines.structured_ir);
const verdict = metrics.structured_ir.decisionAccuracy === 1
  && metrics.structured_ir.constraintAdherenceRate === 1
  && metrics.structured_ir.unsafeAcceptanceCount === 0
  && metrics.structured_ir.constraintAdherenceRate > metrics.direct_regex.constraintAdherenceRate
  ? "PASS_CONTROLLED_IR_SCREEN"
  : "FAIL_OR_INCONCLUSIVE";

console.log(JSON.stringify({
  project: "T2424-0037",
  name: "NLP-to-CAD",
  hypothesis: "Within the frozen controlled-language benchmark, an explicit validated intermediate representation improves constraint adherence and fail-closed behavior relative to direct regex-to-CAD emission.",
  benchmarkVersion: "v0.1-26-prompts",
  metrics,
  optionalOpenScadKernel: kernel,
  verdict,
  claimBoundary: "controlled deterministic compiler screen only; not arbitrary NLP-to-CAD, CAD-kernel correctness, manufacturing validity, or publication-ready evidence",
}, null, 2));
