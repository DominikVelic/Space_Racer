self.addEventListener('install', function(event) {
    event.waitUntil(
      caches.open('WEBTE-hra').then(function(cache) {
        return cache.addAll([
          '/',
          '/index.html',
          '/main.js',
          '/main.css',
          '/manifest.json',
          '/levels.json',
          '/img/meteor.png',
          '/img/rocket.png',
          '/img/space.png',
          '/space-mission-font/SpaceMission-rgyw9.otf',
        ]);
      })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
      fetch(event.request).catch(function() {
        return caches.match(event.request);
      })
    );
});
  