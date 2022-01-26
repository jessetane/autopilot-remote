const version = 'v3'

const files = [
  '/',
  '/app/index.css',
  '/app/index.js',
  '/app/connected/index.css',
  '/app/disconnected/index.css',
  '/app/connecting/index.css',
  '/app/failure/index.css',
  '/app/state/index.js',
  '/app/disconnected/index.js',
  '/app/connecting/index.js',
  '/app/connected/index.js',
  '/app/failure/index.js',
  '/modules/url-state/index.js',
  '/app/raw/index.js',
  '/app/can/index.js',
  '/modules/hyperbind/index.js',
  '/modules/url-state/qs.js',
  '/manifest.json',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/android-chrome-192x192.png',
  '/apple-touch-icon.png',
]

class MyWorker {
  async install (evt) {
    const cache = await caches.open(version)
    const r = await cache.addAll(files)
    return r
  }

  async fetch (evt) {
    const cache = await caches.open(version)
    const res = await cache.match(evt.request)
    if (res) return res
    return fetch(evt.request)
  }

  async clearCache () {
    const allCaches = await caches.keys()
    const jobs = allCaches.map(key => key !== version ? caches.delete(key) : null)
    return Promise.all(jobs)
  }
}

const w = new MyWorker()

self.addEventListener('install', evt => {
  evt.waitUntil(w.install(evt))
})

self.addEventListener('activate', evt => {
  evt.waitUntil(w.clearCache())
})

self.addEventListener('fetch', evt => {
  // console.log(new URL(evt.request.url).pathname)
  evt.respondWith(w.fetch(evt))
})
