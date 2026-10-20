// Search only learner-facing study fields. Identifiers, provider metadata and
// image/base64 bytes are not useful source text and must not enter the index.
const textFields = new Set([
  'title', 'subject', 'topic', 'notes', 'text', 'content', 'question', 'prompt',
  'answer', 'explanation', 'front', 'back', 'review', 'feedback', 'description',
  'instructions', 'summary', 'label', 'name', 'hint', 'hints', 'solution',
  'successCriteria', 'additional', 'reflection', 'reasoning', 'strengths',
  'improvements', 'suggestedQuestions', 'options', 'choices', 'excerpt', 'term',
  'meaning', 'modelAnswer', 'studentAnswer', 'correctAnswer', 'comment', 'reason', 'folder',
]);
const containers = new Set([
  'metadata', 'paper', 'sections', 'questions', 'parts', 'subparts', 'flashcards', 'organisation',
  'results', 'notebooks', 'sources', 'outputs', 'quiz', 'quizResponses', 'tasks',
  'threads', 'messages', 'structuredReview', 'criteria', 'errors', 'rubric',
]);
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);

export function studyMaterialText(value) {
  const pieces = [];
  const visited = new Set();
  const visit = (entry, depth, allowText = false) => {
    if (typeof entry === 'string') { if (allowText) pieces.push(entry); return; }
    if (!entry || typeof entry !== 'object' || depth > 16 || visited.has(entry)) return;
    visited.add(entry);
    if (Array.isArray(entry)) { for (const child of entry) visit(child, depth + 1, allowText); return; }
    for (const [key, child] of Object.entries(entry)) {
      if (textFields.has(key)) visit(child, depth + 1, true);
      else if (containers.has(key)) visit(child, depth + 1);
    }
  };
  visit(value, 0, true);
  return pieces.join(' ');
}

export function savedWorkText(item) {
  return [item?.title, item?.kind, studyMaterialText(item?.payload)]
    .filter(value => typeof value === 'string').join(' ');
}

export function notebookSearchEntries(notebooks, location = 'Saved on this device') {
  if (!Array.isArray(notebooks)) return [];
  return notebooks.flatMap(notebook => {
    if (!isRecord(notebook) || typeof notebook.id !== 'string' || !notebook.id || typeof notebook.title !== 'string') return [];
    const to = `/study-notebook?notebook=${encodeURIComponent(notebook.id)}`;
    const sources = Array.isArray(notebook.sources) ? notebook.sources : [];
    return [{
      title: notebook.title,
      description: `Notebook · ${notebook.subject || 'Your sources'} · ${location}`,
      to, area: 'Saved work', account: true,
      keywords: studyMaterialText({ subject: notebook.subject, outputs: notebook.outputs,
        suggestedQuestions: notebook.suggestedQuestions,
        // Old sources without a locator remain searchable at notebook level.
        sources: sources.filter(source => typeof source?.id !== 'string' || !source.id) }),
    }, ...sources.flatMap(source => {
      if (!isRecord(source) || typeof source.id !== 'string' || !source.id || typeof source.content !== 'string') return [];
      return [{
        title: typeof source.title === 'string' && source.title.trim() ? source.title : 'Notebook source',
        description: `Source in ${notebook.title} · ${location}`,
        to: `${to}&source=${encodeURIComponent(source.id)}`, area: 'Saved work', account: true,
        keywords: `${notebook.title} ${typeof notebook.subject === 'string' ? notebook.subject : ''} ${source.content}`,
      }];
    })];
  });
}

export function resolveNotebookSearchLocation(notebooks, notebookId, sourceId) {
  if (!notebookId) return { notebookId: null, sourceId: null, error: null };
  const notebook = Array.isArray(notebooks) && notebooks.find(entry => entry?.id === notebookId);
  if (!notebook) return { notebookId: null, sourceId: null, error: 'The linked notebook is unavailable in this account. It may have been deleted.' };
  if (sourceId && (!Array.isArray(notebook.sources) || !notebook.sources.some(source => source?.id === sourceId))) {
    return { notebookId, sourceId: null, error: 'The linked source is no longer in this notebook. Your other sources are unchanged.' };
  }
  return { notebookId, sourceId: sourceId || null, error: null };
}
