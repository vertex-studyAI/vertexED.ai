import { CONCEPT_GRAPH, LEARNING_QUESTIONS } from './learningModel.mjs';
import { notebookStorageKeys } from './notebookStorageScope.mjs';
import { userContentStorageKeys, normalizeUserContentStorageScope } from './userContentStorageScope.mjs';
import type { GlobalSearchEntry } from './globalSearchIndex';
import { notebookSearchEntries } from './savedWorkText.mjs';
import { conversationSearchEntries } from '../../contracts/apexConversation.js';

export type PersonalSearchIndex = {
  entries: GlobalSearchEntry[];
  notebooks: { entries: GlobalSearchEntry[]; dirty: boolean } | null;
  conversations: { entries: GlobalSearchEntry[]; dirty: boolean } | null;
};

export function readPersonalSearchIndex(scope: string, local: Storage, session: Storage): PersonalSearchIndex {
  const parse = (storage: Storage, key: string) => { try { const value = JSON.parse(storage.getItem(key) || '[]'); return Array.isArray(value) ? value : []; } catch { return []; } };
  const entries: GlobalSearchEntry[] = [
    { title: 'Start a 5-minute session', description: 'A short attempt with time for feedback.', to: '/learn?minutes=5', area: 'Study tool', keywords: 'quick time practice', account: true },
    { title: 'Start a 15-minute session', description: 'Choose bounded original practice.', to: '/learn?minutes=15', area: 'Study tool', keywords: 'quick time practice', account: true },
    { title: 'Review mistakes', description: 'Inspect recorded errors and plan a repair.', to: '/learn?tab=mistakes', area: 'Study tool', keywords: 'errors repair', account: true },
    { title: 'Open mastery', description: 'Inspect concepts, prerequisites and due reviews.', to: '/learn?tab=knowledge', area: 'Study tool', keywords: 'courses skills graph review', account: true },
    ...CONCEPT_GRAPH.map(n => ({ title: n.label, description: `${n.subject} / ${n.topic}: evidence and practice.`, to: `/learn?concept=${encodeURIComponent(n.id)}`, area: 'Topic' as const, keywords: `${n.subject} ${n.topic} diagnostic`, account: true })),
    ...LEARNING_QUESTIONS.map(q => ({ title: `${q.subject}: ${q.topic} question`, description: q.prompt, to: `/learn?question=${q.id}&subject=${encodeURIComponent(q.subject)}`, area: 'Study tool' as const, keywords: `${q.concepts.join(' ')} ${q.difficulty}`, account: true })),
  ];
  const keys = userContentStorageKeys(scope);
  let notebooks: PersonalSearchIndex['notebooks'] = null;
  const notebookKeys = notebookStorageKeys(scope);
  try {
    const raw = local.getItem(notebookKeys.notebooks);
    const values = raw === null ? null : JSON.parse(raw);
    if (Array.isArray(values)) {
      const metadata = JSON.parse(local.getItem(`${notebookKeys.updatedAt}:sync`) || '{}');
      const updatedAt = local.getItem(notebookKeys.updatedAt);
      notebooks = { entries: notebookSearchEntries(values) as GlobalSearchEntry[],
        dirty: metadata?.pending === true || !metadata?.syncedLocalTime || updatedAt !== metadata.syncedLocalTime };
    }
  } catch { /* Unreadable device material must not replace verified cloud results. */ }
  for (const card of parse(local, keys.srDeck).slice(0,300)) {
    if (typeof card?.front !== 'string' || typeof card.back !== 'string') continue;
    entries.push({ title: card.front.slice(0,160), description: 'Saved flashcard · open your review deck', to: '/notetaker?mode=study', area: 'Saved work', keywords: card.back.slice(0,2000), account: true });
  }
  for (const note of parse(local, keys.quickNotes).slice(0,100)) {
    if (typeof note?.title !== 'string' || typeof note.content !== 'string') continue;
    entries.push({ title: note.title, description: 'Study Zone note', to: '/study-zone', area: 'Saved work', keywords: note.content.slice(0,8000), account: true });
  }
  let conversations: PersonalSearchIndex['conversations'] = null;
  try {
    const raw = local.getItem(`vertex_apex:${normalizeUserContentStorageScope(scope)}:history-v1`);
    if (raw !== null) {
      const envelope = JSON.parse(raw);
      if (typeof envelope?.dirty === 'boolean') conversations = {
        entries: conversationSearchEntries(envelope.snapshot) as GlobalSearchEntry[], dirty: envelope.dirty,
      };
    }
  } catch { /* Preserve corrupt bytes; search must not attempt recovery writes. */ }
  const legacy: GlobalSearchEntry[] = [];
  if (!conversations) for (const message of parse(session, `vertex_apex:${normalizeUserContentStorageScope(scope)}:apex-main`).slice(-40)) {
    if (typeof message?.text !== 'string') continue;
    legacy.push({ title: message.text.slice(0,100), description: 'Apex conversation in this browser session', to: '/chatbot', area: 'Saved work', keywords: message.text, account: true });
  }
  if (!conversations && legacy.length) conversations = { entries: legacy, dirty: false };
  return { entries, notebooks, conversations };
}

export function learningSearchEntries(scope: string, local: Storage, session: Storage): GlobalSearchEntry[] {
  const index = readPersonalSearchIndex(scope, local, session);
  return [...index.entries, ...index.notebooks?.entries ?? [], ...index.conversations?.entries ?? []];
}
