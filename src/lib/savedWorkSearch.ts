import type { GlobalSearchEntry } from './globalSearchIndex';
import type { StudyArtifact } from './userContent';

export function savedWorkSearchEntries(items: StudyArtifact[]): GlobalSearchEntry[] {
  return items.map(item => ({
    title: item.title || `Saved ${item.kind}`,
    description: `${item.kind === 'notebook' || item.kind === 'planner' ? 'Workspace snapshot' : item.kind} · ${item.localOnly ? 'Saved on this device' : 'Saved to your account'}`,
    to: `/saved-work?item=${encodeURIComponent(item.id)}`,
    area: 'Saved work',
    account: true,
    // Source text is searched locally, never sent to analytics or a model.
    keywords: [item.payload.topic, item.payload.subject, item.payload.notes, item.payload.question]
      .filter((value): value is string => typeof value === 'string').map(value => value.slice(0, 8000)).join(' '),
  }));
}
