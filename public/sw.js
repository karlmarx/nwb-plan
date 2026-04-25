const CACHE = 'nwb-plan-v7';
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE_URLS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/_next/')) return;

  // Network-first for navigations: a stale HTML shell would reference dead
  // hashed asset URLs after a deploy, breaking the page entirely. Always
  // ask the network for HTML when we can; fall back to cache only offline.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(resp => {
          if (resp && resp.status === 200 && resp.type === 'basic') {
            const clone = resp.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return resp;
        })
        .catch(() => caches.match(e.request).then(c => c || caches.match('/')))
    );
    return;
  }

  // Cache-first for static precached assets (manifest, icons).
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        if (!resp || resp.status !== 200 || resp.type !== 'basic') return resp;
        const clone = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return resp;
      });
    })
  );
});
