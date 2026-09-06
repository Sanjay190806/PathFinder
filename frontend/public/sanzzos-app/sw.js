const CACHE_NAME = 'sanzz_os_cache_v3';
const APP_SHELL = ['/', '/index.html', '/manifest.webmanifest', '/offline'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL).catch(() => undefined))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

function shouldSkipCache(url, request) {
  return (
    url.includes('/api/') ||
    url.includes('/api/auth/') ||
    url.includes('/api/cloud/') ||
    url.includes('/api/sync/') ||
    request.headers.has('authorization') ||
    url.includes('chrome-extension')
  );
}

function isStaticAsset(url) {
  return /\.(js|css|png|svg|webp|woff2?|json|webmanifest)$/i.test(url.pathname);
}

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  if (shouldSkipCache(requestUrl.href, event.request)) {
    return;
  }

  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            if (isStaticAsset(requestUrl) || requestUrl.pathname === '/' || requestUrl.pathname.endsWith('.html')) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
            }
          }
          return networkResponse;
        })
        .catch(async () => {
          if (event.request.mode === 'navigate') {
            const offline = await caches.match('/offline');
            if (offline) return offline;
            const shell = await caches.match('/index.html');
            if (shell) return shell;
          }
          if (cachedResponse) return cachedResponse;
          throw new Error('Offline and asset not cached');
        });

      return cachedResponse || fetchPromise;
    })
  );
});
