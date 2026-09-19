const CACHE_NAME = "fairbets-v3";
const APP_ROOT = self.registration.scope;
const APP_SHELL = [
  APP_ROOT,
  new URL("index.html", APP_ROOT).toString(),
  new URL("manifest.webmanifest", APP_ROOT).toString(),
  new URL("app-icon.svg", APP_ROOT).toString(),
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                (key.startsWith("series-ledger-") || key.startsWith("fairbets-")) &&
                key !== CACHE_NAME,
            )
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: "window" }))
      .then((clients) => Promise.all(clients.map((client) => client.navigate(client.url)))),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok && new URL(event.request.url).origin === self.location.origin) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) =>
          cached ?? caches.match(new URL("index.html", APP_ROOT).toString()),
        ),
      ),
  );
});
