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
  isPlatformPlausible,
  resetPlatformOrigin
} from 'core/Utils/getPlatformOrigin'

const UA = {
  desktop: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  mac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  android: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  androidTv: 'Mozilla/5.0 (Linux; Android 11; BRAVIA 4K GB) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36',
  fireTv: 'Mozilla/5.0 (Linux; Android 9; AFTMM Build/PS7233) AppleWebKit/537.36 (KHTML, like Gecko) Silk/100.0 like Chrome/100.0.0.0 Safari/537.36',
  tizen: 'Mozilla/5.0 (SMART-TV; Linux; Tizen 6.0) AppleWebKit/537.36 (KHTML, like Gecko) 76.0.3809.146/6.0 TV Safari/537.36',
  webos: 'Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.79 Safari/537.36 WebAppManager',
  netcast: 'Mozilla/5.0 (X11; Linux) AppleWebKit/537.31 (KHTML, like Gecko) Safari/537.31 NetCast.TV-2013',
  iphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  ipad: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
}

const setDevice = ({ userAgent = UA.desktop, maxTouchPoints = 0, platform = 'Win32' } = {}) => {
  Object.defineProperty(window.navigator, 'userAgent', { value: userAgent, configurable: true })
  Object.defineProperty(window.navigator, 'maxTouchPoints', { value: maxTouchPoints, configurable: true })
  Object.defineProperty(window.navigator, 'platform', { value: platform, configurable: true })
}

const resetDevice = () => {
  delete window.navigator.userAgent
  delete window.navigator.maxTouchPoints
  delete window.navigator.platform
}

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
  setDevice()
})

afterEach(() => {
  resetDevice()
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

describe('isPlatformPlausible (pure)', () => {
  const device = (userAgent, extra = {}) => ({ userAgent, maxTouchPoints: 0, navigatorPlatform: 'Win32', ...extra })

  it.each(['web', 'pwa-web'])('"%s" is plausible on any device', (platform) => {
    expect(isPlatformPlausible(platform, device(UA.desktop))).toBe(true)
    expect(isPlatformPlausible(platform, device(UA.tizen))).toBe(true)
    expect(isPlatformPlausible(platform, device(''))).toBe(true)
  })

  it.each(['android', 'android-tv', 'fire-tv'])('"%s" needs an Android user agent', (platform) => {
    expect(isPlatformPlausible(platform, device(UA.android))).toBe(true)
    expect(isPlatformPlausible(platform, device(UA.androidTv))).toBe(true)
    expect(isPlatformPlausible(platform, device(UA.fireTv))).toBe(true)
    expect(isPlatformPlausible(platform, device(UA.desktop))).toBe(false)
    expect(isPlatformPlausible(platform, device(UA.iphone))).toBe(false)
    expect(isPlatformPlausible(platform, device(UA.tizen))).toBe(false)
  })

  it('"samsung-tv" needs Tizen or SMART-TV', () => {
    expect(isPlatformPlausible('samsung-tv', device(UA.tizen))).toBe(true)
    expect(isPlatformPlausible('samsung-tv', device('Mozilla/5.0 (SMART-TV; Linux)'))).toBe(true)
    expect(isPlatformPlausible('samsung-tv', device(UA.desktop))).toBe(false)
    expect(isPlatformPlausible('samsung-tv', device(UA.webos))).toBe(false)
  })

  it('"lg-tv" needs Web0S, webOS or NetCast', () => {
    expect(isPlatformPlausible('lg-tv', device(UA.webos))).toBe(true)
    expect(isPlatformPlausible('lg-tv', device('Mozilla/5.0 (Linux) webOS.TV-2021'))).toBe(true)
    expect(isPlatformPlausible('lg-tv', device(UA.netcast))).toBe(true)
    expect(isPlatformPlausible('lg-tv', device(UA.desktop))).toBe(false)
    expect(isPlatformPlausible('lg-tv', device(UA.tizen))).toBe(false)
  })

  it('"ios" needs an iPhone, iPad, iPod or an iPadOS desktop-class device', () => {
    expect(isPlatformPlausible('ios', device(UA.iphone))).toBe(true)
    expect(isPlatformPlausible('ios', device(UA.ipad))).toBe(true)
    expect(isPlatformPlausible('ios', device('Mozilla/5.0 (iPod touch; CPU iPhone OS 12_0)'))).toBe(true)
    expect(isPlatformPlausible('ios', device(UA.mac, { navigatorPlatform: 'MacIntel', maxTouchPoints: 5 }))).toBe(true)
    expect(isPlatformPlausible('ios', device(UA.mac, { navigatorPlatform: 'MacIntel', maxTouchPoints: 0 }))).toBe(false)
    expect(isPlatformPlausible('ios', device(UA.desktop))).toBe(false)
    expect(isPlatformPlausible('ios', device(UA.android))).toBe(false)
  })

  it('is case-insensitive on the user agent and normalizes the platform value', () => {
    expect(isPlatformPlausible('android', device('mozilla/5.0 (linux; ANDROID 13)'))).toBe(true)
    expect(isPlatformPlausible('lg-tv', device('mozilla/5.0 (WEB0S; linux)'))).toBe(true)
    expect(isPlatformPlausible('samsung-tv', device('mozilla/5.0 (smart-tv; linux; tizen 6.0)'))).toBe(true)
    expect(isPlatformPlausible('  Android ', device(UA.android))).toBe(true)
  })

  it('rejects unknown or non-string platforms', () => {
    expect(isPlatformPlausible('windows-phone', device(UA.android))).toBe(false)
    expect(isPlatformPlausible(undefined, device(UA.android))).toBe(false)
    expect(isPlatformPlausible(null, device(UA.android))).toBe(false)
  })

  it('does not throw without device info', () => {
    expect(isPlatformPlausible('android')).toBe(false)
    expect(isPlatformPlausible('web')).toBe(true)
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
    setDevice({ userAgent: UA.android })
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
    setDevice({ userAgent: UA.tizen })
    setUrl(`/?${PLATFORM_QUERY_PARAM}=samsung-tv`)
    initPlatformOrigin()
    setUrl('/radio')
    resetPlatformOrigin()
    expect(initPlatformOrigin()).toMatchObject({ platform: 'samsung-tv', source: 'session' })
  })

  it('a new launch URL overrides the stored value', () => {
    setDevice({ userAgent: UA.android })
    setUrl(`/?${PLATFORM_QUERY_PARAM}=android`)
    initPlatformOrigin()
    resetPlatformOrigin()
    setUrl(`/?${PLATFORM_QUERY_PARAM}=fire-tv`)
    expect(initPlatformOrigin().platform).toBe('fire-tv')
    expect(window.sessionStorage.getItem(PLATFORM_SESSION_KEY)).toBe('fire-tv')
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
    setDevice({ userAgent: UA.android })
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

  describe('self-healing against the device', () => {
    it('discards and removes a stored android platform on a desktop user agent', () => {
      window.sessionStorage.setItem(PLATFORM_SESSION_KEY, 'android')
      expect(initPlatformOrigin()).toEqual({ platform: 'web', source: 'default' })
      expect(window.sessionStorage.getItem(PLATFORM_SESSION_KEY)).toBeNull()
    })

    it('a plain refresh after a desktop simulation returns to web', () => {
      setUrl(`/?${PLATFORM_QUERY_PARAM}=android`)
      expect(initPlatformOrigin().platform).toBe('android')
      setUrl('/')
      resetPlatformOrigin()
      expect(initPlatformOrigin().platform).toBe('web')
    })

    it('keeps a stored android platform on an Android user agent', () => {
      setDevice({ userAgent: UA.android })
      window.sessionStorage.setItem(PLATFORM_SESSION_KEY, 'android')
      expect(initPlatformOrigin()).toEqual({ platform: 'android', source: 'session' })
      expect(window.sessionStorage.getItem(PLATFORM_SESSION_KEY)).toBe('android')
    })

    it('removes a stored value that is not a known platform', () => {
      window.sessionStorage.setItem(PLATFORM_SESSION_KEY, 'toaster')
      expect(initPlatformOrigin().platform).toBe('web')
      expect(window.sessionStorage.getItem(PLATFORM_SESSION_KEY)).toBeNull()
    })

    it('keeps a stored web platform', () => {
      window.sessionStorage.setItem(PLATFORM_SESSION_KEY, 'web')
      expect(initPlatformOrigin()).toEqual({ platform: 'web', source: 'session' })
      expect(window.sessionStorage.getItem(PLATFORM_SESSION_KEY)).toBe('web')
    })

    it('falls back to standalone detection once the stale value is discarded', () => {
      window.sessionStorage.setItem(PLATFORM_SESSION_KEY, 'android')
      setStandalone(true)
      expect(initPlatformOrigin()).toMatchObject({ platform: 'pwa-web', source: 'standalone' })
    })

    it.each([
      ['android', 'android', 'desktop'],
      ['android-tv', 'androidTv', 'desktop'],
      ['fire-tv', 'fireTv', 'desktop'],
      ['samsung-tv', 'tizen', 'desktop'],
      ['lg-tv', 'webos', 'desktop'],
      ['lg-tv', 'netcast', 'android'],
      ['ios', 'iphone', 'desktop'],
      ['ios', 'ipad', 'android']
    ])('%s: stored on a matching user agent is kept, on a mismatching one is removed', (platform, matching, mismatching) => {
      setDevice({ userAgent: UA[matching] })
      window.sessionStorage.setItem(PLATFORM_SESSION_KEY, platform)
      expect(initPlatformOrigin()).toEqual({ platform, source: 'session' })
      expect(window.sessionStorage.getItem(PLATFORM_SESSION_KEY)).toBe(platform)

      resetPlatformOrigin()
      setDevice({ userAgent: UA[mismatching] })
      expect(initPlatformOrigin().platform).toBe('web')
      expect(window.sessionStorage.getItem(PLATFORM_SESSION_KEY)).toBeNull()
    })

    it('honors an iPadOS desktop-class device for ios', () => {
      setDevice({ userAgent: UA.mac, platform: 'MacIntel', maxTouchPoints: 5 })
      window.sessionStorage.setItem(PLATFORM_SESSION_KEY, 'ios')
      expect(initPlatformOrigin().platform).toBe('ios')
    })

    it('honors the query parameter on a mismatching device but does not persist it', () => {
      setUrl(`/?${PLATFORM_QUERY_PARAM}=android`)
      expect(initPlatformOrigin()).toEqual({ platform: 'android', source: 'query' })
      expect(window.sessionStorage.getItem(PLATFORM_SESSION_KEY)).toBeNull()
    })

    it.each([
      ['android', 'android'],
      ['android-tv', 'androidTv'],
      ['fire-tv', 'fireTv'],
      ['samsung-tv', 'tizen'],
      ['lg-tv', 'webos'],
      ['ios', 'iphone']
    ])('persists the %s query parameter on a matching device', (platform, ua) => {
      setDevice({ userAgent: UA[ua] })
      setUrl(`/?${PLATFORM_QUERY_PARAM}=${platform}`)
      expect(initPlatformOrigin().platform).toBe(platform)
      expect(window.sessionStorage.getItem(PLATFORM_SESSION_KEY)).toBe(platform)
    })

    it('a query parameter that does not fit the device replaces a stale stored value without keeping it', () => {
      window.sessionStorage.setItem(PLATFORM_SESSION_KEY, 'android')
      setUrl(`/?${PLATFORM_QUERY_PARAM}=lg-tv`)
      expect(initPlatformOrigin().platform).toBe('lg-tv')
      expect(window.sessionStorage.getItem(PLATFORM_SESSION_KEY)).toBeNull()
    })

    it('honors the referrer signal on a desktop but does not persist it', () => {
      setReferrer('android-app://com.example.twa')
      expect(initPlatformOrigin()).toMatchObject({ platform: 'android', source: 'referrer' })
      expect(window.sessionStorage.getItem(PLATFORM_SESSION_KEY)).toBeNull()
    })

    it('keeps the in-memory value across SPA navigation', () => {
      setUrl(`/?${PLATFORM_QUERY_PARAM}=android`)
      initPlatformOrigin()
      setUrl('/tv')
      expect(getPlatformOrigin()).toBe('android')
    })

    it('never throws when the session removal fails', () => {
      window.sessionStorage.setItem(PLATFORM_SESSION_KEY, 'android')
      jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => { throw new Error('denied') })
      expect(() => initPlatformOrigin()).not.toThrow()
      expect(getPlatformOrigin()).toBe('web')
    })
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
