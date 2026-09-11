import {
  resolveSessionStorage,
  safeStorageGet,
  safeStorageRemove,
  safeStorageSet,
} from './browserStorage.mjs';

export const MAX_APEX_CHAT_MESSAGES = 40;

function normalizeMessage(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;

  const id = typeof value.id === 'string' ? value.id.trim() : '';
  const role = value.role === 'user' || value.role === 'assistant' ? value.role : null;
  const text = typeof value.text === 'string' ? value.text : null;
  if (!id || !role || text === null) return null;

  return { id, role, text };
}

export function normalizeApexChatMessages(value) {
  if (!Array.isArray(value)) return [];

  const normalized = [];
  const seenIds = new Set();
  for (const entry of value) {
    const message = normalizeMessage(entry);
    if (!message || seenIds.has(message.id)) continue;
    seenIds.add(message.id);
    normalized.push(message);
  }

  return normalized.slice(-MAX_APEX_CHAT_MESSAGES);
}

function getSessionStorage(owner) {
  return resolveSessionStorage(owner);
}

export function loadApexChatMessages(owner, storageKey) {
  const raw = safeStorageGet(getSessionStorage(owner), storageKey);
  if (!raw) return [];

  try {
    return normalizeApexChatMessages(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function saveApexChatMessages(owner, storageKey, messages) {
  try {
    return safeStorageSet(
      getSessionStorage(owner),
      storageKey,
      JSON.stringify(normalizeApexChatMessages(messages)),
    );
  } catch {
    return false;
  }
}

export function clearApexChatMessages(owner, storageKey) {
  return safeStorageRemove(getSessionStorage(owner), storageKey);
}
