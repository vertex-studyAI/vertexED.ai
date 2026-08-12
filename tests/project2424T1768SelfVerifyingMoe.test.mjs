import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  executeSelfVerifyingMoe,
  executeUnverifiedMoe,
  softmax,
} from '../portfolio/project2424/projects/T2424-1768/src/selfVerifyingMoe.mjs';
import {
  buildSyntheticExperts,
  runSyntheticBenchmark,
  uniformRouter,
} from '../portfolio/project2424/projects/T2424-1768/experiment/syntheticBenchmark.mjs';
import {
  verifyRetainedResult,
} from '../portfolio/project2424/projects/T2424-1768/experiment/verifyRetainedResult.mjs';

test('softmax is stable and normalized', () => {
  const weights = softmax([1000, 1001, 999]);
  assert.ok(Math.abs(weights.reduce((sum, value) => sum + value, 0) - 1) < 1e-12);
  assert.ok(weights[1] > weights[0]);
  assert.ok(weights[0] > weights[2]);
});

test('self-verifying engine rejects an injected out-of-contract expert output', () => {
  const experts = buildSyntheticExperts({ injectViolation: true });
  const sample = { x: 0.75 };
  const result = executeSelfVerifyingMoe({ sample, experts, router: uniformRouter });

  assert.equal(result.exhausted, false);
  assert.deepEqual(result.acceptedExperts, ['smooth-a', 'smooth-b']);
  assert.deepEqual(result.rejectedExperts, ['candidate-c']);
  assert.equal(result.audit.find((entry) => entry.id === 'candidate-c').accepted, false);
  assert.ok(Math.abs(result.weights.reduce((sum, value) => sum + value, 0) - 1) < 1e-12);
});

test('clean control accepts all experts and matches the unverified mixture', () => {
  const experts = buildSyntheticExperts({ injectViolation: false });
  const sample = { x: 0.4 };
  const verified = executeSelfVerifyingMoe({ sample, experts, router: uniformRouter });
  const unverified = executeUnverifiedMoe({ sample, experts, router: uniformRouter });

  assert.equal(verified.exhausted, false);
  assert.equal(verified.rejectedExperts.length, 0);
  assert.deepEqual(verified.acceptedExperts, ['smooth-a', 'smooth-b', 'candidate-c']);
  assert.ok(Math.abs(verified.prediction - unverified.prediction) <= 1e-12);
});

test('engine fails closed when the accepted-expert quorum is not met', () => {
  const experts = [
    { id: 'a', predict: () => 100, verify: () => false },
    { id: 'b', predict: () => 200, verify: () => ({ accepted: false, reason: 'bad' }) },
  ];
  const result = executeSelfVerifyingMoe({
    sample: {},
    experts,
    router: () => [1, 1],
    minAccepted: 1,
  });

  assert.equal(result.exhausted, true);
  assert.equal(result.prediction, null);
  assert.deepEqual(result.acceptedExperts, []);
  assert.deepEqual(result.rejectedExperts, ['a', 'b']);
});

test('invalid expert/verifier/router contracts fail closed', () => {
  assert.throws(
    () => executeSelfVerifyingMoe({ sample: {}, experts: [{ id: 'a', predict: () => 1 }], router: () => [1] }),
    /verify/,
  );
  assert.throws(
    () => executeSelfVerifyingMoe({
      sample: {},
      experts: [{ id: 'a', predict: () => 1, verify: () => ({ accepted: 'yes' }) }],
      router: () => [1],
    }),
    /verifier must return/,
  );
  assert.throws(
    () => executeSelfVerifyingMoe({
      sample: {},
      experts: [{ id: 'a', predict: () => 1, verify: () => true }],
      router: () => [Number.NaN],
    }),
    /finite/,
  );
});

test('frozen synthetic benchmark passes only the bounded mechanics gates', () => {
  const report = runSyntheticBenchmark({ sampleCount: 81 });

  assert.equal(report.project, 'T2424-1768');
  assert.equal(report.verdict, 'PASS_CONTROLLED_SELF_VERIFICATION_MECHANICS');
  assert.equal(report.gates.catchesInjectedViolation, true);
  assert.equal(report.gates.improvesCorruptedControl, true);
  assert.equal(report.gates.preservesCleanControl, true);
  assert.equal(report.gates.neverExhaustsFixture, true);
  assert.ok(report.corrupted.rejectedExpertRate > 0);
  assert.ok(
    report.corrupted.verifiedMeanAbsoluteError < report.corrupted.unverifiedMeanAbsoluteError * 0.5,
  );
  assert.equal(report.clean.rejectedExpertRate, 0);
  assert.ok(report.cleanDelta <= 1e-12);
});

test('retained result is independently recomputable without importing the engine', async () => {
  const url = new URL(
    '../portfolio/project2424/projects/T2424-1768/experiment/retained-result.json',
    import.meta.url,
  );
  const retained = JSON.parse(await readFile(url, 'utf8'));
  const verification = verifyRetainedResult(retained);

  assert.equal(verification.ok, true);
  assert.equal(verification.verdict, 'PASS_CONTROLLED_SELF_VERIFICATION_MECHANICS');
  assert.ok(verification.corrupted.rejectedExpertRate > 0);
  assert.equal(verification.clean.rejectedExpertRate, 0);
});
