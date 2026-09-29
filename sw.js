"use strict";
// Keeps the Morse Light page usable with no signal. The page comes from the network
// when it answers within 3 s (and the copy here is refreshed), else from this cache.
// Requests to other sites, such as the ntfy.sh relay, are left alone.
const CACHE = "morselight-v1";
const FILES = ["./", "./icon-180.png"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", event => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;
  // The message page is one entry however it is addressed (with or without a query);
  // the secret after '#' never reaches here. Other files keep their own entries.
  const page = req.mode === "navigate" && /\/(index\.html)?$/.test(url.pathname);
  event.respondWith(answer(req, page ? "./" : req));
});

async function answer(req, key) {
  const network = fetch(req).then(res => {
    if (res.ok) {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(key, copy));
    }
    return res;
  });
  network.catch(() => {});
  try {
    const first = await Promise.race([network, new Promise(r => setTimeout(r, 3000, null))]);
    if (first) return first;
  } catch (e) {
    // Offline: fall through to the cached copy.
  }
  const cached = await caches.match(key, { ignoreSearch: true });
  return cached || network;
}
