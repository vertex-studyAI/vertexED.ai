export type DurableOutboxRecord<T = unknown> = {
  id: string;
  channel: 'artifact' | 'learner-state';
  scope: string;
  logicalKey: string;
  revision: string;
  payload: T;
  updatedAt: string;
};

const DATABASE_NAME = 'vertexed-recovery-v1';
const STORE_NAME = 'outbox';

function recordId(channel: DurableOutboxRecord['channel'], scope: string, logicalKey: string) {
  return JSON.stringify([channel, scope, logicalKey]);
}

function openDatabase(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) database.createObjectStore(STORE_NAME, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
    request.onblocked = () => resolve(null);
  });
}

export async function putDurableOutboxRecord<T>(
  record: Omit<DurableOutboxRecord<T>, 'id'>,
): Promise<boolean> {
  const database = await openDatabase();
  if (!database) return false;
  return new Promise((resolve) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put({
      ...record,
      id: recordId(record.channel, record.scope, record.logicalKey),
    });
    transaction.oncomplete = () => { database.close(); resolve(true); };
    transaction.onerror = () => { database.close(); resolve(false); };
    transaction.onabort = () => { database.close(); resolve(false); };
  });
}

export async function listDurableOutboxRecords<T>(
  channel: DurableOutboxRecord['channel'],
  scope: string,
): Promise<Array<DurableOutboxRecord<T>>> {
  const database = await openDatabase();
  if (!database) return [];
  return new Promise((resolve) => {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const request = transaction.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve((request.result as Array<DurableOutboxRecord<T>>)
      .filter((record) => record.channel === channel && record.scope === scope));
    request.onerror = () => resolve([]);
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => database.close();
    transaction.onabort = () => database.close();
  });
}

export async function deleteDurableOutboxRecord(
  channel: DurableOutboxRecord['channel'],
  scope: string,
  logicalKey: string,
  revision?: string,
): Promise<boolean> {
  const database = await openDatabase();
  if (!database) return false;
  return new Promise((resolve) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const id = recordId(channel, scope, logicalKey);
    const request = store.get(id);
    request.onsuccess = () => {
      const current = request.result as DurableOutboxRecord | undefined;
      if (current && (!revision || current.revision === revision)) store.delete(id);
    };
    request.onerror = () => transaction.abort();
    transaction.oncomplete = () => { database.close(); resolve(true); };
    transaction.onerror = () => { database.close(); resolve(false); };
    transaction.onabort = () => { database.close(); resolve(false); };
  });
}
