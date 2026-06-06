const CACHE_NAME = 'receptari-v1';

// Recursos a guardar en cache per funcionar offline
const CACHE_URLS = [
  './',
  './index.html',
  './manifest.json'
];

// Instal·lació: guardem els recursos bàsics
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Activació: eliminem caches antics
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch: primer intentem xarxa, si falla servim des de cache
self.addEventListener('fetch', event => {
  // No interceptem peticions a CDNs externs (fonts, icones, libs)
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Guardem còpia fresca a la cache
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
