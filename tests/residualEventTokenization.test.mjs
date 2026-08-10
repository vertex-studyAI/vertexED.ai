import test from "node:test";
import assert from "node:assert/strict";
import {
  decodeResidualEvents,
  encodeResidualEvents,
  evaluateResidualEncoding,
  generateTrendWithDefects,
  runThresholdSweep
} from "../portfolio/new-projects/residual-event-tokenization/src/core.mjs";

test("linear predictor compresses an exact trend after its first two events", () => {
  const values = Array.from({ length: 30 }, (_, index) => index);
  const encoded = encodeResidualEvents(values, { threshold: 0.5, mode: "linear" });
  const decoded = decodeResidualEvents(encoded);
  assert.deepEqual(decoded, values);
  assert.equal(encoded.events.length, 2);
});

test("decoder reconstruction respects the configured residual threshold", () => {
  const values = generateTrendWithDefects(120);
  for (const mode of ["hold", "linear"]) {
    for (const threshold of [0.1, 0.25, 0.5, 1, 2]) {
      const encoded = encodeResidualEvents(values, { threshold, mode });
      const metrics = evaluateResidualEncoding(values, encoded);
      assert.ok(metrics.maxAbsError < threshold + 1e-12, `${mode} threshold ${threshold}`);
      assert.ok(metrics.tokens >= 1 && metrics.tokens <= values.length);
      assert.ok(metrics.compressionFactor >= 1);
    }
  }
});

test("higher thresholds cannot increase token count for hold predictor on the same signal", () => {
  const values = generateTrendWithDefects(120);
  const rows = runThresholdSweep(values, [0.1, 0.25, 0.5, 1, 2], "hold");
  for (let index = 1; index < rows.length; index += 1) {
    assert.ok(rows[index].tokens <= rows[index - 1].tokens);
  }
});

test("linear residual events beat zero-order hold on a clean linear trend", () => {
  const values = Array.from({ length: 100 }, (_, index) => 2 + 0.4 * index);
  const linear = encodeResidualEvents(values, { threshold: 0.2, mode: "linear" });
  const hold = encodeResidualEvents(values, { threshold: 0.2, mode: "hold" });
  assert.equal(linear.events.length, 2);
  assert.ok(hold.events.length > linear.events.length * 10);
});

test("malformed streams and invalid thresholds fail closed", () => {
  assert.throws(() => encodeResidualEvents([1, 2, 3], { threshold: 0 }), /threshold/);
  assert.throws(() => encodeResidualEvents([1, Number.NaN, 3]), /finite/);
  assert.throws(
    () => decodeResidualEvents({ length: 4, mode: "linear", events: [{ index: 1, value: 2 }] }),
    /index 0/
  );
});
