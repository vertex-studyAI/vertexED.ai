function finite(value, label) {
  if (!Number.isFinite(value)) throw new TypeError(`${label} must be finite`);
  return Number(value);
}

function nonnegative(value, label) {
  const parsed = finite(value, label);
  if (parsed < 0) throw new RangeError(`${label} must be >= 0`);
  return parsed;
}

function positiveInt(value, label, min = 1, max = 4096) {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new RangeError(`${label} must be an integer in [${min}, ${max}]`);
  }
  return value;
}

function validateModes(modes, points) {
  if (!Array.isArray(modes) || modes.length === 0) throw new TypeError("modes must be non-empty");
  return modes.map((mode, index) => {
    const k = positiveInt(mode.k, `modes[${index}].k`, 1, Math.floor((points - 1) / 2));
    const sine = finite(mode.sine ?? 0, `modes[${index}].sine`);
    const cosine = finite(mode.cosine ?? 0, `modes[${index}].cosine`);
    if (Math.abs(sine) + Math.abs(cosine) <= Number.EPSILON) {
      throw new RangeError(`modes[${index}] must have non-zero sine or cosine amplitude`);
    }
    return { k, sine, cosine };
  });
}

export function adrSnapshot(options = {}) {
  const points = positiveInt(options.points ?? 128, "points", 16, 4096);
  const advection = finite(options.advection ?? 0.2, "advection");
  const diffusion = nonnegative(options.diffusion ?? 0.01, "diffusion");
  const reaction = finite(options.reaction ?? -0.1, "reaction");
  const time = nonnegative(options.time ?? 0.5, "time");
  const modes = validateModes(options.modes ?? [
    { k: 1, sine: 1, cosine: 0 },
    { k: 3, sine: 0.35, cosine: -0.2 }
  ], points);

  const evolvedModes = modes.map((mode) => {
    const omega = 2 * Math.PI * mode.k;
    const decay = Math.exp((reaction - diffusion * omega ** 2) * time);
    const phase = omega * advection * time;
    const cosPhase = Math.cos(phase);
    const sinPhase = Math.sin(phase);
    return {
      ...mode,
      sine: decay * (mode.sine * cosPhase + mode.cosine * sinPhase),
      cosine: decay * (mode.cosine * cosPhase - mode.sine * sinPhase)
    };
  });

  const values = Array.from({ length: points }, (_, index) => {
    const x = index / points;
    return evolvedModes.reduce((sum, mode) => {
      const angle = 2 * Math.PI * mode.k * x;
      return sum + mode.sine * Math.sin(angle) + mode.cosine * Math.cos(angle);
    }, 0);
  });

  return { points, advection, diffusion, reaction, time, modes: evolvedModes, values };
}

function validateAxis(values, label) {
  if (!Array.isArray(values) || values.length < 2) throw new TypeError(`${label} must contain at least two values`);
  const parsed = values.map((value, index) => finite(value, `${label}[${index}]`));
  for (let index = 1; index < parsed.length; index += 1) {
    if (!(parsed[index] > parsed[index - 1])) throw new RangeError(`${label} must be strictly increasing`);
  }
  return parsed;
}

function bracket(axis, value, label) {
  finite(value, label);
  if (value < axis[0] || value > axis.at(-1)) {
    throw new RangeError(`${label} must be within surrogate axis bounds`);
  }
  if (value === axis.at(-1)) return { lower: axis.length - 2, upper: axis.length - 1, weight: 1 };
  let upper = 1;
  while (upper < axis.length && axis[upper] < value) upper += 1;
  const lower = upper - 1;
  const span = axis[upper] - axis[lower];
  return { lower, upper, weight: (value - axis[lower]) / span };
}

function key(ai, di, ri, ti) {
  return `${ai}:${di}:${ri}:${ti}`;
}

export function buildADRGridSurrogate(options = {}) {
  const points = positiveInt(options.points ?? 128, "points", 16, 4096);
  const modes = validateModes(options.modes ?? [
    { k: 1, sine: 1, cosine: 0 },
    { k: 3, sine: 0.35, cosine: -0.2 }
  ], points);
  const axes = {
    advection: validateAxis(options.advection ?? [0, 0.15, 0.3], "advection"),
    diffusion: validateAxis(options.diffusion ?? [0, 0.01, 0.02], "diffusion"),
    reaction: validateAxis(options.reaction ?? [-0.2, 0, 0.2], "reaction"),
    time: validateAxis(options.time ?? [0, 0.3, 0.6], "time")
  };
  if (axes.diffusion[0] < 0 || axes.time[0] < 0) {
    throw new RangeError("diffusion and time axes must be >= 0");
  }

  const snapshots = new Map();
  axes.advection.forEach((advection, ai) => {
    axes.diffusion.forEach((diffusion, di) => {
      axes.reaction.forEach((reaction, ri) => {
        axes.time.forEach((time, ti) => {
          snapshots.set(
            key(ai, di, ri, ti),
            adrSnapshot({ points, modes, advection, diffusion, reaction, time }).values
          );
        });
      });
    });
  });

  return { points, modes, axes, snapshots, snapshotCount: snapshots.size };
}

export function predictADR(surrogate, parameters) {
  if (!surrogate || !(surrogate.snapshots instanceof Map)) throw new TypeError("invalid surrogate");
  const brackets = [
    bracket(surrogate.axes.advection, parameters.advection, "advection"),
    bracket(surrogate.axes.diffusion, parameters.diffusion, "diffusion"),
    bracket(surrogate.axes.reaction, parameters.reaction, "reaction"),
    bracket(surrogate.axes.time, parameters.time, "time")
  ];
  const output = Array(surrogate.points).fill(0);

  for (let mask = 0; mask < 16; mask += 1) {
    let weight = 1;
    const indices = brackets.map((item, axisIndex) => {
      const useUpper = (mask >> axisIndex) & 1;
      weight *= useUpper ? item.weight : (1 - item.weight);
      return useUpper ? item.upper : item.lower;
    });
    if (weight === 0) continue;
    const snapshot = surrogate.snapshots.get(key(...indices));
    if (!snapshot) throw new Error("surrogate corner snapshot missing");
    for (let index = 0; index < output.length; index += 1) {
      output[index] += weight * snapshot[index];
    }
  }

  return output;
}

export function errorMetrics(reference, prediction) {
  if (!Array.isArray(reference) || !Array.isArray(prediction) || reference.length !== prediction.length || reference.length === 0) {
    throw new TypeError("reference and prediction must be non-empty arrays of equal length");
  }
  let squaredError = 0;
  let squaredReference = 0;
  let maxAbsError = 0;
  for (let index = 0; index < reference.length; index += 1) {
    const expected = finite(reference[index], `reference[${index}]`);
    const actual = finite(prediction[index], `prediction[${index}]`);
    const error = actual - expected;
    squaredError += error ** 2;
    squaredReference += expected ** 2;
    maxAbsError = Math.max(maxAbsError, Math.abs(error));
  }
  const rmse = Math.sqrt(squaredError / reference.length);
  const relativeL2 = squaredReference <= Number.EPSILON
    ? (squaredError <= Number.EPSILON ? 0 : Infinity)
    : Math.sqrt(squaredError / squaredReference);
  return { rmse, relativeL2, maxAbsError };
}

export function evaluateADRSurrogate(surrogate, cases) {
  if (!Array.isArray(cases) || cases.length === 0) throw new TypeError("cases must be non-empty");
  const rows = cases.map((parameters, index) => {
    const reference = adrSnapshot({ points: surrogate.points, modes: surrogate.modes, ...parameters }).values;
    const prediction = predictADR(surrogate, parameters);
    return { index, parameters: { ...parameters }, ...errorMetrics(reference, prediction) };
  });
  return {
    rows,
    meanRelativeL2: rows.reduce((sum, row) => sum + row.relativeL2, 0) / rows.length,
    worstRelativeL2: Math.max(...rows.map((row) => row.relativeL2)),
    meanRmse: rows.reduce((sum, row) => sum + row.rmse, 0) / rows.length
  };
}
