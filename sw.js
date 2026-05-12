// FieldKit Service Worker — Full Offline Support
const CACHE = 'fieldkit-v1';
const ASSETS = [
  './',
  './index.html',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Network-first for API calls, cache-first for app shell
  if(e.request.url.includes('/api/')) {
    e.respondWith(
      fetch(e.request).catch(() =>
        new Response(JSON.stringify({error:'offline'}), {headers:{'Content-Type':'application/json'}})
      )
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(cached => cached ||
        fetch(e.request).then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
          return res;
        }).catch(() => caches.match('./index.html'))
      )
    );
  }
});

// Background sync when connection restores
self.addEventListener('sync', e => {
  if(e.tag === 'fieldkit-sync') {
    e.waitUntil(
      self.clients.matchAll().then(clients =>
        clients.forEach(c => c.postMessage({type:'sync-trigger'}))
      )
    );
  }
});
