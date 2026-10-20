import { getRunningMainBundle } from 'core/Utils/getMainBundleName'

const VERSION_TIMEOUT_MS = 2000

// Tracks a waiting service worker so the UI can offer a refresh (the "update flow").
export class ServiceWorkerService {
  constructor ({ container, reload, MessageChannel: Channel, getRunningVersion, versionTimeoutMs } = {}) {
    this.registration = null
    this.listeners = new Set()
    this.container = container
    this.reload = reload || (() => window.location.reload())
    this.Channel = Channel
    this.getRunningVersion = getRunningVersion || getRunningMainBundle
    this.versionTimeoutMs = versionTimeoutMs || VERSION_TIMEOUT_MS
  }

  // Asks a worker for its main bundle name; resolves null on timeout, error or an old worker without the handler.
  requestWorkerVersion (worker) {
    const Channel = this.Channel || (typeof MessageChannel !== 'undefined' ? MessageChannel : undefined)
    if (!Channel) {
      return Promise.resolve(null)
    }
    return new Promise((resolve) => {
      let timer
      const finish = (version) => {
        clearTimeout(timer)
        resolve(version)
      }
      try {
        const channel = new Channel()
        channel.port1.onmessage = (event) => finish(event.data?.type === 'VERSION' ? event.data.main || null : null)
        timer = setTimeout(() => finish(null), this.versionTimeoutMs)
        worker.postMessage({ type: 'GET_VERSION' }, [channel.port2])
      } catch (error) {
        finish(null)
      }
    })
  }

  // A waiting worker with the same main bundle as the running page is activated silently (no toast, no reload);
  // a different or unknown version keeps the toast, because a tab on old JS may still request old lazy chunks.
  async handleUpdate (registration) {
    const waiting = registration?.waiting
    if (!waiting) {
      return
    }
    const running = this.getRunningVersion()
    const offered = running ? await this.requestWorkerVersion(waiting) : null
    if (running && offered === running) {
      waiting.postMessage({ type: 'SKIP_WAITING' })
      return
    }
    this.setRegistration(registration)
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
