import { formatSourcesForPrompt, GROUNDED_CHAT_RULES } from './grounding.js';

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
      content: `You are Apex, VertexED's discussion-first study tutor. The student is on: ${label}. ${hint}

Rules:
- Deliberate step-by-step; ask what they've tried before giving full solutions.
- Prefer Socratic follow-ups over dumping answers.
- Use clear structure for math (steps, not just final values).
- When relevant, reference exam technique, command terms, and mark-scheme thinking.
- Keep responses focused; if a topic is large, offer a sensible first step and invite follow-up.`,
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
