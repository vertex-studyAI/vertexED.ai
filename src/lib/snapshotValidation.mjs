import { normalizePlannerTasks } from './plannerTasks.mjs';

const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = value => typeof value === 'string';
const id = value => text(value) && value.trim().length > 0;
const time = value => text(value) && Number.isFinite(Date.parse(value));
const texts = value => Array.isArray(value) && value.every(text);
const unique = items => new Set(items.map(item => item.id)).size === items.length;
const sourceKinds = new Set(['text', 'paste', 'artifact', 'transcript', 'file']);
const outputKinds = new Set(['study-guide', 'briefing', 'faq', 'audio-script', 'audio-brief', 'audio-critique', 'audio-debate', 'timeline', 'flashcards', 'quiz', 'glossary', 'outline', 'mind-map', 'compare', 'suggested-questions', 'board-deep-dive']);

function validSource(value) {
  return record(value) && id(value.id) && sourceKinds.has(value.type) && text(value.title) && text(value.content)
    && Number.isInteger(value.wordCount) && value.wordCount >= 0 && time(value.createdAt) && typeof value.enabled === 'boolean';
}

function validOutput(value) {
  return record(value) && id(value.id) && outputKinds.has(value.kind) && text(value.title) && text(value.content) && time(value.generatedAt)
    && (value.suggestedQuestions === undefined || texts(value.suggestedQuestions))
    && (value.isAudioScript === undefined || typeof value.isAudioScript === 'boolean')
    && (value.flashcards === undefined || Array.isArray(value.flashcards) && value.flashcards.every(card => record(card) && text(card.front) && text(card.back)
      && (card.sourceIds === undefined || texts(card.sourceIds))))
    && (value.quiz === undefined || Array.isArray(value.quiz) && value.quiz.every(question => record(question) && id(question.id)
      && ['mcq', 'short'].includes(question.type) && text(question.question) && texts(question.options)
      && text(question.answer) && text(question.explanation) && Number.isFinite(question.marks) && question.marks > 0
      && (question.sourceIds === undefined || texts(question.sourceIds))));
}

export function validateNotebooks(value) {
  if (!Array.isArray(value) || !value.every(notebook => record(notebook) && id(notebook.id) && text(notebook.title) && text(notebook.subject)
    && time(notebook.createdAt) && time(notebook.updatedAt)
    && Array.isArray(notebook.sources) && notebook.sources.every(validSource) && unique(notebook.sources)
    && Array.isArray(notebook.outputs) && notebook.outputs.every(validOutput) && unique(notebook.outputs)
    // Legacy notebooks legitimately lack suggestedQuestions.
    && (notebook.suggestedQuestions === undefined || texts(notebook.suggestedQuestions))) || !unique(value)) {
    throw new Error('Saved notebooks contain invalid records. Original data is preserved. Export account data before recovery.');
  }
  return value;
}

export function validatePlannerSnapshot(snapshot) {
  if (!record(snapshot) || !['Day', 'Week'].includes(snapshot.mode) || !time(snapshot.updatedAt)) throw new Error('Planner view or revision is invalid. Original data is preserved.');
  return { ...snapshot, tasks: normalizePlannerTasks(snapshot.tasks) };
}

export function validateNotebookSnapshot(snapshot) {
  if (!record(snapshot) || !time(snapshot.updatedAt)) throw new Error('Notebook revision is invalid. Original data is preserved.');
  validateNotebooks(snapshot.notebooks);
  return snapshot;
}
