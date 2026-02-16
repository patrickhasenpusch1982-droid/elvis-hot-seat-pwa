
const CACHE_NAME = "elvis-hot-seat-v6";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./elvis-db.json",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png"
].filter(Boolean);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => (k !== CACHE_NAME) ? caches.delete(k) : null))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Data file: network-first so edits go live immediately.
  if (url.pathname.endsWith("/elvis-db.json") || url.pathname.endsWith("elvis-db.json")) {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // App shell (HTML/JS/CSS): network-first for quicker updates, fallback to cache.
  const isShell = url.pathname.endsWith("/") ||
                  url.pathname.endsWith("/index.html") ||
                  url.pathname.endsWith("index.html") ||
                  url.pathname.endsWith(".js") ||
                  url.pathname.endsWith(".css");

  if (isShell) {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then((c) => c || caches.match("./index.html")))
    );
    return;
  }

  // Everything else: cache-first
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
      return res;
    }).catch(() => caches.match("./index.html")))
  );
});

  // Always try network first for the data file so edits go live immediately.
  if (url.pathname.endsWith("/elvis-db.json") || url.pathname.endsWith("elvis-db.json")) {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // App shell: cache-first
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
      return res;
    }).catch(() => caches.match("./index.html")))
  );
});
      caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
      return res;
    }).catch(() => caches.match("./index.html")))
  );
});
