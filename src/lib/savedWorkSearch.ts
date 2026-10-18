import type { GlobalSearchEntry } from './globalSearchIndex';
import type { StudyArtifact } from './userContent';
import { conversationSearchEntries } from '../../contracts/apexConversation.js';
import { notebookSearchEntries, savedWorkText } from './savedWorkText.mjs';
import type { PersonalSearchIndex } from './learningSearch';

export function mergedSavedWorkSearchEntries(items: StudyArtifact[], personal?: PersonalSearchIndex | null): GlobalSearchEntry[] {
  const deviceKinds = new Set<string>();
  const deviceEntries: GlobalSearchEntry[] = [...personal?.entries ?? []];
  for (const [kind, snapshot] of [['notebook', personal?.notebooks], ['conversation', personal?.conversations]] as const) {
    if (snapshot && (snapshot.dirty || !items.some(item => item.kind === kind))) {
      deviceKinds.add(kind);
      deviceEntries.push(...snapshot.entries);
    }
  }
  const entries = [...deviceEntries, ...savedWorkSearchEntries(items.filter(item => !deviceKinds.has(item.kind)))];
  return [...new Map(entries.map(entry => [`${entry.to}\u0000${entry.title}`, entry])).values()];
}

export function savedWorkSearchEntries(items: StudyArtifact[]): GlobalSearchEntry[] {
  return items.flatMap(item => {
    if (item.kind === 'conversation') {
      try { return conversationSearchEntries(item.payload) as GlobalSearchEntry[]; }
      catch { return []; }
    }
    if (item.kind === 'notebook') {
      const entries = notebookSearchEntries(item.payload?.notebooks, item.localOnly ? 'Saved on this device' : 'Saved to your account');
      if (entries.length) return entries as GlobalSearchEntry[];
    }
    return [{
    title: item.title || `Saved ${item.kind}`,
    description: `${item.kind === 'notebook' || item.kind === 'planner' ? 'Workspace snapshot' : item.kind} · ${item.localOnly ? 'Saved on this device' : 'Saved to your account'}`,
    to: `/saved-work?item=${encodeURIComponent(item.id)}`,
    area: 'Saved work',
    account: true,
    // Source text is searched locally, never sent to analytics or a model.
    keywords: savedWorkText(item),
    }];
  });
}
