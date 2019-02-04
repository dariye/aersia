module.exports = {
  "swDest": "dist/sw.js",
  "globDirectory": "dist",
  "globPatterns": [
    "**/*.{txt,svg,ico,html,js,json,css,webmanifest}"
  ],
  "clientsClaim": true,
  "skipWaiting": true,
  "runtimeCaching": [{
    "urlPattern": new RegExp(/^https:\/\/fonts\.googleapis\.com/),
    "handler": "staleWhileRevalidate",
    "options": {
      "cacheableResponse": {
        "statuses": [2, 200]
      }
    }
    },
    {
    "urlPattern": new RegExp('^https://*\.aersia\.net/'),
    "handler": "staleWhileRevalidate",
    "options": {
      "cacheableResponse": {
        "statuses": [0, 200]
      }
    }
  }]
}
