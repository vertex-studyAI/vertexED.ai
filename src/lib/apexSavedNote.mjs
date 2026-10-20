const QUESTION_LIMIT = 2_000;
const ANSWER_LIMIT = 12_000;
const SOURCE_LIMIT = 6;
const SOURCE_EXCERPT_LIMIT = 700;

function cleanText(value, limit) {
  return typeof value === 'string' ? value.trim().slice(0, limit) : '';
}

function cleanSource(source) {
  if (!source || typeof source !== 'object') return null;
  const id = cleanText(source.id, 160);
  const title = cleanText(source.title, 300);
  if (!id || !title) return null;
  const excerpt = cleanText(source.excerpt, SOURCE_EXCERPT_LIMIT);
  return { id, title, ...(excerpt ? { excerpt } : {}) };
}

function sourceSection(sources) {
  if (!sources.length) return '';
  return `\n\n## Evidence used\n${sources.map((source) => (
    `- **${source.title}**${source.excerpt ? `: ${source.excerpt}` : ''}`
  )).join('\n')}`;
}

/**
 * Turns one finished Apex answer into an ordinary editable note.  The saved
 * object deliberately contains the learner's prompt and only the cited source
 * snippets shown in the conversation, so opening it in Notes needs no later
 * AI call or hidden conversation storage.
 */
export function buildApexSavedNote(messages, assistantMessageId, contextLabel = '') {
  if (!Array.isArray(messages) || typeof assistantMessageId !== 'string') return null;
  const index = messages.findIndex((message) => message?.id === assistantMessageId);
  const message = index >= 0 ? messages[index] : null;
  if (!message || message.role !== 'assistant') return null;

  const answer = cleanText(message.text, ANSWER_LIMIT);
  if (!answer) return null;

  const earlier = messages.slice(0, index).reverse().find((candidate) => candidate?.role === 'user');
  const question = cleanText(earlier?.text, QUESTION_LIMIT);
  const context = cleanText(contextLabel, 160);
  const sources = (Array.isArray(message.sources) ? message.sources : [])
    .map(cleanSource)
    .filter(Boolean)
    .slice(0, SOURCE_LIMIT);
  const titleStem = question || context || 'Saved explanation';
  const title = `AI tutor note: ${titleStem}`.slice(0, 200);
  const promptSection = question ? `## Your question\n${question}\n\n` : '';
  const contextSection = context ? `Context: ${context}\n\n` : '';

  return {
    title,
    payload: {
      topic: title,
      notes: `# ${title}\n\n> **AI tutor output:** Verify this explanation against your course materials before relying on it.\n\n${contextSection}${promptSection}## Explanation\n${answer}${sourceSection(sources)}`,
      source: 'ai-tutor',
      apex: {
        question: question || null,
        context: context || null,
        sources,
      },
    },
  };
}
