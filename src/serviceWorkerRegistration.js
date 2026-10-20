// Registers the Workbox service worker (production builds only; see src/index.js).
export function register ({ onUpdate } = {}) {
  if (!('serviceWorker' in navigator)) {
    return
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${process.env.PUBLIC_URL}/service-worker.js`)
      .then((registration) => {
        // A worker may already be waiting from a previous visit.
        if (registration.waiting && navigator.serviceWorker.controller) {
          onUpdate?.(registration)
        }

        registration.onupdatefound = () => {
          const installing = registration.installing
          if (!installing) {
            return
          }
          installing.onstatechange = () => {
            // "installed" with an existing controller means an update, not the first install.
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
              onUpdate?.(registration)
            }
          }
        }
      })
      .catch((error) => console.error('Service worker registration failed:', error))
  })
}
