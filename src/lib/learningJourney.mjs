import { LEARNING_QUESTIONS, normalisePracticeAttempt, buildKnowledgeModel } from './learningModel.mjs';

export function sessionEvidenceChanges(session, attempts) {
  const submitted = new Set(Object.values(session.responses).map(r => r.submitted).filter(Boolean));
  const original = attempts.filter(a => submitted.has(a.id));
  const before = attempts.filter(a => Date.parse(a.at) < session.startedAt && !submitted.has(a.id));
  const previous = buildKnowledgeModel(before);
  const current = buildKnowledgeModel([...before, ...original]);
  const concepts = new Set(original.flatMap(a => LEARNING_QUESTIONS.find(q => q.id === a.questionId)?.conceptIds || []));
  return current.filter(n => concepts.has(n.id)).map(n => ({ ...n, previousStatus: previous.find(p => p.id === n.id).status }));
}

// Derived views only: preserve the original answer and authoritative attempt record.
export function buildMistakeNotebook(attempts, reflections = []) {
  const rows = attempts.map(normalisePracticeAttempt).filter(Boolean).sort((a, b) => a.at.localeCompare(b.at));
  return LEARNING_QUESTIONS.flatMap(question => {
    const history = rows.filter(a => a.questionId === question.id);
    const errors = history.filter(a => !a.correct);
    if (!errors.length) return [];
    const lastError = errors.at(-1);
    const later = history.filter(a => a.at > lastError.at);
    return [{ question, history, errors, lastError, reflection: reflections.find(r => r.questionId === question.id),
      recovery: later.some(a => a.correct && !a.hinted) ? 'Correct on a later unassisted attempt' : later.some(a => a.correct) ? 'Correct with help; revisit later' : 'Ready to revisit' }];
  }).sort((a, b) => b.lastError.at.localeCompare(a.lastError.at));
}

export function fitPracticeQuestions({ select, minutes, count = 5 }) {
  const ids = [];
  const budget = Number(minutes);
  const timed = Number.isFinite(budget) && budget >= 5 && budget <= 60;
  let remaining = timed ? budget * 60 : Infinity;
  const excluded = [];
  while (ids.length < (timed ? 20 : count) && excluded.length < LEARNING_QUESTIONS.length) {
    const q = select(excluded);
    if (!q) break;
    excluded.push(q.id);
    // Reserve a minute for feedback per question. Duration is an estimate.
    if (q.estimatedSeconds + 60 <= remaining) { ids.push(q.id); remaining -= q.estimatedSeconds + 60; }
  }
  return ids;
}

export function prerequisitePath(nodes) {
  const sorted = [], visited = new Set();
  const visit = node => {
    if (visited.has(node.id)) return;
    visited.add(node.id);
    node.prerequisites.forEach(id => { const pre = nodes.find(n => n.id === id); if (pre) visit(pre); });
    sorted.push(node);
  };
  nodes.forEach(visit);
  return sorted;
}

export function reviewBucket(dueAt, now = new Date()) {
  if (dueAt === null) return 'Not scheduled';
  const start = new Date(now); start.setHours(0, 0, 0, 0);
  const end = new Date(start); end.setDate(end.getDate() + 1);
  return dueAt < start.getTime() ? 'Overdue' : dueAt < end.getTime() ? 'Due today' : 'Upcoming';
}

export function practiceHint(question, level) {
  if (level < 3 && question.hints?.[level - 1]) return question.hints[level - 1];
  if (level === 1) return `Start with ${question.concepts[0]}. What is given, and what do you need to find? Write that relationship before calculating.`;
  if (level === 2) return question.solution.length > 1 ? question.solution[0] : `Compare each possible answer against the definition of ${question.concepts[0]}. Which assumption does each one require?`;
  return question.solution.join('\n\n');
}
