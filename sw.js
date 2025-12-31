const CACHE_NAME = "arctic-time-truckers-v1.1.0";

const FILES_TO_CACHE = [
  "/index.html",
  "/tailwind.css",
  "/favicon.ico", 
  "/favicon.png", 
  "/LICENSE", 
  "/manifest.json", 
  "/README.md",

  "/js/app.js",
  "/js/components.js",
  "/js/localDB.js",
  "/js/pages.js",
  "/js/sw.js",
  "/js/translations.js",
  "/js/utils.js",

  "/assets/1-pringles-ice-road-specialist.jpg ",
  "/assets/2-aurora-purple-navigator.jpg",
  "/assets/3-fluffy-snow-specialist.jpg   ",
  "/assets/4-gray-night-professional.jpg",
  "/assets/5-skittles-siamese-compass.jpg ",
  "/assets/6-orange-tabby-junior-driver.jpg",
  "/assets/7-maine-coon-northern-expert.jpg ",
  "/assets/8-tuxedo-long-haul-professional.jpg",
  "/assets/arctic_diner.jpg ",
  "/assets/arctic_time_trucking_screenshot.jpg",
  "/assets/cat_truck_stop.jpg",
  "/assets/icon-192.png",
  "/assets/pringles.jpg",
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request)
        .then(response => {
          if (
            response &&
            response.status === 200 &&
            response.type === "basic"
          ) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match("/index.html"));
    })
  );
});
