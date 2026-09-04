import { canonicalOptionLabels, optionContinuation, renderScienceQaPrompt } from './prompt-template.mjs';

function requireFiniteScore(value, label) {
  if (!Number.isFinite(value)) throw new Error(`option ${label} produced a non-finite log-likelihood`);
  return value;
}

export function softmaxLogLikelihoods(logLikelihoods) {
  if (!Array.isArray(logLikelihoods) || logLikelihoods.length < 2) {
    throw new Error('at least two option log-likelihoods are required');
  }
  const values = logLikelihoods.map((value, index) => requireFiniteScore(value, index));
  const maxValue = Math.max(...values);
  const weights = values.map((value) => Math.exp(value - maxValue));
  const denominator = weights.reduce((sum, value) => sum + value, 0);
  if (!Number.isFinite(denominator) || denominator <= 0) throw new Error('softmax denominator is invalid');
  return weights.map((value) => value / denominator);
}

export async function scoreScienceQaOptions(example, scoreContinuation) {
  if (typeof scoreContinuation !== 'function') throw new TypeError('scoreContinuation must be a function');
  const prompt = renderScienceQaPrompt(example);
  const labels = canonicalOptionLabels(example.choices.length);
  const logLikelihoods = [];

  for (const label of labels) {
    const continuation = optionContinuation(label, labels.length);
    const result = await scoreContinuation({ prompt, continuation, label });
    logLikelihoods.push(requireFiniteScore(result, label));
  }

  const probabilities = softmaxLogLikelihoods(logLikelihoods);
  let bestIndex = 0;
  for (let index = 1; index < probabilities.length; index += 1) {
    if (probabilities[index] > probabilities[bestIndex]) bestIndex = index;
  }

  return {
    prompt,
    labels,
    log_likelihoods: logLikelihoods,
    probabilities,
    predicted_label: labels[bestIndex]
  };
}
