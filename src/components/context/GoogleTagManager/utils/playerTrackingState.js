/**
 * Singleton holding player tracking state outside React, so timeupdate ticks cause no re-renders.
 */
class PlayerTrackingState {
  constructor () {
    this.state = new Map()
  }

  get (key) {
    return this.state.get(key)
  }

  set (key, value) {
    this.state.set(key, value)
  }

  // Scoped per content: audio and video can both have state and must not reset each other.
  delete (key) {
    this.state.delete(key)
  }

  clear () {
    this.state.clear()
  }
}

export default new PlayerTrackingState()
