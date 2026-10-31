// sw.js
// Progressive Web App Service Worker for inc-engine
// Provides offline capability, asset caching, and standalone PWA installation

const CACHE_NAME = 'inc-engine-v3';

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './src/ui/app.js',
  './src/games/index.js',
  './src/games/dyson-swarm.js',
  './src/games/aetherforge.js',
  './src/games/sunken-observatory.js',
  './src/engine/bignum.js',
  './src/engine/core.js',
  './src/engine/formulas.js',
  './src/engine/policies.js',
  './src/engine/simulator.js',
  './src/session/session.js',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/bg-dyson-swarm.jpg',
  './assets/bg-aetherforge.jpg',
  './assets/bg-sunken-observatory.jpg',
  './assets/panel-dyson-swarm.jpg',
  './assets/panel-aetherforge.jpg',
  './assets/panel-sunken-observatory.jpg',
  './assets/portrait-dyson.jpg',
  './assets/portrait-aetherforge.jpg',
  './assets/portrait-sunken.jpg',
  './assets/prestige-dyson.jpg',
  './assets/prestige-aetherforge.jpg',
  './assets/prestige-sunken.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Handle same-origin requests or Google Fonts
  if (url.origin === self.location.origin || url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Fetch updated version in background to refresh cache
          fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
          }).catch(() => {
            // Network failure is expected when offline; cache serves request
          });
          return cachedResponse;
        }

        // Cache miss: fetch from network and store
        return fetch(event.request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        }).catch(() => {
          // If offline and requesting navigation, return index.html
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
    );
  }
});
