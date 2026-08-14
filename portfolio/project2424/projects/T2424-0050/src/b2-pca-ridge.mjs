const DEFAULT_RIDGE_ALPHAS = Object.freeze([1e-8, 1e-6, 1e-4, 1e-2, 1e-1, 1, 10]);

function finite(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new TypeError(`${label} must be finite`);
  return number;
}

function positiveInteger(value, label) {
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) throw new RangeError(`${label} must be a positive integer`);
  return number;
}

function asMatrix(input, label) {
  if (!Array.isArray(input) || input.length === 0) throw new TypeError(`${label} must be a non-empty matrix`);
  if (!Array.isArray(input[0]) || input[0].length === 0) throw new TypeError(`${label} rows must be non-empty arrays`);
  const columns = input[0].length;
  return input.map((row, rowIndex) => {
    if (!Array.isArray(row) || row.length !== columns) {
      throw new TypeError(`${label}[${rowIndex}] must have ${columns} columns`);
    }
    return row.map((value, columnIndex) => finite(value, `${label}[${rowIndex}][${columnIndex}]`));
  });
}

function dot(left, right) {
  let total = 0;
  for (let index = 0; index < left.length; index += 1) total += left[index] * right[index];
  return total;
}

function l2Norm(vector) {
  return Math.sqrt(dot(vector, vector));
}

function scale(vector, scalar) {
  return vector.map((value) => value * scalar);
}

function subtractProjection(vector, basis) {
  const output = [...vector];
  for (const direction of basis) {
    const projection = dot(output, direction);
    for (let index = 0; index < output.length; index += 1) output[index] -= projection * direction[index];
  }
  return output;
}

function canonicalizeDirection(vector) {
  const firstMaterial = vector.find((value) => Math.abs(value) > 1e-14);
  if (firstMaterial === undefined || firstMaterial >= 0) return vector;
  return vector.map((value) => -value);
}

function columnMeans(matrix) {
  const means = Array(matrix[0].length).fill(0);
  for (const row of matrix) {
    for (let column = 0; column < row.length; column += 1) means[column] += row[column];
  }
  return means.map((value) => value / matrix.length);
}

function centerMatrix(matrix, means) {
  return matrix.map((row) => row.map((value, column) => value - means[column]));
}

function covarianceMultiply(centered, vector) {
  const denominator = centered.length - 1;
  if (denominator <= 0) throw new RangeError('PCA requires at least two training rows');
  const rowProjections = centered.map((row) => dot(row, vector));
  const output = Array(vector.length).fill(0);
  for (let rowIndex = 0; rowIndex < centered.length; rowIndex += 1) {
    const coefficient = rowProjections[rowIndex] / denominator;
    const row = centered[rowIndex];
    for (let column = 0; column < row.length; column += 1) output[column] += row[column] * coefficient;
  }
  return output;
}

function deterministicInitialVector(dimension, componentIndex) {
  const raw = Array.from({ length: dimension }, (_, index) => (
    Math.sin((index + 1) * (componentIndex + 1) * 1.618033988749895)
    + Math.cos((index + 1) * (componentIndex + 2) * 0.7071067811865476)
  ));
  const norm = l2Norm(raw);
  if (norm <= Number.EPSILON) throw new Error('deterministic PCA initializer collapsed');
  return scale(raw, 1 / norm);
}

export function fitPcaPowerIteration(inputMatrix, {
  components = 8,
  maxIterations = 500,
  tolerance = 1e-11,
} = {}) {
  const matrix = asMatrix(inputMatrix, 'inputMatrix');
  if (matrix.length < 2) throw new RangeError('PCA requires at least two training rows');
  const requested = positiveInteger(components, 'components');
  const maximum = Math.min(matrix[0].length, matrix.length - 1);
  if (requested > maximum) throw new RangeError(`components must be <= ${maximum}`);
  const iterations = positiveInteger(maxIterations, 'maxIterations');
  const convergence = finite(tolerance, 'tolerance');
  if (convergence <= 0) throw new RangeError('tolerance must be > 0');

  const mean = columnMeans(matrix);
  const centered = centerMatrix(matrix, mean);
  const directions = [];
  const eigenvalues = [];

  for (let component = 0; component < requested; component += 1) {
    let vector = subtractProjection(deterministicInitialVector(matrix[0].length, component), directions);
    let norm = l2Norm(vector);
    if (norm <= 1e-14) throw new Error(`PCA initializer for component ${component} is rank-deficient`);
    vector = scale(vector, 1 / norm);

    for (let iteration = 0; iteration < iterations; iteration += 1) {
      let next = covarianceMultiply(centered, vector);
      next = subtractProjection(next, directions);
      norm = l2Norm(next);
      if (norm <= 1e-14) throw new Error(`PCA covariance rank is below requested component ${component + 1}`);
      next = scale(next, 1 / norm);

      const alignedDot = dot(vector, next);
      if (alignedDot < 0) next = scale(next, -1);
      const delta = Math.sqrt(next.reduce((sum, value, index) => sum + (value - vector[index]) ** 2, 0));
      vector = next;
      if (delta <= convergence) break;
      if (iteration === iterations - 1) {
        throw new Error(`PCA component ${component} did not converge within ${iterations} iterations`);
      }
    }

    vector = canonicalizeDirection(subtractProjection(vector, directions));
    norm = l2Norm(vector);
    if (norm <= 1e-14) throw new Error(`PCA component ${component} collapsed after orthogonalization`);
    vector = scale(vector, 1 / norm);
    const covarianceVector = covarianceMultiply(centered, vector);
    const eigenvalue = dot(vector, covarianceVector);
    if (!(eigenvalue > 0)) throw new Error(`PCA component ${component} has non-positive eigenvalue ${eigenvalue}`);
    directions.push(vector);
    eigenvalues.push(eigenvalue);
  }

  return Object.freeze({
    inputDimension: matrix[0].length,
    componentCount: directions.length,
    mean: Object.freeze(mean),
    components: Object.freeze(directions.map((row) => Object.freeze(row))),
    eigenvalues: Object.freeze(eigenvalues),
    solver: 'covariance_operator_power_iteration_deflation_v1',
  });
}

export function transformPca(inputMatrix, pcaModel) {
  const matrix = asMatrix(inputMatrix, 'inputMatrix');
  if (!pcaModel || !Array.isArray(pcaModel.mean) || !Array.isArray(pcaModel.components)) {
    throw new TypeError('pcaModel is invalid');
  }
  if (matrix[0].length !== pcaModel.mean.length) {
    throw new RangeError(`input dimension ${matrix[0].length} does not match PCA dimension ${pcaModel.mean.length}`);
  }
  return matrix.map((row) => {
    const centered = row.map((value, column) => value - pcaModel.mean[column]);
    return pcaModel.components.map((direction) => dot(centered, direction));
  });
}

function solveLinearSystem(leftInput, rightInput) {
  const left = asMatrix(leftInput, 'left');
  const right = asMatrix(rightInput, 'right');
  const size = left.length;
  if (left[0].length !== size) throw new RangeError('left matrix must be square');
  if (right.length !== size) throw new RangeError('right matrix row count must match left matrix');

  const augmented = left.map((row, index) => [...row, ...right[index]]);
  const rhsColumns = right[0].length;
  const width = size + rhsColumns;

  for (let pivot = 0; pivot < size; pivot += 1) {
    let bestRow = pivot;
    for (let row = pivot + 1; row < size; row += 1) {
      if (Math.abs(augmented[row][pivot]) > Math.abs(augmented[bestRow][pivot])) bestRow = row;
    }
    if (Math.abs(augmented[bestRow][pivot]) <= 1e-14) throw new Error('ridge normal equation is singular');
    [augmented[pivot], augmented[bestRow]] = [augmented[bestRow], augmented[pivot]];

    const pivotValue = augmented[pivot][pivot];
    for (let column = pivot; column < width; column += 1) augmented[pivot][column] /= pivotValue;

    for (let row = 0; row < size; row += 1) {
      if (row === pivot) continue;
      const factor = augmented[row][pivot];
      if (Math.abs(factor) <= Number.EPSILON) continue;
      for (let column = pivot; column < width; column += 1) {
        augmented[row][column] -= factor * augmented[pivot][column];
      }
    }
  }

  return augmented.map((row) => row.slice(size));
}

function fitRidgeOnScores(scoreInput, targetInput, alphaInput) {
  const scores = asMatrix(scoreInput, 'scores');
  const targets = asMatrix(targetInput, 'targets');
  if (scores.length !== targets.length) throw new RangeError('scores and targets must have the same row count');
  const alpha = finite(alphaInput, 'alpha');
  if (alpha <= 0) throw new RangeError('alpha must be > 0');

  const scoreMean = columnMeans(scores);
  const targetMean = columnMeans(targets);
  const centeredScores = centerMatrix(scores, scoreMean);
  const centeredTargets = centerMatrix(targets, targetMean);
  const features = scores[0].length;
  const outputs = targets[0].length;

  const gram = Array.from({ length: features }, () => Array(features).fill(0));
  const cross = Array.from({ length: features }, () => Array(outputs).fill(0));
  for (let row = 0; row < centeredScores.length; row += 1) {
    for (let left = 0; left < features; left += 1) {
      for (let right = 0; right < features; right += 1) {
        gram[left][right] += centeredScores[row][left] * centeredScores[row][right];
      }
      for (let output = 0; output < outputs; output += 1) {
        cross[left][output] += centeredScores[row][left] * centeredTargets[row][output];
      }
    }
  }
  for (let index = 0; index < features; index += 1) gram[index][index] += alpha;

  return {
    alpha,
    scoreMean,
    targetMean,
    weights: solveLinearSystem(gram, cross),
  };
}

export function fitPcaRidge(featureInput, targetInput, {
  components = 8,
  alpha = 1e-4,
  pca = {},
} = {}) {
  const features = asMatrix(featureInput, 'features');
  const targets = asMatrix(targetInput, 'targets');
  if (features.length !== targets.length) throw new RangeError('features and targets must have the same row count');
  const pcaModel = fitPcaPowerIteration(features, { components, ...pca });
  const scores = transformPca(features, pcaModel);
  const ridge = fitRidgeOnScores(scores, targets, alpha);
  return Object.freeze({
    kind: 'darcy_v2_b2_pca_ridge_v1',
    pca: pcaModel,
    ridge: Object.freeze({
      alpha: ridge.alpha,
      scoreMean: Object.freeze(ridge.scoreMean),
      targetMean: Object.freeze(ridge.targetMean),
      weights: Object.freeze(ridge.weights.map((row) => Object.freeze(row))),
    }),
    trainingRows: features.length,
    inputDimension: features[0].length,
    outputDimension: targets[0].length,
    parameterCount: pcaModel.componentCount * features[0].length
      + pcaModel.componentCount * targets[0].length
      + targets[0].length,
  });
}

export function predictPcaRidge(featureInput, model) {
  if (!model || model.kind !== 'darcy_v2_b2_pca_ridge_v1') throw new TypeError('invalid B2 PCA+ridge model');
  const scores = transformPca(featureInput, model.pca);
  return scores.map((row) => {
    const centered = row.map((value, index) => value - model.ridge.scoreMean[index]);
    return model.ridge.targetMean.map((mean, output) => {
      let value = mean;
      for (let feature = 0; feature < centered.length; feature += 1) {
        value += centered[feature] * model.ridge.weights[feature][output];
      }
      return value;
    });
  });
}

export function meanRelativeL2Rows(actualInput, predictedInput) {
  const actual = asMatrix(actualInput, 'actual');
  const predicted = asMatrix(predictedInput, 'predicted');
  if (actual.length !== predicted.length || actual[0].length !== predicted[0].length) {
    throw new RangeError('actual and predicted matrices must have matching shapes');
  }
  let total = 0;
  for (let row = 0; row < actual.length; row += 1) {
    let numerator = 0;
    let denominator = 0;
    for (let column = 0; column < actual[row].length; column += 1) {
      numerator += (actual[row][column] - predicted[row][column]) ** 2;
      denominator += actual[row][column] ** 2;
    }
    if (denominator <= Number.EPSILON) throw new RangeError(`actual row ${row} has zero relative-L2 denominator`);
    total += Math.sqrt(numerator / denominator);
  }
  return total / actual.length;
}

export function selectPcaRidgeAlpha(trainingFeatures, trainingTargets, validationFeatures, validationTargets, {
  components = 8,
  alphas = DEFAULT_RIDGE_ALPHAS,
  pca = {},
} = {}) {
  if (!Array.isArray(alphas) || alphas.length === 0) throw new TypeError('alphas must be a non-empty array');
  const candidates = alphas.map((value) => finite(value, 'alpha'));
  if (candidates.some((value) => value <= 0)) throw new RangeError('all alphas must be > 0');

  let best = null;
  const results = [];
  for (const alpha of candidates) {
    const model = fitPcaRidge(trainingFeatures, trainingTargets, { components, alpha, pca });
    const predictions = predictPcaRidge(validationFeatures, model);
    const score = meanRelativeL2Rows(validationTargets, predictions);
    const record = { alpha, validationMeanRelativeL2: score, model };
    results.push(record);
    if (!best || score < best.validationMeanRelativeL2 - 1e-15
      || (Math.abs(score - best.validationMeanRelativeL2) <= 1e-15 && alpha < best.alpha)) {
      best = record;
    }
  }

  return Object.freeze({
    selectionMetric: 'validation_pressure_mean_relative_l2',
    selectedAlpha: best.alpha,
    selectedScore: best.validationMeanRelativeL2,
    selectedModel: best.model,
    candidates: Object.freeze(results.map(({ model, ...record }) => Object.freeze(record))),
  });
}

export const DARCY_V2_B2_FREEZE = Object.freeze({
  implementation: 'darcy_v2_b2_pca_ridge_v1',
  feature: 'training log permeability only',
  target: 'pressure field',
  componentCount: 8,
  dimensionCap: 8,
  ridgeAlphas: DEFAULT_RIDGE_ALPHAS,
  selectionMetric: 'validation pressure mean relative L2 only',
  testOrOodForSelection: false,
  pcaSolver: 'covariance_operator_power_iteration_deflation_v1',
});
