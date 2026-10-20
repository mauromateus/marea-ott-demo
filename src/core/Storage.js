// localStorage wrapper, kept for parity with the real product. Do NOT use it for the platform origin:
// a Trusted Web Activity shares localStorage with Chrome, so a persisted value would leak into browser visits.
class Storage {
  getStore () {
    try {
      return window.localStorage || null
    } catch (e) {
      return null
    }
  }

  setKey (key) {
    this.key = key
  }

  getKey (key) {
    if (this.key === undefined) {
      return key
    }
    if (String(key).includes(this.key)) {
      return key
    }
    return `${this.key}::${key}`
  }

  getItem (key) {
    const store = this.getStore()
    if (!store) {
      return
    }
    key = this.getKey(key)
    try {
      const raw = store.getItem(key)
      try {
        return JSON.parse(raw)
      } catch (e) {
        return raw
      }
    } catch (e) {
      // access denied
    }
  }

  setItem (key, val) {
    const store = this.getStore()
    if (!store) {
      return
    }
    key = this.getKey(key)
    if (val !== null && typeof val === 'object') {
      try {
        val = JSON.stringify(val)
      } catch (e) {}
    }
    try {
      store.setItem(key, val)
    } catch (e) {
      // quota or access denied
    }
  }

  removeItem (key) {
    const store = this.getStore()
    if (!store) {
      return
    }
    key = this.getKey(key)
    try {
      store.removeItem(key)
    } catch (e) {
      // access denied
    }
  }
}

export default new Storage()
