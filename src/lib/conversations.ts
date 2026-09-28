import { authFetchWithAccessToken, getAccessToken } from './apiAuth';
import { getUserContentStorageScope, normalizeUserContentStorageScope } from './userContentStorageScope.mjs';
import { createConversationStore } from './conversationStore.mjs';
import { resolveLocalStorage, resolveSessionStorage } from './browserStorage.mjs';

export type ConversationState = {
  snapshot: { version: number; threads: Array<{ id: string; messages: Array<{ id: string; role: 'user' | 'assistant'; text: string; sources?: import('./chatbotApi').ChatbotSource[] }> }> };
  revision: string | null;
  dirty: boolean;
  ready: boolean;
  readOnly: boolean;
  status: string;
};

const stores = new Map<string, ReturnType<typeof createConversationStore>>();
const unavailableStorage = {
  getItem(): string | null { throw new Error('Browser storage is unavailable.'); },
  setItem() { throw new Error('Browser storage is unavailable.'); },
};

export function getConversationStore(scope?: string | null) {
  const account = normalizeUserContentStorageScope(scope);
  let store = stores.get(account);
  if (store) return store;
  const key = `vertex_apex:${account}:history-v1`;
  store = createConversationStore({
    key,
    storage: resolveLocalStorage(typeof window === 'undefined' ? null : window) ?? unavailableStorage,
    legacyStorage: resolveSessionStorage(typeof window === 'undefined' ? null : window),
    legacyPrefix: scope ? `vertex_apex:${account}:` : null,
    isCurrent: () => Boolean(scope) && getUserContentStorageScope() === scope,
    request: async (method: string, body?: unknown) => {
      if (!scope || getUserContentStorageScope() !== scope) throw new Error('Sign in to save and resume your private conversations.');
      const token = await getAccessToken();
      if (!token || getUserContentStorageScope() !== scope) throw new Error('Sign in again. Conversation history is saved on this device only.');
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      try {
        const response = await authFetchWithAccessToken(`/api/user-content${method === 'GET' ? '?kind=conversation&limit=2' : ''}`, token, {
          method, signal: controller.signal,
          ...(body ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}),
        });
        if (response.status === 409) throw new Error('Conversation history changed elsewhere. Export this copy, then reload the account copy before continuing.');
        if (!response.ok) throw new Error('Account save is unavailable. Conversation history is saved on this device only. Retry when connected.');
        return await response.json();
      } catch (error) {
        if (controller.signal.aborted) throw new Error('Account save timed out. Conversation history is saved on this device only.');
        if (error instanceof TypeError) throw new Error('Connection unavailable. Conversation history is saved on this device only.');
        throw error;
      } finally { clearTimeout(timeout); }
    },
  });
  stores.set(account, store);
  return store;
}

export function downloadConversations(store: ReturnType<typeof getConversationStore>) {
  const blob = new Blob([store.exportData()], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'vertexed-conversations.json';
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
