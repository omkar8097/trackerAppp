const CACHE_NAME = 'expenseflow-v3';

// Install Event - Pre-cache core shell using relative paths
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching relative app shell assets');
      return cache.addAll([
        './',
        './index.html',
        './manifest.json',
        './favicon.svg',
        './pwa-192x192.svg',
        './pwa-512x512.svg'
      ]);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up stale v1 caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Dynamic relative caching
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Ignore non-http schemes
  if (!url.protocol.startsWith('http')) return;

  // Navigation requests: Network first, fallback to relative cached index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => {
          return caches.match('./index.html') || caches.match(request);
        })
    );
    return;
  }

  // Static assets: Stale-while-revalidate strategy
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
          }
          return networkResponse;
        })
        .catch(() => {
          // Swallow network error for cached assets
        });

      return cachedResponse || fetchPromise;
    })
  );
});
