// ═══════════════════════════════════════
//  praxisveto — Service Worker
//  Cache offline · PWA
// ═══════════════════════════════════════

const CACHE_NAME = 'praxisveto-v1';

const CACHE_FILES = [
  './',
  './index.html',
  './manifest.json',
  './PraxisVeto-icon.svg',
  './PraxisVeto-Diabete-Canin.html',
];

// Installation — mise en cache
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(CACHE_FILES);
    })
  );
  self.skipWaiting();
});

// Activation — nettoyage anciens caches
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Fetch — cache first, réseau en fallback
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request).catch(function() {
        return caches.match('./index.html');
      });
    })
  );
});
