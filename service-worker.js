// ═══════════════════════════════════════════════════════════
//  Service Worker — SimCare
//  Stratégie : "réseau d'abord, cache en secours"
//  - En ligne  : toujours la version la plus fraîche (réseau),
//                ET on la stocke en cache au passage.
//  - Hors ligne: on sert la dernière version mise en cache.
//
//  IMPORTANT : à chaque mise à jour du contenu de l'app,
//  incrémenter CACHE_VERSION ci-dessous. Sans ça, les anciens
//  fichiers en cache ne seront jamais remplacés par les neufs
//  pour un étudiant qui a déjà visité l'app hors-ligne.
// ═══════════════════════════════════════════════════════════

const CACHE_VERSION = 'simcare-v1';

// Fichiers essentiels précachés dès l'installation, avant même
// que l'étudiant navigue dedans — le "socle" indispensable.
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './praxis-qcm-data.js',
];

// Jamais mis en cache : tout ce qui touche à la vérification de
// code d'accès ou au suivi de temps doit toujours passer par le
// réseau, jamais servir une réponse périmée depuis le cache.
const NEVER_CACHE_HOSTS = [
  'supabase.co',
];

function estExclu(url) {
  return NEVER_CACHE_HOSTS.some(host => url.hostname.includes(host));
}

// ── INSTALLATION : précharge le socle ──
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting(); // active la nouvelle version sans attendre la fermeture des onglets
});

// ── ACTIVATION : nettoie les anciennes versions du cache ──
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((noms) =>
      Promise.all(
        noms
          .filter((nom) => nom !== CACHE_VERSION)
          .map((nom) => caches.delete(nom))
      )
    )
  );
  self.clients.claim();
});

// ── INTERCEPTION DES REQUÊTES ──
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Seules les requêtes GET de notre propre origine sont concernées.
  // Les appels vers Supabase (vérification de code, etc.) passent
  // toujours directement au réseau, sans jamais être mis en cache.
  if (event.request.method !== 'GET' || estExclu(url)) {
    return; // laisse la requête suivre son chemin normal
  }

  event.respondWith(
    fetch(event.request)
      .then((reponseReseau) => {
        // Succès réseau : on met à jour le cache avec cette version fraîche
        const copie = reponseReseau.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, copie));
        return reponseReseau;
      })
      .catch(() => {
        // Échec réseau (hors-ligne) : on sert la version en cache si elle existe
        return caches.match(event.request).then((reponseCache) => {
          if (reponseCache) return reponseCache;
          // Rien en cache non plus : on ne peut rien faire de mieux
          // qu'une réponse d'erreur explicite plutôt qu'un plantage silencieux.
          return new Response(
            'Page non disponible hors connexion pour le moment.',
            { status: 503, statusText: 'Hors ligne', headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
          );
        });
      })
  );
});
