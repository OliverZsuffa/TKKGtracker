/* TKKGTracker offline support; APP_BASE respects the GitHub Pages subpath. */
const APP_BASE = new URL("./", self.registration.scope).href;
const CACHE_NAME = "tkkgtracker-shell-v1";
const CATALOGUE_URL = new URL("data/episodes.json", APP_BASE).href;
const APP_ENTRY_URL = APP_BASE;

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const essentials = [
      APP_ENTRY_URL,
      new URL("manifest.webmanifest", APP_BASE).href,
      new URL("pwa-icon.svg", APP_BASE).href,
      CATALOGUE_URL,
    ];
    await Promise.all(essentials.map(async (url) => {
      try {
        const response = await fetch(url, { cache: "reload" });
        if (response.ok) await cache.put(url, response);
      } catch {
        // A failed pre-cache must not prevent installation.
      }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter((key) => key.startsWith("tkkgtracker-shell-") && key !== CACHE_NAME)
      .map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.href.startsWith(APP_BASE)) return;

  if (url.href === CATALOGUE_URL || request.mode === "navigate") {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const response = await fetch(request);
        if (response.ok) await cache.put(url.href, response.clone());
        return response;
      } catch {
        const cached = await cache.match(url.href)
          || (request.mode === "navigate" ? await cache.match(APP_ENTRY_URL) : undefined);
        return cached || Response.error();
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    } catch {
      return Response.error();
    }
  })());
});
