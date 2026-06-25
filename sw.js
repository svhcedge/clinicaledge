const CACHE = 'clinicaledge-v1782416958';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  // Install new version immediately without waiting
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  // Delete old caches and take control immediately
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
     .then(() => {
       // Tell all open tabs to reload so they get the new version
       self.clients.matchAll({type:'window'}).then(function(clients){
         clients.forEach(function(client){ client.postMessage({type:'RELOAD'}); });
       });
     })
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.hostname.includes('google') || url.hostname.includes('script.google')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  if (e.request.destination === 'document') {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request)));
});
