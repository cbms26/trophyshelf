// Service worker for the web (PWA) build. Generated into dist-web/sw.js by
// `npm run build:web`. Precaches the app shell so it opens offline; API
// calls (cover analysis, plaques, the Librarian) always go to the network.
module.exports = {
  globDirectory: 'dist-web/',
  // Fonts are left out: every weight of each font package is exported, but
  // only the few the app loads are needed — those get cached on first use.
  globPatterns: ['**/*.{html,js,css,png,jpg,svg,ico,json}'],
  globIgnores: ['sw.js', 'workbox-*.js'],
  maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
  swDest: 'dist-web/sw.js',
  skipWaiting: true,
  clientsClaim: true,
  cleanupOutdatedCaches: true,
  navigateFallback: '/index.html',
  navigateFallbackDenylist: [/^\/api\//, /^\/privacy/, /^\/terms/],
  runtimeCaching: [
    {
      urlPattern: /\.(?:ttf|otf|woff2?)$/,
      handler: 'CacheFirst',
      options: { cacheName: 'fonts', expiration: { maxEntries: 20 } },
    },
  ],
};
