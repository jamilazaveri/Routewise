const CACHE_NAME = 'routewise-cache-v2.0';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/variables.css?v=3.2',
  './css/base.css?v=3.2',
  './css/wizard.css?v=3.2',
  './css/loader.css?v=3.2',
  './css/results.css?v=3.2',
  './css/responsive.css?v=3.2',
  './css/immersive.css?v=1.0',
  './css/buttons.css?v=1.0',
  './js/config.js',
  './js/state.js',
  './js/api.js',
  './js/wizard.js',
  './js/attraction_images.data.js?v=4.2',
  './js/components.js?v=4.3',
  './js/immersive.js?v=1.0',
  './js/app.js?v=4.3',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('SW: Pre-caching partial failure, will cache on demand:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Always network-first for API requests, health checks, and config.js (prevent serving stale API configuration)
  if (url.pathname.includes('/api/') || url.pathname.includes('/health') || url.pathname.endsWith('config.js')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' }).catch(() => {
        return caches.match(event.request);
      })
    );
    return;
  }

  // Cache-first for static local assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached and update in background (stale-while-revalidate)
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }

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
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});
