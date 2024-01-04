self.addEventListener('install', function(event) {
    event.waitUntil(
      caches.open('SpaceRacer').then(function(cache) {
        return cache.addAll([
          '/~xvelic/SpaceRacer/',
          '/~xvelic/SpaceRacer/index.html',
          '/~xvelic/SpaceRacer/main.js',
          '/~xvelic/SpaceRacer/main.css',
          '/~xvelic/SpaceRacer/manifest.json',
          '/~xvelic/SpaceRacer/levels.json',
          '/~xvelic/SpaceRacer/img/meteor.png',
          '/~xvelic/SpaceRacer/img/rocket.png',
          '/~xvelic/SpaceRacer/img/space.png',
          '/~xvelic/SpaceRacer/img/rocket_icon.png',
          '/~xvelic/SpaceRacer/space-mission-font/SpaceMission-rgyw9.otf',
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
  