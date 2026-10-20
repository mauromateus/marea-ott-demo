import {
  PLATFORMS,
  PLATFORM_QUERY_PARAM,
  PLATFORM_SESSION_KEY,
  resolvePlatform,
  initPlatformOrigin,
  getPlatformOrigin,
  getPlatformDetails,
  getDisplayMode,
  isStandaloneMode,
  resetPlatformOrigin
} from 'core/Utils/getPlatformOrigin'

const setUrl = (url) => window.history.pushState({}, '', url)

const setStandalone = (matches) => {
  window.matchMedia = jest.fn((query) => ({
    matches: query === '(display-mode: standalone)' && matches,
    media: query,
    addListener: () => {},
    removeListener: () => {}
  }))
}

const setReferrer = (value) => {
  Object.defineProperty(document, 'referrer', { value, configurable: true })
}

beforeEach(() => {
  window.sessionStorage.clear()
  window.localStorage.clear()
  setUrl('/')
  setStandalone(false)
  setReferrer('')
  delete window.navigator.standalone
  resetPlatformOrigin()
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('PLATFORMS whitelist', () => {
  it('contains exactly the eight allowed values', () => {
    expect(PLATFORMS).toEqual(['web', 'pwa-web', 'android', 'android-tv', 'fire-tv', 'samsung-tv', 'lg-tv', 'ios'])
  })
})

describe('resolvePlatform (pure)', () => {
  it('defaults to web', () => {
    expect(resolvePlatform({})).toEqual({ platform: 'web', source: 'default', persist: false })
  })

  it.each(PLATFORMS)('accepts "%s" injected by the native shell', (platform) => {
    expect(resolvePlatform({ queryValue: platform })).toEqual({ platform, source: 'query', persist: true })
  })

  it('normalizes case and whitespace of the injected value', () => {
    expect(resolvePlatform({ queryValue: '  Android-TV ' }).platform).toBe('android-tv')
  })

  it('ignores unknown injected values and falls through', () => {
    expect(resolvePlatform({ queryValue: 'windows-phone' }).platform).toBe('web')
    expect(resolvePlatform({ queryValue: 'windows-phone', isStandalone: true }).platform).toBe('pwa-web')
  })

  it('injected value wins over everything else', () => {
    const result = resolvePlatform({
      queryValue: 'lg-tv',
      storedValue: 'android',
      referrer: 'android-app://com.example.twa',
      isStandalone: true,
      useReferrerSignal: true
    })
    expect(result.platform).toBe('lg-tv')
  })

  it('stored session value wins over referrer and standalone', () => {
    const result = resolvePlatform({
      storedValue: 'fire-tv',
      referrer: 'android-app://com.example.twa',
      isStandalone: true,
      useReferrerSignal: true
    })
    expect(result).toEqual({ platform: 'fire-tv', source: 'session', persist: false })
  })

  it('ignores an invalid stored value', () => {
    expect(resolvePlatform({ storedValue: 'garbage' }).platform).toBe('web')
  })

  it('standalone wins over default and is not persisted', () => {
    expect(resolvePlatform({ isStandalone: true })).toEqual({ platform: 'pwa-web', source: 'standalone', persist: false })
  })

  describe('UNCONFIRMED android-app:// referrer signal', () => {
    it('resolves android when enabled and persists it', () => {
      expect(resolvePlatform({ referrer: 'android-app://com.example.twa', useReferrerSignal: true }))
        .toEqual({ platform: 'android', source: 'referrer', persist: true })
    })

    it('wins over standalone because a TWA reports display-mode standalone', () => {
      expect(resolvePlatform({ referrer: 'android-app://com.example.twa', isStandalone: true, useReferrerSignal: true }).platform)
        .toBe('android')
    })

    it('is ignored when disabled', () => {
      expect(resolvePlatform({ referrer: 'android-app://com.example.twa', useReferrerSignal: false }).platform).toBe('web')
    })

    it('is ignored for ordinary referrers', () => {
      expect(resolvePlatform({ referrer: 'https://www.google.com/', useReferrerSignal: true }).platform).toBe('web')
    })
  })
})

describe('display mode helpers', () => {
  it('isStandaloneMode reads display-mode: standalone', () => {
    setStandalone(true)
    expect(isStandaloneMode()).toBe(true)
    expect(getDisplayMode()).toBe('standalone')
  })

  it('isStandaloneMode reads navigator.standalone (iOS)', () => {
    window.navigator.standalone = true
    expect(isStandaloneMode()).toBe(true)
  })

  it('reports browser when nothing matches', () => {
    expect(isStandaloneMode()).toBe(false)
    expect(getDisplayMode()).toBe('browser')
  })

  it('does not throw when matchMedia is missing', () => {
    delete window.matchMedia
    expect(isStandaloneMode()).toBe(false)
  })
})

describe('initPlatformOrigin (browser integration)', () => {
  it('reads the ms_platform query parameter and persists it in sessionStorage only', () => {
    setUrl(`/?${PLATFORM_QUERY_PARAM}=android`)
    expect(initPlatformOrigin()).toMatchObject({ platform: 'android', source: 'query' })
    expect(window.sessionStorage.getItem(PLATFORM_SESSION_KEY)).toBe('android')
    expect(window.localStorage.length).toBe(0)
  })

  it('keeps the platform across route changes (query param disappears)', () => {
    setUrl(`/?${PLATFORM_QUERY_PARAM}=android`)
    initPlatformOrigin()
    setUrl('/tv')
    expect(getPlatformOrigin()).toBe('android')
  })

  it('keeps the platform after a reload of a route without the query param', () => {
    setUrl(`/?${PLATFORM_QUERY_PARAM}=samsung-tv`)
    initPlatformOrigin()
    setUrl('/radio')
    resetPlatformOrigin()
    expect(initPlatformOrigin()).toMatchObject({ platform: 'samsung-tv', source: 'session' })
  })

  it('a new launch URL overrides the stored value', () => {
    setUrl(`/?${PLATFORM_QUERY_PARAM}=android`)
    initPlatformOrigin()
    resetPlatformOrigin()
    setUrl(`/?${PLATFORM_QUERY_PARAM}=ios`)
    expect(initPlatformOrigin().platform).toBe('ios')
  })

  it('ignores an invalid query parameter and persists nothing', () => {
    setUrl(`/?${PLATFORM_QUERY_PARAM}=hacked`)
    expect(initPlatformOrigin().platform).toBe('web')
    expect(window.sessionStorage.getItem(PLATFORM_SESSION_KEY)).toBeNull()
  })

  it('resolves pwa-web in standalone display mode without persisting it', () => {
    setStandalone(true)
    expect(initPlatformOrigin()).toMatchObject({ platform: 'pwa-web', source: 'standalone' })
    expect(window.sessionStorage.getItem(PLATFORM_SESSION_KEY)).toBeNull()
  })

  it('resolves pwa-web through navigator.standalone', () => {
    window.navigator.standalone = true
    expect(initPlatformOrigin().platform).toBe('pwa-web')
  })

  it('a later plain browser visit in the same session is not mislabelled', () => {
    setStandalone(true)
    initPlatformOrigin()
    resetPlatformOrigin()
    setStandalone(false)
    expect(initPlatformOrigin().platform).toBe('web')
  })

  it('defaults to web', () => {
    expect(initPlatformOrigin()).toEqual({ platform: 'web', source: 'default' })
  })

  it('resolves android from an android-app:// referrer on first load and persists it', () => {
    setReferrer('android-app://com.example.twa')
    expect(initPlatformOrigin()).toMatchObject({ platform: 'android', source: 'referrer' })
    expect(window.sessionStorage.getItem(PLATFORM_SESSION_KEY)).toBe('android')
  })

  it('respects useReferrerSignal: false', () => {
    setReferrer('android-app://com.example.twa')
    expect(initPlatformOrigin({ useReferrerSignal: false }).platform).toBe('web')
  })

  it('caches: getPlatformOrigin does not re-resolve after init', () => {
    setUrl(`/?${PLATFORM_QUERY_PARAM}=lg-tv`)
    initPlatformOrigin()
    setUrl('/?ms_platform=ios')
    expect(getPlatformOrigin()).toBe('lg-tv')
  })

  it('getPlatformOrigin resolves lazily when init was never called', () => {
    setUrl(`/?${PLATFORM_QUERY_PARAM}=fire-tv`)
    expect(getPlatformOrigin()).toBe('fire-tv')
    expect(getPlatformDetails().source).toBe('query')
  })

  describe('storage unavailable', () => {
    it('does not throw when setItem/getItem throw', () => {
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('QuotaExceeded') })
      jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('SecurityError') })
      setUrl(`/?${PLATFORM_QUERY_PARAM}=android`)
      expect(() => initPlatformOrigin()).not.toThrow()
      expect(getPlatformOrigin()).toBe('android')
    })

    it('does not throw when window.sessionStorage itself throws', () => {
      const original = Object.getOwnPropertyDescriptor(window, 'sessionStorage')
      Object.defineProperty(window, 'sessionStorage', { configurable: true, get () { throw new Error('denied') } })
      try {
        setUrl(`/?${PLATFORM_QUERY_PARAM}=ios`)
        expect(() => initPlatformOrigin()).not.toThrow()
        expect(getPlatformOrigin()).toBe('ios')
      } finally {
        if (original) Object.defineProperty(window, 'sessionStorage', original)
      }
    })
  })
})
