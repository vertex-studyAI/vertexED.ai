const LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function normalizeText(value, field, { allowEmpty = false } = {}) {
  if (typeof value !== 'string') throw new TypeError(`${field} must be a string`);
  const normalized = value.replace(/\r\n?/g, '\n').trim();
  if (!allowEmpty && normalized.length === 0) throw new Error(`${field} must be non-empty`);
  if (normalized.includes('\u0000')) throw new Error(`${field} must not contain NUL bytes`);
  return normalized;
}

export function canonicalOptionLabels(optionCount) {
  if (!Number.isInteger(optionCount) || optionCount < 2 || optionCount > LABELS.length) {
    throw new RangeError(`optionCount must be an integer in [2, ${LABELS.length}]`);
  }
  return LABELS.slice(0, optionCount).split('');
}

export function renderScienceQaPrompt({ question, hint = '', choices }) {
  const normalizedQuestion = normalizeText(question, 'question');
  const normalizedHint = normalizeText(hint, 'hint', { allowEmpty: true });
  if (!Array.isArray(choices)) throw new TypeError('choices must be an array');
  const labels = canonicalOptionLabels(choices.length);
  const normalizedChoices = choices.map((choice, index) => normalizeText(choice, `choices[${index}]`));

  const lines = [
    'Task: Answer the multiple-choice science question using the image and text.',
    'Return only the option label.',
    '',
    `Question: ${normalizedQuestion}`
  ];

  if (normalizedHint) lines.push(`Context: ${normalizedHint}`);
  lines.push('', 'Options:');
  for (let index = 0; index < normalizedChoices.length; index += 1) {
    lines.push(`(${labels[index]}) ${normalizedChoices[index]}`);
  }
  lines.push('', 'Answer: ');
  return lines.join('\n');
}

export function optionContinuation(label, optionCount) {
  const labels = canonicalOptionLabels(optionCount);
  if (!labels.includes(label)) throw new Error(`label ${String(label)} is not valid for ${optionCount} options`);
  return label;
}
