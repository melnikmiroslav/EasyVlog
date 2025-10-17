const CACHE_NAME = 'easyvlog-v3';
const STATIC_CACHE = 'easyvlog-static-v3';
const DYNAMIC_CACHE = 'easyvlog-dynamic-v3';
const VIDEO_CACHE = 'easyvlog-video-v3';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

const MAX_DYNAMIC_CACHE_SIZE = 50;
const MAX_VIDEO_CACHE_SIZE = 10;

const limitCacheSize = (name, size) => {
  caches.open(name).then(cache => {
    cache.keys().then(keys => {
      if (keys.length > size) {
        cache.delete(keys[0]).then(() => limitCacheSize(name, size));
      }
    });
  });
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [STATIC_CACHE, DYNAMIC_CACHE, VIDEO_CACHE];
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheWhitelist.includes(cacheName)) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return;
  }

  if (url.pathname.includes('/api/') || url.pathname.includes('/functions/')) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return new Response(
            JSON.stringify({ error: 'Offline', message: 'No internet connection' }),
            { headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
    return;
  }

  if (request.destination === 'video') {
    event.respondWith(
      caches.open(VIDEO_CACHE)
        .then(cache => {
          return cache.match(request)
            .then(response => {
              if (response) {
                return response;
              }
              return fetch(request)
                .then(fetchResponse => {
                  if (fetchResponse && fetchResponse.status === 200) {
                    cache.put(request, fetchResponse.clone());
                    limitCacheSize(VIDEO_CACHE, MAX_VIDEO_CACHE_SIZE);
                  }
                  return fetchResponse;
                });
            });
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response;
        }

        return fetch(request)
          .then((fetchResponse) => {
            if (!fetchResponse || fetchResponse.status !== 200) {
              return fetchResponse;
            }

            const shouldCache =
              url.origin === location.origin ||
              request.destination === 'image' ||
              request.destination === 'style' ||
              request.destination === 'script';

            if (shouldCache) {
              const responseToCache = fetchResponse.clone();
              caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                  cache.put(request, responseToCache);
                  limitCacheSize(DYNAMIC_CACHE, MAX_DYNAMIC_CACHE_SIZE);
                });
            }

            return fetchResponse;
          })
          .catch(() => {
            if (request.destination === 'document') {
              return caches.match('/offline.html');
            }
          });
      })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'EasyVlog';
  const options = {
    body: data.body || 'У вас новое уведомление',
    icon: '/icon-192.png',
    badge: '/icon-96.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'notification',
    requireInteraction: false,
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});
