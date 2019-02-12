importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.6.1/workbox-sw.js');

if (workbox) {
  console.log(`workbox installed 🔥`)
  /**
   * inject precache from manifest
   */
  workbox.precaching.precacheAndRoute([])

  /**
   * Fonts
   */
  workbox.routing.registerRoute(
    /^https:\/\/fonts\.googleapis\.com/,
    workbox.strategies.staleWhileRevalidate({
      cacheName: 'google-fonts-stylesheets'
    })
  )

  /**
   * Tracks
   */

  // workbox.routing.registerRoute(
  //   /^https:\/\/(.*)\.aersia\.net\(.*)\/(.*)\.m4a/,
  //   workbox.strategies.cacheFirst({
  //     cacheName: 'track-cache',
  //     plugins: [
  //       new workbox.expiration.Plugin({
  //         maxEntries: 21,
  //         maxAgeSeconds: 30 * 24 * 60 * 60
  //       })
  //     ]
  //   })
  // )

} else {
  console.log(`workbox where art though? 😢`)
}

