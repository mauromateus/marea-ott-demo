/* eslint-disable no-restricted-globals */
// Workbox InjectManifest entry (react-scripts picks up src/service-worker.js).
import { clientsClaim } from 'workbox-core'
import { ExpirationPlugin } from 'workbox-expiration'
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { StaleWhileRevalidate } from 'workbox-strategies'
import { shouldRuntimeCache, isNavigationFallback } from './core/services/ServiceWorker/cacheRules'

clientsClaim()

// App shell: every asset emitted by the build, except /config/*.json, which is served stale-while-revalidate below
// so that config edits do not wait for a new service worker.
precacheAndRoute(self.__WB_MANIFEST.filter((entry) => !/\/config\//.test(entry.url)))

// SPA navigation fallback to index.html (rules in cacheRules.js; the shell lives under PUBLIC_URL).
registerRoute(
  ({ request, url }) => isNavigationFallback({ url, request }),
  createHandlerBoundToURL(process.env.PUBLIC_URL + '/index.html')
)

// Same-origin images, fonts and config JSON. Player scripts, HLS/DASH manifests, media segments and
// anything on *.mdstrm.com are excluded by shouldRuntimeCache, and no other route matches them,
// so the service worker never intercepts them.
registerRoute(
  ({ url, request }) => shouldRuntimeCache({ url, request, origin: self.location.origin }),
  new StaleWhileRevalidate({
    cacheName: 'marea-runtime',
    plugins: [new ExpirationPlugin({ maxEntries: 60 })]
  })
)

// Update flow: the page posts SKIP_WAITING when the user accepts the refresh toast.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
