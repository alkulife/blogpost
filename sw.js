self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('store').then((cache) => cache.addAll([
      '/',
      '/index.html',
      '/index.js',
      '/blogposts.js',
      '/imags/alkulife-blogpost.jpg',
      '/fonts/Amiri-Regular.ttf',
      '/images/down.png',
      '/images/up.png',
      '/images/search.png',
      '/images/toc.png',
    ])),
  );
});

self.addEventListener('fetch', (e) => {
  console.log(e.request.url);
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request)),
  );
});
