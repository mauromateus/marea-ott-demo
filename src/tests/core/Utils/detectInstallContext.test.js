import detectInstallContext, { shouldShowIosInstructions, canShowInstallUi, readInstallContext } from 'core/Utils/detectInstallContext'

const UA = {
  iphoneSafari: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  ipadSafari: 'Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
  macSafari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  androidChrome: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
  desktopChrome: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
}

describe('detectInstallContext', () => {
  it('detects iPhone Safari as iOS, not standalone', () => {
    expect(detectInstallContext({ userAgent: UA.iphoneSafari, platform: 'iPhone', maxTouchPoints: 5 }))
      .toEqual({ isIos: true, isIphone: true, isAndroid: false, isStandalone: false })
  })

  it('detects iPad Safari (iPad UA) as iOS', () => {
    expect(detectInstallContext({ userAgent: UA.ipadSafari, platform: 'iPad', maxTouchPoints: 5 }).isIos).toBe(true)
  })

  it('detects iPadOS desktop-class UA (MacIntel with touch) as iOS', () => {
    expect(detectInstallContext({ userAgent: UA.macSafari, platform: 'MacIntel', maxTouchPoints: 5 }).isIos).toBe(true)
  })

  it('tells an iPhone apart from an iPad, including the desktop-class iPadOS UA', () => {
    expect(detectInstallContext({ userAgent: UA.iphoneSafari, platform: 'iPhone', maxTouchPoints: 5 }).isIphone).toBe(true)
    expect(detectInstallContext({ userAgent: UA.ipadSafari, platform: 'iPad', maxTouchPoints: 5 }).isIphone).toBe(false)
    expect(detectInstallContext({ userAgent: UA.macSafari, platform: 'MacIntel', maxTouchPoints: 5 }).isIphone).toBe(false)
  })

  it('does not treat a real Mac (MacIntel, no touch) as iOS', () => {
    expect(detectInstallContext({ userAgent: UA.macSafari, platform: 'MacIntel', maxTouchPoints: 0 }).isIos).toBe(false)
  })

  it('detects Android Chrome as Android, not iOS', () => {
    expect(detectInstallContext({ userAgent: UA.androidChrome, platform: 'Linux armv8l', maxTouchPoints: 5 }))
      .toEqual({ isIos: false, isIphone: false, isAndroid: true, isStandalone: false })
  })

  it('detects desktop Chrome as neither', () => {
    expect(detectInstallContext({ userAgent: UA.desktopChrome, platform: 'Win32', maxTouchPoints: 0 }))
      .toEqual({ isIos: false, isIphone: false, isAndroid: false, isStandalone: false })
  })

  it('is standalone with navigator.standalone (iOS) or display-mode standalone (others)', () => {
    expect(detectInstallContext({ userAgent: UA.iphoneSafari, platform: 'iPhone', navigatorStandalone: true }).isStandalone).toBe(true)
    expect(detectInstallContext({ userAgent: UA.androidChrome, displayModeStandalone: true }).isStandalone).toBe(true)
  })

  it('tolerates missing input', () => {
    expect(detectInstallContext()).toEqual({ isIos: false, isIphone: false, isAndroid: false, isStandalone: false })
  })
})

describe('shouldShowIosInstructions', () => {
  const iphone = detectInstallContext({ userAgent: UA.iphoneSafari, platform: 'iPhone', maxTouchPoints: 5 })
  const ipadDesktop = detectInstallContext({ userAgent: UA.macSafari, platform: 'MacIntel', maxTouchPoints: 5 })
  const iphoneStandalone = detectInstallContext({ userAgent: UA.iphoneSafari, platform: 'iPhone', navigatorStandalone: true })
  const android = detectInstallContext({ userAgent: UA.androidChrome, platform: 'Linux armv8l', maxTouchPoints: 5 })
  const desktop = detectInstallContext({ userAgent: UA.desktopChrome, platform: 'Win32' })

  it('shows on iPhone and iPadOS desktop-class Safari in a browser tab', () => {
    expect(shouldShowIosInstructions({ context: iphone, platform: 'web' })).toBe(true)
    expect(shouldShowIosInstructions({ context: ipadDesktop, platform: 'web' })).toBe(true)
  })

  it('hides when standalone, even if the resolver was forced to web', () => {
    expect(shouldShowIosInstructions({ context: iphoneStandalone, platform: 'web' })).toBe(false)
  })

  it('hides when the resolved platform is not web (installed PWA, shells)', () => {
    expect(shouldShowIosInstructions({ context: iphone, platform: 'pwa-web' })).toBe(false)
    expect(shouldShowIosInstructions({ context: iphone, platform: 'ios' })).toBe(false)
  })

  it('hides on Android, on the Android TWA shell and on desktop', () => {
    expect(shouldShowIosInstructions({ context: android, platform: 'web' })).toBe(false)
    expect(shouldShowIosInstructions({ context: android, platform: 'android' })).toBe(false)
    expect(shouldShowIosInstructions({ context: desktop, platform: 'web' })).toBe(false)
  })
})

describe('canShowInstallUi', () => {
  it('is true only for the browser platform', () => {
    expect(canShowInstallUi('web')).toBe(true)
    const others = ['pwa-web', 'android', 'ios', 'android-tv', 'lg-tv', undefined]
    others.forEach((platform) => expect(canShowInstallUi(platform)).toBe(false))
  })
})

describe('readInstallContext', () => {
  afterEach(() => {
    jest.restoreAllMocks()
    delete window.navigator.maxTouchPoints
  })

  it('reads the live navigator and display mode', () => {
    jest.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue(UA.iphoneSafari)
    jest.spyOn(window.navigator, 'platform', 'get').mockReturnValue('iPhone')
    Object.defineProperty(window.navigator, 'maxTouchPoints', { value: 5, configurable: true })
    window.matchMedia = (query) => ({ matches: query === '(display-mode: standalone)', addListener () {}, removeListener () {} })
    expect(readInstallContext()).toEqual({ isIos: true, isIphone: true, isAndroid: false, isStandalone: true })
  })
})
