export const RING_BUFFER_SIZE = 20

class DataLayerService {
  constructor () {
    this.recent = []
    this.listeners = new Set()
  }

  /**
   * Push event to the data layer (same signature as the real service).
   * @param {object} params
   * @param {string} params.eventName
   * @param {object} [params.params]
   */
  pushEvent ({ eventName, params }) {
    try {
      // Unlike the real service, the layer is created on demand so events work with GTM disabled.
      window.dataLayer = window.dataLayer || []
      const payload = { event: eventName, ...params }
      window.dataLayer.push(payload)
      this._record(payload)
    } catch (err) {
      console.warn('DataLayerService: Error pushing event to dataLayer', err?.message)
    }
  }

  _record (payload) {
    this.recent.push({ at: Date.now(), payload })
    if (this.recent.length > RING_BUFFER_SIZE) {
      this.recent.shift()
    }
    this.listeners.forEach((listener) => listener())
  }

  getRecentEvents () {
    return this.recent.slice()
  }

  clearRecentEvents () {
    this.recent = []
    this.listeners.forEach((listener) => listener())
  }

  subscribe (listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
}

export default new DataLayerService()
