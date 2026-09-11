export function resolveLocalStorage(owner) {
  try {
    return owner?.localStorage ?? null;
  } catch {
    return null;
  }
}

export function safeStorageGet(storage, key) {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function safeStorageSet(storage, key, value) {
  try {
    if (!storage) return false;
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}
