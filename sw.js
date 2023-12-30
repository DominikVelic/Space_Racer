self.addEventListener('install', function(event) {
    event.waitUntil(
      caches.open('WEBTE-hra').then(function(cache) {
        return cache.addAll([
          '/~xvelic/WEBTE-hra/',
          '/~xvelic/WEBTE-hra/index.html',
          '/~xvelic/WEBTE-hra/main.js',
          '/~xvelic/WEBTE-hra/main.css',
          '/~xvelic/WEBTE-hra/manifest.json',
          '/~xvelic/WEBTE-hra/levels.json',
          '/~xvelic/WEBTE-hra/img/meteor.png',
          '/~xvelic/WEBTE-hra/img/rocket.png',
          '/~xvelic/WEBTE-hra/img/space.png',
          '/~xvelic/WEBTE-hra/space-mission-font/SpaceMission-rgyw9.otf',
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
  