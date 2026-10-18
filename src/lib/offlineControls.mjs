export const OFFLINE_PREFERENCE = 'vertexed:public-offline-enabled';
export function offlineEnabled(host = globalThis) {
  try { return host.localStorage.getItem(OFFLINE_PREFERENCE) !== 'false'; } catch { return true; }
}

export function messageOfflineWorker(worker, type, host = globalThis, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const channel = new host.MessageChannel();
    const timer = host.setTimeout(() => { close(); reject(new Error('Offline storage did not respond. Try again.')); }, timeout);
    function close() { host.clearTimeout(timer); channel.port1.close(); channel.port2.close(); }
    channel.port1.onmessage = event => { close(); if (event.data?.error) reject(new Error(event.data.error)); else resolve(event.data); };
    try { worker.postMessage({ type }, [channel.port2]); } catch (error) { close(); reject(error); }
  });
}

export async function offlineStatus(host = globalThis) {
  if (!host.navigator?.serviceWorker || !host.caches) return { state: 'unsupported' };
  if (!offlineEnabled(host)) return { state: 'disabled' };
  const registration = await host.navigator.serviceWorker.getRegistration('/');
  if (!registration || ![registration.active, registration.waiting, registration.installing].some(worker => worker?.scriptURL === new URL('/sw.js', host.location.origin).href)) return { state: 'missing' };
  if (!registration.active || registration.active.scriptURL !== new URL('/sw.js', host.location.origin).href) return { state: 'downloading' };
  const status = await messageOfflineWorker(registration.active, 'VERTEXED_OFFLINE_STATUS', host);
  return { ...status, state: status.ready ? 'ready' : 'incomplete', updateAvailable: Boolean(registration.waiting), downloading: Boolean(registration.installing) };
}

export async function downloadOffline(host = globalThis) {
  if (!host.navigator?.serviceWorker) throw new Error('Offline storage is unavailable in this browser.');
  if (host.navigator.onLine === false) throw new Error('Connect to the internet before downloading lessons.');
  host.localStorage.setItem(OFFLINE_PREFERENCE, 'true');
  const registration = await host.navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' });
  await registration.update();
  if (registration.active && !registration.installing && !registration.waiting) {
    const status = await messageOfflineWorker(registration.active, 'VERTEXED_OFFLINE_STATUS', host);
    if (!status.ready) await messageOfflineWorker(registration.active, 'VERTEXED_OFFLINE_REPAIR', host, 60000);
  }
  return registration;
}

export async function removeOffline(host = globalThis) {
  // Persist opt-out before touching caches so another tab does not reinstall it.
  host.localStorage.setItem(OFFLINE_PREFERENCE, 'false');
  const registration = await host.navigator.serviceWorker.getRegistration('/');
  if (registration) {
    const ours = worker => worker?.scriptURL === new URL('/sw.js', host.location.origin).href;
    const workers = [registration.active, registration.waiting, registration.installing].filter(ours);
    await Promise.allSettled(workers.map(worker => messageOfflineWorker(worker, 'VERTEXED_OFFLINE_DISABLE', host)));
    if (workers.length) await registration.unregister();
  }
  for (const name of await host.caches.keys()) {
    if (name.startsWith('vertexed-public-v1-')) await host.caches.delete(name);
  }
}
