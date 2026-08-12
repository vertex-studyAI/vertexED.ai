import {
  executeSelfVerifyingMoe,
  executeUnverifiedMoe,
} from '../src/selfVerifyingMoe.mjs';

export function target(sample) {
  return 0.75 * sample.x + 0.25;
}

export function buildSamples(sampleCount = 81) {
  if (!Number.isInteger(sampleCount) || sampleCount < 3) {
    throw new TypeError('sampleCount must be an integer >= 3');
  }
  return Array.from({ length: sampleCount }, (_, index) => ({
    x: -1 + (2 * index) / (sampleCount - 1),
  }));
}

function boundedContract({ prediction }) {
  const accepted = prediction >= -0.6 && prediction <= 1.1;
  return {
    accepted,
    reason: accepted ? 'inside-frozen-output-bound' : 'outside-frozen-output-bound',
  };
}

export function buildSyntheticExperts({ injectViolation = false } = {}) {
  return [
    {
      id: 'smooth-a',
      predict: (sample) => target(sample) + 0.04 * sample.x,
      verify: boundedContract,
    },
    {
      id: 'smooth-b',
      predict: (sample) => target(sample) - 0.03 * (1 - sample.x * sample.x),
      verify: boundedContract,
    },
    {
      id: 'candidate-c',
      predict: (sample) => {
        const nominal = target(sample) + 0.02 * Math.sin(3 * sample.x);
        return injectViolation && sample.x > 0.2 ? nominal + 6 : nominal;
      },
      verify: boundedContract,
    },
  ];
}

export function uniformRouter(_sample, experts) {
  return experts.map(() => 1);
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function evaluateCondition({ samples, experts }) {
  const verifiedErrors = [];
  const unverifiedErrors = [];
  let rejected = 0;
  let exhausted = 0;

  for (const sample of samples) {
    const expected = target(sample);
    const verified = executeSelfVerifyingMoe({
      sample,
      experts,
      router: uniformRouter,
      minAccepted: 1,
    });
    const unverified = executeUnverifiedMoe({ sample, experts, router: uniformRouter });

    rejected += verified.rejectedExperts.length;
    if (verified.exhausted) {
      exhausted += 1;
    } else {
      verifiedErrors.push(Math.abs(verified.prediction - expected));
    }
    unverifiedErrors.push(Math.abs(unverified.prediction - expected));
  }

  return {
    verifiedMeanAbsoluteError: verifiedErrors.length ? mean(verifiedErrors) : null,
    unverifiedMeanAbsoluteError: mean(unverifiedErrors),
    rejectedExpertRate: rejected / (samples.length * experts.length),
    exhaustedRate: exhausted / samples.length,
  };
}

export function runSyntheticBenchmark({ sampleCount = 81 } = {}) {
  const samples = buildSamples(sampleCount);
  const corruptedExperts = buildSyntheticExperts({ injectViolation: true });
  const cleanExperts = buildSyntheticExperts({ injectViolation: false });

  const corrupted = evaluateCondition({ samples, experts: corruptedExperts });
  const clean = evaluateCondition({ samples, experts: cleanExperts });
  const cleanDelta = Math.abs(clean.verifiedMeanAbsoluteError - clean.unverifiedMeanAbsoluteError);

  const gates = {
    catchesInjectedViolation: corrupted.rejectedExpertRate > 0,
    improvesCorruptedControl:
      corrupted.verifiedMeanAbsoluteError < corrupted.unverifiedMeanAbsoluteError * 0.5,
    preservesCleanControl: clean.rejectedExpertRate === 0 && cleanDelta <= 1e-12,
    neverExhaustsFixture: corrupted.exhaustedRate === 0 && clean.exhaustedRate === 0,
  };

  return {
    project: 'T2424-1768',
    claim:
      'caller-supplied output contracts can reject injected out-of-bound expert outputs and prevent them from contaminating a scalar mixture on this frozen synthetic fixture',
    protocol: {
      sampleCount,
      expertCount: 3,
      router: 'uniform-fixed-scores',
      acceptedOutputRange: [-0.6, 1.1],
      injectedViolation: 'candidate-c adds +6 when x > 0.2 in the corrupted condition',
    },
    corrupted,
    clean,
    cleanDelta,
    gates,
    verdict: Object.values(gates).every(Boolean)
      ? 'PASS_CONTROLLED_SELF_VERIFICATION_MECHANICS'
      : 'FAIL_CONTROLLED_SELF_VERIFICATION_MECHANICS',
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify(runSyntheticBenchmark(), null, 2));
}
