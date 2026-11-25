/* AeroSafety Case — minimal app-shell service worker.
   Caches the app shell (HTML, manifest, icons) for faster repeat loads and
   basic offline access to the UI. Map tiles and the Leaflet library are
   intentionally left to the network (cache-first would risk stale map data
   and the providers are external/cross-origin). */

const CACHE_NAME = 'aerosafety-case-shell-v1';
const SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-48.png',
  './icons/icon-96.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Only manage same-origin app-shell requests; let everything else (map tiles,
  // Leaflet CDN, address search) go straight to the network as usual.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return response;
      }).catch(() => cached);
    })
  );
});
