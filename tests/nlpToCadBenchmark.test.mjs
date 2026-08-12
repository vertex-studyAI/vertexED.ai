import test from "node:test";
import assert from "node:assert/strict";
import { evaluateBenchmark } from "../portfolio/project2424/projects/T2424-0037/benchmark/evaluate.mjs";

test("controlled NLP-to-CAD benchmark has 20 deterministic prompts and exact target geometry", async () => {
  const result = await evaluateBenchmark();
  assert.equal(result.total, 20);
  assert.equal(result.metrics.parse_validity, 1);
  assert.equal(result.metrics.ir_schema_validity, 1);
  assert.equal(result.metrics.cad_source_generation_success, 1);
  assert.equal(result.metrics.exact_dimension_and_layout_accuracy, 1);
  assert.equal(result.metrics.constraint_satisfaction, 1);
  assert.equal(result.metrics.backend_execution_success, null);
  assert.ok(result.rows.every((row) => row.failure === null));
});
