const version = '1.1.0'

const files = [
  '/',
  '/index.css',
  '/index.js',
  '/manifest.json',
  '/icons/favicon-16x16.png',
  '/icons/favicon-32x32.png',
  '/icons/android-chrome-192x192.png',
  '/icons/apple-touch-icon.png',
  '/modules/url-state/index.js',
  '/modules/url-state/qs.js',
  '/modules/hyperbind/index.js',
  '/state/index.js',
  '/raw/index.js',
  '/can/index.js',
  '/disconnected/index.js',
  '/disconnected/index.css',
  '/connecting/index.js',
  '/connected/index.js',
  '/connected/index.css',
  '/failure/index.css',
  '/failure/index.js',
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
