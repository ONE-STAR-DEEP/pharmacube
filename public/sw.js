const CACHE_NAME = "pharmacube-cache-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  self.clients.claim();

  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

self.addEventListener("fetch", (event) => {

  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Ignore Next.js internals & APIs
  if (
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/api/")
  ) {
    return;
  }

  // Cache static assets only
  const isStaticAsset =
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".jpeg") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".webp") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js");

  if (!isStaticAsset) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {

      if (cached) {
        return cached;
      }

      return fetch(event.request)
        .then((response) => {

          if (!response || response.status !== 200) {
            return response;
          }

          const clone = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });

          return response;
        })
        .catch(() => cached);

    })
  );
});