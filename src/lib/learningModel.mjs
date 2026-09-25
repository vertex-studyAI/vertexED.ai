import { ADAPTIVE_QUESTION_BANK } from '../content/adaptiveQuestionBank.mjs';
import { classifyPracticeAnswer } from './adaptivePractice.mjs';

export const PRACTICE_MODES = ['diagnostic', 'targeted', 'mixed', 'exam', 'rapid', 'prerequisites', 'challenge'];
export const MISTAKE_CAUSES = ['unclassified', 'conceptual', 'algebraic', 'arithmetic', 'misread', 'time pressure', 'forgot formula', 'weak prerequisite', 'careless'];
export const LEVELS = ['foundation', 'intermediate', 'advanced', 'very-hard'];
const DAY = 86400000;
const slug = text => String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const conceptId = (subject, concept) => `${slug(subject)}:${slug(concept)}`;
const prerequisites = {
  'inverse functions': ['domain'], 'Bayes theorem': ['conditional probability'],
  'De Moivre theorem': ['polar form'], 'projection': ['dot product'],
  'tangent slope': ['limits'], 'separable equations': ['definite integrals'],
  'friction': ['free-body diagrams', 'Newton second law'],
  'circular motion': ['Newton second law'], 'normal force': ['free-body diagrams'],
  'inelastic collision': ['momentum conservation'], 'terminal voltage': ['internal resistance'],
  'call trees': ['recursion'], 'dynamic programming': ['recursion', 'state design'],
  'binary search': ['loop invariants'], 'shortest paths': ['graph algorithms'],
};

// Curriculum adapters are data. These sample questions are not a complete syllabus.
export const CURRICULUM_CATALOG = [
  { id: 'IB_DP', label: 'IB Diploma', bankLabel: 'IB DP', levels: ['HL', 'SL'], components: ['Internal assessment', 'Paper 1', 'Paper 2', 'Paper 3'] },
  { id: 'IB_MYP', label: 'IB MYP', bankLabel: 'IB MYP', levels: [], components: ['School assessment', 'eAssessment'] },
  { id: 'GCSE', label: 'GCSE', bankLabel: 'GCSE', levels: ['Foundation', 'Higher'], components: ['Paper 1', 'Paper 2'] },
  { id: 'IGCSE', label: 'IGCSE', bankLabel: 'IGCSE', levels: ['Core', 'Extended'], components: ['Paper 1', 'Paper 2'] },
  { id: 'AP', label: 'Advanced Placement', bankLabel: 'AP', levels: [], components: ['MCQ', 'FRQ'] },
  { id: 'A_LEVELS', label: 'A Level', bankLabel: 'A Level', levels: ['AS', 'A2'], components: ['School assessment', 'Exam'] },
];
export const LEARNING_QUESTIONS = ADAPTIVE_QUESTION_BANK.map(q => ({
  ...q, conceptIds: q.concepts.map(c => conceptId(q.subject, c)),
  skill: q.type === 'numeric' ? 'Calculate and interpret' : 'Analyse and discriminate',
  marks: 1, source: 'VertexED original', calculator: 'optional',
  estimatedSeconds: [90, 150, 210, 300][LEVELS.indexOf(q.difficulty)] || 150,
}));
export const CONCEPT_GRAPH = [...new Map(LEARNING_QUESTIONS.flatMap(q => q.concepts.map(label => {
  const id = conceptId(q.subject, label);
  return [id, { id, label, subject: q.subject, unit: q.topic, topic: q.topic,
    skill: q.skill, curricula: q.curriculum,
    prerequisites: (prerequisites[label] || []).map(c => conceptId(q.subject, c)) }];
}))).values()];

export function normalisePracticeAttempt(value) {
  const q = LEARNING_QUESTIONS.find(q => q.id === value?.questionId);
  if (!q || !/^attempt:[a-zA-Z0-9-]{8,80}$/.test(value?.id || '')
    || typeof value.answer !== 'string' || !value.answer.trim() || value.answer.length > 200
    || (value.confidence !== null && ![1, 2, 3, 4, 5].includes(value.confidence)) || typeof value.hinted !== 'boolean'
    || !Number.isFinite(value.seconds) || value.seconds < 0 || value.seconds > 86400
    || !Number.isFinite(Date.parse(value.at)) || Date.parse(value.at) > Date.now() + DAY
    || !PRACTICE_MODES.includes(value.mode)) return null;
  const result = classifyPracticeAnswer(q, value.answer);
  return { id: value.id, questionId: q.id, answer: value.answer, confidence: value.confidence,
    hinted: value.hinted, seconds: Math.round(value.seconds), at: new Date(value.at).toISOString(), mode: value.mode,
    correct: result.correct, error: result.errorSubcategory, evidence: 'original-bank-answer-check-v1' };
}
export function normaliseMistake(value) {
  if (!/^mistake:[a-zA-Z0-9-]{8,80}$/.test(value?.id || '')
    || !LEARNING_QUESTIONS.some(q => q.id === value.questionId)
    || !MISTAKE_CAUSES.includes(value.cause) || typeof value.reflection !== 'string' || value.reflection.length > 2000
    || typeof value.correction !== 'string' || value.correction.length > 2000
    || !Number.isFinite(Date.parse(value.updatedAt))) return null;
  return { id: value.id, questionId: value.questionId, cause: value.cause, reflection: value.reflection,
    correction: value.correction, updatedAt: new Date(value.updatedAt).toISOString() };
}
export function parseLearningRecords(raw, type) {
  if (!raw) return [];
  const rows = JSON.parse(raw);
  const normalise = type === 'practice_attempt' ? normalisePracticeAttempt : normaliseMistake;
  if (!Array.isArray(rows) || rows.length > 10000 || rows.some(row => !normalise(row))) {
    throw new Error('Saved practice data could not be read. Original data is preserved; export account data in Settings.');
  }
  return [...new Map(rows.map(row => { const clean = normalise(row); return [clean.id, clean]; })).values()];
}
export function mergeLearningRecord(records, record, type) {
  const normalise = type === 'practice_attempt' ? normalisePracticeAttempt : normaliseMistake;
  const clean = normalise(record);
  if (!clean) throw new Error('This practice record is invalid.');
  const existing = records.find(row => row.id === clean.id);
  if (existing && (existing.updatedAt || existing.at) > (clean.updatedAt || clean.at)) return records;
  const rows = records.filter(row => row.id !== clean.id).concat(clean);
  if (rows.length > 10000) throw new Error('Practice storage is full. Export your account data before continuing.');
  return rows;
}

export function buildKnowledgeModel(attempts = [], now = Date.now()) {
  const valid = attempts.map(normalisePracticeAttempt).filter(Boolean).filter(a => Date.parse(a.at) <= now);
  return CONCEPT_GRAPH.map(node => {
    const rows = valid.filter(a => LEARNING_QUESTIONS.find(q => q.id === a.questionId)?.conceptIds.includes(node.id))
      .sort((a, b) => a.at.localeCompare(b.at));
    const recent = rows.slice(-5);
    const independent = recent.filter(a => a.correct && !a.hinted);
    const distinct = new Set(independent.map(a => a.questionId)).size;
    const days = new Set(independent.map(a => a.at.slice(0, 10))).size;
    const last = rows.at(-1);
    const failures = recent.filter(a => !a.correct).length;
    const status = !last ? 'unassessed' : failures >= 2 && failures >= recent.length / 2 ? 'weak'
      : independent.length >= 3 && distinct >= 2 && days >= 2 && last.correct && !last.hinted ? 'mastered' : 'developing';
    // Transparent interval heuristic, never a predicted probability of remembering.
    const intervalDays = !last || !last.correct || last.hinted ? 1 : Math.min(30, 2 ** Math.min(independent.length, 5));
    const dueAt = last ? Date.parse(last.at) + intervalDays * DAY : null;
    return { ...node, status, attempts: rows.length, independentCorrect: independent.length, distinctQuestions: distinct,
      confidence: recent.some(a => a.confidence !== null) ? recent.filter(a => a.confidence !== null).reduce((sum, a) => sum + a.confidence, 0) / recent.filter(a => a.confidence !== null).length : null,
      lastAt: last?.at || null, dueAt, reviewDue: dueAt !== null && dueAt <= now,
      accuracy: rows.length ? rows.filter(a => a.correct).length / rows.length : null,
      repeatedErrors: failures, intervalDays,
      explanation: !last ? 'No recorded attempt.' : `${rows.length} attempts; ${independent.length} recent correct without a hint; ${distinct} distinct questions.` };
  });
}

export function selectLearningQuestion({ attempts = [], subject = '', topic = '', concept = '', curriculum = '', mode = 'diagnostic', exclude = [], targetId = '' } = {}) {
  const model = buildKnowledgeModel(attempts);
  const byId = new Map(model.map(n => [n.id, n]));
  const target = byId.get(concept);
  const pool = LEARNING_QUESTIONS.filter(q => !exclude.includes(q.id)
    && (!subject || q.subject === subject) && (!curriculum || q.curriculum.includes(curriculum))
    && (!topic || q.topic === topic)
    && (!concept || q.conceptIds.includes(concept) || mode === 'prerequisites' && q.conceptIds.some(id => target?.prerequisites.includes(id))));
  return pool.map(q => {
    const nodes = q.conceptIds.map(id => byId.get(id));
    const history = attempts.filter(a => a.questionId === q.id);
    const last = history.at(-1);
    let priority = !history.length ? 20 : 0;
    priority += nodes.some(n => n.status === 'weak') ? 30 : 0;
    priority += nodes.some(n => n.reviewDue) ? 15 : 0;
    if (mode === 'diagnostic') priority += nodes.some(n => n.status === 'unassessed') ? 50 : 0;
    if (mode === 'targeted' && last && !last.correct) priority += 50;
    if (mode === 'prerequisites' && q.conceptIds.some(id => target?.prerequisites.includes(id))) priority += 100;
    const previous = attempts.at(-1);
    const previousLevel = LEVELS.indexOf(LEARNING_QUESTIONS.find(q => q.id === previous?.questionId)?.difficulty);
    const desired = mode === 'challenge' ? 3 : mode === 'rapid' ? 0 : previous ? Math.max(0, Math.min(3, previousLevel + (previous.correct && !previous.hinted ? 1 : -1))) : 0;
    priority -= Math.abs(LEVELS.indexOf(q.difficulty) - desired) * 8;
    if (q.id === targetId) priority += 1000;
    return { q, priority };
  }).sort((a, b) => b.priority - a.priority || a.q.id.localeCompare(b.q.id))[0]?.q || null;
}

export function buildLearningPlan({ attempts = [], tasks = [], exams = [], subjects = [], minutes = 25, dueCards = 0, now = Date.now() } = {}) {
  const model = buildKnowledgeModel(attempts, now);
  const candidates = [];
  for (const task of tasks) {
    if (task.completed || !task.date || !Number.isFinite(Date.parse(task.date))) continue;
    const days = Math.floor((Date.parse(task.date + 'T23:59:59') - now) / DAY);
    if (days > 7) continue;
    candidates.push({ id: `task:${task.id}`, title: task.title, minutes: Math.max(5, Number(task.minutes) || 25),
      reason: days < 0 ? `Overdue since ${task.date}. Reschedule or complete it in your planner.` : `Scheduled for ${task.date}.`,
      score: days < 0 ? 120 : 85 - days * 3, to: '/planner', kind: 'task' });
  }
  for (const node of model.filter(n => (!subjects.length || subjects.includes(n.subject)) && n.attempts)) {
    const upcoming = exams.filter(e => e.subject === node.subject && Number.isFinite(Date.parse(e.date)) && Date.parse(e.date + 'T23:59:59') >= now)
      .sort((a, b) => a.date.localeCompare(b.date))[0];
    const days = upcoming ? Math.max(0, Math.ceil((Date.parse(upcoming.date + 'T23:59:59') - now) / DAY)) : null;
    const gap = node.prerequisites.map(id => model.find(n => n.id === id)).find(n => n?.status === 'weak');
    if (node.status === 'mastered' && !node.reviewDue && (days === null || days > 7)) continue;
    const reason = [node.status === 'weak' ? `${node.repeatedErrors} of your last ${Math.min(5, node.attempts)} attempts were incorrect.` : node.explanation,
      node.reviewDue ? `Your ${node.intervalDays}-day review interval has elapsed.` : '',
      gap ? `Review prerequisite: ${gap.label}.` : '', days !== null ? `${node.subject} assessment in ${days} day${days === 1 ? '' : 's'}.` : ''].filter(Boolean).join(' ');
    candidates.push({ id: node.id, title: gap ? `Repair ${gap.label}` : `Practise ${node.label}`, minutes: 10, reason,
      score: (node.status === 'weak' ? 65 : 20) + (node.reviewDue ? 20 : 0) + (gap ? 15 : 0) + (days !== null ? Math.max(0, 35 - days * 3) : 0),
      to: `/learn?concept=${encodeURIComponent((gap || node).id)}&mode=${gap ? 'prerequisites' : 'targeted'}`, kind: 'concept' });
  }
  if (dueCards) candidates.push({ id: 'cards', title: `Review ${dueCards} due flashcards`, minutes: Math.min(15, Math.max(5, dueCards)), reason: 'These cards are due under your saved review schedule.', score: 70, to: '/notetaker?mode=study', kind: 'cards' });
  if (!candidates.length) candidates.push({ id: 'diagnostic', title: 'Find your starting point', minutes: 10, reason: 'No assessed concept needs review yet. Try an original question to start collecting evidence.', score: 0, to: '/learn?mode=diagnostic', kind: 'diagnostic' });
  const sorted = candidates.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  let remaining = Math.max(5, Math.min(480, Number(minutes) || 25));
  const planned = [], backlog = [];
  for (const item of sorted) {
    if (item.minutes <= remaining) { planned.push(item); remaining -= item.minutes; } else backlog.push(item);
  }
  return { planned, backlog, plannedMinutes: planned.reduce((n, item) => n + item.minutes, 0), model };
}
