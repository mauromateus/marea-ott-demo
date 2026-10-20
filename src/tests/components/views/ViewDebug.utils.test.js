import formatReport from 'components/views/ViewDebug/utils/formatReport'
import collectDiagnostics from 'components/views/ViewDebug/utils/collectDiagnostics'
import { resetPlatformOrigin, initPlatformOrigin } from 'core/Utils/getPlatformOrigin'
import marea from '../../../../public/config/marea.json'

describe('collectDiagnostics', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
    window.history.pushState({}, '', '/debug?ms_platform=android-tv')
    window.matchMedia = () => ({ matches: false, addListener () {}, removeListener () {} })
    resetPlatformOrigin()
    initPlatformOrigin()
  })

  it('reports the resolved platform and the analytics appName selected for it', () => {
    const d = collectDiagnostics({ config: marea, platformDetails: { platform: 'android-tv', source: 'query' } })
    expect(d.platform).toBe('android-tv')
    expect(d.platformSource).toBe('query')
    expect(d.analyticsAppName).toBe('marea-android-tv')
  })

  it('reports display mode, referrer, user agent, connectivity and service worker state', () => {
    const d = collectDiagnostics({ config: marea, platformDetails: { platform: 'web', source: 'default' }, online: true })
    expect(d.displayMode).toBe('browser')
    expect(d).toHaveProperty('referrer')
    expect(d.userAgent).toBe(window.navigator.userAgent)
    expect(d.online).toBe(true)
    expect(['yes', 'no', 'not supported']).toContain(d.serviceWorkerControlling)
  })

  it('reports the launch query string and the stored session value on a matching device', () => {
    Object.defineProperty(window.navigator, 'userAgent', { value: 'Mozilla/5.0 (Linux; Android 11; BRAVIA 4K GB)', configurable: true })
    try {
      resetPlatformOrigin()
      initPlatformOrigin()
      const d = collectDiagnostics({ config: marea, platformDetails: { platform: 'android-tv', source: 'query' } })
      expect(d.launchQuery).toBe('?ms_platform=android-tv')
      expect(d.sessionPlatform).toBe('android-tv')
    } finally {
      delete window.navigator.userAgent
    }
  })

  it('reports no stored platform when the launch value does not fit the device', () => {
    const d = collectDiagnostics({ config: marea, platformDetails: { platform: 'android-tv', source: 'query' } })
    expect(d.launchQuery).toBe('?ms_platform=android-tv')
    expect(d.sessionPlatform).toBe('')
  })
})

describe('formatReport', () => {
  const diagnostics = {
    platform: 'android',
    platformSource: 'referrer',
    analyticsAppName: 'marea-pwa-android',
    appVersion: '0.1.0',
    displayMode: 'standalone',
    referrer: 'android-app://com.example.twa',
    userAgent: 'UA/1.0',
    serviceWorkerControlling: 'yes',
    online: false,
    launchQuery: '',
    sessionPlatform: 'android',
    url: 'https://marea.test/debug',
    viewport: '360x640 @3x',
    generatedAt: '2025-01-01T00:00:00.000Z'
  }
  const events = [
    { at: Date.UTC(2025, 0, 1, 0, 0, 5), payload: { event: 'ms_event_page_view', ms_platform_origin: 'android' } },
    { at: Date.UTC(2025, 0, 1, 0, 0, 9), payload: { event: 'ms_event_video_start', ms_platform_origin: 'android' } }
  ]
  const report = formatReport(diagnostics, events)

  it('is plain text with one labelled line per diagnostic', () => {
    expect(report).toContain('Plataforma resuelta: android (referrer)')
    expect(report).toContain('appName de analítica: marea-pwa-android')
    expect(report).toContain('Modo de pantalla (display-mode): standalone')
    expect(report).toContain('document.referrer: android-app://com.example.twa')
    expect(report).toContain('userAgent: UA/1.0')
    expect(report).toContain('El service worker controla la página: sí')
    expect(report).toContain('En línea: no')
  })

  it('shows an empty referrer explicitly', () => {
    expect(formatReport({ ...diagnostics, referrer: '' }, [])).toContain('document.referrer: (vacío)')
  })

  it('lists the events with their timestamps, newest first', () => {
    expect(report).toContain('Eventos de dataLayer (últimos 2)')
    const first = report.indexOf('ms_event_video_start')
    const second = report.indexOf('ms_event_page_view')
    expect(first).toBeGreaterThan(-1)
    expect(first).toBeLessThan(second)
    expect(report).toContain('2025-01-01T00:00:09.000Z')
  })

  it('handles no events', () => {
    expect(formatReport(diagnostics, [])).toContain('Eventos de dataLayer (últimos 0)')
  })
})
