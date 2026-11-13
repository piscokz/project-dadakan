/* ============================================================
   Service Worker — Precache aset inti agar interaksi bebas jeda
   ============================================================ */

const CORE_VERSION = "v3";
const CORE_CACHE = `dadakan-core-${CORE_VERSION}`;
const FONT_CACHE = "dadakan-fonts-v1";
const KEEP_CACHES = new Set([CORE_CACHE, FONT_CACHE]);
const MAX_FONT_ENTRIES = 24;

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./dashboard.html",
  "./book.css?v=3",
  "./book.js?v=3",
  "./dashboard.css?v=2",
  "./rhythm.js?v=3",
  "./cake.svg",
  "./sw-register.js?v=1",
];

function isCacheable(response) {
  return (
    Boolean(response) &&
    response.status === 200 &&
    (response.type === "basic" || response.type === "cors")
  );
}

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  while (keys.length > maxEntries) {
    const oldest = keys.shift();
    if (oldest) await cache.delete(oldest);
  }
}

async function networkFirst(request) {
  const cache = await caches.open(CORE_CACHE);
  try {
    // Gunakan cache: "no-cache" agar HTML terbaru di GitHub Pages melewati cache edge 10 menit.
    const response = await fetch(request.url, { cache: "no-cache" });
    if (isCacheable(response)) {
      await cache.put(request.url, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await cache.match(request.url);
    if (cached) return cached;
    if (new URL(request.url).pathname.endsWith("/")) {
      const indexFallback = await cache.match("./index.html");
      if (indexFallback) return indexFallback;
    }
    throw err;
  }
}

async function cacheFirst(request, cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request.url);
  if (cached) return cached;

  const response = await fetch(request);
  if (isCacheable(response)) {
    await cache.put(request.url, response.clone());
    if (maxEntries) await trimCache(cacheName, maxEntries);
  }
  return response;
}

async function staleWhileRevalidate(request, cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request.url);

  const networkPromise = fetch(request)
    .then(async (response) => {
      if (isCacheable(response)) {
        await cache.put(request.url, response.clone());
        if (maxEntries) await trimCache(cacheName, maxEntries);
      }
      return response;
    })
    .catch(() => null);

  if (cached) return cached;
  const networkResponse = await networkPromise;
  if (networkResponse) return networkResponse;
  return fetch(request);
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CORE_CACHE)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => !KEEP_CACHES.has(key)).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  // Biarkan request Range (mis. streaming bg.mp3 HTTP 206) dan non-GET langsung ke jaringan.
  if (request.method !== "GET" || request.headers.has("range")) return;

  const url = new URL(request.url);
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  if (
    url.origin === "https://fonts.googleapis.com" ||
    url.origin === "https://fonts.gstatic.com"
  ) {
    event.respondWith(staleWhileRevalidate(request, FONT_CACHE, MAX_FONT_ENTRIES));
    return;
  }

  if (url.origin !== self.location.origin) return;
  if (url.pathname.endsWith(".mp3")) return;

  if (
    request.mode === "navigate" ||
    url.pathname.endsWith(".html") ||
    url.pathname.endsWith("/")
  ) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (url.searchParams.has("v") || url.pathname.endsWith(".svg")) {
    event.respondWith(cacheFirst(request, CORE_CACHE));
    return;
  }

  event.respondWith(staleWhileRevalidate(request, CORE_CACHE));
});
