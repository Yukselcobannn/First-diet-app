const CACHE_NAME = 'iyi-beslen-shell-v38';
const APP_FILES = [
  './',
  './index.html',
  './nutrition-data.js?v=20261021.8',
  './gizlilik.html',
  './manifest.webmanifest',
  './app.css?v=20261030.1',
  './app-enhancements.js?v=20261023.5',
  './app-features.js?v=20261030.2',
  './assets/recipes/yogurt-oats.svg',
  './assets/recipes/egg-toast.svg',
  './assets/recipes/chickpea-bulgur.svg',
  './assets/recipes/chicken-bulgur.svg',
  './assets/recipes/lentil-bowl.svg',
  './assets/recipes/tuna-salad.svg',
  './icons/icon-192.svg',
  './icons/icon-512.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_FILES)));
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    const versionedUrl = new URL(request.url);
    versionedUrl.searchParams.set('__appShell', CACHE_NAME);
    const versionedRequest = new Request(versionedUrl.toString(), request);
    event.respondWith(
      fetch(versionedRequest)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      }
      return response;
    }))
  );
});
