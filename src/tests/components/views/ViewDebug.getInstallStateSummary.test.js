import getInstallStateSummary from 'components/views/ViewDebug/utils/getInstallStateSummary'
import { SNOOZE_MS } from 'components/common/InstallSheet/utils/isSnoozed'

describe('getInstallStateSummary', () => {
  const now = Date.UTC(2026, 0, 15, 12)
  const ready = { canInstall: true, platform: 'web', storedPlatform: '', dismissedAt: undefined, installedMark: false, now }

  it('is available when the browser offered the install and nothing hides the card', () => {
    expect(getInstallStateSummary(ready)).toEqual({ code: 'available', params: {} })
  })

  it('reports the browser as the cause when it never offered the install', () => {
    expect(getInstallStateSummary({ ...ready, canInstall: false })).toEqual({ code: 'no-offer', params: {} })
  })

  it('reports a snooze with the moment it ends', () => {
    const dismissedAt = now - 1000
    expect(getInstallStateSummary({ ...ready, dismissedAt })).toEqual({ code: 'snoozed', params: { until: dismissedAt + SNOOZE_MS } })
  })

  it('ignores an expired, future or corrupt dismissal', () => {
    ;[now - SNOOZE_MS, now + 5000, 'yesterday', null].forEach((dismissedAt) => {
      expect(getInstallStateSummary({ ...ready, dismissedAt }).code).toBe('available')
    })
  })

  it('reports the installed mark when the browser is not offering the install', () => {
    expect(getInstallStateSummary({ ...ready, canInstall: false, installedMark: true }).code).toBe('hidden-installed')
  })

  it('does not blame a stale installed mark while the browser offers the install', () => {
    expect(getInstallStateSummary({ ...ready, installedMark: true }).code).toBe('available')
    expect(getInstallStateSummary({ ...ready, installedMark: true, dismissedAt: now - 1 }).code).toBe('snoozed')
  })

  it('reports a platform that is not web and keeps both platform values', () => {
    expect(getInstallStateSummary({ ...ready, platform: 'android', storedPlatform: 'android' }))
      .toEqual({ code: 'hidden-platform', params: { platform: 'android', storedPlatform: 'android' } })
    expect(getInstallStateSummary({ ...ready, platform: 'pwa-web' }).code).toBe('hidden-platform')
  })

  it('reports the quiet route only when the card would otherwise show', () => {
    expect(getInstallStateSummary({ ...ready, quietRoute: true })).toEqual({ code: 'hidden-route', params: {} })
  })

  it('does not require a browser offer on iOS, where the sheet shows steps instead', () => {
    expect(getInstallStateSummary({ ...ready, canInstall: false, isIos: true }).code).toBe('available')
    expect(getInstallStateSummary({ ...ready, canInstall: false, isIos: true, installedMark: true }).code).toBe('hidden-installed')
  })

  describe('precedence when several causes apply', () => {
    const everything = { canInstall: false, platform: 'android', storedPlatform: 'android', dismissedAt: now - 1, installedMark: true, quietRoute: true, now }

    it('platform beats every other cause', () => {
      expect(getInstallStateSummary(everything).code).toBe('hidden-platform')
    })

    it('installed mark beats snooze, no offer and route', () => {
      expect(getInstallStateSummary({ ...everything, platform: 'web' }).code).toBe('hidden-installed')
    })

    it('snooze beats no offer and route', () => {
      expect(getInstallStateSummary({ ...everything, platform: 'web', installedMark: false }).code).toBe('snoozed')
    })

    it('no offer beats the route', () => {
      expect(getInstallStateSummary({ ...everything, platform: 'web', installedMark: false, dismissedAt: undefined }).code).toBe('no-offer')
    })
  })

  it('defaults now to the current time', () => {
    expect(getInstallStateSummary({ canInstall: true, platform: 'web', dismissedAt: Date.now() - 1000 }).code).toBe('snoozed')
  })
})
