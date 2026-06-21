// PraxisCare Service Worker v3.0 — 10 modules
const CACHE_NAME = 'praxiscare-v3';
const FILES = [
  './PraxisCare.html',
  './PraxisO2-IFSI.html',
  './PraxisPerf-IFSI.html',
  './PraxisGluco-IFSI.html',
  './PraxisContention-IFSI.html',
  './PraxisAlmanach-IFSI.html',
  './PraxisDouleur-IFSI.html',
  './PraxisConstantes-IFSI.html',
  './PraxisRevision-IFSI.html',
  './PraxisEnvironnement-IFSI.html',
  './PraxisConsultation-IFSI.html',
  './PraxisCare-icon.svg',
  './manifest.json',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Réseau d'abord, cache ensuite — pour toujours avoir la dernière version
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() =>
        caches.match(event.request)
          .then(cached => cached || caches.match('./PraxisCare.html'))
      )
  );
});
