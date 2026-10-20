// Tracks a waiting service worker so the UI can offer a refresh (the "update flow").
export class ServiceWorkerService {
  constructor ({ container, reload } = {}) {
    this.registration = null
    this.listeners = new Set()
    this.container = container
    this.reload = reload || (() => window.location.reload())
  }

  getContainer () {
    return this.container || (typeof navigator !== 'undefined' ? navigator.serviceWorker : undefined)
  }

  setRegistration (registration) {
    this.registration = registration
    this.listeners.forEach((listener) => listener())
  }

  hasUpdate () {
    return !!this.registration?.waiting
  }

  subscribe (listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  applyUpdate () {
    const waiting = this.registration?.waiting
    const container = this.getContainer()
    if (!waiting || !container) {
      return
    }
    // The new worker takes control after SKIP_WAITING; reloading then loads the new assets consistently.
    container.addEventListener('controllerchange', () => this.reload(), { once: true })
    waiting.postMessage({ type: 'SKIP_WAITING' })
  }
}

export default new ServiceWorkerService()
