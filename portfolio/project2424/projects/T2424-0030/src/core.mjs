const TWO_PI = 2 * Math.PI;

function finiteNumber(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new TypeError(`${label} must be finite`);
  return number;
}

function point(value, label = 'point') {
  if (!Array.isArray(value) || value.length !== 2) {
    throw new TypeError(`${label} must be a [x, y] pair`);
  }
  return [finiteNumber(value[0], `${label}[0]`), finiteNumber(value[1], `${label}[1]`)];
}

function vector(from, to) {
  return [to[0] - from[0], to[1] - from[1]];
}

function magnitude(value) {
  return Math.hypot(value[0], value[1]);
}

function rotate(value, angle) {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  return [
    value[0] * cosine - value[1] * sine,
    value[0] * sine + value[1] * cosine,
  ];
}

function wrapAngle(angle) {
  let wrapped = angle;
  while (wrapped <= -Math.PI) wrapped += TWO_PI;
  while (wrapped > Math.PI) wrapped -= TWO_PI;
  return wrapped;
}

export function signedTurnAngle(previousVelocity, currentVelocity) {
  const a = point(previousVelocity, 'previousVelocity');
  const b = point(currentVelocity, 'currentVelocity');
  if (magnitude(a) <= 1e-12 || magnitude(b) <= 1e-12) return 0;
  const cross = a[0] * b[1] - a[1] * b[0];
  const dot = a[0] * b[0] + a[1] * b[1];
  return Math.atan2(cross, dot);
}

function validateHistory(history, minimumLength) {
  if (!Array.isArray(history) || history.length < minimumLength) {
    throw new TypeError(`history must contain at least ${minimumLength} points`);
  }
  return history.map((value, index) => point(value, `history[${index}]`));
}

export function predictConstantVelocity(history) {
  const points = validateHistory(history, 2);
  const previous = points.at(-2);
  const current = points.at(-1);
  const velocity = vector(previous, current);
  return [current[0] + velocity[0], current[1] + velocity[1]];
}

export function predictAdaptiveGeometry(history, options = {}) {
  const points = validateHistory(history, 3);
  const previousPrevious = points.at(-3);
  const previous = points.at(-2);
  const current = points.at(-1);
  const previousVelocity = vector(previousPrevious, previous);
  const currentVelocity = vector(previous, current);
  const turnThreshold = finiteNumber(options.turnThreshold ?? 0.02, 'turnThreshold');
  const maxTurn = finiteNumber(options.maxTurn ?? 0.5, 'maxTurn');

  if (turnThreshold < 0) throw new RangeError('turnThreshold must be >= 0');
  if (maxTurn <= 0 || maxTurn > Math.PI) throw new RangeError('maxTurn must be in (0, pi]');
  if (magnitude(currentVelocity) <= 1e-12) return [current[0], current[1]];

  const observedTurn = wrapAngle(signedTurnAngle(previousVelocity, currentVelocity));
  if (Math.abs(observedTurn) < turnThreshold) {
    return predictConstantVelocity(points);
  }

  const boundedTurn = Math.max(-maxTurn, Math.min(maxTurn, observedTurn));
  const nextVelocity = rotate(currentVelocity, boundedTurn);
  return [current[0] + nextVelocity[0], current[1] + nextVelocity[1]];
}

export function createDeterministicRng(seed) {
  let state = Number(seed) >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 0x1_0000_0000;
  };
}

export function generateSyntheticTrajectory({
  seed = 1,
  steps = 80,
  baseTurn = 0.12,
  turnJitter = 0.01,
  speedJitter = 0.002,
} = {}) {
  const count = Math.trunc(finiteNumber(steps, 'steps'));
  if (count < 4) throw new RangeError('steps must be >= 4');
  const turn = finiteNumber(baseTurn, 'baseTurn');
  const turnNoise = finiteNumber(turnJitter, 'turnJitter');
  const speedNoise = finiteNumber(speedJitter, 'speedJitter');
  if (turnNoise < 0 || speedNoise < 0) throw new RangeError('jitter values must be >= 0');

  const random = createDeterministicRng(seed);
  let heading = (random() * TWO_PI) - Math.PI;
  let speed = 0.8 + random() * 0.4;
  const trajectory = [[0, 0]];

  for (let index = 0; index < count; index += 1) {
    heading += turn + (random() * 2 - 1) * turnNoise;
    speed *= 1 + (random() * 2 - 1) * speedNoise;
    const previous = trajectory.at(-1);
    trajectory.push([
      previous[0] + speed * Math.cos(heading),
      previous[1] + speed * Math.sin(heading),
    ]);
  }

  return trajectory;
}

function predictionError(prediction, target) {
  return Math.hypot(prediction[0] - target[0], prediction[1] - target[1]);
}

export function evaluateTrajectory(trajectory, options = {}) {
  const points = validateHistory(trajectory, 4);
  let baselineError = 0;
  let adaptiveError = 0;
  let curvedSelections = 0;
  let samples = 0;

  for (let index = 3; index < points.length; index += 1) {
    const history = points.slice(index - 3, index);
    const target = points[index];
    const baseline = predictConstantVelocity(history);
    const adaptive = predictAdaptiveGeometry(history, options);
    const previousVelocity = vector(history[0], history[1]);
    const currentVelocity = vector(history[1], history[2]);
    const turnThreshold = options.turnThreshold ?? 0.02;
    if (Math.abs(signedTurnAngle(previousVelocity, currentVelocity)) >= turnThreshold) {
      curvedSelections += 1;
    }
    baselineError += predictionError(baseline, target);
    adaptiveError += predictionError(adaptive, target);
    samples += 1;
  }

  return {
    samples,
    meanBaselineError: baselineError / samples,
    meanAdaptiveError: adaptiveError / samples,
    relativeImprovement: baselineError > 0 ? 1 - (adaptiveError / baselineError) : 0,
    curvedSelectionRate: curvedSelections / samples,
  };
}

export function runSyntheticGeometryBenchmark({ seeds = 20 } = {}) {
  const count = Math.trunc(finiteNumber(seeds, 'seeds'));
  if (count < 1) throw new RangeError('seeds must be >= 1');
  const curvedTurns = [0.08, 0.12, 0.16, 0.20];
  const curved = [];
  const straight = [];

  for (let seed = 0; seed < count; seed += 1) {
    for (const baseTurn of curvedTurns) {
      curved.push(evaluateTrajectory(generateSyntheticTrajectory({ seed, baseTurn })));
    }
    straight.push(evaluateTrajectory(generateSyntheticTrajectory({
      seed,
      baseTurn: 0,
      turnJitter: 0,
    })));
  }

  function summarize(results) {
    const total = results.reduce((accumulator, result) => ({
      samples: accumulator.samples + result.samples,
      baseline: accumulator.baseline + result.meanBaselineError * result.samples,
      adaptive: accumulator.adaptive + result.meanAdaptiveError * result.samples,
      curvedSelections: accumulator.curvedSelections + result.curvedSelectionRate * result.samples,
    }), { samples: 0, baseline: 0, adaptive: 0, curvedSelections: 0 });

    const meanBaselineError = total.baseline / total.samples;
    const meanAdaptiveError = total.adaptive / total.samples;
    return {
      samples: total.samples,
      meanBaselineError,
      meanAdaptiveError,
      relativeImprovement: meanBaselineError > 0 ? 1 - meanAdaptiveError / meanBaselineError : 0,
      curvedSelectionRate: total.curvedSelections / total.samples,
    };
  }

  return {
    seeds: count,
    curvedTurns,
    curved: summarize(curved),
    straightControl: summarize(straight),
  };
}
