export const CONVERSATION_LIMIT_BYTES = 240 * 1024;
export const CONVERSATION_THREAD_LIMIT = 24;
export const CONVERSATION_MESSAGE_LIMIT = 200;

export function validateConversations(value) {
  const fail = () => { throw new Error('Conversation data is unreadable or exceeds its limit. Export a backup before recovery.'); };
  if (!value || value.version !== 1 || !Array.isArray(value.threads) || value.threads.length > CONVERSATION_THREAD_LIMIT) fail();
  const ids = new Set();
  for (const thread of value.threads) {
    if (!thread || typeof thread.id !== 'string' || !thread.id || thread.id.length > 120 || ids.has(thread.id)
      || !Array.isArray(thread.messages) || thread.messages.length > CONVERSATION_MESSAGE_LIMIT) fail();
    ids.add(thread.id);
    const messages = new Set();
    for (const message of thread.messages) {
      if (!message || typeof message.id !== 'string' || !message.id || message.id.length > 100 || messages.has(message.id)
        || !['user', 'assistant'].includes(message.role) || typeof message.text !== 'string' || message.text.length > 50000) fail();
      messages.add(message.id);
      if (message.sources !== undefined) {
        if (!Array.isArray(message.sources) || message.sources.length > 20) fail();
        for (const source of message.sources) {
          if (!source || typeof source.id !== 'string' || source.id.length > 200 || typeof source.title !== 'string' || source.title.length > 1000) fail();
          for (const field of ['excerpt', 'path']) if (source[field] !== undefined && (typeof source[field] !== 'string' || source[field].length > 12000)) fail();
        }
      }
    }
  }
  if (new TextEncoder().encode(JSON.stringify(value)).length > CONVERSATION_LIMIT_BYTES) fail();
  return value;
}

export function conversationSearchEntries(snapshot) {
  return validateConversations(snapshot).threads.filter(thread => thread.messages.length).map(thread => ({
    title: thread.messages.find(message => message.role === 'user')?.text.slice(0, 100) || 'AI tutor conversation',
    description: 'Private AI tutor conversation. AI replies need checking against your course materials.',
    to: `/chatbot?thread=${encodeURIComponent(thread.id)}`,
    area: 'Saved work', account: true,
    keywords: thread.messages.map(message => message.text).join(' '),
  }));
}
