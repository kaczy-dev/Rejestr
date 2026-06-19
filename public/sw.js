/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const CACHE_NAME = 'ros-blacklist-offline-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/index.css',
  '/src/App.tsx',
  '/src/types.ts',
  '/src/mockData.ts',
  '/src/cryptoUtils.ts',
  '/src/components/DashboardView.tsx',
  '/src/components/AddEntryModal.tsx',
  '/src/components/EntryDetails.tsx',
  '/src/components/InteractiveIncidentMap.tsx',
  '/src/components/NotificationsPanel.tsx',
  '/src/components/SecureChat.tsx',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap'
];

// On service worker installation, pre-cache the static shell and resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching application assets for offline support');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => {
      // Force immediate control over the clients
      return self.skipWaiting();
    })
  );
});

// Activate handler: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch handler: Network-first for code modules/HTML, cache-first for fonts/media
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Focus only on GET requests
  if (event.request.method !== 'GET') return;

  // Decide cache strategy based on destination/URL style
  const isFontOrStaticAsset = 
    event.request.destination === 'font' || 
    requestUrl.hostname.includes('fonts.gstatic.com') ||
    requestUrl.hostname.includes('fonts.googleapis.com') ||
    event.request.destination === 'image';

  if (isFontOrStaticAsset) {
    // Cache First with Network Fallback
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        }).catch(() => {
          // If offline and not in cache, try matching a close variant if possible
          return caches.match('/');
        });
      })
    );
  } else {
    // Network First with Cache Fallback for code assets to stay up to date
    event.respondWith(
      fetch(event.request).then((networkResponse) => {
        // If valid, put it in the cache to keep it fresh
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch((err) => {
        console.warn('[Service Worker] Dynamic asset loading failed, falling back to cache:', event.request.url, err);
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If request fails completely, fallback to root index.html to allow SPA reload
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html') || caches.match('/');
          }
          return new Response('Internet connection is currently unavailable.', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({ 'Content-Type': 'text/plain; charset=utf-8' })
          });
        });
      })
    );
  }
});
