self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('store').then((cache) => cache.addAll([
      '/blogpost/',
      '/blogpost/index.html',
      '/blogpost/index.js',
      '/blogpost/blogposts.js',
      '/blogpost/fonts/Amiri-Regular.ttf',
      '/blogpost/images/alkulife-blogpost.jpg',
      '/blogpost/images/down.png',
      '/blogpost/images/up.png',
      '/blogpost/images/search.png',
      '/blogpost/images/toc.png',
    ])),
  );
});

self.addEventListener('fetch', (e) => {
  console.log(e.request.url);
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request)),
  );
});
