const DEFAULT_BREAKPOINTS = Object.freeze([-0.84, -0.25, 0.25, 0.84]);
const DEFAULT_ALPHABET = Object.freeze(['a', 'b', 'c', 'd', 'e']);

function finiteSeries(values, label = 'series') {
  if (!Array.isArray(values) || values.length < 2) {
    throw new TypeError(`${label} must contain at least two numeric values`);
  }
  return values.map((value, index) => {
    const number = Number(value);
    if (!Number.isFinite(number)) throw new TypeError(`${label}[${index}] must be finite`);
    return number;
  });
}

function positiveInteger(value, label) {
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) {
    throw new RangeError(`${label} must be a positive integer`);
  }
  return number;
}

export function zNormalize(values) {
  const clean = finiteSeries(values, 'window');
  const mean = clean.reduce((sum, value) => sum + value, 0) / clean.length;
  const variance = clean.reduce((sum, value) => sum + (value - mean) ** 2, 0) / clean.length;
  const std = Math.sqrt(variance);
  if (std < 1e-12) return clean.map(() => 0);
  return clean.map((value) => (value - mean) / std);
}

export function piecewiseAggregate(values, segments) {
  const clean = finiteSeries(values, 'normalized window');
  const count = positiveInteger(segments, 'segments');
  if (count > clean.length) throw new RangeError('segments cannot exceed window length');
  if (clean.length % count !== 0) {
    throw new RangeError('window length must be divisible by segments for this minimum implementation');
  }
  const block = clean.length / count;
  return Array.from({ length: count }, (_, segment) => {
    const start = segment * block;
    const slice = clean.slice(start, start + block);
    return slice.reduce((sum, value) => sum + value, 0) / slice.length;
  });
}

export function quantize(value, breakpoints = DEFAULT_BREAKPOINTS, alphabet = DEFAULT_ALPHABET) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new TypeError('value must be finite');
  if (!Array.isArray(breakpoints) || !Array.isArray(alphabet) || alphabet.length !== breakpoints.length + 1) {
    throw new TypeError('alphabet length must equal breakpoints length + 1');
  }
  for (let index = 1; index < breakpoints.length; index += 1) {
    if (!(breakpoints[index] > breakpoints[index - 1])) {
      throw new RangeError('breakpoints must be strictly increasing');
    }
  }
  const bucket = breakpoints.findIndex((threshold) => number < threshold);
  return alphabet[bucket === -1 ? alphabet.length - 1 : bucket];
}

export function windowSignature(seriesInput, start, options = {}) {
  const series = finiteSeries(seriesInput);
  const windowSize = positiveInteger(options.windowSize ?? 8, 'windowSize');
  const segments = positiveInteger(options.segments ?? 4, 'segments');
  const offset = Number(start);
  if (!Number.isInteger(offset) || offset < 0 || offset + windowSize > series.length) {
    throw new RangeError('start must identify a complete window inside the series');
  }
  if (windowSize % segments !== 0) {
    throw new RangeError('windowSize must be divisible by segments');
  }
  const normalized = zNormalize(series.slice(offset, offset + windowSize));
  const aggregate = piecewiseAggregate(normalized, segments);
  return aggregate.map((value) => quantize(value, options.breakpoints, options.alphabet)).join('');
}

function selectNonOverlapping(positions, windowSize) {
  const selected = [];
  for (const position of positions) {
    if (selected.every((existing) => Math.abs(position - existing) >= windowSize)) {
      selected.push(position);
    }
  }
  return selected;
}

export function discoverMotifs(seriesInput, options = {}) {
  const series = finiteSeries(seriesInput);
  const windowSize = positiveInteger(options.windowSize ?? 8, 'windowSize');
  const segments = positiveInteger(options.segments ?? 4, 'segments');
  const stride = positiveInteger(options.stride ?? 1, 'stride');
  const minSupport = positiveInteger(options.minSupport ?? 2, 'minSupport');
  if (windowSize > series.length) throw new RangeError('windowSize cannot exceed series length');
  if (windowSize % segments !== 0) throw new RangeError('windowSize must be divisible by segments');

  const groups = new Map();
  for (let start = 0; start + windowSize <= series.length; start += stride) {
    const signature = windowSignature(series, start, { ...options, windowSize, segments });
    if (!groups.has(signature)) groups.set(signature, []);
    groups.get(signature).push(start);
  }

  const motifs = [];
  for (const [signature, positions] of groups.entries()) {
    const selectedPositions = selectNonOverlapping(positions, windowSize);
    if (selectedPositions.length < minSupport) continue;
    motifs.push({
      signature,
      support: selectedPositions.length,
      positions: selectedPositions,
      coverage: Math.min(1, (selectedPositions.length * windowSize) / series.length)
    });
  }

  return motifs.sort((left, right) =>
    right.support - left.support ||
    right.coverage - left.coverage ||
    left.signature.localeCompare(right.signature)
  );
}

export function summarizeDictionary(seriesInput, options = {}) {
  const series = finiteSeries(seriesInput);
  const motifs = discoverMotifs(series, options);
  return {
    observations: series.length,
    motifCount: motifs.length,
    topMotif: motifs[0] ?? null,
    motifs
  };
}
