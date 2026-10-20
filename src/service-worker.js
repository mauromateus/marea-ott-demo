/* eslint-disable no-restricted-globals */
// Workbox InjectManifest entry (react-scripts picks up src/service-worker.js).
import { clientsClaim } from 'workbox-core'
import { ExpirationPlugin } from 'workbox-expiration'
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { StaleWhileRevalidate } from 'workbox-strategies'
import { shouldRuntimeCache, isNavigationFallback } from './core/services/ServiceWorker/cacheRules'
import { createNavigationHandler } from './core/services/ServiceWorker/navigationHandler'
import { PRECACHE_OPTIONS } from './core/services/ServiceWorker/precacheOptions'
import getMainBundleName from './core/Utils/getMainBundleName'

clientsClaim()

// App shell: every asset emitted by the build, except /config/*.json, which is served stale-while-revalidate below
// so that config edits do not wait for a new service worker.
// __WB_MANIFEST must appear once: InjectManifest replaces that single injection point.
const manifest = self.__WB_MANIFEST.filter((entry) => !/\/config\//.test(entry.url))
precacheAndRoute(manifest, PRECACHE_OPTIONS)

// Navigations go to the network first (always the newest shell); the precached shell is the offline fallback.
// Rules in cacheRules.js and navigationHandler.js; the shell lives under PUBLIC_URL.
const SHELL_URL = process.env.PUBLIC_URL + '/index.html'
registerRoute(
  ({ request, url }) => isNavigationFallback({ url, request }),
  createNavigationHandler({
    shellUrl: SHELL_URL,
    fetchFn: (request) => fetch(request),
    fallback: createHandlerBoundToURL(SHELL_URL),
    isOffline: () => self.navigator.onLine === false
  })
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

// Update flow: the page posts SKIP_WAITING when the user accepts the toast (or the versions match, silently).
// GET_VERSION lets the page compare main bundles before deciding to show the toast.
self.addEventListener('message', (event) => {
  if (!event.data) {
    return
  }
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  } else if (event.data.type === 'GET_VERSION' && event.ports && event.ports[0]) {
    event.ports[0].postMessage({ type: 'VERSION', main: getMainBundleName(manifest.map((entry) => entry.url)) })
  }
})
