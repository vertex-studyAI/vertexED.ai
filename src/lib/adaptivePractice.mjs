import { ADAPTIVE_QUESTION_BANK } from '../content/adaptiveQuestionBank.mjs';

const closeEnough = (actual, expected, tolerance = 0) => Number.isFinite(actual)
  && Math.abs(actual - expected) <= Math.max(tolerance, Math.abs(expected) * 1e-9);

export function matchesFilters(question, filters = {}) {
  if (filters.subject && filters.subject !== 'all' && question.subject !== filters.subject) return false;
  if (filters.topic && filters.topic !== 'all' && question.topic !== filters.topic) return false;
  if (filters.difficulty && filters.difficulty !== 'all' && question.difficulty !== filters.difficulty) return false;
  if (filters.type && filters.type !== 'all' && question.type !== filters.type) return false;
  if (filters.curriculum && filters.curriculum !== 'all' && !question.curriculum.includes(filters.curriculum)) return false;
  return true;
}

function seededRandom(seed) {
  let state = (Number(seed) || 1) >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let next = state;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

export function selectPracticeQuestions({
  bank = ADAPTIVE_QUESTION_BANK,
  filters = {},
  count = 5,
  recentIds = [],
  seed = Date.now(),
} = {}) {
  const requested = Math.max(1, Math.min(20, Number(count) || 1));
  const eligible = bank.filter((question) => matchesFilters(question, filters));
  const recent = new Set(recentIds.slice(-Math.max(requested * 2, 6)));
  const fresh = eligible.filter((question) => !recent.has(question.id));
  const pool = fresh.length >= Math.min(requested, eligible.length) ? fresh : eligible;
  const random = seededRandom(seed);
  return pool
    .map((question) => ({ question, order: random() }))
    .sort((left, right) => left.order - right.order)
    .slice(0, requested)
    .map(({ question }) => question);
}

function defaultIncorrect(question, rawAnswer) {
  return {
    correct: false,
    errorCategory: 'execution',
    errorSubcategory: question.type === 'numeric' && !Number.isFinite(Number(rawAnswer)) ? 'answer_format' : 'unclassified_error',
    confidence: question.type === 'numeric' && !Number.isFinite(Number(rawAnswer)) ? 0.98 : 0.45,
    evidence: question.type === 'numeric' && !Number.isFinite(Number(rawAnswer))
      ? 'The response could not be read as a number.'
      : 'The final response does not match the verified answer, but it does not align with a known misconception pattern.',
    correctConcept: question.concepts.join(', '),
    studentMisconception: 'There is not enough evidence to name one precise misconception.',
    nextStep: 'Compare your first changed step with the worked reasoning, then retry without looking.',
    recommendedMicroPractice: `Retry a ${question.difficulty} ${question.topic.toLowerCase()} question that isolates ${question.concepts[0]}.`,
  };
}

export function classifyPracticeAnswer(question, rawAnswer) {
  if (!question) throw new Error('A question is required.');
  const text = String(rawAnswer ?? '').trim();
  const numeric = text && /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[-+]?\d+)?$/i.test(text) ? Number(text) : NaN;
  const correct = question.type === 'multiple-choice'
    ? text !== '' && Number.isInteger(Number(text)) && Number(text) === question.answer.choice
    : closeEnough(numeric, question.answer.value, question.answer.tolerance);

  if (correct) {
    return {
      correct: true,
      errorCategory: null,
      errorSubcategory: null,
      confidence: 1,
      evidence: 'The response matches the verified answer.',
      correctConcept: question.concepts.join(', '),
      studentMisconception: null,
      nextStep: 'Explain why the method works, then try a transfer question without the worked steps.',
      recommendedMicroPractice: `Move to another ${question.topic.toLowerCase()} question at the same or next difficulty.`,
    };
  }

  const match = (question.mistakes ?? []).find((mistake) => question.type === 'multiple-choice'
    ? text !== '' && Number(text) === mistake.choice
    : closeEnough(numeric, mistake.value, mistake.tolerance ?? 0));
  if (!match) return defaultIncorrect(question, rawAnswer);

  return {
    correct: false,
    errorCategory: match.category,
    errorSubcategory: match.subcategory,
    confidence: 0.9,
    evidence: match.evidence,
    correctConcept: question.concepts.join(', '),
    studentMisconception: match.misconception,
    nextStep: match.nextStep,
    recommendedMicroPractice: `Practise one ${question.topic.toLowerCase()} item focused on ${match.subcategory.replace(/_/g, ' ')}.`,
  };
}

export function selectTargetedFollowUp(question, diagnosis, recentIds = [], seed = Date.now()) {
  if (!question || !diagnosis || diagnosis.correct) return null;
  const recent = new Set([question.id, ...recentIds.slice(-8)]);
  const sameTopic = ADAPTIVE_QUESTION_BANK.filter((candidate) =>
    candidate.id !== question.id
    && !recent.has(candidate.id)
    && candidate.subject === question.subject
    && candidate.topic === question.topic);
  const sameTopicIncludingRecent = ADAPTIVE_QUESTION_BANK.filter((candidate) =>
    candidate.id !== question.id
    && candidate.subject === question.subject
    && candidate.topic === question.topic);
  const sameConcept = ADAPTIVE_QUESTION_BANK.filter((candidate) =>
    candidate.id !== question.id
    && !recent.has(candidate.id)
    && candidate.subject === question.subject
    && candidate.concepts.some((concept) => question.concepts.includes(concept)));
  const pool = sameTopic.length ? sameTopic : sameConcept.length ? sameConcept : sameTopicIncludingRecent;
  if (!pool.length) return null;
  return selectPracticeQuestions({ bank: pool, count: 1, seed })[0] ?? null;
}

export function topicsForSubject(subject, bank = ADAPTIVE_QUESTION_BANK) {
  return [...new Set(bank.filter((question) => !subject || subject === 'all' || question.subject === subject)
    .map((question) => question.topic))].sort();
}

export function answerLabel(question) {
  if (question.type === 'multiple-choice') return question.choices[question.answer.choice];
  return `${question.answer.value}${question.units ? ` ${question.units}` : ''}`;
}
