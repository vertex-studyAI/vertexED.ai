import { formatSourcesForPrompt, GROUNDED_CHAT_RULES } from './grounding.js';
import { VERTEX_AGENTS } from './vertexAgents.js';

export function buildAskMessages({ question, history, context, sources }) {
  const trimmedQuestion = typeof question === 'string' ? question.trim() : '';
  const messages = [];

  if (context && typeof context === 'object') {
    const label = typeof context.label === 'string'
      ? context.label.trim().slice(0, 120)
      : 'VertexED';
    const hint = typeof context.hint === 'string'
      ? context.hint.trim().slice(0, 2000)
      : '';
    messages.push({
      role: 'system',
      content: `${VERTEX_AGENTS.apexTutor.instructions}

The student is on: ${label}. ${hint}`,
    });
  }

  const sourceBlock = formatSourcesForPrompt(sources);
  if (sourceBlock && messages.length > 0) {
    messages[0].content += `\n\n${GROUNDED_CHAT_RULES}\n\n${sourceBlock}`;
  } else if (sourceBlock) {
    messages.push({ role: 'system', content: `${GROUNDED_CHAT_RULES}\n\n${sourceBlock}` });
  }

  if (Array.isArray(history)) {
    const recentHistory = history.slice(-10);
    for (const [index, entry] of recentHistory.entries()) {
      const role = entry?.role === 'assistant' ? 'assistant' : 'user';
      const text = typeof entry?.text === 'string' ? entry.text.trim() : '';
      const duplicatesCurrentQuestion =
        index === recentHistory.length - 1 && role === 'user' && text === trimmedQuestion;
      if (text && !duplicatesCurrentQuestion) messages.push({ role, content: text.slice(0, 2000) });
    }
  }

  messages.push({ role: 'user', content: trimmedQuestion });
  return messages;
}
