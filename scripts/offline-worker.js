/* global MANIFEST */
// Only build-enumerated public resources enter this cache. Never cache API,
// auth, user uploads, navigation responses, or arbitrary runtime requests.
const worker = globalThis;
const prefix = 'vertexed-public-v1-';
const cacheName = `${prefix}${MANIFEST.version}`;
let disabled = false;
const urls = new Set(MANIFEST.entries.map(entry => new URL(entry.url, worker.location.origin).href));

worker.addEventListener('install', event => {
  event.waitUntil((async () => {
    try {
      const cache = await worker.caches.open(cacheName);
      await cache.addAll(MANIFEST.entries.map(entry => new Request(entry.url, {
        credentials: 'omit', cache: 'reload', redirect: 'error', integrity: entry.integrity,
      })));
      if (disabled) await worker.caches.delete(cacheName);
    } catch (error) {
      await worker.caches.delete(cacheName);
      throw error;
    }
    // No skipWaiting: an update must not replace resources beneath open tabs.
  })());
});

worker.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await worker.caches.keys()) {
      if (name.startsWith(prefix) && name !== cacheName) await worker.caches.delete(name);
    }
    await worker.clients.claim();
  })());
});

worker.addEventListener('fetch', event => {
  if (disabled) return;
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== worker.location.origin
    || request.headers.has('authorization') || url.pathname === '/api' || url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate' && (!url.pathname.split('/').pop().includes('.') || url.pathname === '/index.html')) {
    event.respondWith((async () => {
      const cache = await worker.caches.open(cacheName);
      const shell = await cache.match('/index.html');
      // Keep the HTML and lazy chunks on the same installed version. Updates
      // activate after existing tabs close, rather than mixing two releases.
      return shell || worker.fetch(request);
    })());
  } else if (urls.has(url.href)) {
    event.respondWith((async () => {
      const cache = await worker.caches.open(cacheName);
      return (await cache.match(request)) || worker.fetch(request);
    })());
  }
});

worker.addEventListener('message', event => {
  if (!event.source || !event.ports?.[0]) return;
  if (event.data?.type === 'VERTEXED_OFFLINE_DISABLE') {
    disabled = true;
    event.waitUntil(worker.caches.delete(cacheName).then(() => event.ports[0].postMessage({ disabled: true })));
  } else if (event.data?.type === 'VERTEXED_OFFLINE_REPAIR') {
    event.waitUntil((async () => {
      try {
        disabled = false;
        const cache = await worker.caches.open(cacheName);
        await cache.addAll(MANIFEST.entries.map(entry => new Request(entry.url, {
          credentials: 'omit', cache: 'reload', redirect: 'error', integrity: entry.integrity,
        })));
        if (disabled) { await worker.caches.delete(cacheName); throw new Error('disabled'); }
        event.ports[0].postMessage({ ready: true });
      } catch { event.ports[0].postMessage({ error: 'The offline copy could not be downloaded. Check your connection and available storage, then try again.' }); }
    })());
  } else if (event.data?.type === 'VERTEXED_OFFLINE_STATUS') {
    event.waitUntil((async () => {
      const cache = await worker.caches.open(cacheName);
      const entries = await Promise.all(MANIFEST.entries.map(entry => cache.match(entry.url)));
      const cached = entries.filter(Boolean).length;
      event.ports[0].postMessage({ ready: !disabled && cached === MANIFEST.entries.length, cached, total: MANIFEST.entries.length, version: MANIFEST.version });
    })());
  }
});
