/**
 * Service Worker - PWA Offline Support & Fast Loading
 * Portal Penilaian Biologi - SMA Negeri 2 Ciamis
 */

const CACHE_NAME = 'nilai-biologi-v1.4';
const STATIC_ASSETS = [
  'index.html',
  'css/global.css',
  'css/auth.css',
  'css/dashboard.css',
  'js/api.js',
  'js/ui.js',
  'siswa/dashboard.html',
  'siswa/nilai.html',
  'siswa/grafik.html',
  'siswa/profil.html',
  'images/logo.png',
  'images/guru.png',
  'images/icon-192.png',
  'images/icon-512.png',
  'images/apple-touch-icon.png',
  'manifest.json'
];

// Install & Cache Core Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const asset of STATIC_ASSETS) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn('PWA cache item skipped:', asset, err);
        }
      }
    })
  );
  self.skipWaiting();
});

// Activate & Purge ALL Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Listen for update message from UI
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch Strategy:
// 1. Google Apps Script / Dynamic APIs -> Always Network (Never Cache)
// 2. HTML Navigation -> Direct Network (Fallback to Cache if Offline)
// 3. Static Assets (CSS, JS, Images) -> Stale-While-Revalidate (Instant load + background refresh)
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Bypass cache for dynamic API endpoints
  if (
    url.includes('script.google.com') ||
    url.includes('script.googleusercontent.com') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  const isHtml = event.request.mode === 'navigate' ||
    (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'));

  if (isHtml) {
    // Direct Network for HTML pages so user always sees the newest layout
    event.respondWith(
      fetch(event.request)
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;

          // Never redirect student to index.html when offline or on network error
          const reqUrl = new URL(event.request.url);
          if (reqUrl.pathname.endsWith('/') || reqUrl.pathname.endsWith('/index.html')) {
            return caches.match('index.html');
          }

          return new Response(
            '<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Offline - Portal Biologi</title><style>body{font-family:sans-serif;background:#0f172a;color:#f8fafc;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;padding:20px;text-align:center;}h2{color:#38bdf8;}button{margin-top:16px;background:#10b981;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-weight:bold;cursor:pointer;}</style></head><body><div><h2>📡 Jaringan Lemah / Terputus</h2><p>Tidak dapat memuat halaman saat ini. Pastikan HP terhubung ke internet.</p><button onclick="window.location.reload()">Coba Muat Ulang</button></div></body></html>',
            {
              status: 503,
              headers: { 'Content-Type': 'text/html;charset=utf-8' }
            }
          );
        })
    );
    return;
  }

  // Stale-While-Revalidate for CSS, JS, Images, Icons
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          // Ignore network errors for background update
        });

      return cachedResponse || fetchPromise;
    })
  );
});

