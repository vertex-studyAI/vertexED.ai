function requireSeries(values) {
  if (!Array.isArray(values) || values.length < 2) {
    throw new TypeError("values must contain at least two observations");
  }
  values.forEach((value, index) => {
    if (!Number.isFinite(value)) throw new TypeError(`values[${index}] must be finite`);
  });
  return values.map(Number);
}

function requireMode(mode) {
  if (mode !== "hold" && mode !== "linear") {
    throw new RangeError(`unsupported predictor mode: ${mode}`);
  }
}

export function predictFromEvents(events, index, mode = "linear") {
  requireMode(mode);
  if (!Array.isArray(events) || events.length === 0) {
    throw new TypeError("events must contain at least one token");
  }
  const last = events.at(-1);
  if (index <= last.index) return last.value;
  if (mode === "hold" || events.length < 2) return last.value;

  const previous = events.at(-2);
  const deltaIndex = last.index - previous.index;
  if (deltaIndex <= 0) throw new RangeError("event indices must be strictly increasing");
  const slope = (last.value - previous.value) / deltaIndex;
  return last.value + slope * (index - last.index);
}

export function encodeResidualEvents(values, options = {}) {
  const clean = requireSeries(values);
  const threshold = options.threshold ?? 0.5;
  const mode = options.mode ?? "linear";
  requireMode(mode);
  if (!Number.isFinite(threshold) || threshold <= 0) {
    throw new RangeError("threshold must be finite and > 0");
  }

  const events = [{ index: 0, value: clean[0], residual: 0 }];
  for (let index = 1; index < clean.length; index += 1) {
    const prediction = predictFromEvents(events, index, mode);
    const residual = clean[index] - prediction;
    if (Math.abs(residual) >= threshold) {
      events.push({ index, value: clean[index], residual });
    }
  }

  return {
    schemaVersion: 1,
    length: clean.length,
    threshold,
    mode,
    events
  };
}

export function decodeResidualEvents(encoded) {
  if (!encoded || !Number.isInteger(encoded.length) || encoded.length < 2) {
    throw new TypeError("encoded.length must be an integer >= 2");
  }
  requireMode(encoded.mode);
  if (!Array.isArray(encoded.events) || encoded.events.length === 0) {
    throw new TypeError("encoded.events must be non-empty");
  }
  if (encoded.events[0].index !== 0) throw new RangeError("first event must be at index 0");

  const output = [];
  const active = [];
  let eventCursor = 0;
  for (let index = 0; index < encoded.length; index += 1) {
    const nextEvent = encoded.events[eventCursor];
    if (nextEvent && nextEvent.index === index) {
      if (!Number.isFinite(nextEvent.value)) throw new TypeError(`event ${eventCursor} value must be finite`);
      if (active.length > 0 && nextEvent.index <= active.at(-1).index) {
        throw new RangeError("event indices must be strictly increasing");
      }
      active.push({ index: nextEvent.index, value: nextEvent.value });
      output.push(nextEvent.value);
      eventCursor += 1;
      continue;
    }
    if (nextEvent && nextEvent.index < index) throw new RangeError("events must be sorted by index");
    output.push(predictFromEvents(active, index, encoded.mode));
  }
  if (eventCursor !== encoded.events.length) throw new RangeError("event index exceeds encoded length");
  return output;
}

export function evaluateResidualEncoding(values, encoded) {
  const clean = requireSeries(values);
  if (encoded.length !== clean.length) throw new RangeError("encoded length does not match source");
  const reconstructed = decodeResidualEvents(encoded);
  const errors = clean.map((value, index) => reconstructed[index] - value);
  const absolute = errors.map(Math.abs);
  const squared = errors.map((value) => value ** 2);
  const mae = absolute.reduce((sum, value) => sum + value, 0) / absolute.length;
  const rmse = Math.sqrt(squared.reduce((sum, value) => sum + value, 0) / squared.length);
  const maxAbsError = Math.max(...absolute);

  return {
    observations: clean.length,
    tokens: encoded.events.length,
    tokenRatio: encoded.events.length / clean.length,
    compressionFactor: clean.length / encoded.events.length,
    mae,
    rmse,
    maxAbsError,
    reconstructed
  };
}

export function runThresholdSweep(values, thresholds, mode = "linear") {
  requireSeries(values);
  if (!Array.isArray(thresholds) || thresholds.length === 0) {
    throw new TypeError("thresholds must be non-empty");
  }
  return thresholds.map((threshold) => {
    const encoded = encodeResidualEvents(values, { threshold, mode });
    const metrics = evaluateResidualEncoding(values, encoded);
    return { threshold, mode, ...metrics, events: encoded.events };
  });
}

export function generateTrendWithDefects(length = 120) {
  if (!Number.isInteger(length) || length < 20) throw new RangeError("length must be an integer >= 20");
  const values = [];
  let offset = 0;
  for (let index = 0; index < length; index += 1) {
    if (index === Math.floor(length * 0.35)) offset += 5;
    if (index === Math.floor(length * 0.7)) offset -= 3.5;
    const trend = 0.18 * index;
    const smoothVariation = 0.12 * Math.sin(index / 5);
    values.push(trend + smoothVariation + offset);
  }
  return values;
}
