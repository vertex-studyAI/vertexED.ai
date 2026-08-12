function finiteNonnegative(value, label) {
  if (!Number.isFinite(value) || value < 0) throw new RangeError(`${label} must be finite and >= 0`);
  return Number(value);
}

function validatePoints(points) {
  if (!Number.isInteger(points) || points < 16 || points > 4096) {
    throw new RangeError("points must be an integer in [16, 4096]");
  }
  return points;
}

function validateModes(modes, points) {
  if (!Array.isArray(modes) || modes.length === 0) throw new TypeError("modes must be non-empty");
  return modes.map((mode, index) => {
    if (!Number.isInteger(mode.k) || mode.k < 1 || mode.k >= points / 2) {
      throw new RangeError(`modes[${index}].k must be an integer in [1, points/2)`);
    }
    if (!Number.isFinite(mode.amplitude)) throw new TypeError(`modes[${index}].amplitude must be finite`);
    return { k: mode.k, amplitude: Number(mode.amplitude) };
  });
}

export function heatSolution(options = {}) {
  const points = validatePoints(options.points ?? 128);
  const time = finiteNonnegative(options.time ?? 1, "time");
  const diffusivity = finiteNonnegative(options.diffusivity ?? 0.001, "diffusivity");
  const modes = validateModes(options.modes ?? [
    { k: 1, amplitude: 1 },
    { k: 5, amplitude: 0.8 },
    { k: 12, amplitude: 0.6 }
  ], points);

  const decayedModes = modes.map((mode) => ({
    ...mode,
    decayedAmplitude: mode.amplitude * Math.exp(-diffusivity * (2 * Math.PI * mode.k) ** 2 * time)
  }));

  const values = Array.from({ length: points }, (_, index) => {
    const x = index / points;
    return decayedModes.reduce(
      (sum, mode) => sum + mode.decayedAmplitude * Math.sin(2 * Math.PI * mode.k * x),
      0
    );
  });

  return { points, time, diffusivity, modes: decayedModes, values };
}

export function projectSineModes(values, maxMode) {
  if (!Array.isArray(values) || values.length < 16 || values.some((value) => !Number.isFinite(value))) {
    throw new TypeError("values must contain at least 16 finite observations");
  }
  if (!Number.isInteger(maxMode) || maxMode < 1 || maxMode >= values.length / 2) {
    throw new RangeError("maxMode must be an integer in [1, values.length/2)");
  }
  const scale = 2 / values.length;
  return Array.from({ length: maxMode }, (_, offset) => {
    const k = offset + 1;
    const amplitude = scale * values.reduce(
      (sum, value, index) => sum + value * Math.sin(2 * Math.PI * k * index / values.length),
      0
    );
    return { k, amplitude, energy: amplitude ** 2 };
  });
}

export function analyzeRepresentation(values, options = {}) {
  const maxMode = options.maxMode ?? Math.min(32, Math.floor(values.length / 2) - 1);
  const energyFraction = options.energyFraction ?? 0.95;
  if (!Number.isFinite(energyFraction) || energyFraction <= 0 || energyFraction > 1) {
    throw new RangeError("energyFraction must be in (0, 1]");
  }
  const spectrum = projectSineModes(values, maxMode);
  const totalEnergy = spectrum.reduce((sum, mode) => sum + mode.energy, 0);
  if (totalEnergy <= Number.EPSILON) {
    return {
      totalEnergy,
      effectiveModeCount: 0,
      spectralEntropy: 0,
      dominantModes: [],
      spectrum
    };
  }

  const ranked = spectrum.slice().sort((left, right) => right.energy - left.energy || left.k - right.k);
  let cumulative = 0;
  let effectiveModeCount = 0;
  for (const mode of ranked) {
    cumulative += mode.energy;
    effectiveModeCount += 1;
    if (cumulative / totalEnergy >= energyFraction) break;
  }

  const probabilities = spectrum
    .map((mode) => mode.energy / totalEnergy)
    .filter((probability) => probability > 0);
  const rawEntropy = -probabilities.reduce((sum, probability) => sum + probability * Math.log(probability), 0);
  const spectralEntropy = probabilities.length <= 1 ? 0 : rawEntropy / Math.log(probabilities.length);

  return {
    totalEnergy,
    effectiveModeCount,
    spectralEntropy,
    dominantModes: ranked.slice(0, effectiveModeCount),
    spectrum
  };
}

export function sweepDiffusivity(options = {}) {
  const diffusivities = options.diffusivities ?? [0, 0.0002, 0.001, 0.005, 0.02];
  if (!Array.isArray(diffusivities) || diffusivities.length < 2) {
    throw new TypeError("diffusivities must contain at least two values");
  }
  const points = options.points ?? 128;
  const time = options.time ?? 1;
  const modes = options.modes ?? [
    { k: 1, amplitude: 1 },
    { k: 5, amplitude: 0.8 },
    { k: 12, amplitude: 0.6 }
  ];
  const maxMode = options.maxMode ?? Math.max(...modes.map((mode) => mode.k));
  const energyFraction = options.energyFraction ?? 0.95;

  return diffusivities.map((diffusivity) => {
    finiteNonnegative(diffusivity, "diffusivity");
    const solution = heatSolution({ points, time, diffusivity, modes });
    const representation = analyzeRepresentation(solution.values, { maxMode, energyFraction });
    return {
      diffusivity,
      effectiveModeCount: representation.effectiveModeCount,
      spectralEntropy: representation.spectralEntropy,
      totalEnergy: representation.totalEnergy,
      dominantModes: representation.dominantModes
    };
  });
}

export function detectRepresentationTransitions(rows) {
  if (!Array.isArray(rows) || rows.length < 2) throw new TypeError("rows must contain at least two sweep points");
  const transitions = [];
  for (let index = 1; index < rows.length; index += 1) {
    if (rows[index].effectiveModeCount !== rows[index - 1].effectiveModeCount) {
      transitions.push({
        fromDiffusivity: rows[index - 1].diffusivity,
        toDiffusivity: rows[index].diffusivity,
        fromModeCount: rows[index - 1].effectiveModeCount,
        toModeCount: rows[index].effectiveModeCount
      });
    }
  }
  return transitions;
}
