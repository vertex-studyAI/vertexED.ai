import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { listStudyArtifactsDetailed, type StudyArtifact } from '@/lib/userContent';

type Collection = { scope: string | null; itemId?: string; items: StudyArtifact[]; nextOffset: number | null; loading: boolean; error: string | null };
const empty: Collection = { scope: null, items: [], nextOffset: null, loading: false, error: null };

export function useStudyArtifactCollection(enabled: boolean, itemId?: string) {
  const { user } = useAuth();
  const scope = user?.id ?? null;
  const [state, setState] = useState<Collection>(empty);
  const request = useRef(0);
  const busy = useRef(false);
  const invalidate = useCallback(() => { request.current++; busy.current = false; }, []);
  const load = useCallback(async (offset = 0) => {
    if (!scope || busy.current) return;
    const ticket = ++request.current;
    busy.current = true;
    setState(previous => ({ ...(offset ? previous : empty), scope, itemId, loading: true }));
    try {
      const result = await listStudyArtifactsDetailed(undefined, { limit: 50, offset, id: itemId });
      if (request.current !== ticket) return;
      setState(previous => ({
        scope,
        itemId,
        items: [...new Map([...(offset ? previous.items : []), ...result.items].map(item => [item.id, item])).values()],
        nextOffset: result.nextOffset ?? null,
        loading: false,
        error: result.cloudUnavailable || !result.ok ? 'Cloud work could not be loaded. Available device saves are still shown.' : null,
      }));
    } catch {
      if (request.current === ticket) setState(previous => ({ ...previous, loading: false, error: 'Saved work could not be loaded. Your work has not been changed.' }));
    } finally {
      if (request.current === ticket) busy.current = false;
    }
  }, [scope, itemId]);

  useEffect(() => {
    invalidate();
    setState(empty);
    if (enabled) void load();
    return invalidate;
  }, [enabled, load, invalidate]);

  // Do not expose the previous account during the render before effect cleanup.
  const visible = state.scope === scope && state.itemId === itemId ? state : { ...empty, loading: enabled && !!scope };
  return { ...visible, reload: () => load(), loadMore: () => visible.nextOffset !== null ? load(visible.nextOffset) : Promise.resolve() };
}
