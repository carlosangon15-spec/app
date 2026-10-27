// Guarda la app en el teléfono para que abra rápido y funcione sin internet.
// Si cambias algo en la app, sube el número de versión (v1 -> v2) para que los teléfonos se actualicen.
var VERSION = 'la-inmaculada-v2';
var ARCHIVOS = ['./', 'index.html', 'manifest.webmanifest', 'logo.png', 'logo-transparente.png', 'icon-192.png', 'icon-512.png',
  'icon-maskable-512.png', 'apple-touch-icon.png', 'favicon.png', 'la-inmaculada-contacto.vcf'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(ARCHIVOS); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (claves) {
    return Promise.all(claves.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }));
  self.clients.claim();
});

// Primero intenta internet (para tener siempre lo último); si no hay conexión, usa la copia guardada.
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(function (r) {
      var copia = r.clone();
      caches.open(VERSION).then(function (c) { c.put(e.request, copia); });
      return r;
    }).catch(function () {
      return caches.match(e.request, { ignoreSearch: true }).then(function (r) { return r || caches.match('index.html'); });
    })
  );
});
