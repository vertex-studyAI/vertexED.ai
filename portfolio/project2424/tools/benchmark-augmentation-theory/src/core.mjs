function finiteNumber(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new TypeError(`${label} must be finite`);
  return number;
}

function binaryLabel(value, label = 'label') {
  const number = Number(value);
  if (number !== -1 && number !== 1) throw new RangeError(`${label} must be -1 or 1`);
  return number;
}

export function validateBenchmarkCase(record) {
  if (!record || typeof record !== 'object') throw new TypeError('benchmark case must be an object');
  const id = String(record.id ?? '').trim();
  if (!id) throw new TypeError('benchmark case id is required');
  return { id, signal: finiteNumber(record.signal, 'signal'), shortcut: finiteNumber(record.shortcut, 'shortcut'), label: binaryLabel(record.label) };
}

export function createShortcutBenchmark({ size = 100 } = {}) {
  const count = Math.trunc(finiteNumber(size, 'size'));
  if (count < 2) throw new RangeError('size must be >= 2');
  return Array.from({ length: count }, (_, index) => {
    const label = index % 2 === 0 ? -1 : 1;
    const magnitude = 0.5 + ((index * 37) % 17) / 20;
    return { id: `case-${String(index).padStart(3, '0')}`, signal: label * magnitude, shortcut: label * (1 + ((index * 11) % 13) / 10), label };
  });
}

export function augmentBenchmark(cases, augmentations) {
  if (!Array.isArray(cases) || cases.length === 0) throw new TypeError('cases must be a non-empty array');
  if (!Array.isArray(augmentations) || augmentations.length === 0) throw new TypeError('augmentations must be a non-empty array');
  const normalized = cases.map(validateBenchmarkCase);
  const outputs = [];
  for (const augmentation of augmentations) {
    const name = String(augmentation?.name ?? '').trim();
    if (!name) throw new TypeError('augmentation name is required');
    if (typeof augmentation?.transform !== 'function') throw new TypeError(`augmentation ${name} requires a transform function`);
    for (const record of normalized) {
      const transformed = validateBenchmarkCase({ ...augmentation.transform({ ...record }), id: `${record.id}::${name}` });
      if (transformed.label !== record.label) throw new Error(`augmentation ${name} changed label for ${record.id}`);
      outputs.push({ ...transformed, sourceId: record.id, augmentation: name });
    }
  }
  return outputs;
}

export function accuracy(cases, predictor) {
  if (!Array.isArray(cases) || cases.length === 0) throw new TypeError('cases must be a non-empty array');
  if (typeof predictor !== 'function') throw new TypeError('predictor must be a function');
  let correct = 0;
  for (const raw of cases) {
    const record = validateBenchmarkCase(raw);
    const prediction = binaryLabel(predictor(record), `prediction for ${record.id}`);
    if (prediction === record.label) correct += 1;
  }
  return correct / cases.length;
}

export function rankModels(scores) {
  if (!Array.isArray(scores) || scores.length === 0) throw new TypeError('scores must be a non-empty array');
  return [...scores].sort((left, right) => finiteNumber(right.accuracy, 'accuracy') - finiteNumber(left.accuracy, 'accuracy') || String(left.name).localeCompare(String(right.name)));
}

export function compareModels({ cases, augmentations, models }) {
  if (!Array.isArray(models) || models.length < 2) throw new TypeError('models must contain at least two predictors');
  const baseCases = cases.map(validateBenchmarkCase);
  const augmentedCases = augmentBenchmark(baseCases, augmentations);
  const results = models.map((model) => {
    const name = String(model?.name ?? '').trim();
    if (!name) throw new TypeError('model name is required');
    const baseAccuracy = accuracy(baseCases, model.predict);
    const augmentedAccuracy = accuracy(augmentedCases, model.predict);
    return { name, baseAccuracy, augmentedAccuracy, robustnessDelta: augmentedAccuracy - baseAccuracy };
  });
  return {
    cases: baseCases.length,
    augmentedCases: augmentedCases.length,
    baseRanking: rankModels(results.map((result) => ({ name: result.name, accuracy: result.baseAccuracy }))),
    augmentedRanking: rankModels(results.map((result) => ({ name: result.name, accuracy: result.augmentedAccuracy }))),
    results,
  };
}

export const robustSignalModel = Object.freeze({ name: 'signal-model', predict(record) { return record.signal >= 0 ? 1 : -1; } });
export const shortcutModel = Object.freeze({ name: 'shortcut-model', predict(record) { return record.shortcut >= 0 ? 1 : -1; } });
export const flipShortcutAugmentation = Object.freeze({ name: 'flip-shortcut', transform(record) { return { ...record, shortcut: -record.shortcut }; } });
export const neutralSignalScaleAugmentation = Object.freeze({ name: 'scale-signal', transform(record) { return { ...record, signal: record.signal * 2 }; } });

export function runBenchmarkAugmentationScreen({ size = 100 } = {}) {
  const cases = createShortcutBenchmark({ size });
  const models = [robustSignalModel, shortcutModel];
  const shortcutBreak = compareModels({ cases, augmentations: [flipShortcutAugmentation], models });
  const neutralControl = compareModels({ cases, augmentations: [neutralSignalScaleAugmentation], models });
  const byName = (result, name) => result.results.find((entry) => entry.name === name);
  const baseSignal = byName(shortcutBreak, 'signal-model').baseAccuracy;
  const baseShortcut = byName(shortcutBreak, 'shortcut-model').baseAccuracy;
  const brokenSignal = byName(shortcutBreak, 'signal-model').augmentedAccuracy;
  const brokenShortcut = byName(shortcutBreak, 'shortcut-model').augmentedAccuracy;
  const neutralSignal = byName(neutralControl, 'signal-model').augmentedAccuracy;
  const neutralShortcut = byName(neutralControl, 'shortcut-model').augmentedAccuracy;
  return {
    baseAccuracyGap: Math.abs(baseSignal - baseShortcut),
    shortcutBreakingGap: brokenSignal - brokenShortcut,
    neutralGap: Math.abs(neutralSignal - neutralShortcut),
    shortcutBreak,
    neutralControl,
  };
}
