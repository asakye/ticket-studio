// 票根工坊 Service Worker：让工具可以离线使用、安装到手机桌面
const CACHE = "ticket-studio-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./ticket.html",
  "./grid.html",
  "./compress.html",
  "./css/style.css",
  "./js/config.js",
  "./js/common.js",
  "./js/ticket.js",
  "./js/grid.js",
  "./js/compress.js",
  "./manifest.webmanifest",
  "./assets/icon.svg",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((cache) => cache.put(e.request, copy));
      return res;
    }))
  );
});
